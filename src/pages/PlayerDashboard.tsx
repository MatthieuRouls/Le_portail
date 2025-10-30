import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerData } from '../hooks/usePlayerData';
import { useAllPlayers } from '../hooks/useAllPlayers';
import { useGameState } from '../hooks/useGameState';
import { useGameEvents } from '../hooks/useGameEvents';
import { validateMission } from '../lib/missionValidator';
import { activateInverseTrap, attemptMissionTheft, cancelTrap } from '../lib/trapManager';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PortalGauge from '../components/ui/PortalGauge';
import QRScanner from '../components/QRScanner';
import TrapSelector from '../components/player/TrapSelector';
import MissionTheftModal from '../components/player/MissionTheftModal';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';

interface PlayerDashboardProps {
  playerId: string;
  onNavigate: (page: 'home' | 'login') => void;
}

export default function PlayerDashboard({ playerId, onNavigate }: PlayerDashboardProps) {
  const { playerData, loading: playerLoading } = usePlayerData(playerId);
  const { gameState, loading: gameLoading } = useGameState();
  const { players } = useAllPlayers();
  const { events } = useGameEvents(5);
  
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showTrapSelector, setShowTrapSelector] = useState(false);
  const [showMissionTheft, setShowMissionTheft] = useState(false);
  const [trapMessage, setTrapMessage] = useState<string>('');

  const handleScan = async (data: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setShowScanner(false);
    
    try {
      const result = await validateMission(data, playerId);
      setScanResult(result.message);
      
      setTimeout(() => {
        setScanResult('');
      }, 5000);
    } catch (error) {
      setScanResult(`❌ Erreur : ${error}`);
      setTimeout(() => {
        setScanResult('');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateInverseTrap = async (humanId: string) => {
    setShowTrapSelector(false);
    const result = await activateInverseTrap(playerId, humanId);
    setTrapMessage(result.message);
    setTimeout(() => setTrapMessage(''), 8000);
  };

  const handleOpenMissionTheft = () => {
    setShowTrapSelector(false);
    setShowMissionTheft(true);
  };

  const handleAttemptTheft = async (humanId: string, guessedTargetId: string) => {
    setShowMissionTheft(false);
    const result = await attemptMissionTheft(playerId, humanId, guessedTargetId);
    setTrapMessage(result.message);
    setTimeout(() => setTrapMessage(''), 8000);
  };

  const handleCancelTrap = async () => {
    const result = await cancelTrap(playerId);
    setTrapMessage(result.message);
    setTimeout(() => setTrapMessage(''), 3000);
  };

  if (playerLoading || gameLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d1d5db'
      }}>
        ⏳ Chargement...
      </div>
    );
  }

  if (!playerData) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#d1d5db'
      }}>
        Joueur introuvable
      </div>
    );
  }

  if (playerData.isEliminated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <StaticNoise />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '2rem',
          zIndex: 10
        }}>
          <GlitchText style={{ fontSize: '3rem', color: '#dc2626' }}>
            <h1>☠️ ÉLIMINÉ</h1>
          </GlitchText>
          <p style={{ color: '#9ca3af', fontFamily: 'monospace' }}>
            Tu as été éliminé du jeu
          </p>
          <Button onClick={() => onNavigate('home')} variant="secondary">
            RETOUR
          </Button>
        </div>
      </div>
    );
  }

  if (gameState?.gameEnded) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <StaticNoise />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '2rem',
          zIndex: 10
        }}>
          <GlitchText style={{ fontSize: '3rem', color: '#dc2626' }}>
            <h1>🏁 PARTIE TERMINÉE</h1>
          </GlitchText>
          <div style={{
            textAlign: 'center',
            color: '#e5e7eb',
            fontFamily: 'monospace',
            fontSize: '1.5rem'
          }}>
            {gameState.winner === 'humans' ? '👤 VICTOIRE DES HUMAINS' : '👻 VICTOIRE DES ALTÉRÉS'}
          </div>
          <p style={{ color: '#9ca3af', fontFamily: 'monospace', textAlign: 'center' }}>
            {gameState.endReason}
          </p>
          <Button onClick={() => onNavigate('home')} variant="secondary">
            RETOUR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <StaticNoise />
      <FlickeringLights />
      
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(127, 29, 29, 0.15) 0%, #000000 70%)'
      }} />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '1.5rem 0',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <motion.button
            onClick={() => onNavigate('login')}
            whileHover={{ x: -5 }}
            style={{
              color: '#dc2626',
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← DÉCONNEXION
          </motion.button>

          <GlitchText style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <h1>{playerData.name}</h1>
          </GlitchText>

          <div style={{
            color: playerData.role === 'human' ? '#10b981' : '#dc2626',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            {playerData.role === 'human' ? '👤 HUMAIN' : '👻 ALTÉRÉ'}
          </div>
        </div>

        <AnimatePresence>
          {(scanResult || trapMessage) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: (scanResult || trapMessage).includes('✅')
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
                border: (scanResult || trapMessage).includes('✅')
                  ? '1px solid rgba(16, 185, 129, 0.5)'
                  : '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '0.5rem',
                color: (scanResult || trapMessage).includes('✅') ? '#10b981' : '#ef4444',
                fontFamily: 'monospace',
                whiteSpace: 'pre-line',
                textAlign: 'center'
              }}
            >
              {scanResult || trapMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <Card style={{ marginBottom: '1.5rem' }}>
          <PortalGauge
            level={gameState?.portalLevel || 0}
            maxLevel={20}
          />
        </Card>

        {playerData.currentMission && (
          <Card style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              🎯 MISSION ACTIVE
            </h3>
            
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(127, 29, 29, 0.3)',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                marginBottom: '0.5rem'
              }}>
                Tier {playerData.currentMission.tier}
              </div>
              <div style={{
                fontSize: '1.125rem',
                color: '#e5e7eb',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {playerData.currentMission.riddle}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#d1d5db',
                fontFamily: 'monospace'
              }}>
                {playerData.currentMission.instruction}
              </div>
            </div>

            <Button
              onClick={() => setShowScanner(true)}
              variant="primary"
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ EN COURS...' : '📱 SCANNER QR CODE'}
            </Button>

            {playerData.missionQueue && playerData.missionQueue.length > 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid rgba(234, 179, 8, 0.5)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#fbbf24',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}>
                📋 {playerData.missionQueue.length} mission{playerData.missionQueue.length > 1 ? 's' : ''} en attente
              </div>
            )}
          </Card>
        )}

        {playerData.allMissionsCompleted && !playerData.currentMission && (
          <Card style={{ marginBottom: '1.5rem' }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#10b981',
              fontFamily: 'monospace'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                TOUTES LES MISSIONS TERMINÉES !
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Continue à chercher les Altérés
              </div>
            </div>
          </Card>
        )}

        {playerData.role === 'altered' && (
          <Card style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              👻 PIÈGES DISPONIBLES
            </h3>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#e5e7eb',
                fontFamily: 'monospace'
              }}>
                Pièges restants
              </div>
              <div style={{
                fontSize: '1.5rem',
                color: '#a78bfa',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}>
                {playerData.trapsRemaining || 0}/2
              </div>
            </div>

            {playerData.activeTrap && (
              <div style={{
                padding: '1rem',
                backgroundColor: playerData.activeTrap.type === 'inverse_trap'
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(234, 179, 8, 0.2)',
                border: playerData.activeTrap.type === 'inverse_trap'
                  ? '2px solid rgba(139, 92, 246, 0.5)'
                  : '2px solid rgba(234, 179, 8, 0.5)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#e5e7eb',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}>
                    {playerData.activeTrap.type === 'inverse_trap' ? '🎭 PIÈGE INVERSÉ ACTIF' : '🕵️ VOL EN COURS'}
                  </div>
                  <button
                    onClick={handleCancelTrap}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.5)',
                      border: '1px solid rgba(239, 68, 68, 0.7)',
                      borderRadius: '0.25rem',
                      color: '#fff',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>

                {playerData.activeTrap.type === 'inverse_trap' && (
                  <>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#d1d5db',
                      fontFamily: 'monospace',
                      marginBottom: '0.5rem'
                    }}>
                      🎯 Cible : <strong>{playerData.activeTrap.targetName}</strong>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#d1d5db',
                      fontFamily: 'monospace',
                      marginBottom: '0.5rem'
                    }}>
                      💡 Indice : <em>{playerData.activeTrap.targetHint}</em>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      fontFamily: 'monospace',
                      marginTop: '0.75rem',
                      fontStyle: 'italic'
                    }}>
                      Fais-toi scanner par {playerData.activeTrap.targetName} pour réussir le piège
                    </div>
                  </>
                )}
              </div>
            )}

            {!playerData.activeTrap && (playerData.trapsRemaining || 0) > 0 && (
              <Button
                onClick={() => setShowTrapSelector(true)}
                variant="secondary"
              >
                👻 ACTIVER UN PIÈGE
              </Button>
            )}

            {(playerData.trapsRemaining || 0) === 0 && !playerData.activeTrap && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                border: '1px solid rgba(107, 114, 128, 0.5)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                textAlign: 'center'
              }}>
                ❌ Plus de pièges disponibles
              </div>
            )}
          </Card>
        )}

        <Card>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#e5e7eb',
            marginBottom: '1rem',
            fontFamily: 'monospace'
          }}>
            📜 ÉVÉNEMENTS RÉCENTS
          </h3>
          {events.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(17, 24, 39, 0.5)',
                    borderRadius: '0.375rem',
                    color: '#9ca3af',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  <span style={{ color: '#dc2626' }}>•</span> {event.message}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              fontFamily: 'monospace',
              padding: '2rem'
            }}>
              Aucun événement
            </div>
          )}
        </Card>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {playerData.role === 'altered' && showTrapSelector && (
        <TrapSelector
          players={players}
          currentPlayerId={playerId}
          trapsRemaining={playerData.trapsRemaining || 0}
          onSelectInverseTrap={handleActivateInverseTrap}
          onSelectMissionTheft={handleOpenMissionTheft}
          onClose={() => setShowTrapSelector(false)}
        />
      )}

      {playerData.role === 'altered' && showMissionTheft && (
        <MissionTheftModal
          players={players}
          currentPlayerId={playerId}
          onAttemptTheft={handleAttemptTheft}
          onClose={() => setShowMissionTheft(false)}
        />
      )}
    </div>
  );
}
