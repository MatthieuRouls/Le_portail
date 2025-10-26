import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';
import PortalGauge from '../components/ui/PortalGauge';
import QRScannerMobile from '../components/game/QRScannerMobile';
import PlayerSelector from '../components/game/PlayerSelector';
import { useGameState } from '../hooks/useGameState';
import { usePlayerData } from '../hooks/usePlayerData';
import { useGameEvents } from '../hooks/useGameEvents';
import { getCurrentPlayer } from '../lib/playerAuth';
import { validateMission } from '../lib/missionValidator';

interface PlayerDashboardProps {
  onNavigate: (page: 'home' | 'login' | 'player') => void;
}

// Composant Card moderne et épuré
const ModernCard = ({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
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
    className={className}
  >
    {children}
  </motion.div>
);

// Bouton moderne
const ModernButton = ({ children, onClick, variant = 'primary', style = {} }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; style?: React.CSSProperties }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '0.875rem 1.5rem',
        backgroundColor: isPrimary ? 'rgba(127, 29, 29, 0.6)' : 'rgba(40, 40, 40, 0.6)',
        border: isPrimary ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid rgba(75, 85, 99, 0.5)',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)',
        boxShadow: isPrimary ? '0 0 15px rgba(220, 38, 38, 0.2)' : 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary ? 'rgba(127, 29, 29, 0.8)' : 'rgba(55, 55, 55, 0.8)';
        e.currentTarget.style.borderColor = isPrimary ? 'rgba(220, 38, 38, 0.8)' : 'rgba(107, 114, 128, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary ? 'rgba(127, 29, 29, 0.6)' : 'rgba(40, 40, 40, 0.6)';
        e.currentTarget.style.borderColor = isPrimary ? 'rgba(220, 38, 38, 0.5)' : 'rgba(75, 85, 99, 0.5)';
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
  
  const [showScanner, setShowScanner] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if (!currentPlayer) {
      onNavigate('login');
    }
  }, [currentPlayer, onNavigate]);

  const handlePlayerScan = async (playerId: string) => {
    setShowScanner(false);
    setShowSelector(false);
    
    if (!currentPlayer?.id) return;
    
    const result = await validateMission(playerId, currentPlayer.id);
    setValidationMessage(result.message);
    setTimeout(() => setValidationMessage(''), 5000);
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

        {/* Grid */}
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

          {/* Mission */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(127, 29, 29, 0.2)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>⚙</span>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#e5e7eb', 
                fontFamily: 'monospace',
                margin: 0
              }}>
                MISSION ACTIVE
              </h3>
            </div>
            
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  backgroundColor: validationMessage.includes('✅') 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                  border: validationMessage.includes('✅')
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid rgba(239, 68, 68, 0.5)',
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
                  <ModernButton onClick={() => setShowScanner(true)}>
                    📷 SCANNER UN QR CODE
                  </ModernButton>
                  <ModernButton onClick={() => setShowSelector(true)} variant="secondary">
                    👥 SÉLECTIONNER UN JOUEUR
                  </ModernButton>
                </div>
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#9ca3af', 
                fontFamily: 'monospace',
                padding: '2rem'
              }}>
                Aucune mission active
              </div>
            )}
          </ModernCard>

          {/* Rôle */}
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

          {/* Progression */}
          <ModernCard>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Progression
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
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
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
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
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Suspects surveillés
            </h3>
            {playerData?.suspicions && playerData.suspicions.length > 0 ? (
              <>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  {playerData.suspicions.map((suspectId, i) => (
                    <motion.div
                      key={suspectId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{ 
                        backgroundColor: 'rgba(127, 29, 29, 0.15)', 
                        borderRadius: '6px', 
                        padding: '0.875rem', 
                        border: '1px solid rgba(127, 29, 29, 0.2)', 
                        fontFamily: 'monospace', 
                        fontSize: '0.8125rem',
                        color: '#e5e7eb'
                      }}
                    >
                      ▸ {suspectId}
                    </motion.div>
                  ))}
                </div>
                <ModernButton variant="secondary">
                  ➕ AJOUTER UN SUSPECT
                </ModernButton>
              </>
            ) : (
              <>
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  padding: '2rem',
                  marginBottom: '1rem'
                }}>
                  Aucun suspect pour le moment
                </div>
                <ModernButton variant="secondary">
                  ➕ AJOUTER UN SUSPECT
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
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Événements récents
            </h3>
            {eventsLoading ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                padding: '1rem'
              }}>
                Chargement...
              </div>
            ) : events.length > 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.625rem', 
                fontSize: '0.8125rem', 
                fontFamily: 'monospace' 
              }}>
                {events.map((event, i) => (
                  <motion.div 
                    key={event.id}
                    style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span style={{ color: '#dc2626' }}>•</span> {event.message}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                padding: '2rem'
              }}>
                Aucun événement récent
              </div>
            )}
          </ModernCard>
        </div>
      </div>

      {/* Modals */}
      {showScanner && (
        <QRScannerMobile
          onScanSuccess={(qrData) => {
            const playerId = qrData.split('/').pop() || '';
            handlePlayerScan(playerId);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showSelector && (
        <PlayerSelector
          onSelect={(playerId) => handlePlayerScan(playerId)}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
