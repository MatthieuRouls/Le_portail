import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';
import { checkGameEnd, triggerGameEnd } from './endGameManager';
import { validateInverseTrap } from './trapManager';

export interface MissionValidationResult {
  success: boolean;
  message: string;
  isCorrectTarget?: boolean;
  missionCompleted?: boolean;
  portalChange?: number;
  gameEnded?: boolean;
  nextMissionAvailable?: boolean;
  allMissionsCompleted?: boolean;
  cooldownRemaining?: number;
}

const SUCCESS_COOLDOWN_MS = 15 * 60 * 1000;

const FAILURE_COOLDOWNS = [
  1 * 60 * 1000,
  5 * 60 * 1000,
  10 * 60 * 1000,
  15 * 60 * 1000,
  20 * 60 * 1000
];

function getFailureCooldown(consecutiveFailures: number): number {
  const index = consecutiveFailures - 1;
  if (index >= FAILURE_COOLDOWNS.length) {
    return FAILURE_COOLDOWNS[FAILURE_COOLDOWNS.length - 1];
  }
  return FAILURE_COOLDOWNS[index];
}

function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
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
    
    // ✨ NOUVEAU : Vérifier si le joueur scanné a un piège inversé actif
    const scannedPlayerDoc = await getDoc(doc(db, 'players', cleanedScannedId));
    if (scannedPlayerDoc.exists()) {
      const scannedPlayerData = scannedPlayerDoc.data();
      if (scannedPlayerData.role === 'altered' && scannedPlayerData.activeTrap?.type === 'inverse_trap') {
        // Le joueur scanné est un altéré avec piège inversé actif !
        console.log('🎭 Piège inversé détecté !');
        const trapResult = await validateInverseTrap(cleanedScannedId, currentPlayerId);
        
        if (trapResult.success) {
          return {
            success: true,
            isCorrectTarget: false,
            message: `❌ Ce n'est pas la bonne cible !\n\n⚠️ ${scannedPlayerData.name} avait un piège inversé actif !`,
            missionCompleted: false
          };
        }
      }
    }
    
    const playerDoc = await getDoc(doc(db, 'players', currentPlayerId));
    if (!playerDoc.exists()) {
      console.error('❌ Joueur actuel introuvable');
      return { success: false, message: 'Joueur introuvable' };
    }

    const playerData = playerDoc.data();
    const now = Date.now();
    
    const lastAttempt = playerData.lastScanAttemptTime || 0;
    const consecutiveFailures = playerData.consecutiveFailures || 0;
    const timeSinceLastAttempt = now - lastAttempt;
    
    console.log('📊 Échecs consécutifs:', consecutiveFailures);
    console.log('⏰ Dernière tentative:', new Date(lastAttempt).toLocaleTimeString());
    console.log('⏱️ Temps depuis dernière tentative:', Math.floor(timeSinceLastAttempt / 1000), 'secondes');
    
    if (consecutiveFailures > 0 && lastAttempt > 0) {
      const requiredCooldown = getFailureCooldown(consecutiveFailures);
      console.log('⏳ Cooldown requis:', requiredCooldown / 60000, 'minutes');
      
      if (timeSinceLastAttempt < requiredCooldown) {
        const remainingMs = requiredCooldown - timeSinceLastAttempt;
        const remainingFormatted = formatTimeRemaining(remainingMs);
        console.log('❌ COOLDOWN ÉCHEC ACTIF -', remainingFormatted, 'restant');
        
        return {
          success: false,
          message: `⏰ ${consecutiveFailures} échec${consecutiveFailures > 1 ? 's' : ''} consécutif${consecutiveFailures > 1 ? 's' : ''} !\nAttends ${remainingFormatted} avant de réessayer.`,
          cooldownRemaining: remainingMs
        };
      }
    }
    
    const lastValidation = playerData.lastValidationTime || 0;
    const timeSinceLastValidation = now - lastValidation;
    
    console.log('⏰ Dernière validation réussie:', new Date(lastValidation).toLocaleTimeString());
    console.log('⏱️ Temps depuis dernière validation:', Math.floor(timeSinceLastValidation / 1000), 'secondes');
    
    if (timeSinceLastValidation < SUCCESS_COOLDOWN_MS) {
      const remainingMs = SUCCESS_COOLDOWN_MS - timeSinceLastValidation;
      const remainingFormatted = formatTimeRemaining(remainingMs);
      console.log('❌ COOLDOWN VALIDATION ACTIF -', remainingFormatted, 'restant');
      
      return {
        success: false,
        message: `⏰ Tu viens de valider une mission !\nAttends encore ${remainingFormatted} avant de pouvoir valider la suivante.`,
        cooldownRemaining: remainingMs
      };
    }
    
    console.log('✅ Cooldowns OK - Validation autorisée');
    
    const currentMission = playerData.currentMission;

    console.log('Mission actuelle:', currentMission);

    if (!currentMission) {
      console.error('❌ Aucune mission active');
      return { success: false, message: 'Aucune mission active' };
    }

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
      const newFailureCount = consecutiveFailures + 1;
      const nextCooldown = getFailureCooldown(newFailureCount);
      const nextCooldownFormatted = formatTimeRemaining(nextCooldown);
      
      console.log('❌ Mauvaise cible - Échecs consécutifs:', newFailureCount);
      console.log('⏰ Prochain cooldown:', nextCooldownFormatted);
      
      await updateDoc(doc(db, 'players', currentPlayerId), {
        lastScanAttemptTime: now,
        consecutiveFailures: newFailureCount
      });
      
      return {
        success: true,
        isCorrectTarget: false,
        message: `❌ Ce n'est pas la bonne cible ! Tu as scanné ${scannedPlayerData.name}.\n\n⏰ ${newFailureCount} échec${newFailureCount > 1 ? 's' : ''} consécutif${newFailureCount > 1 ? 's' : ''} : attends ${nextCooldownFormatted} avant de réessayer.`,
        missionCompleted: false
      };
    }

    console.log('✅ BONNE CIBLE ! Réinitialisation des échecs consécutifs.');
    
    const portalChange = playerData.role === 'human' ? -1 : +1;
    console.log('Changement portail:', portalChange, '(rôle:', playerData.role, ')');

    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    const gameState = gameStateDoc.data();
    const newPortalLevel = Math.max(0, Math.min(20, (gameState?.portalLevel ?? 10) + portalChange));
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

    const missionQueue = playerData.missionQueue || [];
    const nextMission = missionQueue.length > 0 ? missionQueue[0] : null;
    const remainingQueue = missionQueue.slice(1);
    
    console.log('📋 Queue restante:', missionQueue.length, 'missions');
    
    let updateData: any = {
      missionsCompleted: arrayUnion(currentMission.id),
      lastValidationTime: now,
      lastScanAttemptTime: now,
      consecutiveFailures: 0
    };
    
    if (nextMission) {
      console.log('⏭️ Passage à la mission suivante');
      updateData.currentMission = nextMission;
      updateData.missionQueue = remainingQueue;
      updateData.allMissionsCompleted = false;
    } else {
      console.log('🎉 Toutes les missions terminées !');
      updateData.currentMission = null;
      updateData.missionQueue = [];
      updateData.allMissionsCompleted = true;
    }
    
    await updateDoc(doc(db, 'players', currentPlayerId), updateData);
    console.log('✅ Joueur mis à jour');

    // ✨ Événement silencieux pour altérés
    if (!currentMission.isSilent) {
      await GameEvents.missionCompleted(playerData.name, currentPlayerId);
      
      if (portalChange > 0) {
        await GameEvents.portalIncreased(newPortalLevel);
      } else {
        await GameEvents.portalDecreased(newPortalLevel);
      }
      console.log('✅ Événements créés');
    } else {
      console.log('🤫 Mission silencieuse - Pas d\'événement public');
    }

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
        nextMissionAvailable: false,
        allMissionsCompleted: !nextMission,
        message: `✅ Mission réussie ! ${endCheck.reason}`
      };
    }

    console.log('=== FIN VALIDATION ===\n');

    let message = `✅ Mission réussie ! Tu as trouvé ${scannedPlayerData.name}. `;
    message += playerData.role === 'human' 
      ? `Le Portail diminue de ${Math.abs(portalChange)} niveau. `
      : `Le Portail augmente de ${portalChange} niveau. `;
    
    if (nextMission) {
      message += `\n\n🎯 Nouvelle mission reçue !\n⏰ Cooldown : 15 minutes avant de pouvoir valider la prochaine.`;
    } else {
      message += `\n\n🎉 Toutes tes missions sont terminées !`;
    }

    return {
      success: true,
      isCorrectTarget: true,
      missionCompleted: true,
      portalChange,
      gameEnded: false,
      nextMissionAvailable: !!nextMission,
      allMissionsCompleted: !nextMission,
      message
    };

  } catch (error) {
    console.error('❌ ERREUR validation mission:', error);
    return { 
      success: false, 
      message: `❌ Erreur lors de la validation: ${error}` 
    };
  }
}
