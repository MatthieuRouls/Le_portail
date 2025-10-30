import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface GameEvent {
  id: string;
  type: 'mission_completed' | 'portal_change' | 'player_eliminated' | 'voting_started' | 'game_ended';
  message: string;
  timestamp: number;
  data?: any;
}

export class GameEvents {
  static async missionCompleted(playerName: string, playerId: string): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'mission_completed',
      message: `${playerName} a complété une mission`,
      timestamp: Date.now(),
      data: { playerId, playerName }
    });
  }

  static async portalIncreased(newLevel: number): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'portal_change',
      message: `⚠️ Le Portail s'ouvre davantage (niveau ${newLevel})`,
      timestamp: Date.now(),
      data: { newLevel, direction: 'increase' }
    });
  }

  static async portalDecreased(newLevel: number): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'portal_change',
      message: `✅ Le Portail se referme (niveau ${newLevel})`,
      timestamp: Date.now(),
      data: { newLevel, direction: 'decrease' }
    });
  }

  static async playerEliminated(playerName: string): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'player_eliminated',
      message: `❌ ${playerName} a été éliminé par vote`,
      timestamp: Date.now(),
      data: { playerName }
    });
  }

  static async votingStarted(initiatorName: string): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'voting_started',
      message: `🗳️ ${initiatorName} a lancé une réunion de vote`,
      timestamp: Date.now(),
      data: { initiatorName }
    });
  }

  static async humanVictory(): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'game_ended',
      message: `🎉 VICTOIRE DES HUMAINS ! Le Portail a été refermé !`,
      timestamp: Date.now(),
      data: { winner: 'humans' }
    });
  }

  static async alteredVictory(): Promise<void> {
    await addDoc(collection(db, 'events'), {
      type: 'game_ended',
      message: `👻 VICTOIRE DES ALTÉRÉS ! Le Portail est grand ouvert !`,
      timestamp: Date.now(),
      data: { winner: 'altered' }
    });
  }

  static async getRecentEvents(limitCount: number = 10): Promise<GameEvent[]> {
    const q = query(
      collection(db, 'events'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GameEvent));
  }
}
