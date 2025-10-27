import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';
import PortalGauge from '../components/ui/PortalGauge';
import QRScannerMobile from '../components/game/QRScannerMobile';
import PlayerSelector from '../components/game/PlayerSelector';
import SuspectSelector from '../components/game/SuspectSelector';
import VotingInterface from '../components/game/VotingInterface';
import EndGameScreen from '../components/game/EndGameScreen';
import { useGameState } from '../hooks/useGameState';
import { usePlayerData } from '../hooks/usePlayerData';
import { useGameEvents } from '../hooks/useGameEvents';
import { useEndGameState } from '../hooks/useEndGameState';
import { getCurrentPlayer } from '../lib/playerAuth';
import { validateMission } from '../lib/missionValidator';
import { addSuspect, removeSuspect } from '../lib/suspectsManager';
import { startVotingSession, getActiveVotingSession } from '../lib/votingSystem';
import { debugScanResult } from '../lib/debugMission';

interface PlayerDashboardProps {
  onNavigate: (page: 'home' | 'login' | 'player') => void;
}

const ModernCard = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      backgroundColor: 'rgba(15, 15, 15, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(127, 29, 29, 0.3)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}
  >
    {children}
  </motion.div>
);

const ModernButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  style = {} 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger'; 
  disabled?: boolean; 
  style?: React.CSSProperties 
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        width: '100%',
        padding: '0.875rem 1.5rem',
        backgroundColor: isDanger 
          ? 'rgba(220, 38, 38, 0.6)' 
          : isPrimary 
          ? 'rgba(127, 29, 29, 0.6)' 
          : 'rgba(40, 40, 40, 0.6)',
        border: isDanger
          ? '1px solid rgba(220, 38, 38, 0.8)'
          : isPrimary 
          ? '1px solid rgba(220, 38, 38, 0.5)' 
          : '1px solid rgba(75, 85, 99, 0.5)',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)',
        opacity: disabled ? 0.5 : 1,
        ...style
      }}
    >
      {children}
    </motion.button>
  );
};

