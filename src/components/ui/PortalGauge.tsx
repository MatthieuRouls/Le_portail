import { motion } from 'framer-motion';

interface PortalGaugeProps {
  level: number;
  maxLevel?: number;
}

export default function PortalGauge({ level, maxLevel = 20 }: PortalGaugeProps) {
  const percentage = (level / maxLevel) * 100;
  const isDangerous = percentage > 70;
  const isCritical = percentage > 85;

  // Gradient qui évolue en fonction du niveau
  const getGradientColors = () => {
    if (isCritical) {
      return 'from-portal-danger-dark via-portal-danger to-portal-danger-light';
    } else if (isDangerous) {
      return 'from-portal-secondary-dark via-portal-secondary to-portal-danger';
    } else {
      return 'from-portal-primary-dark via-portal-primary to-portal-primary-light';
    }
  };

  return (
    <div className="w-full">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-portal-text-primary tracking-wider">
            NIVEAU DU PORTAIL
          </span>
          {isCritical && (
            <motion.span
              className="text-portal-danger text-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚠ CRITIQUE
            </motion.span>
          )}
        </div>
        <motion.span
          className={`font-mono text-lg font-bold ${
            isCritical
              ? 'text-portal-danger'
              : isDangerous
              ? 'text-portal-secondary'
              : 'text-portal-primary'
          }`}
          animate={isDangerous ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {level}/{maxLevel}
        </motion.span>
      </div>

      {/* Barre de progression */}
      <div className="relative h-10 bg-portal-bg-dark/90 rounded-lg overflow-hidden border border-portal-primary/30 shadow-inner">
        {/* Fond avec grille */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />

        {/* Barre de progression animée */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getGradientColors()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Effet de brillance */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Marqueurs de seuils */}
        <div className="absolute inset-0 flex">
          {[33, 66, 90].map((threshold) => (
            <div
              key={threshold}
              className="absolute top-0 bottom-0 w-px bg-portal-text-muted/30"
              style={{ left: `${threshold}%` }}
            />
          ))}
        </div>

        {/* Effet de pulsation pour le niveau critique */}
        {isCritical && (
          <motion.div
            className="absolute inset-0 bg-portal-danger/20"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Légende */}
      <div className="flex justify-between mt-3 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-portal-success animate-pulse" />
          <span className="text-portal-success">STABLE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-portal-secondary" />
          <span className="text-portal-text-secondary">INSTABLE</span>
        </div>
        <motion.div
          className="flex items-center gap-1.5"
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-portal-danger animate-pulse" />
          <span className="text-portal-danger">DANGER</span>
        </motion.div>
      </div>
    </div>
  );
}
