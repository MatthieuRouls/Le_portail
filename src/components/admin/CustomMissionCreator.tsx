import { useState } from 'react';
import { motion } from 'framer-motion';
import { createCustomMission } from '../../lib/missionGenerator';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Player {
  id: string;
  name: string;
  role: 'human' | 'altered';
  currentMission?: any;
  isEliminated?: boolean;
}

interface CustomMissionCreatorProps {
  players: Player[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function CustomMissionCreator({ players, onSuccess, onError }: CustomMissionCreatorProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [riddle, setRiddle] = useState('');
  const [creating, setCreating] = useState(false);

  const availablePlayers = players.filter(p => !p.isEliminated && !p.currentMission);
  const availableTargets = players.filter(p => !p.isEliminated && p.id !== selectedPlayer);

  const handleCreate = async () => {
    if (!selectedPlayer || !selectedTarget || !riddle.trim()) {
      onError('❌ Tous les champs sont requis');
      return;
    }

    setCreating(true);

    const result = await createCustomMission(
      selectedPlayer,
      selectedTarget,
      riddle.trim()
    );

    if (result.success) {
      onSuccess(result.message);
      // Réinitialiser le formulaire
      setSelectedPlayer('');
      setSelectedTarget('');
      setRiddle('');
    } else {
      onError(result.message);
    }

    setCreating(false);
  };

  return (
    <Card>
      <h3 style={{
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#e5e7eb',
        marginBottom: '1rem',
        fontFamily: 'monospace'
      }}>
        🎯 CRÉER UNE MISSION PERSONNALISÉE
      </h3>

      <div style={{
        display: 'grid',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Sélection du joueur */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            color: '#9ca3af',
            marginBottom: '0.5rem',
            fontFamily: 'monospace'
          }}>
            1️⃣ Qui reçoit la mission ?
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => {
              setSelectedPlayer(e.target.value);
              if (e.target.value === selectedTarget) {
                setSelectedTarget('');
              }
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#111827',
              border: '2px solid #374151',
              borderRadius: '0.5rem',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            <option value="">-- Sélectionner un joueur --</option>
            {availablePlayers.length > 0 ? (
              availablePlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.role === 'human' ? '👤' : '👻'} {player.name}
                </option>
              ))
            ) : (
              <option disabled>Aucun joueur disponible (tous ont une mission)</option>
            )}
          </select>
        </div>

        {/* Sélection de la cible */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            color: '#9ca3af',
            marginBottom: '0.5rem',
            fontFamily: 'monospace'
          }}>
            2️⃣ Qui est la cible à trouver ?
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            disabled={!selectedPlayer}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#111827',
              border: '2px solid #374151',
              borderRadius: '0.5rem',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              opacity: selectedPlayer ? 1 : 0.5
            }}
          >
            <option value="">-- Sélectionner la cible --</option>
            {availableTargets.map(player => (
              <option key={player.id} value={player.id}>
                {player.role === 'human' ? '👤' : '👻'} {player.name}
              </option>
            ))}
          </select>
        </div>

        {/* Énigme */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            color: '#9ca3af',
            marginBottom: '0.5rem',
            fontFamily: 'monospace'
          }}>
            3️⃣ Énigme à résoudre
          </label>
          <textarea
            value={riddle}
            onChange={(e) => setRiddle(e.target.value)}
            placeholder="Ex: Trouve celui qui porte le nom d'une fleur..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#111827',
              border: '2px solid #374151',
              borderRadius: '0.5rem',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Aperçu */}
        {selectedPlayer && selectedTarget && riddle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(127, 29, 29, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '0.5rem'
            }}
          >
            <div style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontFamily: 'monospace',
              marginBottom: '0.5rem'
            }}>
              📋 APERÇU DE LA MISSION
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>
                  {players.find(p => p.id === selectedPlayer)?.name}
                </span>
                {' '}doit trouver{' '}
                <span style={{ color: '#dc2626' }}>
                  {players.find(p => p.id === selectedTarget)?.name}
                </span>
              </div>
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                borderRadius: '0.375rem',
                borderLeft: '3px solid #dc2626'
              }}>
                💡 {riddle}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Button
        onClick={handleCreate}
        variant="primary"
        disabled={creating || !selectedPlayer || !selectedTarget || !riddle.trim()}
      >
        {creating ? '⏳ CRÉATION...' : '✅ CRÉER LA MISSION'}
      </Button>
    </Card>
  );
}
