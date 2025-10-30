import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface GameEvent {
  id: string;
  type: 'mission_completed' | 'portal_change' | 'player_eliminated' | 'voting_started' | 'game_ended';
  message: string;
  timestamp: number;
  data?: any;
}

export function useGameEvents(limitCount: number = 10) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as GameEvent));
        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erreur chargement événements:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { events, loading };
}
