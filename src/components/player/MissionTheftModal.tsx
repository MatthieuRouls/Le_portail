import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Player {
  id: string;
  name: string;
  role: string;
  currentMission: any;
}

interface MissionTheftModalProps {
  players: Player[];
  currentPlayerId: string;
  onAttemptTheft: (humanId: string, guessedTargetId: string) => void;
  onClose: () => void;
}

export default function MissionTheftModal({
  players,
  currentPlayerId,
  onAttemptTheft,
  onClose
}: MissionTheftModalProps) {
  const [selectedHuman, setSelectedHuman] = useState<string>('');
  const [guessedTarget, setGuessedTarget] = useState<string>('');

  const humansWithMissions = players.filter(
    p => p.id !== currentPlayerId && 
         p.role === 'human' && 
         p.currentMission !== null
  );

  const allPossibleTargets = players.filter(
    p => p.id !== currentPlayerId && p.id !== selectedHuman
  );

  const handleConfirm = () => {
    if (selectedHuman && guessedTarget) {
      onAttemptTheft(selectedHuman, guessedTarget);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Card>
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#dc2626',
              fontFamily: 'monospace',
              marginBottom: '0.5rem'
            }}>
              🕵️ VOL DE MISSION
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontFamily: 'monospace'
            }}>
              Devine la cible d'un humain
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              marginBottom: '0.75rem',
              fontWeight: 'bold'
            }}>
              1️⃣ Quel humain veux-tu cibler ?
            </div>

            {humansWithMissions.length === 0 ? (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '0.5rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}>
                ❌ Aucun humain avec mission active
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {humansWithMissions.map(human => (
                  <button
                    key={human.id}
                    onClick={() => {
                      setSelectedHuman(human.id);
                      setGuessedTarget('');
                    }}
                    style={{
                      padding: '1rem',
                      backgroundColor: selectedHuman === human.id
                        ? 'rgba(234, 179, 8, 0.3)'
                        : 'rgba(17, 24, 39, 0.5)',
                      border: selectedHuman === human.id
                        ? '2px solid rgba(234, 179, 8, 0.8)'
                        : '1px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '0.5rem',
                      color: '#e5e7eb',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>👤 {human.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedHuman && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#e5e7eb',
                fontFamily: 'monospace',
                marginBottom: '0.75rem',
                fontWeight: 'bold'
              }}>
                2️⃣ Quelle est sa cible selon toi ?
              </div>

              <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {allPossibleTargets.map(target => (
                  <button
                    key={target.id}
                    onClick={() => setGuessedTarget(target.id)}
                    style={{
                      padding: '1rem',
                      backgroundColor: guessedTarget === target.id
                        ? 'rgba(234, 179, 8, 0.3)'
                        : 'rgba(17, 24, 39, 0.5)',
                      border: guessedTarget === target.id
                        ? '2px solid rgba(234, 179, 8, 0.8)'
                        : '1px solid rgba(75, 85, 99, 0.5)',
                      borderRadius: '0.5rem',
                      color: '#e5e7eb',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>
                      {target.role === 'human' ? '👤' : '👻'} {target.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {target.role === 'human' ? 'Humain' : 'Altéré'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedHuman && guessedTarget && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#e5e7eb',
                fontFamily: 'monospace',
                lineHeight: '1.5'
              }}>
                ✅ Tu penses que <strong>{humansWithMissions.find(h => h.id === selectedHuman)?.name}</strong> doit trouver <strong>{allPossibleTargets.find(t => t.id === guessedTarget)?.name}</strong> ?
                <br /><br />
                Si tu as raison : +2 Portail et sa mission est invalidée !
                <br />
                Si tu te trompes : Aucun piège consommé, tu peux réessayer.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Button onClick={onClose} variant="secondary">
              ANNULER
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              disabled={!selectedHuman || !guessedTarget}
            >
              TENTER LE VOL
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
