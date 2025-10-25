import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Meeting, Player } from '../../types/game';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { castVote } from '../../lib/gameActions';

interface VotingCardProps {
  meeting: Meeting;
  currentPlayer: Player;
  allPlayers: Player[];
}

export default function VotingCard({ meeting, currentPlayer, allPlayers }: VotingCardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Vérifier si le joueur a déjà voté
  useEffect(() => {
    if (meeting.votes[currentPlayer.id]) {
      setHasVoted(true);
      setSelectedPlayer(meeting.votes[currentPlayer.id]);
    }
  }, [meeting, currentPlayer]);

  // Timer pour le temps restant
  useEffect(() => {
    if (!meeting.votingEndsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, meeting.votingEndsAt! - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [meeting.votingEndsAt]);

  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVote = async () => {
    if (!selectedPlayer || hasVoted) return;

    setIsSubmitting(true);
    try {
      await castVote(currentPlayer.id, currentPlayer.name, selectedPlayer);
      setHasVoted(true);
    } catch (error) {
      console.error('Error casting vote:', error);
      alert('Erreur lors du vote. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrer les joueurs votables (non éliminés, pas soi-même)
  const votablePlayers = allPlayers.filter(
    (p) => !p.isEliminated && p.id !== currentPlayer.id
  );

  // Compter les votes actuels
  const voteCount = Object.keys(meeting.votes).length;
  const totalPlayers = allPlayers.filter((p) => !p.isEliminated).length;

  return (
    <Card variant="danger" glow>
      <div className="space-y-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🗳
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-portal-danger font-mono uppercase">
                Réunion {meeting.meetingNumber}/3
              </h3>
              <p className="text-sm text-portal-text-secondary font-mono">
                Phase de vote
              </p>
            </div>
          </div>

          {timeLeft !== null && (
            <motion.div
              className="text-right"
              animate={timeLeft < 60000 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="text-2xl font-bold text-portal-danger font-mono">
                {formatTimeLeft(timeLeft)}
              </div>
              <div className="text-xs text-portal-text-muted font-mono">
                Temps restant
              </div>
            </motion.div>
          )}
        </div>

        {/* Message d'information */}
        <div className="bg-portal-bg-light/50 rounded-lg p-4 border border-portal-danger/20">
          <p className="text-portal-text-primary text-sm font-mono leading-relaxed">
            Votez pour éliminer un joueur suspect. La personne avec le plus de voix sera
            éliminée de la partie.
          </p>
        </div>

        {/* Compteur de votes */}
        <div className="flex items-center justify-between text-sm font-mono">
          <span className="text-portal-text-secondary">Votes reçus :</span>
          <span className="text-portal-primary font-bold">
            {voteCount}/{totalPlayers}
          </span>
        </div>

        {/* Barre de progression des votes */}
        <div className="h-2 bg-portal-bg-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-portal-danger-dark to-portal-danger"
            initial={{ width: 0 }}
            animate={{ width: `${(voteCount / totalPlayers) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Liste des joueurs votables */}
        {!hasVoted ? (
          <div className="space-y-2">
            <label className="text-sm font-mono text-portal-text-secondary uppercase tracking-wide">
              Choisissez un joueur à éliminer :
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
              <AnimatePresence>
                {votablePlayers.map((player, index) => (
                  <motion.button
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={`
                      p-3 rounded-lg border font-mono text-sm
                      transition-all duration-200
                      ${
                        selectedPlayer === player.id
                          ? 'bg-portal-danger/20 border-portal-danger text-portal-danger shadow-glow-danger'
                          : 'bg-portal-bg-light/30 border-portal-primary/20 text-portal-text-primary hover:border-portal-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {player.role === 'human' ? '👤' : '👤'}
                      </span>
                      <span className="truncate">{player.name}</span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Bouton de vote */}
            <Button
              variant="danger"
              onClick={handleVote}
              disabled={!selectedPlayer || isSubmitting}
              isLoading={isSubmitting}
              className="w-full mt-4"
            >
              {selectedPlayer
                ? `Voter pour ${votablePlayers.find((p) => p.id === selectedPlayer)?.name}`
                : 'Sélectionnez un joueur'}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-portal-success/10 border border-portal-success/30 rounded-lg p-6 text-center"
          >
            <motion.div
              className="text-5xl mb-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              ✓
            </motion.div>
            <p className="text-portal-success text-lg font-bold font-mono mb-2">
              Vote enregistré !
            </p>
            <p className="text-portal-text-secondary text-sm font-mono">
              Vous avez voté pour{' '}
              <span className="text-portal-danger">
                {votablePlayers.find((p) => p.id === selectedPlayer)?.name}
              </span>
            </p>
            <p className="text-portal-text-muted text-xs font-mono mt-3">
              En attente des autres votes...
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
