import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface GameState {
  id: string;
  status: 'waiting' | 'ongoing' | 'finished';
  portalLevel: number;
  maxLevel: number;
  startedAt: number;
  humanFragments: number;
  alteredSuccesses: number;
  winner: 'humans' | 'altered' | null;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gameStateRef = doc(db, 'game_state', 'current');

    const unsubscribe = onSnapshot(gameStateRef, (doc) => {
      if (doc.exists()) {
        setGameState({
          id: doc.id,
          ...doc.data()
        } as GameState);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { gameState, loading };
}
