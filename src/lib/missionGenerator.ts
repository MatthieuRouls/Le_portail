import { collection, addDoc, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Mission } from './playerManager';

const TIER_1_RIDDLES = [
  { riddle: "Cherche celui qui porte du bleu", instruction: "Trouve la personne en bleu" },
  { riddle: "Trouve celui qui sourit souvent", instruction: "Cherche la personne souriante" },
  { riddle: "Cherche celui qui parle fort", instruction: "Trouve la personne bruyante" }
];

const TIER_2_RIDDLES = [
  { riddle: "Celui dont le prénom commence par la 4ème lettre de l'alphabet", instruction: "Prénom commence par D" },
  { riddle: "Cherche celui qui a les cheveux longs", instruction: "Trouve cheveux longs" }
];

const TIER_3_RIDDLES = [
  { riddle: "Celui qui cache un secret", instruction: "Cherche le mystérieux" },
  { riddle: "Trouve celui qui observe en silence", instruction: "Le silencieux" }
];

function getRiddleForTier(tier: number) {
  let riddles;
  switch (tier) {
    case 1:
      riddles = TIER_1_RIDDLES;
      break;
    case 2:
      riddles = TIER_2_RIDDLES;
      break;
    case 3:
      riddles = TIER_3_RIDDLES;
      break;
    default:
      riddles = TIER_1_RIDDLES;
  }
  return riddles[Math.floor(Math.random() * riddles.length)];
}

export async function createMission(
  playerId: string,
  tier: number,
  targetPlayer?: { id: string; name: string }
): Promise<Mission> {
  try {
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    if (!playerDoc.exists()) {
      throw new Error('Joueur introuvable');
    }

    const playerData = playerDoc.data();
    const playerName = playerData.name;
    const playerRole = playerData.role;

    let target = targetPlayer;
    if (!target) {
      const allPlayersSnapshot = await getDocs(collection(db, 'players'));
      const allPlayers = allPlayersSnapshot.docs.map(doc => doc.data());
      
      const availableTargets = allPlayers.filter((p: any) => 
        p.id !== playerId && !p.isEliminated
      );
      
      if (availableTargets.length === 0) {
        throw new Error('Aucune cible disponible');
      }
      
      const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
      target = { id: randomTarget.id, name: randomTarget.name };
    }

    const riddleData = getRiddleForTier(tier);
    
    const mission: Mission = {
      id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assignedTo: playerId,
      assignedToName: playerName,
      targetId: target.id,
      targetName: target.name,
      tier,
      riddle: riddleData.riddle,
      instruction: riddleData.instruction,
      completed: false,
      createdAt: Date.now(),
      isSilent: playerRole === 'altered'
    };

    await addDoc(collection(db, 'missions'), mission);
    console.log('✅ Mission créée:', mission.id, 'Silent:', mission.isSilent);
    
    return mission;
  } catch (error) {
    console.error('❌ Erreur création mission:', error);
    throw error;
  }
}

export async function createMissionQueue(
  playerId: string,
  count: number = 3
): Promise<{ success: boolean; message: string; missions?: Mission[] }> {
  try {
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    if (!playerDoc.exists()) {
      return { success: false, message: '❌ Joueur introuvable' };
    }

    const playerData = playerDoc.data();
    
    if (playerData.currentMission || (playerData.missionQueue && playerData.missionQueue.length > 0)) {
      return { 
        success: false, 
        message: '❌ Ce joueur a déjà des missions en cours ou en attente' 
      };
    }

    const missions: Mission[] = [];
    const tiers = [1, 2, 3];
    
    for (let i = 0; i < Math.min(count, tiers.length); i++) {
      const mission = await createMission(playerId, tiers[i]);
      missions.push(mission);
    }

    const [firstMission, ...remainingMissions] = missions;
    
    await updateDoc(doc(db, 'players', playerId), {
      currentMission: firstMission,
      missionQueue: remainingMissions,
      allMissionsCompleted: false
    });

    console.log(`✅ ${missions.length} missions créées pour ${playerData.name}`);
    
    return {
      success: true,
      message: `✅ ${missions.length} missions créées pour ${playerData.name}`,
      missions
    };
  } catch (error) {
    console.error('❌ Erreur création queue:', error);
    return {
      success: false,
      message: `❌ Erreur: ${error}`
    };
  }
}
