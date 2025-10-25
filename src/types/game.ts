export type PlayerRole = 'human' | 'altered';
export type MissionType = 'investigation' | 'sabotage';
export type GameStatus = 'waiting' | 'ongoing' | 'finished';
export type EventType = 'mission_completed' | 'portal_increased' | 'meeting_triggered' | 'player_eliminated' | 'vote_started' | 'vote_ended';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  qrCode: string;
  currentMission: CurrentMission | null;
  missionsCompleted: string[];
  suspicions: string[];
  isEliminated: boolean;
  votedFor?: string | null; // ID du joueur pour qui il a voté
}

export interface CurrentMission {
  id: string;
  target: string;
  completed: boolean;
  startedAt: number;
}

export interface Meeting {
  id: string;
  meetingNumber: number; // 1, 2, ou 3
  triggeredAt: number;
  triggeredBy: 'mission_threshold'; // Peut être étendu plus tard
  missionThreshold: number; // Seuil de missions qui a déclenché la réunion
  isActive: boolean;
  votingEndsAt: number | null;
  votes: Record<string, string>; // playerId -> targetPlayerId
  eliminatedPlayer: string | null;
}

export interface GameEvent {
  id: string;
  type: EventType;
  timestamp: number;
  message: string;
  data?: Record<string, any>;
}

export interface GameState {
  id: string;
  status: GameStatus;
  portalLevel: number;
  startedAt: number;
  humanFragments: number;
  alteredSuccesses: number;
  winner: 'humans' | 'altered' | null;
  totalMissionsCompleted: number; // Pour tracker le seuil de réunion
  meetingsHeld: number; // Nombre de réunions tenues (max 3)
  currentMeeting: Meeting | null;
  // Seuils pour déclencher les réunions
  meetingThresholds: number[]; // Ex: [7, 14, 20] missions complétées
}