export default function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const currentPlayer = getCurrentPlayer();
  const { gameState, loading: gameLoading } = useGameState();
  const { playerData, loading: playerLoading } = usePlayerData(currentPlayer?.id || null);
  const { events, loading: eventsLoading } = useGameEvents(5);
  const { gameEnded, endGameStats } = useEndGameState();
  
  const [showScanner, setShowScanner] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [showSuspectSelector, setShowSuspectSelector] = useState(false);
  const [showVotingInterface, setShowVotingInterface] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [suspectMessage, setSuspectMessage] = useState('');
  const [votingMessage, setVotingMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isStartingVote, setIsStartingVote] = useState(false);
  const [hasActiveVote, setHasActiveVote] = useState(false);

  useEffect(() => {
    if (!currentPlayer) {
      onNavigate('login');
    }
  }, [currentPlayer, onNavigate]);

  useEffect(() => {
    checkActiveVote();
    const interval = setInterval(checkActiveVote, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkActiveVote = async () => {
    const activeSession = await getActiveVotingSession();
    setHasActiveVote(!!activeSession);
  };

  const handlePlayerScan = async (playerId: string) => {
    setShowScanner(false);
    setShowSelector(false);
    
    if (!currentPlayer?.id) return;
    
    setIsValidating(true);
    setValidationMessage('⏳ Validation en cours...');
    
    try {
      await debugScanResult(playerId, currentPlayer.id);
      const result = await validateMission(playerId, currentPlayer.id);
      setValidationMessage(result.message);
      setTimeout(() => setValidationMessage(''), 5000);
    } catch (error) {
      setValidationMessage(`❌ Erreur : ${error}`);
      setTimeout(() => setValidationMessage(''), 5000);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddSuspect = async (suspectId: string, suspectName: string) => {
    setShowSuspectSelector(false);
    if (!currentPlayer?.id) return;
    
    const result = await addSuspect(currentPlayer.id, suspectId);
    setSuspectMessage(result.message);
    setTimeout(() => setSuspectMessage(''), 3000);
  };

  const handleRemoveSuspect = async (suspectId: string) => {
    if (!currentPlayer?.id) return;
    
    const result = await removeSuspect(currentPlayer.id, suspectId);
    setSuspectMessage(result.message);
    setTimeout(() => setSuspectMessage(''), 3000);
  };

  const handleStartVoting = async () => {
    if (!currentPlayer?.id) return;
    
    const confirmed = confirm(
      '⚠️ LANCER UNE RÉUNION ?\n\nTous les joueurs seront invités à voter pour éliminer quelqu\'un.\n\nContinuer ?'
    );
    
    if (!confirmed) return;
    
    setIsStartingVote(true);
    
    const result = await startVotingSession(currentPlayer.id);
    
    if (result.success) {
      setVotingMessage(result.message);
      setHasActiveVote(true);
      setTimeout(() => {
        setVotingMessage('');
        setShowVotingInterface(true);
      }, 1500);
    } else {
      setVotingMessage(`❌ ${result.message}`);
      setTimeout(() => setVotingMessage(''), 3000);
    }
    
    setIsStartingVote(false);
  };

  const handleJoinVote = () => {
    setShowVotingInterface(true);
  };

  if (!currentPlayer || gameLoading || playerLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#d1d5db',
        fontFamily: 'monospace'
      }}>
        ⏳ Chargement...
      </div>
    );
  }

  // Afficher l'écran de fin si le jeu est terminé
  if (gameEnded && endGameStats) {
    return (
      <EndGameScreen
        stats={endGameStats}
        currentPlayerId={currentPlayer?.id}
        onClose={() => onNavigate('home')}
      />
    );
  }

  const totalMissions = 5;
  const completedMissions = playerData?.missionsCompleted?.length || 0;
  const progressPercentage = (completedMissions / totalMissions) * 100;

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
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1.5rem 0', 
        position: 'relative', 
        zIndex: 10 
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <motion.button 
            onClick={() => onNavigate('home')}
            whileHover={{ x: -5 }}
            style={{ 
              color: '#dc2626', 
              transition: 'all 0.3s',
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ← QUITTER
          </motion.button>
          
          <GlitchText style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <h1>{playerData?.name || currentPlayer.name}</h1>
          </GlitchText>
          
          <motion.div 
            style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              fontFamily: 'monospace', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.375rem' 
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#dc2626', 
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)'
            }} />
            CONNECTÉ
          </motion.div>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem'
        }}>
          {/* Portail */}
          <div style={{ gridColumn: '1 / -1' }}>
            <ModernCard>
              <PortalGauge 
                level={gameState?.portalLevel || 0} 
                maxLevel={gameState?.maxLevel || 20} 
              />
            </ModernCard>
          </div>

          {/* Notification vote actif */}
          {hasActiveVote && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ gridColumn: '1 / -1' }}
            >
              <ModernCard style={{ 
                border: '2px solid #dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ fontSize: '2rem' }}
                    >
                      🗳️
                    </motion.span>
                    <div>
                      <h3 style={{
                        color: '#dc2626',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        marginBottom: '0.25rem'
                      }}>
                        RÉUNION EN COURS
                      </h3>
                      <p style={{
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        margin: 0
                      }}>
                        Un vote est en cours !
                      </p>
                    </div>
                  </div>
                  <ModernButton
                    onClick={handleJoinVote}
                    variant="danger"
                    style={{ minWidth: '200px' }}
                  >
                    REJOINDRE
                  </ModernButton>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Mission */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#e5e7eb', 
              fontFamily: 'monospace',
              marginBottom: '1.25rem'
            }}>
              ⚙ MISSION ACTIVE
            </h3>
            
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  backgroundColor: validationMessage.includes('✅') 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid ' + (validationMessage.includes('✅') 
                    ? 'rgba(16, 185, 129, 0.5)' 
                    : 'rgba(239, 68, 68, 0.5)'),
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  color: validationMessage.includes('✅') ? '#10b981' : '#ef4444',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {validationMessage}
              </motion.div>
            )}
            
            {playerData?.currentMission ? (
              <>
                <div style={{ 
                  backgroundColor: 'rgba(127, 29, 29, 0.15)', 
                  borderRadius: '8px', 
                  padding: '1.25rem',
                  border: '1px solid rgba(127, 29, 29, 0.2)',
                  marginBottom: '1rem'
                }}>
                  <p style={{ 
                    color: '#d1d5db', 
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem', 
                    lineHeight: '1.6',
                    marginBottom: '1rem'
                  }}>
                    {playerData.currentMission.riddle || playerData.currentMission.instruction || 'Mission en cours...'}
                  </p>
                  <p style={{ 
                    fontSize: '0.8125rem', 
                    color: '#9ca3af', 
                    fontFamily: 'monospace',
                    margin: 0
                  }}>
                    🎯 CIBLE : <span style={{ color: '#dc2626' }}>
                      {playerData.currentMission.targetName || '[INCONNUE]'}
                    </span>
                  </p>
                </div>
                
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <ModernButton onClick={() => setShowScanner(true)} disabled={isValidating}>
                    📷 SCANNER UN QR CODE
                  </ModernButton>
                  <ModernButton onClick={() => setShowSelector(true)} variant="secondary" disabled={isValidating}>
                    👥 SÉLECTIONNER UN JOUEUR
                  </ModernButton>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontFamily: 'monospace', padding: '2rem' }}>
                Aucune mission active
              </div>
            )}
          </ModernCard>

          {/* Réunion */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: '#e5e7eb', 
              fontFamily: 'monospace',
              marginBottom: '1.25rem'
            }}>
              🗳️ RÉUNION & VOTE
            </h3>

            {votingMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  backgroundColor: votingMessage.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid ' + (votingMessage.includes('✅') ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  color: votingMessage.includes('✅') ? '#10b981' : '#ef4444',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {votingMessage}
              </motion.div>
            )}

            <div style={{
              backgroundColor: 'rgba(127, 29, 29, 0.15)',
              borderRadius: '8px',
              padding: '1.25rem',
              border: '1px solid rgba(127, 29, 29, 0.2)',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#d1d5db',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                Convoque une réunion pour voter et éliminer un joueur suspect.
              </p>
            </div>

            {hasActiveVote ? (
              <ModernButton onClick={handleJoinVote} variant="danger">
                🗳️ REJOINDRE LE VOTE
              </ModernButton>
            ) : (
              <ModernButton 
                onClick={handleStartVoting} 
                variant="danger"
                disabled={isStartingVote}
              >
                {isStartingVote ? '⏳ LANCEMENT...' : '🗳️ LANCER UNE RÉUNION'}
              </ModernButton>
            )}
          </ModernCard>

          {/* Rôle et Progression */}
          <ModernCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>
                {playerData?.role === 'human' ? '👤' : '👻'}
              </span>
              <div>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#e5e7eb', 
                  fontFamily: 'monospace',
                  marginBottom: '0.25rem'
                }}>
                  {playerData?.role === 'human' ? 'HUMAIN' : 'ALTÉRÉ'}
                </h3>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  fontFamily: 'monospace',
                  margin: 0
                }}>
                  {playerData?.role === 'human' ? 'Fermer le portail' : 'Ouvrir le portail'}
                </p>
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace'
            }}>
              PROGRESSION
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem' 
              }}>
                <span style={{ color: '#9ca3af' }}>Missions</span>
                <span style={{ color: '#e5e7eb', fontWeight: '600' }}>
                  {completedMissions}/{totalMissions}
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                borderRadius: '999px', 
                height: '8px',
                overflow: 'hidden'
              }}>
                <motion.div 
                  style={{ 
                    background: 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%)', 
                    height: '100%', 
                    borderRadius: '999px'
                  }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </ModernCard>

          {/* Suspects */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace'
            }}>
              SUSPECTS SURVEILLÉS
            </h3>
            
            {suspectMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  backgroundColor: suspectMessage.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid ' + (suspectMessage.includes('✅') ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  color: suspectMessage.includes('✅') ? '#10b981' : '#ef4444',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {suspectMessage}
              </motion.div>
            )}
            
            {playerData?.suspicions && playerData.suspicions.length > 0 ? (
              <>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  {playerData.suspicions.map((suspectId: string) => (
                    <div
                      key={suspectId}
                      style={{ 
                        backgroundColor: 'rgba(127, 29, 29, 0.15)', 
                        borderRadius: '6px', 
                        padding: '0.875rem', 
                        border: '1px solid rgba(127, 29, 29, 0.2)', 
                        fontFamily: 'monospace', 
                        fontSize: '0.8125rem',
                        color: '#e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>▸ {suspectId}</span>
                      <button
                        onClick={() => handleRemoveSuspect(suspectId)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <ModernButton onClick={() => setShowSuspectSelector(true)} variant="secondary">
                  ➕ AJOUTER
                </ModernButton>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.875rem', padding: '2rem', marginBottom: '1rem' }}>
                  Aucun suspect
                </div>
                <ModernButton onClick={() => setShowSuspectSelector(true)} variant="secondary">
                  ➕ AJOUTER
                </ModernButton>
              </>
            )}
          </ModernCard>

          {/* Événements */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace'
            }}>
              ÉVÉNEMENTS RÉCENTS
            </h3>
            {eventsLoading ? (
              <div style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'monospace', padding: '1rem' }}>
                Chargement...
              </div>
            ) : events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                {events.map((event) => (
                  <div key={event.id} style={{ color: '#9ca3af', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#dc2626' }}>•</span> {event.message}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'monospace', padding: '2rem' }}>
                Aucun événement
              </div>
            )}
          </ModernCard>
        </div>
      </div>

      {showScanner && (
        <QRScannerMobile
          onScanSuccess={handlePlayerScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showSelector && (
        <PlayerSelector
          onSelect={handlePlayerScan}
          onClose={() => setShowSelector(false)}
        />
      )}

      {showSuspectSelector && (
        <SuspectSelector
          currentPlayerId={currentPlayer.id}
          currentSuspicions={playerData?.suspicions || []}
          onSelect={handleAddSuspect}
          onClose={() => setShowSuspectSelector(false)}
        />
      )}

      {showVotingInterface && (
        <VotingInterface
          currentPlayerId={currentPlayer.id}
          onClose={() => {
            setShowVotingInterface(false);
            checkActiveVote();
          }}
        />
      )}
    </div>
  );
}
