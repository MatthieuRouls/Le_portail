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
    const timer = setTimeout(() => setShowWarning(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#000000', position: 'relative', overflow: 'hidden' }}>
      <FlickeringLights />
      <StaticNoise />
      <DemogorgonParticles />
      
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(127, 29, 29, 0.2), #000000, rgba(88, 28, 135, 0.2))' }} />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}
      >
        <GlitchText className="font-bold mb-4">
          <h1 style={{ 
            fontSize: '7rem', 
            color: '#dc2626',
            textShadow: '0 0 30px rgba(220, 38, 38, 0.8)',
            fontWeight: 'bold'
              }}>
          LE PORTAIL
          </h1>
        </GlitchText>

        <motion.p
          style={{ fontSize: '1.5rem', color: '#d1d5db', marginBottom: '1rem', fontFamily: 'monospace' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          L'Ombre approche...
        </motion.p>

        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '2rem', fontFamily: 'monospace', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            >
              ⚠ DANGER : ENTITÉ DÉTECTÉE ⚠
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginBottom: '3rem' }}>
          <PortalVortex />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ marginTop: '3rem' }}
        >
          <Button
            onClick={() => onNavigate('login')}
            className="text-xl px-12 py-4"
          >
            🔓 ENTRER DANS LE PORTAIL
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ marginTop: '2rem' }}
        >
          <button
            onClick={() => onNavigate('admin')}
            style={{ 
              color: '#7f1d1d', 
              fontSize: '0.875rem', 
              transition: 'color 0.3s', 
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#991b1b'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#7f1d1d'}
          >
            [ADMIN ACCESS]
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
