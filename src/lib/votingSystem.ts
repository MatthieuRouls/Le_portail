import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';

export interface VotingSession {
  id: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: number;
  status: 'active' | 'completed' | 'cancelled';
  votes: { [playerId: string]: string };
  eligibleVoters: string[];
  results?: {
    eliminated: string;
    eliminatedName: string;
    voteCount: { [playerId: string]: number };
    totalVotes: number;
  };
  endedAt?: number;
}

export async function startVotingSession(initiatorId: string): Promise<{
  success: boolean;
  sessionId?: string;
  message: string;
}> {
  try {
    console.log('🗳️ Démarrage d\'une session de vote par', initiatorId);
    
    const activeSessionQuery = query(
      collection(db, 'voting_sessions'),
      where('status', '==', 'active')
    );
    const activeSessions = await getDocs(activeSessionQuery);
    
    if (!activeSessions.empty) {
      return {
        success: false,
        message: '❌ Une session de vote est déjà en cours !'
      };
    }
    
    const playersSnapshot = await getDocs(collection(db, 'players'));
    const eligibleVoters = playersSnapshot.docs
      .filter(doc => !doc.data().isEliminated)
      .map(doc => doc.id);
    
    if (eligibleVoters.length < 3) {
      return {
        success: false,
        message: '❌ Pas assez de joueurs pour organiser un vote (minimum 3)'
      };
    }
    
    const initiatorDoc = await getDoc(doc(db, 'players', initiatorId));
    const initiatorName = initiatorDoc.data()?.name || 'Inconnu';
    
    const sessionId = `vote_${Date.now()}`;
    const votingSession: VotingSession = {
      id: sessionId,
      initiatedBy: initiatorId,
      initiatedByName: initiatorName,
      initiatedAt: Date.now(),
      status: 'active',
      votes: {},
      eligibleVoters
    };
    
    await setDoc(doc(db, 'voting_sessions', sessionId), votingSession);
    await GameEvents.votingStarted(initiatorName);
    
    console.log('✅ Session de vote créée:', sessionId);
    
    return {
      success: true,
      sessionId,
      message: '✅ Session de vote démarrée !'
    };
    
  } catch (error) {
    console.error('❌ Erreur démarrage vote:', error);
    return {
      success: false,
      message: 'Erreur lors du démarrage du vote'
    };
  }
}

export async function castVote(
  sessionId: string,
  voterId: string,
  targetId: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🗳️ Vote:', voterId, '→', targetId);
    
    const sessionRef = doc(db, 'voting_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return { success: false, message: 'Session de vote introuvable' };
    }
    
    const session = sessionDoc.data() as VotingSession;
    
    if (session.status !== 'active') {
      return { success: false, message: 'Le vote est terminé' };
    }
    
    if (!session.eligibleVoters.includes(voterId)) {
      return { success: false, message: 'Tu ne peux pas voter' };
    }
    
    const targetDoc = await getDoc(doc(db, 'players', targetId));
    if (!targetDoc.exists() || targetDoc.data().isEliminated) {
      return { success: false, message: 'Ce joueur ne peut pas être voté' };
    }
    
    if (voterId === targetId) {
      return { success: false, message: 'Tu ne peux pas voter pour toi-même !' };
    }
    
    const updatedVotes = { ...session.votes, [voterId]: targetId };
    await updateDoc(sessionRef, {
      votes: updatedVotes
    });
    
    console.log('✅ Vote enregistré');
    
    if (Object.keys(updatedVotes).length === session.eligibleVoters.length) {
      console.log('🎯 Tous les joueurs ont voté, fin de la session');
      await finalizeVotingSession(sessionId);
    }
    
    return {
      success: true,
      message: '✅ Vote enregistré !'
    };
    
  } catch (error) {
    console.error('❌ Erreur vote:', error);
    return {
      success: false,
      message: 'Erreur lors du vote'
    };
  }
}

export async function finalizeVotingSession(sessionId: string): Promise<void> {
  try {
    console.log('🏁 Finalisation du vote:', sessionId);
    
    const sessionRef = doc(db, 'voting_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) return;
    
    const session = sessionDoc.data() as VotingSession;
    
    const voteCount: { [playerId: string]: number } = {};
    Object.values(session.votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    });
    
    console.log('📊 Décompte des votes:', voteCount);
    
    let maxVotes = 0;
    let eliminated = '';
    
    Object.entries(voteCount).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminated = playerId;
      }
    });
    
    const maxVotedPlayers = Object.entries(voteCount)
      .filter(([_, count]) => count === maxVotes)
      .map(([playerId]) => playerId);
    
    if (maxVotedPlayers.length > 1) {
      eliminated = maxVotedPlayers[Math.floor(Math.random() * maxVotedPlayers.length)];
      console.log('⚖️ Égalité détectée, joueur éliminé au hasard:', eliminated);
    }
    
    const eliminatedDoc = await getDoc(doc(db, 'players', eliminated));
    const eliminatedName = eliminatedDoc.data()?.name || 'Inconnu';
    
    console.log('❌ Joueur éliminé:', eliminatedName);
    
    await updateDoc(doc(db, 'players', eliminated), {
      isEliminated: true,
      eliminatedAt: Date.now(),
      currentMission: null
    });
    
    await updateDoc(sessionRef, {
      status: 'completed',
      endedAt: Date.now(),
      results: {
        eliminated,
        eliminatedName,
        voteCount,
        totalVotes: Object.keys(session.votes).length
      }
    });
    
    await GameEvents.playerEliminated(eliminatedName);
    
    console.log('✅ Vote finalisé');
    
  } catch (error) {
    console.error('❌ Erreur finalisation vote:', error);
  }
}

export async function getActiveVotingSession(): Promise<VotingSession | null> {
  try {
    const activeSessionQuery = query(
      collection(db, 'voting_sessions'),
      where('status', '==', 'active')
    );
    const activeSessions = await getDocs(activeSessionQuery);
    
    if (activeSessions.empty) return null;
    
    return activeSessions.docs[0].data() as VotingSession;
  } catch (error) {
    console.error('❌ Erreur récupération session:', error);
    return null;
  }
}

export function subscribeToVotingSession(
  sessionId: string,
  callback: (session: VotingSession | null) => void
): () => void {
  const sessionRef = doc(db, 'voting_sessions', sessionId);
  
  return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as VotingSession);
    } else {
      callback(null);
    }
  });
}

export async function cancelVotingSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'voting_sessions', sessionId), {
    status: 'cancelled',
    endedAt: Date.now()
  });
}
