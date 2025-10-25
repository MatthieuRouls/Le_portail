import { doc, updateDoc, collection, addDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvent, EventType, Meeting } from '../types/game';

/**
 * Ajoute un événement au fil d'actualité
 */
export async function addGameEvent(
  type: EventType,
  message: string,
  data?: Record<string, any>
) {
  try {
    const event: Omit<GameEvent, 'id'> = {
      type,
      message,
      timestamp: Date.now(),
      data: data || {},
    };

    await addDoc(collection(db, 'game_events'), event);
  } catch (error) {
    console.error('Error adding game event:', error);
    throw error;
  }
}

/**
 * Met à jour le niveau du portail
 */
export async function updatePortalLevel(increment: number) {
  try {
    const gameStateRef = doc(db, 'game_state', 'current');
    await updateDoc(gameStateRef, {
      portalLevel: increment,
    });

    await addGameEvent(
      'portal_increased',
      `Le portail s'est intensifié... Niveau actuel: ${increment}/20`,
      { newLevel: increment }
    );
  } catch (error) {
    console.error('Error updating portal level:', error);
    throw error;
  }
}

/**
 * Complète une mission pour un joueur
 */
export async function completeMission(playerId: string, playerName: string) {
  try {
    const playerRef = doc(db, 'players', playerId);
    const gameStateRef = doc(db, 'game_state', 'current');

    // Mettre à jour le joueur
    await updateDoc(playerRef, {
      'currentMission.completed': true,
    });

    // Incrémenter le compteur de missions complétées
    await updateDoc(gameStateRef, {
      totalMissionsCompleted: increment(1),
    });

    await addGameEvent(
      'mission_completed',
      `${playerName} a complété sa mission ✓`,
      { playerId, playerName }
    );

    // Vérifier si on doit déclencher une réunion
    await checkAndTriggerMeeting();
  } catch (error) {
    console.error('Error completing mission:', error);
    throw error;
  }
}

/**
 * Vérifie si une réunion doit être déclenchée basée sur le nombre de missions complétées
 */
export async function checkAndTriggerMeeting() {
  try {
    const gameStateRef = doc(db, 'game_state', 'current');
    const gameStateSnap = await getDoc(gameStateRef);

    if (!gameStateSnap.exists()) return;

    const gameState = gameStateSnap.data();
    const { totalMissionsCompleted, meetingsHeld, meetingThresholds, currentMeeting } = gameState;

    // Si une réunion est déjà en cours, ne rien faire
    if (currentMeeting?.isActive) return;

    // Vérifier si on a atteint un seuil
    const nextMeetingIndex = meetingsHeld;
    if (nextMeetingIndex >= meetingThresholds.length) return; // Toutes les réunions ont été tenues

    const threshold = meetingThresholds[nextMeetingIndex];

    if (totalMissionsCompleted >= threshold) {
      await triggerMeeting(nextMeetingIndex + 1, threshold);
    }
  } catch (error) {
    console.error('Error checking meeting trigger:', error);
    throw error;
  }
}

/**
 * Déclenche une réunion et démarre le vote
 */
export async function triggerMeeting(meetingNumber: number, threshold: number) {
  try {
    const gameStateRef = doc(db, 'game_state', 'current');

    const meeting: Meeting = {
      id: `meeting_${meetingNumber}`,
      meetingNumber,
      triggeredAt: Date.now(),
      triggeredBy: 'mission_threshold',
      missionThreshold: threshold,
      isActive: true,
      votingEndsAt: null, // Sera défini quand le vote commence
      votes: {},
      eliminatedPlayer: null,
    };

    await updateDoc(gameStateRef, {
      currentMeeting: meeting,
    });

    await addGameEvent(
      'meeting_triggered',
      `🚨 RÉUNION ${meetingNumber}/3 - Tous les joueurs doivent se rassembler pour voter !`,
      { meetingNumber, threshold }
    );
  } catch (error) {
    console.error('Error triggering meeting:', error);
    throw error;
  }
}

