import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PlayerStats {
  id: string;
  name: string;
  role: 'human' | 'altered';
  missionsCompleted: number;
  isEliminated: boolean;
  eliminatedAt?: number;
  suspicions: string[];
  votesReceived?: number;
}

interface EndGameStats {
  winner: 'humans' | 'altered';
  endReason: 'portal_closed' | 'portal_opened' | 'all_altered_eliminated' | 'all_humans_eliminated';
  finalPortalLevel: number;
  totalMissionsCompleted: number;
  playersStats: PlayerStats[];
  mvp?: {
    playerId: string;
    playerName: string;
    reason: string;
  };
  duration: number;
  endedAt: number;
}

export function useEndGameState() {
  const [gameEnded, setGameEnded] = useState(false);
  const [endGameStats, setEndGameStats] = useState<EndGameStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'game_state', 'current'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setGameEnded(data.status === 'ended');
          setEndGameStats(data.endGameStats || null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erreur surveillance fin de partie:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { gameEnded, endGameStats, loading };
}
