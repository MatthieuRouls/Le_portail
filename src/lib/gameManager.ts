import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';

export async function resetGame() {
  console.log('🔄 === DÉBUT RESET COMPLET ===');
  
  try {
    const batch = writeBatch(db);
    
    // 1. Réinitialiser l'état du jeu
    console.log('1️⃣ Réinitialisation état du jeu...');
    const gameStateRef = doc(db, 'game_state', 'current');
    batch.update(gameStateRef, {
      portalLevel: 10,
      humanFragments: 0,
      alteredSuccesses: 0,
      gameEnded: false,
      winner: null,
      endReason: null,
      votingSessionActive: false,
      currentVotingTarget: null,
      votingStartedBy: null,
      votingStartTime: null
    });
    
    // 2. Nettoyer TOUTES les missions
    console.log('2️⃣ Suppression de toutes les missions...');
    const missionsSnapshot = await getDocs(collection(db, 'missions'));
    missionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    console.log(`   ✅ ${missionsSnapshot.size} missions supprimées`);
    
    // 3. Réinitialiser TOUS les joueurs
    console.log('3️⃣ Réinitialisation des joueurs...');
    const playersSnapshot = await getDocs(collection(db, 'players'));
    playersSnapshot.docs.forEach((playerDoc) => {
      batch.update(playerDoc.ref, {
        currentMission: null,           // ✨ Supprimer mission active
        missionQueue: [],                // ✨ Vider la queue
        missionsCompleted: [],           // ✨ Vider les missions complétées
        allMissionsCompleted: false,     // ✨ Remettre le flag à false
        isEliminated: false,
        suspicions: [],
        lastScanAttemptTime: 0,          // ✨ Reset cooldown tentatives
        lastValidationTime: 0,           // ✨ Reset cooldown validation
        consecutiveFailures: 0           // ✨ Reset échecs consécutifs
      });
    });
    console.log(`   ✅ ${playersSnapshot.size} joueurs réinitialisés`);
    
    // 4. Supprimer tous les événements
    console.log('4️⃣ Suppression des événements...');
    const eventsSnapshot = await getDocs(collection(db, 'game_events'));
    eventsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    console.log(`   ✅ ${eventsSnapshot.size} événements supprimés`);
    
    // 5. Supprimer toutes les sessions de vote
    console.log('5️⃣ Suppression des sessions de vote...');
    const votesSnapshot = await getDocs(collection(db, 'voting_sessions'));
    votesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    console.log(`   ✅ ${votesSnapshot.size} sessions de vote supprimées`);
    
    // Commit toutes les modifications
    await batch.commit();
    console.log('✅ Batch commit réussi');
    
    // Créer un événement de reset
    await GameEvents.gameReset();
    
    console.log('🎉 === RESET COMPLET TERMINÉ ===\n');
    return { success: true, message: '✅ Jeu réinitialisé avec succès' };
    
  } catch (error) {
    console.error('❌ Erreur lors du reset:', error);
    return { success: false, message: `❌ Erreur: ${error}` };
  }
}

export async function setPortalLevel(level: number) {
  try {
    if (level < 0 || level > 20) {
      throw new Error('Niveau invalide (0-20)');
    }
    
    const gameStateRef = doc(db, 'game_state', 'current');
    const gameState = await getDoc(gameStateRef);
    const oldLevel = gameState.data()?.portalLevel || 10;
    
    await updateDoc(gameStateRef, {
      portalLevel: level
    });
    
    console.log(`✅ Portail: ${oldLevel} → ${level}`);
    
    // Créer un événement
    if (level > oldLevel) {
      await GameEvents.portalIncreased(level);
    } else if (level < oldLevel) {
      await GameEvents.portalDecreased(level);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur setPortalLevel:', error);
    throw error;
  }
}

export async function getGameState() {
  try {
    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    if (!gameStateDoc.exists()) {
      return null;
    }
    return gameStateDoc.data();
  } catch (error) {
    console.error('❌ Erreur getGameState:', error);
    return null;
  }
}
