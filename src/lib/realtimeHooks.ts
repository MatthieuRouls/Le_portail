import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { GameState, Player, GameEvent, Meeting } from '../types/game';

/**
 * Hook pour écouter l'état du jeu en temps réel
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gameStateRef = doc(db, 'game_state', 'current');

    const unsubscribe = onSnapshot(
      gameStateRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setGameState({ id: snapshot.id, ...snapshot.data() } as GameState);
          setLoading(false);
        } else {
          setError('Game state not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to game state:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { gameState, loading, error };
}

/**
 * Hook pour écouter un joueur spécifique en temps réel
 */
export function usePlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    const playerRef = doc(db, 'players', playerId);

    const unsubscribe = onSnapshot(
      playerRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPlayer({ id: snapshot.id, ...snapshot.data() } as Player);
          setLoading(false);
        } else {
          setError('Player not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to player:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [playerId]);

  return { player, loading, error };
}

/**
 * Hook pour écouter tous les joueurs en temps réel
 */
export function useAllPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const playersRef = collection(db, 'players');

    const unsubscribe = onSnapshot(
      playersRef,
      (snapshot) => {
        const playersData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Player)
        );
        setPlayers(playersData);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to players:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { players, loading, error };
}

/**
 * Hook pour écouter les événements en temps réel (les plus récents)
 */
export function useGameEvents(maxEvents: number = 10) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventsRef = collection(db, 'game_events');
    const eventsQuery = query(
      eventsRef,
      orderBy('timestamp', 'desc'),
      limit(maxEvents)
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as GameEvent)
        );
        setEvents(eventsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to events:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxEvents]);

  return { events, loading, error };
}

/**
 * Hook pour écouter la réunion en cours
 */
export function useCurrentMeeting() {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gameStateRef = doc(db, 'game_state', 'current');

    const unsubscribe = onSnapshot(
      gameStateRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setMeeting(data.currentMeeting || null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to meeting:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { meeting, loading, error };
}
