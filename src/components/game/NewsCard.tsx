import { motion, AnimatePresence } from 'framer-motion';
import { GameEvent } from '../../types/game';
import Card from '../ui/Card';

interface NewsCardProps {
  events: GameEvent[];
  maxEvents?: number;
}

export default function NewsCard({ events, maxEvents = 5 }: NewsCardProps) {
  // Trier les événements par timestamp décroissant (plus récent en premier)
  const sortedEvents = [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxEvents);

  const getEventIcon = (type: GameEvent['type']) => {
    switch (type) {
      case 'mission_completed':
        return '✓';
      case 'portal_increased':
        return '⚠';
      case 'meeting_triggered':
        return '📢';
      case 'player_eliminated':
        return '☠';
      case 'vote_started':
        return '🗳';
      case 'vote_ended':
        return '✓';
      default:
        return '►';
    }
  };

  const getEventColor = (type: GameEvent['type']) => {
    switch (type) {
      case 'mission_completed':
        return 'text-portal-success';
      case 'portal_increased':
        return 'text-portal-danger';
      case 'meeting_triggered':
        return 'text-portal-secondary';
      case 'player_eliminated':
        return 'text-portal-danger';
      case 'vote_started':
        return 'text-portal-primary';
      case 'vote_ended':
        return 'text-portal-success';
      default:
        return 'text-portal-text-secondary';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `il y a ${minutes}min`;
    } else if (seconds > 5) {
      return `il y a ${seconds}s`;
    } else {
      return 'À l\'instant';
    }
  };

  return (
    <Card variant="primary" glow>
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-portal-primary"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <h3 className="text-lg font-bold text-portal-primary font-mono uppercase tracking-wide">
          Fil d'actualité
        </h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {sortedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-portal-text-muted text-sm font-mono text-center py-4"
            >
              Aucun événement récent...
            </motion.div>
          ) : (
            sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className="bg-portal-bg-light/50 rounded-lg p-3 border border-portal-primary/10"
              >
                <div className="flex items-start gap-3">
                  <motion.span
                    className={`text-lg ${getEventColor(event.type)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.1, type: 'spring' }}
                  >
                    {getEventIcon(event.type)}
                  </motion.span>

                  <div className="flex-1 min-w-0">
                    <p className="text-portal-text-primary text-sm font-mono leading-relaxed">
                      {event.message}
                    </p>
                    <p className="text-portal-text-muted text-xs font-mono mt-1">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur de défilement si plus d'événements */}
      {events.length > maxEvents && (
        <motion.div
          className="mt-3 text-center text-xs font-mono text-portal-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          +{events.length - maxEvents} événements plus anciens
        </motion.div>
      )}
    </Card>
  );
}
