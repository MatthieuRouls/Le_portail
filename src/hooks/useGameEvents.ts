import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface GameEvent {
  id: string;
  type: 'mission_completed' | 'portal_increased' | 'portal_decreased' | 'player_eliminated' | 'reunion_scheduled' | 'suspicion_added';
  message: string;
  playerId?: string;
  playerName?: string;
  timestamp: number;
}

export function useGameEvents(maxEvents: number = 10) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventsRef = collection(db, 'game_events');
    const q = query(
      eventsRef,
      orderBy('timestamp', 'desc'),
      limit(maxEvents)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: GameEvent[] = [];
      snapshot.forEach((doc) => {
        eventsData.push({
          id: doc.id,
          ...doc.data()
        } as GameEvent);
      });
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [maxEvents]);

  return { events, loading };
}
