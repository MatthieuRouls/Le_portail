import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';

export interface MissionValidationResult {
  success: boolean;
  message: string;
  isCorrectTarget?: boolean;
  missionCompleted?: boolean;
  portalChange?: number;
}

export async function validateMission(
  scannedPlayerId: string,
  currentPlayerId: string
): Promise<MissionValidationResult> {
  try {
    // Récupérer les données du joueur actuel
    const playerDoc = await getDoc(doc(db, 'players', currentPlayerId));
    if (!playerDoc.exists()) {
      return { success: false, message: 'Joueur introuvable' };
    }

    const playerData = playerDoc.data();
    const currentMission = playerData.currentMission;

    // Vérifier qu'il y a une mission active
    if (!currentMission) {
      return { success: false, message: 'Aucune mission active' };
    }

    // Récupérer les données du joueur scanné
    const scannedPlayerDoc = await getDoc(doc(db, 'players', scannedPlayerId));
    if (!scannedPlayerDoc.exists()) {
      return { success: false, message: 'Joueur scanné introuvable' };
    }

    const scannedPlayerData = scannedPlayerDoc.data();

    // Vérifier si c'est la bonne cible
    const isCorrectTarget = currentMission.targetId === scannedPlayerId;

    if (!isCorrectTarget) {
      return {
        success: true,
        isCorrectTarget: false,
        message: `❌ Ce n'est pas la bonne cible ! Tu as scanné ${scannedPlayerData.name}.`,
        missionCompleted: false
      };
    }

    // C'EST LA BONNE CIBLE !
    // Déterminer le changement du portail selon le rôle
    const portalChange = playerData.role === 'human' ? -1 : +1;

    // Récupérer l'état du jeu actuel
    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    const gameState = gameStateDoc.data();
    const newPortalLevel = Math.max(0, Math.min(20, (gameState?.portalLevel || 10) + portalChange));

    // Mettre à jour le niveau du portail
    await updateDoc(doc(db, 'game_state', 'current'), {
      portalLevel: newPortalLevel,
      ...(playerData.role === 'human' 
        ? { humanFragments: (gameState?.humanFragments || 0) + 1 }
        : { alteredSuccesses: (gameState?.alteredSuccesses || 0) + 1 }
      )
    });

    // Marquer la mission comme complétée
    await updateDoc(doc(db, 'missions', currentMission.id), {
      completed: true,
      completedAt: Date.now(),
      result: 'success'
    });

    // Mettre à jour le joueur
    await updateDoc(doc(db, 'players', currentPlayerId), {
      currentMission: null,
      missionsCompleted: arrayUnion(currentMission.id)
    });

    // Créer les événements
    await GameEvents.missionCompleted(playerData.name, currentPlayerId);
    
    if (portalChange > 0) {
      await GameEvents.portalIncreased(newPortalLevel);
    } else {
      await GameEvents.portalDecreased(newPortalLevel);
    }

    return {
      success: true,
      isCorrectTarget: true,
      missionCompleted: true,
      portalChange,
      message: `✅ Mission réussie ! Tu as trouvé ${scannedPlayerData.name}. ${
        playerData.role === 'human' 
          ? `Le Portail diminue de ${Math.abs(portalChange)} niveau.`
          : `Le Portail augmente de ${portalChange} niveau.`
      }`
    };

  } catch (error) {
    console.error('Erreur validation mission:', error);
    return { success: false, message: 'Erreur lors de la validation' };
  }
}
