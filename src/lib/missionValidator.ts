import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';
import { checkGameEnd, triggerGameEnd } from './endGameManager';

export interface MissionValidationResult {
  success: boolean;
  message: string;
  isCorrectTarget?: boolean;
  missionCompleted?: boolean;
  portalChange?: number;
  gameEnded?: boolean;
}

export async function validateMission(
  scannedPlayerId: string,
  currentPlayerId: string
): Promise<MissionValidationResult> {
  try {
    console.log('\n🔍 === VALIDATION MISSION ===');
    console.log('Joueur scanné:', scannedPlayerId);
    console.log('Joueur actuel:', currentPlayerId);
    
    const cleanedScannedId = scannedPlayerId.trim().toLowerCase();
    console.log('ID nettoyé:', cleanedScannedId);
    
    const playerDoc = await getDoc(doc(db, 'players', currentPlayerId));
    if (!playerDoc.exists()) {
      console.error('❌ Joueur actuel introuvable');
      return { success: false, message: 'Joueur introuvable' };
    }

    const playerData = playerDoc.data();
    const currentMission = playerData.currentMission;

    console.log('Mission actuelle:', currentMission);

    if (!currentMission) {
      console.error('❌ Aucune mission active');
      return { success: false, message: 'Aucune mission active' };
    }

    const scannedPlayerDoc = await getDoc(doc(db, 'players', cleanedScannedId));
    if (!scannedPlayerDoc.exists()) {
      console.error('❌ Joueur scanné introuvable:', cleanedScannedId);
      return { 
        success: false, 
        message: `❌ Joueur "${cleanedScannedId}" introuvable dans la base de données` 
      };
    }

    const scannedPlayerData = scannedPlayerDoc.data();
    console.log('Joueur scanné trouvé:', scannedPlayerData.name);

    const isCorrectTarget = currentMission.targetId === cleanedScannedId;
    console.log('Cible attendue:', currentMission.targetId);
    console.log('Est-ce la bonne cible?', isCorrectTarget);

    if (!isCorrectTarget) {
      return {
        success: true,
        isCorrectTarget: false,
        message: `❌ Ce n'est pas la bonne cible ! Tu as scanné ${scannedPlayerData.name}.`,
        missionCompleted: false
      };
    }

    console.log('✅ BONNE CIBLE !');
    
    const portalChange = playerData.role === 'human' ? -1 : +1;
    console.log('Changement portail:', portalChange, '(rôle:', playerData.role, ')');

    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    const gameState = gameStateDoc.data();
    const newPortalLevel = Math.max(0, Math.min(20, (gameState?.portalLevel || 10) + portalChange));
    console.log('Portail:', gameState?.portalLevel, '→', newPortalLevel);

    await updateDoc(doc(db, 'game_state', 'current'), {
      portalLevel: newPortalLevel,
      ...(playerData.role === 'human' 
        ? { humanFragments: (gameState?.humanFragments || 0) + 1 }
        : { alteredSuccesses: (gameState?.alteredSuccesses || 0) + 1 }
      )
    });
    console.log('✅ État du jeu mis à jour');

    await updateDoc(doc(db, 'missions', currentMission.id), {
      completed: true,
      completedAt: Date.now(),
      result: 'success'
    });
    console.log('✅ Mission marquée comme complétée');

    await updateDoc(doc(db, 'players', currentPlayerId), {
      currentMission: null,
      missionsCompleted: arrayUnion(currentMission.id)
    });
    console.log('✅ Joueur mis à jour');

    await GameEvents.missionCompleted(playerData.name, currentPlayerId);
    
    if (portalChange > 0) {
      await GameEvents.portalIncreased(newPortalLevel);
    } else {
      await GameEvents.portalDecreased(newPortalLevel);
    }
    console.log('✅ Événements créés');

    // ✨ VÉRIFIER LA FIN DE PARTIE
    console.log('🔍 Vérification fin de partie...');
    const endCheck = await checkGameEnd();
    
    if (endCheck.isEnded && endCheck.winner && endCheck.reason) {
      console.log('🏁 FIN DE PARTIE DÉTECTÉE !');
      await triggerGameEnd(endCheck.winner, endCheck.reason);
      
      return {
        success: true,
        isCorrectTarget: true,
        missionCompleted: true,
        portalChange,
        gameEnded: true,
        message: `✅ Mission réussie ! ${endCheck.reason}`
      };
    }

    console.log('=== FIN VALIDATION ===\n');

    return {
      success: true,
      isCorrectTarget: true,
      missionCompleted: true,
      portalChange,
      gameEnded: false,
      message: `✅ Mission réussie ! Tu as trouvé ${scannedPlayerData.name}. ${
        playerData.role === 'human' 
          ? `Le Portail diminue de ${Math.abs(portalChange)} niveau.`
          : `Le Portail augmente de ${portalChange} niveau.`
      }`
    };

  } catch (error) {
    console.error('❌ ERREUR validation mission:', error);
    return { 
      success: false, 
      message: `❌ Erreur lors de la validation: ${error}` 
    };
  }
}
