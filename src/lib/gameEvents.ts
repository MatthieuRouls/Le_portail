import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export type EventType = 'mission_completed' | 'portal_increased' | 'portal_decreased' | 'player_eliminated' | 'reunion_scheduled' | 'suspicion_added';

export interface CreateEventData {
  type: EventType;
  message: string;
  playerId?: string;
  playerName?: string;
}

export async function createGameEvent(data: CreateEventData): Promise<boolean> {
  try {
    await addDoc(collection(db, 'game_events'), {
      ...data,
      timestamp: Date.now()
    });
    console.log('✅ Événement créé:', data.message);
    return true;
  } catch (error) {
    console.error('❌ Erreur création événement:', error);
    return false;
  }
}

// Fonctions helper pour créer des événements spécifiques
export const GameEvents = {
  missionCompleted: (playerName: string, playerId: string) => 
    createGameEvent({
      type: 'mission_completed',
      message: `${playerName} a complété sa mission`,
      playerName,
      playerId
    }),

  portalIncreased: (newLevel: number) => 
    createGameEvent({
      type: 'portal_increased',
      message: `Le Portail a augmenté son niveau (${newLevel})`
    }),

  portalDecreased: (newLevel: number) => 
    createGameEvent({
      type: 'portal_decreased',
      message: `Le Portail a diminué son niveau (${newLevel})`
    }),

  playerEliminated: (playerName: string, playerId: string) => 
    createGameEvent({
      type: 'player_eliminated',
      message: `${playerName} a été éliminé`,
      playerName,
      playerId
    }),

  reunionScheduled: () => 
    createGameEvent({
      type: 'reunion_scheduled',
      message: 'Une Réunion approche'
    }),

  suspicionAdded: (suspectName: string, byPlayerName: string) => 
    createGameEvent({
      type: 'suspicion_added',
      message: `${byPlayerName} a ajouté ${suspectName} aux suspects`,
      playerName: byPlayerName
    })
};
