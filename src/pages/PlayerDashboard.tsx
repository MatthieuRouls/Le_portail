import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PortalGauge from '../components/ui/PortalGauge';
import NewsCard from '../components/game/NewsCard';
import VotingCard from '../components/game/VotingCard';
import { useGameState, usePlayer, useAllPlayers, useGameEvents } from '../lib/realtimeHooks';
import { getCurrentPlayerId } from '../lib/playerAuth';

interface PlayerDashboardProps {
  onNavigate: (page: 'home' | 'login' | 'player') => void;
}

export default function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // Hooks temps réel
  const { gameState, loading: gameLoading } = useGameState();
  const { player, loading: playerLoading } = usePlayer(currentPlayerId);
  const { players } = useAllPlayers();
  const { events } = useGameEvents(10);

  useEffect(() => {
    const playerId = getCurrentPlayerId();
    setCurrentPlayerId(playerId);
  }, []);

  if (gameLoading || playerLoading || !player || !gameState) {
    return (
      <div className="min-h-screen bg-portal-bg-darkest flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-portal-primary text-4xl"
        >
          ⚙
        </motion.div>
      </div>
    );
  }

  const isHuman = player.role === 'human';
  const roleColor = isHuman ? 'text-portal-success' : 'text-portal-danger';
  const roleLabel = isHuman ? 'HUMAIN' : 'ALTÉRÉ';
  const roleObjective = isHuman ? 'FERMER LE PORTAIL' : 'OUVRIR LE PORTAIL';

  return (
    <div className="min-h-screen bg-portal-bg-darkest p-4 relative overflow-hidden">
      {/* Effets de fond */}
      <StaticNoise />
      <FlickeringLights />

      {/* Gradient de fond harmonisé */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(0, 212, 255, 0.1), transparent 50%)',
        }}
      />

      {/* Contenu */}
      <div className="max-w-4xl mx-auto py-8 relative z-10">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            onClick={() => onNavigate('home')}
            className="text-portal-primary hover:text-portal-primary-light font-mono text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← QUITTER
          </motion.button>

          <GlitchText>
            <h1 className="text-3xl font-bold text-portal-primary font-mono">
              TERMINAL
            </h1>
          </GlitchText>

          <motion.div
            className="text-xs text-portal-success font-mono inline-flex items-center gap-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-portal-success rounded-full" />
            ACTIF
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Jauge du portail */}
          <Card variant="primary" glow>
            <PortalGauge level={gameState.portalLevel} maxLevel={20} />
          </Card>

          {/* Carte de vote si réunion active */}
          {gameState.currentMeeting?.isActive && (
            <VotingCard
              meeting={gameState.currentMeeting}
              currentPlayer={player}
              allPlayers={players}
            />
          )}

          {/* Informations joueur */}
          <Card variant={isHuman ? 'success' : 'danger'}>
            <div className="flex items-center gap-4">
              <motion.span
                className="text-5xl"
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                {isHuman ? '👤' : '👹'}
              </motion.span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-2xl font-bold font-mono ${roleColor}`}>
                    {player.name}
                  </h3>
                  {player.isEliminated && (
                    <span className="text-portal-danger text-sm font-mono bg-portal-danger/20 px-3 py-1 rounded-full">
                      ÉLIMINÉ
                    </span>
                  )}
                </div>
                <p className="text-sm text-portal-text-secondary font-mono">
                  RÔLE : {roleLabel}
                </p>
                <p className="text-xs text-portal-text-muted font-mono mt-1">
                  OBJECTIF : {roleObjective}
                </p>
              </div>
            </div>
          </Card>

          {/* Mission en cours */}
          {player.currentMission && !player.isEliminated && (
            <Card variant="secondary">
              <div className="flex items-center gap-2 mb-4">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="text-2xl"
                >
                  ⚙
                </motion.span>
                <h3 className="text-lg font-bold text-portal-secondary font-mono uppercase">
                  Mission en cours
                </h3>
              </div>

              <div className="bg-portal-bg-light/50 rounded-lg p-4 border border-portal-secondary/20">
                <p className="text-portal-text-primary text-sm font-mono leading-relaxed mb-4">
                  {player.currentMission.target || 'Mission en attente...'}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-portal-text-muted font-mono">
                    🎯 CIBLE : {player.currentMission.completed ? 'TROUVÉE' : '[INCONNUE]'}
                  </span>
                  {player.currentMission.completed && (
                    <span className="text-portal-success text-xs font-mono">✓ COMPLÉTÉE</span>
                  )}
                </div>
                {!player.currentMission.completed && (
                  <Button variant="secondary" className="w-full">
                    📷 SCANNER UN QR CODE
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Progression */}
          <Card>
            <h3 className="text-lg font-bold text-portal-primary font-mono uppercase mb-4">
              ✓ Progression
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center font-mono text-sm">
                <span className="text-portal-text-secondary">Missions complétées</span>
                <span className="text-portal-success font-bold">
                  {player.missionsCompleted.length}/5
                </span>
              </div>
              <div className="h-3 bg-portal-bg-dark rounded-full overflow-hidden border border-portal-success/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-portal-success-dark to-portal-success relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.missionsCompleted.length / 5) * 100}%` }}
                  transition={{ duration: 1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </div>
          </Card>

          {/* Suspects */}
          <Card>
            <h3 className="text-lg font-bold text-portal-secondary font-mono uppercase mb-4">
              🔍 Suspects
            </h3>
            <div className="space-y-2">
              {player.suspicions.length === 0 ? (
                <p className="text-portal-text-muted text-sm font-mono text-center py-4">
                  Aucun suspect identifié
                </p>
              ) : (
                player.suspicions.map((suspectId, i) => {
                  const suspect = players.find((p) => p.id === suspectId);
                  return (
                    <motion.div
                      key={suspectId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-portal-secondary/10 border border-portal-secondary/20 rounded-lg p-3 font-mono text-sm flex items-center justify-between"
                    >
                      <span className="text-portal-text-primary">▸ {suspect?.name}</span>
                      <span className="text-portal-secondary text-xs">SURVEILLÉ</span>
                    </motion.div>
                  );
                })
              )}
              <Button variant="secondary" className="w-full mt-3">
                ➕ AJOUTER UN SUSPECT
              </Button>
            </div>
          </Card>

          {/* Fil d'actualité */}
          <NewsCard events={events} maxEvents={5} />
        </div>
      </div>
    </div>
  );
}
