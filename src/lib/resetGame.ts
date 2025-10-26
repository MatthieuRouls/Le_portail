import { collection, doc, getDocs, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

export async function resetGameToInitialState() {
  console.log('🔄 RÉINITIALISATION COMPLÈTE DU JEU...\n');
  
  const batch = writeBatch(db);
  let operations = 0;

  try {
    // 1. RESET GAME STATE
    console.log('1️⃣ Reset de l\'état du jeu...');
    await updateDoc(doc(db, 'game_state', 'current'), {
      status: 'waiting',
      portalLevel: 10,
      humanFragments: 0,
      alteredSuccesses: 0,
      winner: null,
      startedAt: Date.now()
    });
    console.log('✅ Game state réinitialisé (Portail à 10)\n');

    // 2. SUPPRIMER TOUS LES ÉVÉNEMENTS
    console.log('2️⃣ Suppression de tous les événements...');
    const eventsSnapshot = await getDocs(collection(db, 'game_events'));
    let deletedEvents = 0;
    for (const eventDoc of eventsSnapshot.docs) {
      await deleteDoc(doc(db, 'game_events', eventDoc.id));
      deletedEvents++;
    }
    console.log(`✅ ${deletedEvents} événements supprimés\n`);

    // 3. RESET DES JOUEURS
    console.log('3️⃣ Reset de tous les joueurs...');
    const playersSnapshot = await getDocs(collection(db, 'players'));
    let resetPlayers = 0;
    
    for (const playerDoc of playersSnapshot.docs) {
      await updateDoc(doc(db, 'players', playerDoc.id), {
        currentMission: null,
        missionsCompleted: [],
        suspicions: [],
        isEliminated: false
      });
      resetPlayers++;
      console.log(`   → ${playerDoc.data().name} réinitialisé`);
    }
    console.log(`✅ ${resetPlayers} joueurs réinitialisés\n`);

    // 4. RESET DES MISSIONS
    console.log('4️⃣ Reset de toutes les missions...');
    const missionsSnapshot = await getDocs(collection(db, 'missions'));
    let resetMissions = 0;
    
    for (const missionDoc of missionsSnapshot.docs) {
      await updateDoc(doc(db, 'missions', missionDoc.id), {
        completed: false,
        completedAt: null,
        result: null
      });
      resetMissions++;
    }
    console.log(`✅ ${resetMissions} missions réinitialisées\n`);

    console.log('🎉 RÉINITIALISATION TERMINÉE !\n');
    console.log('📊 Résumé:');
    console.log(`   • Portail: remis à 10/20`);
    console.log(`   • Événements: ${deletedEvents} supprimés`);
    console.log(`   • Joueurs: ${resetPlayers} réinitialisés`);
    console.log(`   • Missions: ${resetMissions} réinitialisées`);
    
    return {
      success: true,
      eventsDeleted: deletedEvents,
      playersReset: resetPlayers,
      missionsReset: resetMissions
    };

  } catch (error) {
    console.error('❌ ERREUR lors de la réinitialisation:', error);
    return {
      success: false,
      error: error
    };
  }
}

export async function resetAndReassignMissions() {
  console.log('🚀 RESET COMPLET + RÉASSIGNATION DES MISSIONS\n');
  
  // 1. Reset complet
  const resetResult = await resetGameToInitialState();
  
  if (!resetResult.success) {
    console.error('❌ Échec du reset');
    return false;
  }
  
  console.log('\n---\n');
  
  // 2. Réassigner les missions Tier 1
  console.log('5️⃣ Réassignation des missions Tier 1...');
  const { assignMissionsToPlayers } = await import('./repairGame');
  await assignMissionsToPlayers();
  
  console.log('\n🎉 JEU PRÊT POUR UNE NOUVELLE PARTIE !');
  
  return true;
}
