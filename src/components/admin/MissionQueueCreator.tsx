import { useState } from 'react';
import { motion } from 'framer-motion';
import { createMissionQueue } from '../../lib/missionGenerator';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Player {
  id: string;
  name: string;
  role: 'human' | 'altered';
  currentMission?: any;
  missionQueue?: any[];
  isEliminated?: boolean;
}

interface MissionQueueCreatorProps {
  players: Player[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function MissionQueueCreator({ players, onSuccess, onError }: MissionQueueCreatorProps) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [missions, setMissions] = useState([
    { targetId: '', riddle: '' },
    { targetId: '', riddle: '' },
    { targetId: '', riddle: '' }
  ]);
  const [creating, setCreating] = useState(false);

  const availablePlayers = players.filter(p => 
    !p.isEliminated && 
    !p.currentMission && 
    (!p.missionQueue || p.missionQueue.length === 0)
  );
  
  const availableTargets = players.filter(p => !p.isEliminated && p.id !== selectedPlayer);

  const handleMissionChange = (index: number, field: 'targetId' | 'riddle', value: string) => {
    const newMissions = [...missions];
    newMissions[index][field] = value;
    setMissions(newMissions);
  };

  const handleCreate = async () => {
    if (!selectedPlayer) {
      onError('❌ Sélectionne un joueur');
      return;
    }

    // Vérifier que les 3 missions sont remplies
    for (let i = 0; i < 3; i++) {
      if (!missions[i].targetId || !missions[i].riddle.trim()) {
        onError(`❌ Mission ${i + 1} incomplète`);
        return;
      }
    }

    setCreating(true);

    const result = await createMissionQueue(selectedPlayer, missions);

    if (result.success) {
      onSuccess(result.message);
      // Réinitialiser le formulaire
      setSelectedPlayer('');
      setMissions([
        { targetId: '', riddle: '' },
        { targetId: '', riddle: '' },
        { targetId: '', riddle: '' }
      ]);
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
        🎯 CRÉER UNE QUEUE DE 3 MISSIONS
      </h3>

      <div style={{
        display: 'grid',
        gap: '1.5rem',
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
            👤 Qui reçoit ces missions ?
          </label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
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
              <option disabled>Aucun joueur disponible</option>
            )}
          </select>
        </div>

        {/* Les 3 missions */}
        {missions.map((mission, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(127, 29, 29, 0.1)',
              border: '2px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '0.5rem'
            }}
          >
            <h4 style={{
              fontSize: '0.875rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '0.75rem',
              fontFamily: 'monospace'
            }}>
              🎯 MISSION {index + 1} (Tier {index + 1})
            </h4>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginBottom: '0.375rem',
                  fontFamily: 'monospace'
                }}>
                  Cible à trouver
                </label>
                <select
                  value={mission.targetId}
                  onChange={(e) => handleMissionChange(index, 'targetId', e.target.value)}
                  disabled={!selectedPlayer}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#d1d5db',
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    opacity: selectedPlayer ? 1 : 0.5
                  }}
                >
                  <option value="">-- Sélectionner --</option>
                  {availableTargets.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.role === 'human' ? '👤' : '👻'} {player.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginBottom: '0.375rem',
                  fontFamily: 'monospace'
                }}>
                  Énigme
                </label>
                <textarea
                  value={mission.riddle}
                  onChange={(e) => handleMissionChange(index, 'riddle', e.target.value)}
                  placeholder={`Énigme pour trouver la cible ${index + 1}...`}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    color: '#d1d5db',
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Aperçu */}
        {selectedPlayer && missions.every(m => m.targetId && m.riddle) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem'
            }}
          >
            <div style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontFamily: 'monospace',
              marginBottom: '0.5rem'
            }}>
              ✅ APERÇU DE LA QUEUE
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
                {' '}aura 3 missions successives :
              </div>
              {missions.map((mission, index) => (
                <div key={index} style={{ marginLeft: '1rem', marginBottom: '0.375rem' }}>
                  {index + 1}. Trouver{' '}
                  <span style={{ color: '#dc2626' }}>
                    {players.find(p => p.id === mission.targetId)?.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Button
        onClick={handleCreate}
        variant="primary"
        disabled={creating || !selectedPlayer || !missions.every(m => m.targetId && m.riddle.trim())}
      >
        {creating ? '⏳ CRÉATION...' : '✅ CRÉER LA QUEUE DE 3 MISSIONS'}
      </Button>
    </Card>
  );
}
