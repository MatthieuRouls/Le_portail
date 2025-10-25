import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import FlickeringLights from '../components/effects/FlickeringLights';
import StaticNoise from '../components/effects/StaticNoise';
import DemogorgonParticles from '../components/effects/DemogorgonParticles';
import GlitchText from '../components/effects/GlitchText';
import PortalVortex from '../components/effects/PortalVortex';
import Button from '../components/ui/Button';

interface HomeProps {
  onNavigate: (page: 'home' | 'login' | 'player' | 'admin') => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWarning(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-portal-bg-darkest relative overflow-hidden">
      {/* Effets visuels de fond */}
      <FlickeringLights />
      <StaticNoise />
      <DemogorgonParticles />

      {/* Gradient de fond harmonisé */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(0, 212, 255, 0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.15), transparent 50%)',
        }}
      />

      {/* Grille de fond subtle */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Contenu principal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center relative z-10 max-w-4xl"
      >
        {/* Titre avec effet glitch */}
        <GlitchText>
          <h1
            className="text-8xl md:text-9xl font-bold mb-6 tracking-wider"
            style={{
              color: '#00d4ff',
              textShadow: `
                0 0 40px rgba(0, 212, 255, 0.8),
                0 0 80px rgba(0, 212, 255, 0.4),
                0 0 120px rgba(139, 92, 246, 0.3)
              `,
            }}
          >
            LE PORTAIL
          </h1>
        </GlitchText>

        {/* Sous-titre */}
        <motion.p
          className="text-2xl text-portal-text-secondary mb-8 font-mono tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          L'Ombre approche...
        </motion.p>

        {/* Avertissement animé */}
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-portal-danger text-sm mb-8 font-mono uppercase tracking-widest"
            >
              <motion.span
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ⚠ DANGER : ENTITÉ DÉTECTÉE ⚠
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portail visuel */}
        <div className="my-12">
          <PortalVortex />
        </div>

        {/* Bouton principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Button
            onClick={() => onNavigate('login')}
            variant="primary"
            className="text-xl px-12 py-5"
          >
            ENTRER DANS LE PORTAIL
          </Button>
        </motion.div>

        {/* Lien admin discret */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8"
        >
          <motion.button
            onClick={() => onNavigate('admin')}
            className="text-portal-text-muted hover:text-portal-secondary text-sm font-mono bg-transparent border-none cursor-pointer transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            [ADMIN ACCESS]
          </motion.button>
        </motion.div>

        {/* Indicateur de statut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 flex items-center justify-center gap-2 text-xs font-mono text-portal-text-muted"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-portal-primary"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span>SYSTÈME ACTIF</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
