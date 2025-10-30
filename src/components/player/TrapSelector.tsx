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

interface TrapSelectorProps {
  players: Player[];
  currentPlayerId: string;
  trapsRemaining: number;
  onSelectInverseTrap: (humanId: string) => void;
  onSelectMissionTheft: () => void;
  onClose: () => void;
}

export default function TrapSelector({
  players,
  currentPlayerId,
  trapsRemaining,
  onSelectInverseTrap,
  onSelectMissionTheft,
  onClose
}: TrapSelectorProps) {
  const [selectedType, setSelectedType] = useState<'inverse' | 'theft' | null>(null);
  const [selectedHuman, setSelectedHuman] = useState<string>('');

  const humansWithMissions = players.filter(
    p => p.id !== currentPlayerId && 
         p.role === 'human' && 
         p.currentMission !== null
  );

  const handleConfirm = () => {
    if (selectedType === 'inverse' && selectedHuman) {
      onSelectInverseTrap(selectedHuman);
    } else if (selectedType === 'theft') {
      onSelectMissionTheft();
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
        style={{ maxWidth: '500px', width: '100%' }}
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
              👻 ACTIVER UN PIÈGE
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontFamily: 'monospace'
            }}>
              Pièges restants : {trapsRemaining}/2
            </p>
          </div>

          {!selectedType && (
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setSelectedType('inverse')}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  border: '2px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '0.75rem',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎭</div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  PIÈGE INVERSÉ
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.5' }}>
                  Fais-toi scanner par un humain spécifique. Tu recevras un indice sur sa vraie cible.
                  <br />
                  <span style={{ color: '#10b981' }}>Récompense : +1 Portail + Cooldown humain augmenté</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('theft')}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  border: '2px solid rgba(234, 179, 8, 0.5)',
                  borderRadius: '0.75rem',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕵️</div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  VOL DE MISSION
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.5' }}>
                  Devine la cible d'un humain et invalide sa mission s'il est correct.
                  <br />
                  <span style={{ color: '#10b981' }}>Récompense : +2 Portail + Mission invalidée</span>
                </div>
              </button>
            </div>
          )}

          {selectedType === 'inverse' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                marginBottom: '1rem'
              }}>
                🎯 Choisis l'humain qui doit te scanner :
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
                  ❌ Aucun humain avec mission active disponible
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {humansWithMissions.map(human => (
                    <button
                      key={human.id}
                      onClick={() => setSelectedHuman(human.id)}
                      style={{
                        padding: '1rem',
                        backgroundColor: selectedHuman === human.id
                          ? 'rgba(139, 92, 246, 0.3)'
                          : 'rgba(17, 24, 39, 0.5)',
                        border: selectedHuman === human.id
                          ? '2px solid rgba(139, 92, 246, 0.8)'
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
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                        Mission active : {human.currentMission?.tier ? `Tier ${human.currentMission.tier}` : 'Oui'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedType === 'theft' && (
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
                📝 Tu vas devoir choisir un humain et deviner quelle est sa cible.
                <br /><br />
                Si tu devines correctement : +2 Portail et sa mission est invalidée !
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Button
              onClick={onClose}
              variant="secondary"
            >
              {selectedType ? '← RETOUR' : 'ANNULER'}
            </Button>
            <Button
              onClick={() => {
                if (selectedType === 'inverse' && selectedHuman) {
                  handleConfirm();
                } else if (selectedType === 'theft') {
                  handleConfirm();
                } else if (!selectedType) {
                  onClose();
                }
              }}
              variant="primary"
              disabled={selectedType === 'inverse' && !selectedHuman}
            >
              {selectedType ? 'CONFIRMER' : 'FERMER'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
