import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { PLAYERS_DATA, MISSIONS_TIER_1, INITIAL_GAME_STATE } from './gameData';

export async function initializeGame() {
  try {
    console.log('🎮 Initialisation du jeu...');

    // 1. Créer l'état du jeu
    await setDoc(doc(db, 'game_state', 'current'), INITIAL_GAME_STATE);
    console.log('✅ Game state créé');

    // 2. Créer les joueurs
    for (const player of PLAYERS_DATA) {
      const playerData = {
        id: player.id,
        name: player.name,
        role: player.role,
        qrCode: `qr_${player.id}_${Date.now()}`,
        currentMission: null,
        missionsCompleted: [],
        suspicions: [],
        isEliminated: false,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, 'players', player.id), playerData);
    }
    console.log('✅ 20 joueurs créés');

    // 3. Créer les missions Tier 1
    for (const [playerId, missionData] of Object.entries(MISSIONS_TIER_1)) {
      const mission = {
        ...missionData,
        playerId,
        tier: 1,
        completed: false,
        completedAt: null,
        result: null,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, 'missions', mission.id), mission);
    }
    console.log('✅ Missions Tier 1 créées');

    console.log('🎉 Jeu initialisé avec succès !');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return false;
  }
}

export async function checkIfGameExists() {
  try {
    const playersSnapshot = await getDocs(collection(db, 'players'));
    return !playersSnapshot.empty;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return false;
  }
}
