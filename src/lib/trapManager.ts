import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import type { Trap } from './playerManager';

function generateHint(targetName: string): string {
  const hints = [
    `Sa cible porte souvent du ${['rouge', 'bleu', 'noir', 'blanc'][Math.floor(Math.random() * 4)]}`,
    `Le prénom de sa cible commence par "${targetName[0]}"`,
    `Sa cible est ${['grande', 'petite', 'de taille moyenne'][Math.floor(Math.random() * 3)]}`,
    `Sa cible a les cheveux ${['courts', 'longs', 'mi-longs'][Math.floor(Math.random() * 3)]}`,
    `Sa cible ${['sourit beaucoup', 'est souvent sérieuse', 'parle fort'][Math.floor(Math.random() * 3)]}`
  ];
  return hints[Math.floor(Math.random() * hints.length)];
}

export async function activateInverseTrap(
  alteredId: string,
  humanTargetId: string
): Promise<{ success: boolean; message: string; trap?: Trap }> {
  try {
    console.log('🎭 Activation piège inversé...');
    
    const alteredDoc = await getDoc(doc(db, 'players', alteredId));
    if (!alteredDoc.exists()) {
      return { success: false, message: '❌ Joueur introuvable' };
    }
    
    const alteredData = alteredDoc.data();
    
    if (alteredData.role !== 'altered') {
      return { success: false, message: '❌ Seuls les altérés peuvent utiliser des pièges' };
    }
    
    if ((alteredData.trapsRemaining || 0) <= 0) {
      return { success: false, message: '❌ Plus de pièges disponibles (max 2)' };
    }
    
    if (alteredData.activeTrap) {
      return { success: false, message: '❌ Tu as déjà un piège actif' };
    }
    
    const humanDoc = await getDoc(doc(db, 'players', humanTargetId));
    if (!humanDoc.exists()) {
      return { success: false, message: '❌ Humain introuvable' };
    }
    
    const humanData = humanDoc.data();
    const humanMission = humanData.currentMission;
    
    if (!humanMission) {
      return { success: false, message: '❌ Cet humain n\'a pas de mission active' };
    }
    
    const hint = generateHint(humanMission.targetName);
    
    const trap: Trap = {
      id: `trap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'inverse_trap',
      assignedTo: alteredId,
      targetId: humanTargetId,
      targetName: humanData.name,
      targetHint: hint,
      completed: false,
      createdAt: Date.now()
    };
    
    await updateDoc(doc(db, 'players', alteredId), {
      activeTrap: trap,
      trapsRemaining: (alteredData.trapsRemaining || 2) - 1
    });
    
    console.log('✅ Piège inversé activé');
    
    return {
      success: true,
      message: `✅ Piège activé !\n\n🎯 Cible : ${humanData.name}\n💡 Indice : ${hint}\n\nFais-toi scanner par ${humanData.name} pour réussir le piège.`,
      trap
    };
  } catch (error) {
    console.error('❌ Erreur activation piège inversé:', error);
    return { success: false, message: `❌ Erreur: ${error}` };
  }
}

export async function attemptMissionTheft(
  alteredId: string,
  humanTargetId: string,
  guessedTargetId: string
): Promise<{ success: boolean; message: string; correct?: boolean }> {
  try {
    console.log('🕵️ Tentative de vol de mission...');
    
    const alteredDoc = await getDoc(doc(db, 'players', alteredId));
    const humanDoc = await getDoc(doc(db, 'players', humanTargetId));
    
    if (!alteredDoc.exists() || !humanDoc.exists()) {
      return { success: false, message: '❌ Joueur introuvable' };
    }
    
    const alteredData = alteredDoc.data();
    const humanData = humanDoc.data();
    
    if (alteredData.role !== 'altered') {
      return { success: false, message: '❌ Seuls les altérés peuvent voler des missions' };
    }
    
    if ((alteredData.trapsRemaining || 0) <= 0) {
      return { success: false, message: '❌ Plus de pièges disponibles (max 2)' };
    }
    
    const humanMission = humanData.currentMission;
    if (!humanMission) {
      return { success: false, message: '❌ Cet humain n\'a pas de mission active' };
    }
    
    const isCorrect = humanMission.targetId === guessedTargetId;
    
    if (isCorrect) {
      console.log('✅ Vol de mission réussi !');
      
      const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
      const gameState = gameStateDoc.data();
      const newPortalLevel = Math.min(20, (gameState?.portalLevel ?? 10) + 2);
      
      await updateDoc(doc(db, 'game_state', 'current'), {
        portalLevel: newPortalLevel,
        alteredSuccesses: (gameState?.alteredSuccesses || 0) + 1
      });
      
      await updateDoc(doc(db, 'players', humanTargetId), {
        currentMission: null,
        missionQueue: humanData.missionQueue || []
      });
      
      const trapId = `trap_theft_${Date.now()}`;
      await updateDoc(doc(db, 'players', alteredId), {
        trapsRemaining: (alteredData.trapsRemaining || 2) - 1,
        trapsCompleted: arrayUnion(trapId)
      });
      
      const guessedPlayer = await getDoc(doc(db, 'players', guessedTargetId));
      const guessedName = guessedPlayer.exists() ? guessedPlayer.data().name : guessedTargetId;
      
      return {
        success: true,
        correct: true,
        message: `✅ VOL RÉUSSI !\n\nTu as deviné correctement : ${guessedName}\n\n🌀 +2 Portail\n🚫 Mission de ${humanData.name} invalidée`
      };
    } else {
      console.log('❌ Vol de mission raté');
      
      const guessedPlayer = await getDoc(doc(db, 'players', guessedTargetId));
      const guessedName = guessedPlayer.exists() ? guessedPlayer.data().name : guessedTargetId;
      
      return {
        success: true,
        correct: false,
        message: `❌ Vol raté !\n\nTa supposition (${guessedName}) était incorrecte.\n\n⚠️ Piège non comptabilisé, tu peux réessayer.`
      };
    }
  } catch (error) {
    console.error('❌ Erreur vol de mission:', error);
    return { success: false, message: `❌ Erreur: ${error}` };
  }
}

export async function validateInverseTrap(
  alteredId: string,
  scannedByHumanId: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🎭 Validation piège inversé...');
    
    const alteredDoc = await getDoc(doc(db, 'players', alteredId));
    if (!alteredDoc.exists()) {
      return { success: false, message: '❌ Joueur introuvable' };
    }
    
    const alteredData = alteredDoc.data();
    const activeTrap = alteredData.activeTrap;
    
    if (!activeTrap || activeTrap.type !== 'inverse_trap') {
      return { success: false, message: '❌ Aucun piège inversé actif' };
    }
    
    if (activeTrap.targetId !== scannedByHumanId) {
      return { 
        success: false, 
        message: `❌ Ce n'est pas ${activeTrap.targetName} qui t'a scanné` 
      };
    }
    
    console.log('✅ Piège inversé réussi !');
    
    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    const gameState = gameStateDoc.data();
    const newPortalLevel = Math.min(20, (gameState?.portalLevel ?? 10) + 1);
    
    await updateDoc(doc(db, 'game_state', 'current'), {
      portalLevel: newPortalLevel,
      alteredSuccesses: (gameState?.alteredSuccesses || 0) + 1
    });
    
    const humanDoc = await getDoc(doc(db, 'players', scannedByHumanId));
    if (humanDoc.exists()) {
      const humanData = humanDoc.data();
      await updateDoc(doc(db, 'players', scannedByHumanId), {
        consecutiveFailures: (humanData.consecutiveFailures || 0) + 1
      });
    }
    
    await updateDoc(doc(db, 'players', alteredId), {
      activeTrap: null,
      trapsCompleted: arrayUnion(activeTrap.id)
    });
    
    return {
      success: true,
      message: `✅ PIÈGE RÉUSSI !\n\n${activeTrap.targetName} t'a scanné !\n\n🌀 +1 Portail\n⏰ Cooldown de ${activeTrap.targetName} augmenté`
    };
  } catch (error) {
    console.error('❌ Erreur validation piège inversé:', error);
    return { success: false, message: `❌ Erreur: ${error}` };
  }
}

export async function cancelTrap(alteredId: string): Promise<{ success: boolean; message: string }> {
  try {
    const alteredDoc = await getDoc(doc(db, 'players', alteredId));
    if (!alteredDoc.exists()) {
      return { success: false, message: '❌ Joueur introuvable' };
    }
    
    const alteredData = alteredDoc.data();
    
    if (!alteredData.activeTrap) {
      return { success: false, message: '❌ Aucun piège actif' };
    }
    
    await updateDoc(doc(db, 'players', alteredId), {
      activeTrap: null,
      trapsRemaining: (alteredData.trapsRemaining || 0) + 1
    });
    
    return {
      success: true,
      message: '✅ Piège annulé et restitué'
    };
  } catch (error) {
    console.error('❌ Erreur annulation piège:', error);
    return { success: false, message: `❌ Erreur: ${error}` };
  }
}
