import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// ✅ EXPORTS des interfaces
export interface Mission {
  id: string;
  assignedTo: string;
  assignedToName: string;
  targetId: string;
  targetName: string;
  tier: number;
  riddle?: string;
  instruction?: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  result?: 'success' | 'failed';
  isSilent?: boolean;
}

export interface Trap {
  id: string;
  type: 'inverse_trap' | 'mission_theft';
  assignedTo: string;
  targetId?: string;
  targetName?: string;
  targetHint?: string;
  humanTargetId?: string;
  guessedTargetId?: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  result?: 'success' | 'failed';
}

export interface Player {
  id: string;
  name: string;
  role: 'human' | 'altered';
  currentMission: Mission | null;
  missionQueue: Mission[];
  missionsCompleted: string[];
  allMissionsCompleted: boolean;
  isEliminated: boolean;
  suspicions: string[];
  createdAt: number;
  lastScanAttemptTime?: number;
  lastValidationTime?: number;
  consecutiveFailures?: number;
  trapsRemaining?: number;
  activeTrap?: Trap | null;
  trapsCompleted?: string[];
}

export async function createPlayer(
  id: string,
  name: string,
  role: 'human' | 'altered'
): Promise<{ success: boolean; message: string }> {
  try {
    const playerRef = doc(db, 'players', id);
    const existingPlayer = await getDoc(playerRef);
    
    if (existingPlayer.exists()) {
      return {
        success: false,
        message: `❌ Le joueur "${id}" existe déjà`
      };
    }
    
    const player: Player = {
      id,
      name,
      role,
      currentMission: null,
      missionQueue: [],
      missionsCompleted: [],
      allMissionsCompleted: false,
      isEliminated: false,
      suspicions: [],
      createdAt: Date.now(),
      lastScanAttemptTime: 0,
      lastValidationTime: 0,
      consecutiveFailures: 0,
      ...(role === 'altered' && {
        trapsRemaining: 2,
        activeTrap: null,
        trapsCompleted: []
      })
    };
    
    await setDoc(playerRef, player);
    
    return {
      success: true,
      message: `✅ Joueur "${name}" créé avec succès`
    };
  } catch (error) {
    console.error('❌ Erreur création joueur:', error);
    return {
      success: false,
      message: `❌ Erreur: ${error}`
    };
  }
}

export async function deletePlayer(playerId: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteDoc(doc(db, 'players', playerId));
    return {
      success: true,
      message: `✅ Joueur supprimé`
    };
  } catch (error) {
    console.error('❌ Erreur suppression joueur:', error);
    return {
      success: false,
      message: `❌ Erreur: ${error}`
    };
  }
}

export async function getAllPlayers(): Promise<Player[]> {
  try {
    const snapshot = await getDocs(collection(db, 'players'));
    return snapshot.docs.map(doc => doc.data() as Player);
  } catch (error) {
    console.error('❌ Erreur récupération joueurs:', error);
    return [];
  }
}
