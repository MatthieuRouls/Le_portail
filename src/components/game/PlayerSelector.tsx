import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface PlayerSelectorProps {
  onSelect: (playerId: string, playerName: string, role: string) => void;
  onClose: () => void;
}

export default function PlayerSelector({ onSelect, onClose }: PlayerSelectorProps) {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersSnapshot = await getDocs(collection(db, 'players'));
      const playersData = playersSnapshot.docs.map(doc => doc.data());
      setPlayers(playersData.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'auto'
      }}
    >
      <Card style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <h2 style={{
          color: '#dc2626',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontFamily: 'monospace',
          textAlign: 'center'
        }}>
          SÉLECTIONNER UN JOUEUR
        </h2>

        <input
          type="text"
          placeholder="Rechercher un nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#111827',
            border: '2px solid #374151',
            borderRadius: '0.375rem',
            color: '#d1d5db',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        />

        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontFamily: 'monospace' }}>
            Chargement...
          </p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '0.5rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {filteredPlayers.map((player) => (
              <motion.button
                key={player.id}
                onClick={() => onSelect(player.id, player.name, player.role)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '1rem',
                  backgroundColor: player.role === 'human' ? '#064e3b' : '#7f1d1d',
                  border: '2px solid',
                  borderColor: player.role === 'human' ? '#10b981' : '#dc2626',
                  borderRadius: '0.375rem',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{player.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {player.role === 'human' ? '👤 HUMAIN' : '👻 ALTÉRÉ'}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Button onClick={onClose} variant="secondary">
            ANNULER
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
