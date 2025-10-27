import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PlayerStats {
  id: string;
  name: string;
  role: 'human' | 'altered';
  missionsCompleted: number;
  isEliminated: boolean;
  eliminatedAt?: number;
  suspicions: string[];
  votesReceived?: number;
}

interface EndGameStats {
  winner: 'humans' | 'altered';
  endReason: 'portal_closed' | 'portal_opened' | 'all_altered_eliminated' | 'all_humans_eliminated';
  finalPortalLevel: number;
  totalMissionsCompleted: number;
  playersStats: PlayerStats[];
  mvp?: {
    playerId: string;
    playerName: string;
    reason: string;
  };
  duration: number;
  endedAt: number;
}

interface EndGameScreenProps {
  stats: EndGameStats;
  currentPlayerId?: string;
  onRestart?: () => void;
  onClose?: () => void;
}

export default function EndGameScreen({ stats, currentPlayerId, onRestart, onClose }: EndGameScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const isWinner = currentPlayerId 
    ? stats.playersStats.find(p => p.id === currentPlayerId)?.role === (stats.winner === 'humans' ? 'human' : 'altered')
    : false;
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}min ${seconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.98)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'auto'
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%' }}>
        {/* Bannière de victoire */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontSize: '6rem',
              marginBottom: '1rem'
            }}
          >
            {stats.winner === 'humans' ? '🎉' : '👻'}
          </motion.div>
          
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: stats.winner === 'humans' ? '#10b981' : '#dc2626',
            marginBottom: '0.5rem',
            textTransform: 'uppercase'
          }}>
            {stats.winner === 'humans' ? 'VICTOIRE DES HUMAINS' : 'VICTOIRE DES ALTÉRÉS'}
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#9ca3af',
            fontFamily: 'monospace',
            marginBottom: '1rem'
          }}>
            {stats.endReason === 'portal_closed' && '🚪 Le Portail a été refermé'}
            {stats.endReason === 'portal_opened' && '🌀 Le Portail est grand ouvert'}
            {stats.endReason === 'all_altered_eliminated' && '⚔️ Tous les Altérés éliminés'}
            {stats.endReason === 'all_humans_eliminated' && '💀 Tous les Humains éliminés'}
          </p>
          
          {currentPlayerId && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: isWinner ? '#10b981' : '#ef4444'
              }}
            >
              {isWinner ? '🏆 TU AS GAGNÉ !' : '😢 TU AS PERDU'}
            </motion.p>
          )}
        </motion.div>

        {/* Stats générales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '2rem' }}
        >
          <Card style={{ 
            border: '2px solid ' + (stats.winner === 'humans' ? '#10b981' : '#dc2626')
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#dc2626',
                  fontFamily: 'monospace'
                }}>
                  {stats.finalPortalLevel}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}>
                  Niveau final du portail
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#10b981',
                  fontFamily: 'monospace'
                }}>
                  {stats.totalMissionsCompleted}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}>
                  Missions complétées
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  fontFamily: 'monospace'
                }}>
                  {formatDuration(stats.duration)}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}>
                  Durée de la partie
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* MVP */}
        {stats.mvp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: '2rem' }}
          >
            <Card style={{ 
              border: '2px solid #fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  fontFamily: 'monospace',
                  marginBottom: '0.5rem'
                }}>
                  MVP - {stats.mvp.playerName}
                </h3>
                <p style={{
                  color: '#d1d5db',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}>
                  {stats.mvp.reason}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Bouton révélation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: '2rem' }}
        >
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="primary"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1.5rem'
            }}
          >
            {showDetails ? '▲ MASQUER LES RÔLES' : '▼ RÉVÉLER LES RÔLES'}
          </Button>
        </motion.div>

        {/* Détails des joueurs */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginBottom: '2rem' }}
            >
              <Card>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#e5e7eb',
                  fontFamily: 'monospace',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  👥 RÉVÉLATION DES RÔLES
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {stats.playersStats
                    .sort((a, b) => b.missionsCompleted - a.missionsCompleted)
                    .map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          backgroundColor: player.role === 'human' 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : 'rgba(220, 38, 38, 0.1)',
                          border: `2px solid ${player.role === 'human' ? '#10b981' : '#dc2626'}`,
                          borderRadius: '0.5rem',
                          padding: '1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          opacity: player.isEliminated ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '2rem' }}>
                            {player.role === 'human' ? '👤' : '👻'}
                          </span>
                          <div>
                            <h4 style={{
                              fontSize: '1.125rem',
                              fontWeight: 'bold',
                              color: '#e5e7eb',
                              fontFamily: 'monospace',
                              marginBottom: '0.25rem'
                            }}>
                              {player.name}
                              {player.isEliminated && ' ☠️'}
                            </h4>
                            <p style={{
                              fontSize: '0.875rem',
                              color: player.role === 'human' ? '#10b981' : '#dc2626',
                              fontFamily: 'monospace',
                              fontWeight: 'bold'
                            }}>
                              {player.role === 'human' ? 'HUMAIN' : 'ALTÉRÉ'}
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '2rem',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold', 
                              color: '#10b981' 
                            }}>
                              {player.missionsCompleted}
                            </div>
                            <div style={{ color: '#9ca3af' }}>Missions</div>
                          </div>
                          
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold', 
                              color: '#ef4444' 
                            }}>
                              {player.votesReceived || 0}
                            </div>
                            <div style={{ color: '#9ca3af' }}>Votes reçus</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'grid', gap: '1rem', gridTemplateColumns: onRestart ? '1fr 1fr' : '1fr' }}
        >
          {onRestart && (
            <Button
              onClick={onRestart}
              variant="primary"
              style={{
                fontSize: '1.125rem',
                padding: '1.25rem'
              }}
            >
              🔄 NOUVELLE PARTIE
            </Button>
          )}
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="secondary"
              style={{
                fontSize: '1.125rem',
                padding: '1.25rem'
              }}
            >
              🏠 RETOUR À L'ACCUEIL
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
