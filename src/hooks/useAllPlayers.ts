import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Player {
  id: string;
  name: string;
  role: 'human' | 'altered';
  currentMission?: any;
  missionsCompleted?: string[];
  isEliminated?: boolean;
  suspicions?: string[];
}

export function useAllPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        const playersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Player));
        setPlayers(playersData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erreur chargement joueurs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { players, loading };
}