/**
 * Démarre la phase de vote (définit la fin du vote)
 */
export async function startVoting(durationMinutes: number = 5) {
  try {
    const gameStateRef = doc(db, 'game_state', 'current');
    const votingEndsAt = Date.now() + durationMinutes * 60 * 1000;

    await updateDoc(gameStateRef, {
      'currentMeeting.votingEndsAt': votingEndsAt,
    });

    await addGameEvent(
      'vote_started',
      `Le vote est ouvert ! Vous avez ${durationMinutes} minutes pour voter.`,
      { votingEndsAt }
    );
  } catch (error) {
    console.error('Error starting voting:', error);
    throw error;
  }
}

/**
 * Enregistre le vote d'un joueur
 */
export async function castVote(voterId: string, voterName: string, targetId: string) {
  try {
    const gameStateRef = doc(db, 'game_state', 'current');
    const playerRef = doc(db, 'players', voterId);

    // Mettre à jour le vote dans la réunion
    await updateDoc(gameStateRef, {
      [`currentMeeting.votes.${voterId}`]: targetId,
    });

    // Mettre à jour le joueur pour tracker son vote
    await updateDoc(playerRef, {
      votedFor: targetId,
    });

    console.log(`${voterName} a voté`);
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
}

/**
 * Termine le vote et élimine le joueur le plus voté
 */
export async function endVoting() {
  try {
    const gameStateRef = doc(db, 'game_state', 'current');
    const gameStateSnap = await getDoc(gameStateRef);

    if (!gameStateSnap.exists()) return;

    const gameState = gameStateSnap.data();
    const meeting = gameState.currentMeeting;

    if (!meeting || !meeting.isActive) return;

    // Compter les votes
    const voteCounts: Record<string, number> = {};
    Object.values(meeting.votes).forEach((targetId) => {
      const target = targetId as string;
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    });

    // Trouver le joueur le plus voté
    let mostVotedId: string | null = null;
    let maxVotes = 0;

    Object.entries(voteCounts).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = playerId;
      }
    });

    // Éliminer le joueur le plus voté
    if (mostVotedId) {
      const playerRef = doc(db, 'players', mostVotedId);
      const playerSnap = await getDoc(playerRef);

      if (playerSnap.exists()) {
        const playerData = playerSnap.data();

        await updateDoc(playerRef, {
          isEliminated: true,
        });

        await updateDoc(gameStateRef, {
          'currentMeeting.eliminatedPlayer': mostVotedId,
          'currentMeeting.isActive': false,
          meetingsHeld: increment(1),
        });

        await addGameEvent(
          'player_eliminated',
          `${playerData.name} a été éliminé par vote (${maxVotes} voix)`,
          { playerId: mostVotedId, playerName: playerData.name, votes: maxVotes }
        );
      }
    } else {
      // Aucun vote ou égalité
      await updateDoc(gameStateRef, {
        'currentMeeting.isActive': false,
        meetingsHeld: increment(1),
      });

      await addGameEvent(
        'vote_ended',
        'Le vote s\'est terminé sans élimination',
        { reason: 'no_votes_or_tie' }
      );
    }

    // Réinitialiser les votes des joueurs
    const playersSnap = await getDoc(collection(db, 'players') as any);
    // Note: Pour réinitialiser tous les votes, on pourrait faire un batch update
  } catch (error) {
    console.error('Error ending voting:', error);
    throw error;
  }
}

/**
 * Ajoute un suspect à la liste d'un joueur
 */
export async function addSuspicion(playerId: string, suspectId: string, suspectName: string) {
  try {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) return;

    const playerData = playerSnap.data();
    const suspicions = playerData.suspicions || [];

    if (!suspicions.includes(suspectId)) {
      await updateDoc(playerRef, {
        suspicions: [...suspicions, suspectId],
      });
    }
  } catch (error) {
    console.error('Error adding suspicion:', error);
    throw error;
  }
}
