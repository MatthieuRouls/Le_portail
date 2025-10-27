import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface GameEvent {
  id: string;
  message: string;
  timestamp: number;
  type: string;
}

export class GameEvents {
  static async createEvent(message: string, type: string): Promise<void> {
    try {
      await addDoc(collection(db, 'game_events'), {
        message,
        type,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      });
      console.log('✅ Événement créé:', message);
    } catch (error) {
      console.error('❌ Erreur création événement:', error);
    }
  }

  static async gameStarted(): Promise<void> {
    await this.createEvent(
      '🎮 La partie a commencé ! Le Portail s\'ouvre...',
      'game_started'
    );
  }

  static async missionCompleted(playerName: string, playerId: string): Promise<void> {
    await this.createEvent(
      `✅ ${playerName} a complété sa mission !`,
      'mission_completed'
    );
  }

  static async portalIncreased(newLevel: number): Promise<void> {
    await this.createEvent(
      `📈 Le Portail s'ouvre davantage... Niveau ${newLevel}/20`,
      'portal_increased'
    );
  }

  static async portalDecreased(newLevel: number): Promise<void> {
    await this.createEvent(
      `📉 Le Portail se referme légèrement... Niveau ${newLevel}/20`,
      'portal_decreased'
    );
  }

  static async playerEliminated(playerName: string): Promise<void> {
    await this.createEvent(
      `❌ ${playerName} a été éliminé par vote !`,
      'player_eliminated'
    );
  }

  static async votingStarted(initiatorName: string): Promise<void> {
    await this.createEvent(
      `🗳️ ${initiatorName} a lancé une réunion ! Temps de voter.`,
      'vote_started'
    );
  }

  static async suspicionAdded(suspectName: string, playerName: string): Promise<void> {
    await this.createEvent(
      `🔍 ${playerName} surveille ${suspectName}`,
      'suspicion_added'
    );
  }

  static async humanVictory(): Promise<void> {
    await this.createEvent(
      '🎉 VICTOIRE DES HUMAINS ! Le Portail est refermé.',
      'human_victory'
    );
  }

  static async alteredVictory(): Promise<void> {
    await this.createEvent(
      '👻 VICTOIRE DES ALTÉRÉS ! Le Portail est grand ouvert.',
      'altered_victory'
    );
  }
}
