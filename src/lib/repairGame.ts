import { collection, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { MISSIONS_TIER_1 } from './gameData';

export async function diagnoseGame() {
  console.log('🔍 DIAGNOSTIC DU JEU...\n');
  
  // 1. Vérifier game_state
  const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
  if (gameStateDoc.exists()) {
    const gameState = gameStateDoc.data();
    console.log('✅ Game State:', gameState);
  } else {
    console.log('❌ Game State non trouvé !');
  }
  
  // 2. Vérifier les joueurs
  const playersSnapshot = await getDocs(collection(db, 'players'));
  console.log(`\n✅ Joueurs trouvés: ${playersSnapshot.size}`);
  
  let playersWithMissions = 0;
  let playersWithoutMissions = 0;
  
  playersSnapshot.forEach(doc => {
    const player = doc.data();
    if (player.currentMission) {
      playersWithMissions++;
    } else {
      playersWithoutMissions++;
      console.log(`⚠️  ${player.name} n'a PAS de mission`);
    }
  });
  
  console.log(`\n📊 Avec mission: ${playersWithMissions}`);
  console.log(`📊 Sans mission: ${playersWithoutMissions}`);
  
  // 3. Vérifier les missions
  const missionsSnapshot = await getDocs(collection(db, 'missions'));
  console.log(`\n✅ Missions créées: ${missionsSnapshot.size}`);
  
  return {
    hasGameState: gameStateDoc.exists(),
    totalPlayers: playersSnapshot.size,
    playersWithMissions,
    playersWithoutMissions,
    totalMissions: missionsSnapshot.size
  };
}

export async function assignMissionsToPlayers() {
  console.log('🔧 ASSIGNATION DES MISSIONS AUX JOUEURS...\n');
  
  let assigned = 0;
  let errors = 0;
  
  for (const [playerId, missionData] of Object.entries(MISSIONS_TIER_1)) {
    try {
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (!playerDoc.exists()) {
        console.log(`❌ Joueur ${playerId} introuvable`);
        errors++;
        continue;
      }
      
      const playerName = playerDoc.data().name;
      
      // Créer l'objet mission pour le joueur
      const currentMission = {
        id: missionData.id,
        targetId: missionData.targetId,
        targetName: missionData.targetName || missionData.targetId,
        ...(missionData.riddle && { riddle: missionData.riddle }),
        ...(missionData.instruction && { instruction: missionData.instruction }),
        ...(missionData.type && { type: missionData.type })
      };
      
      // Assigner la mission au joueur
      await updateDoc(playerRef, {
        currentMission: currentMission
      });
      
      console.log(`✅ ${playerName} → Mission assignée (cible: ${currentMission.targetName})`);
      assigned++;
      
    } catch (error) {
      console.error(`❌ Erreur pour ${playerId}:`, error);
      errors++;
    }
  }
  
  console.log(`\n📊 Résultat: ${assigned} missions assignées, ${errors} erreurs`);
  return { assigned, errors };
}

export async function repairGame() {
  console.log('🚀 RÉPARATION DU JEU...\n');
  
  // Diagnostic
  await diagnoseGame();
  
  console.log('\n---\n');
  
  // Réparation
  await assignMissionsToPlayers();
  
  console.log('\n✅ RÉPARATION TERMINÉE !');
}
