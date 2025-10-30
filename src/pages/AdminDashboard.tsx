import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '../hooks/useGameState';
import { useAllPlayers } from '../hooks/useAllPlayers';
import { useGameEvents } from '../hooks/useGameEvents';
import { resetGame, setPortalLevel } from '../lib/gameManager';
import { createMission } from '../lib/missionGenerator';
import { createPlayer, deletePlayer } from '../lib/playerManager';
import { GameEvents } from '../lib/gameEvents';
import MissionQueueCreator from '../components/admin/MissionQueueCreator';
import PrintAllQRCodes from '../components/admin/PrintAllQRCodes';
import PlayerConnectionQR from '../components/admin/PlayerConnectionQR';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';
import PortalGauge from '../components/ui/PortalGauge';

interface AdminDashboardProps {
  onNavigate: (page: 'home' | 'admin') => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { gameState, loading: gameLoading } = useGameState();
  const { players, loading: playersLoading } = useAllPlayers();
  const { events, loading: eventsLoading } = useGameEvents(10);
  
  const [resetting, setResetting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [portalInput, setPortalInput] = useState('10');
  
  const [newPlayerId, setNewPlayerId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'human' | 'altered'>('human');
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  
  const [showPrintQRCodes, setShowPrintQRCodes] = useState(false);
  const [selectedPlayerQR, setSelectedPlayerQR] = useState<{ id: string; name: string } | null>(null);

  const handleReset = async () => {
    const confirmed = confirm(
      '⚠️ RÉINITIALISER LE JEU ?\n\n' +
      'Cela va :\n' +
      '- Remettre le portail à 10\n' +
      '- Supprimer toutes les missions\n' +
      '- Réinitialiser tous les joueurs\n' +
      '- Supprimer tous les événements\n' +
      '- Annuler toutes les sessions de vote\n\n' +
      'Continuer ?'
    );
    
    if (!confirmed) return;
    
    setResetting(true);
    try {
      await resetGame();
      setTestMessage('✅ Jeu réinitialisé avec succès !');
      setTimeout(() => setTestMessage(''), 3000);
    } catch (error) {
      setTestMessage(`❌ Erreur : ${error}`);
      setTimeout(() => setTestMessage(''), 5000);
    } finally {
      setResetting(false);
    }
  };

  const handleSetPortal = async () => {
    const level = parseInt(portalInput);
    if (isNaN(level) || level < 0 || level > 20) {
      setTestMessage('❌ Niveau invalide (0-20)');
      setTimeout(() => setTestMessage(''), 3000);
      return;
    }
    
    try {
      await setPortalLevel(level);
      setTestMessage(`✅ Portail réglé à ${level}`);
      setTimeout(() => setTestMessage(''), 3000);
    } catch (error) {
      setTestMessage(`❌ Erreur : ${error}`);
      setTimeout(() => setTestMessage(''), 5000);
    }
  };

  const handleTestMission = async () => {
    if (players.length < 2) {
      setTestMessage('❌ Il faut au moins 2 joueurs');
      setTimeout(() => setTestMessage(''), 3000);
      return;
    }
    
    try {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      await createMission(randomPlayer.id, 1);
      setTestMessage(`✅ Mission créée pour ${randomPlayer.name}`);
      setTimeout(() => setTestMessage(''), 3000);
    } catch (error) {
      setTestMessage(`❌ Erreur : ${error}`);
      setTimeout(() => setTestMessage(''), 5000);
    }
  };

  const handleTestEvent = async (type: string) => {
    try {
      switch (type) {
        case 'mission':
          await GameEvents.missionCompleted('Test Player', 'test_id');
          break;
        case 'portal_up':
          await GameEvents.portalIncreased(gameState?.portalLevel || 10);
          break;
        case 'portal_down':
          await GameEvents.portalDecreased(gameState?.portalLevel || 10);
          break;
        case 'eliminated':
          await GameEvents.playerEliminated('Test Player');
          break;
        case 'vote':
          await GameEvents.votingStarted('Test Player');
          break;
        case 'human_victory':
          await GameEvents.humanVictory();
          break;
        case 'altered_victory':
          await GameEvents.alteredVictory();
          break;
      }
      setTestMessage(`✅ Événement "${type}" créé`);
      setTimeout(() => setTestMessage(''), 3000);
    } catch (error) {
      setTestMessage(`❌ Erreur : ${error}`);
      setTimeout(() => setTestMessage(''), 5000);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerId.trim() || !newPlayerName.trim()) {
      setTestMessage('❌ ID et nom requis');
      setTimeout(() => setTestMessage(''), 3000);
      return;
    }
    
    setCreatingPlayer(true);
    const result = await createPlayer(
      newPlayerId.trim().toLowerCase(),
      newPlayerName.trim(),
      newPlayerRole
    );
    
    setTestMessage(result.message);
    setTimeout(() => setTestMessage(''), 3000);
    
    if (result.success) {
      setNewPlayerId('');
      setNewPlayerName('');
      setNewPlayerRole('human');
    }
    
    setCreatingPlayer(false);
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    const confirmed = confirm(`⚠️ Supprimer ${playerName} ?`);
    if (!confirmed) return;
    
    const result = await deletePlayer(playerId);
    setTestMessage(result.message);
    setTimeout(() => setTestMessage(''), 3000);
  };

  if (gameLoading || playersLoading) {
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
        maxWidth: '1400px',
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
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ← RETOUR
          </motion.button>
          
          <GlitchText style={{ color: '#dc2626', fontSize: '2rem', fontWeight: 'bold' }}>
            <h1>👑 ADMIN</h1>
          </GlitchText>
          
          <div style={{ width: '100px' }} />
        </div>

        {testMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: testMessage.includes('✅')
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              border: testMessage.includes('✅')
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '0.5rem',
              textAlign: 'center',
              color: testMessage.includes('✅') ? '#10b981' : '#ef4444',
              fontFamily: 'monospace'
            }}
          >
            {testMessage}
          </motion.div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
          gap: '1.5rem'
        }}>
          {/* Portail */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Card>
              <PortalGauge
                level={gameState?.portalLevel || 0}
                maxLevel={gameState?.maxLevel || 20}
              />
            </Card>
          </div>

          {/* Créer un joueur */}
          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              ➕ CRÉER UN JOUEUR
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <input
                type="text"
                placeholder="ID (ex: diana)"
                value={newPlayerId}
                onChange={(e) => setNewPlayerId(e.target.value)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#d1d5db',
                  fontFamily: 'monospace'
                }}
              />
              <input
                type="text"
                placeholder="Nom (ex: Diana)"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#d1d5db',
                  fontFamily: 'monospace'
                }}
              />
              <select
                value={newPlayerRole}
                onChange={(e) => setNewPlayerRole(e.target.value as 'human' | 'altered')}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#d1d5db',
                  fontFamily: 'monospace'
                }}
              >
                <option value="human">👤 Humain</option>
                <option value="altered">👻 Altéré</option>
              </select>
            </div>
            
            <Button
              onClick={handleCreatePlayer}
              variant="primary"
              disabled={creatingPlayer}
            >
              {creatingPlayer ? '⏳ CRÉATION...' : '➕ CRÉER LE JOUEUR'}
            </Button>
          </Card>

          {/* Créer une queue de 3 missions */}
          <div style={{ gridColumn: '1 / -1' }}>
            <MissionQueueCreator
              players={players}
              onSuccess={(msg) => {
                setTestMessage(msg);
                setTimeout(() => setTestMessage(''), 3000);
              }}
              onError={(msg) => {
                setTestMessage(msg);
                setTimeout(() => setTestMessage(''), 3000);
              }}
            />
          </div>

          {/* Contrôle du portail */}
          <Card>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              🎚️ CONTRÔLE DU PORTAIL
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="number"
                min="0"
                max="20"
                value={portalInput}
                onChange={(e) => setPortalInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#d1d5db',
                  fontFamily: 'monospace'
                }}
              />
              <Button onClick={handleSetPortal} variant="primary">
                DÉFINIR
              </Button>
            </div>
          </Card>

          {/* Reset */}
          <Card>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              🔄 RÉINITIALISATION
            </h3>
            <Button
              onClick={handleReset}
              variant="primary"
              disabled={resetting}
            >
              {resetting ? '⏳ EN COURS...' : '🔄 RESET COMPLET'}
            </Button>
          </Card>

          {/* QR Codes d'identité */}
          <Card>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              📱 QR CODES D'IDENTITÉ
            </h3>
            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              fontFamily: 'monospace',
              marginBottom: '1rem',
              lineHeight: '1.5'
            }}>
              Pour scanner et identifier les joueurs lors des missions et votes
            </p>
            <Button onClick={() => setShowPrintQRCodes(true)} variant="secondary">
              📱 VOIR & IMPRIMER
            </Button>
          </Card>

          {/* Test de mission */}
          <Card>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              🎯 TEST MISSION ALÉATOIRE
            </h3>
            <Button onClick={handleTestMission} variant="secondary">
              CRÉER MISSION TEST
            </Button>
          </Card>

          {/* Test événements */}
          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              📢 TEST ÉVÉNEMENTS
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem'
            }}>
              <Button onClick={() => handleTestEvent('mission')} variant="secondary">
                Mission complétée
              </Button>
              <Button onClick={() => handleTestEvent('portal_up')} variant="secondary">
                Portail +1
              </Button>
              <Button onClick={() => handleTestEvent('portal_down')} variant="secondary">
                Portail -1
              </Button>
              <Button onClick={() => handleTestEvent('eliminated')} variant="secondary">
                Joueur éliminé
              </Button>
              <Button onClick={() => handleTestEvent('vote')} variant="secondary">
                Vote lancé
              </Button>
              <Button onClick={() => handleTestEvent('human_victory')} variant="secondary">
                Victoire humains
              </Button>
              <Button onClick={() => handleTestEvent('altered_victory')} variant="secondary">
                Victoire altérés
              </Button>
            </div>
          </Card>

          {/* Liste des joueurs */}
          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              👥 JOUEURS ({players.length})
            </h3>
            {players.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.75rem'
              }}>
                {players.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(127, 29, 29, 0.2)',
                      border: '1px solid rgba(220, 38, 38, 0.3)',
                      borderRadius: '0.5rem',
                      opacity: player.isEliminated ? 0.5 : 1,
                      position: 'relative'
                    }}
                  >
                    <button
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(220, 38, 38, 0.5)',
                        border: 'none',
                        borderRadius: '0.25rem',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      ✕
                    </button>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {player.role === 'human' ? '👤' : '👻'}
                      </span>
                      <div>
                        <div style={{
                          color: '#e5e7eb',
                          fontFamily: 'monospace',
                          fontWeight: 'bold'
                        }}>
                          {player.name}
                          {player.isEliminated && ' ☠️'}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: player.role === 'human' ? '#10b981' : '#dc2626',
                          fontFamily: 'monospace'
                        }}>
                          {player.role === 'human' ? 'HUMAIN' : 'ALTÉRÉ'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      fontFamily: 'monospace',
                      marginBottom: '0.75rem'
                    }}>
                      {player.missionsCompleted?.length || 0} missions • 
                      {player.currentMission ? ' 🎯 Mission active' : ' ⏸️ Pas de mission'}
                      {player.missionQueue && player.missionQueue.length > 0 && (
                        <span style={{ color: '#fbbf24' }}> (+{player.missionQueue.length} en attente)</span>
                      )}
                    </div>
                    
                    {/* Bouton QR Code de connexion */}
                    <button
                      onClick={() => setSelectedPlayerQR({ id: player.id, name: player.name })}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '0.375rem',
                        color: '#60a5fa',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                    >
                      🔐 QR CONNEXION
                    </button>
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
                Aucun joueur
              </div>
            )}
          </Card>

          {/* Événements */}
          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#e5e7eb',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              📜 ÉVÉNEMENTS RÉCENTS
            </h3>
            {eventsLoading ? (
              <div style={{
                textAlign: 'center',
                color: '#6b7280',
                fontFamily: 'monospace',
                padding: '1rem'
              }}>
                Chargement...
              </div>
            ) : events.length > 0 ? (
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
      </div>

      {/* Modal Print QR Codes d'identité */}
      {showPrintQRCodes && (
        <PrintAllQRCodes
          players={players}
          onClose={() => setShowPrintQRCodes(false)}
        />
      )}

      {/* Modal QR Code de connexion */}
      {selectedPlayerQR && (
        <PlayerConnectionQR
          playerId={selectedPlayerQR.id}
          playerName={selectedPlayerQR.name}
          onClose={() => setSelectedPlayerQR(null)}
        />
      )}
    </div>
  );
}
