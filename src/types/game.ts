export type PlayerRole = 'human' | 'altered';
export type MissionType = 'investigation' | 'sabotage';
export type GameStatus = 'waiting' | 'ongoing' | 'finished';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  qrCode: string;
  currentMission: CurrentMission | null;
  missionsCompleted: string[];
  suspicions: string[];
  isEliminated: boolean;
}

export interface CurrentMission {
  id: string;
  target: string;
  completed: boolean;
  startedAt: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  portalLevel: number;
  startedAt: number;
  humanFragments: number;
  alteredSuccesses: number;
  winner: 'humans' | 'altered' | null;
}