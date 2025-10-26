import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PlayerData {
  id: string;
  name: string;
  role: 'human' | 'altered';
  qrCode: string;
  currentMission: {
    id: string;
    targetId: string;
    targetName: string;
    riddle?: string;
    instruction?: string;
    type?: 'investigation' | 'sabotage';
  } | null;
  missionsCompleted: string[];
  suspicions: string[];
  isEliminated: boolean;
  createdAt: number;
}

export function usePlayerData(playerId: string | null) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    const playerRef = doc(db, 'players', playerId);

    const unsubscribe = onSnapshot(playerRef, (doc) => {
      if (doc.exists()) {
        setPlayerData({
          id: doc.id,
          ...doc.data()
        } as PlayerData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [playerId]);

  return { playerData, loading };
}
