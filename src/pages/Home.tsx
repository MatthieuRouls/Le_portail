import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import FlickeringLights from '../components/effects/FlickeringLights';
import StaticNoise from '../components/effects/StaticNoise';
import DemogorgonParticles from '../components/effects/DemogorgonParticles';
import GlitchText from '../components/effects/GlitchText';
import PortalVortex from '../components/effects/PortalVortex';

interface HomeProps {
  onNavigate: (page: 'home' | 'login' | 'player' | 'admin') => void;
}

// Bouton cinématique moderne
const CinematicButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  delay = 0 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  variant?: 'primary' | 'secondary';
  delay?: number;
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: isPrimary 
          ? '0 0 40px rgba(220, 38, 38, 0.6), 0 0 80px rgba(220, 38, 38, 0.3)' 
          : '0 0 30px rgba(100, 100, 100, 0.4)'
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'relative',
        padding: isPrimary ? '1.25rem 3rem' : '1rem 2.5rem',
        fontSize: isPrimary ? '1.25rem' : '1rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        color: '#ffffff',
        background: isPrimary 
          ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(60, 60, 60, 0.8) 100%)',
        border: isPrimary 
          ? '2px solid rgba(220, 38, 38, 0.8)' 
          : '2px solid rgba(100, 100, 100, 0.6)',
        borderRadius: '12px',
        cursor: 'pointer',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        boxShadow: isPrimary 
          ? '0 0 30px rgba(220, 38, 38, 0.4), inset 0 0 20px rgba(220, 38, 38, 0.2)' 
          : '0 8px 20px rgba(0, 0, 0, 0.6)',
        textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
        transition: 'all 0.3s ease',
        letterSpacing: '0.1em'
      }}
    >
      {/* Effet de brillance animé */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        }}
        animate={{
          left: ['−100%', '200%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2
        }}
      />
      
      {/* Contenu du bouton */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>
      
      {/* Effet pulsant pour le bouton primaire */}
      {isPrimary && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: '12px',
            border: '2px solid rgba(220, 38, 38, 0.6)',
            pointerEvents: 'none'
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </motion.button>
  );
};

export default function Home({ onNavigate }: HomeProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animation d'entrée progressive
    setTimeout(() => setShowContent(true), 500);
    setTimeout(() => setShowWarning(true), 3000);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem 1rem', 
      backgroundColor: '#000000', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <FlickeringLights />
      <StaticNoise />
      <DemogorgonParticles />
      
      {/* Gradient radial plus dramatique */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(ellipse at center, rgba(127, 29, 29, 0.3) 0%, #000000 50%, rgba(88, 28, 135, 0.2) 100%)',
        opacity: 0.8
      }} />
      
      {/* Vignette sombre sur les bords */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.9) 100%)',
        pointerEvents: 'none'
      }} />
      
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ 
              textAlign: 'center', 
              position: 'relative', 
              zIndex: 10,
              maxWidth: '1200px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem'
            }}
          >
            {/* Logo titre avec effet glitch amélioré */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <GlitchText>
                <h1 style={{ 
                  fontSize: 'clamp(3rem, 12vw, 8rem)',
                  color: '#dc2626',
                  textShadow: `
                    0 0 20px rgba(220, 38, 38, 0.8),
                    0 0 40px rgba(220, 38, 38, 0.6),
                    0 0 60px rgba(220, 38, 38, 0.4),
                    0 0 100px rgba(220, 38, 38, 0.2)
                  `,
                  fontWeight: 'bold',
                  margin: 0,
                  letterSpacing: '0.05em',
                  lineHeight: 1.2
                }}>
                  LE PORTAIL
                </h1>
              </GlitchText>
            </motion.div>

            {/* Sous-titre atmosphérique */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <p style={{ 
                fontSize: 'clamp(1rem, 3vw, 1.75rem)',
                color: '#d1d5db', 
                marginBottom: '1rem', 
                fontFamily: 'monospace',
                textShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
                letterSpacing: '0.15em'
              }}>
                L'Ombre approche...
              </p>
              
              {/* Ligne décorative */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.2, duration: 0.8 }}
                style={{
                  height: '1px',
                  maxWidth: '300px',
                  margin: '0 auto',
                  background: 'linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.8), transparent)'
                }}
              />
            </motion.div>

            {/* Message d'avertissement */}
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ 
                    color: '#ef4444', 
                    fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                    marginBottom: '1rem', 
                    fontFamily: 'monospace',
                    padding: '0.75rem 1.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(127, 29, 29, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                    letterSpacing: '0.1em'
                  }}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚠ DANGER : ENTITÉ DÉTECTÉE ⚠
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Portail central */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              style={{ 
                margin: '2rem 0',
                position: 'relative'
              }}
            >
              <PortalVortex />
              
              {/* Glow effect autour du portail */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: -20,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(220, 38, 38, 0.2) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>

            {/* Boutons d'action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8 }}
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '500px',
                alignItems: 'center'
              }}
            >
              <CinematicButton
                onClick={() => onNavigate('login')}
                delay={2.2}
              >
                🔓 ENTRER DANS LE PORTAIL
              </CinematicButton>

              {/* Texte descriptif sous le bouton principal */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  maxWidth: '400px',
                  lineHeight: 1.6,
                  textAlign: 'center'
                }}
              >
                Connecte-toi pour rejoindre la bataille contre les ténèbres
              </motion.p>

              {/* Bouton admin discret */}
              <motion.button
                onClick={() => onNavigate('admin')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                whileHover={{ 
                  color: '#dc2626',
                  textShadow: '0 0 10px rgba(220, 38, 38, 0.6)'
                }}
                style={{ 
                  color: '#4b5563', 
                  fontSize: '0.8125rem', 
                  transition: 'all 0.3s', 
                  fontFamily: 'monospace',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                [ Accès Administrateur ]
              </motion.button>
            </motion.div>

            {/* Effet de particules flottantes autour du contenu */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '2px',
                    height: '2px',
                    backgroundColor: '#dc2626',
                    borderRadius: '50%',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: '0 0 10px rgba(220, 38, 38, 0.8)'
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer avec crédits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          fontSize: '0.75rem',
          color: '#4b5563',
          fontFamily: 'monospace',
          textAlign: 'center',
          zIndex: 10
        }}
      >
        <p>Stranger Things × Halloween 2025</p>
      </motion.div>
    </div>
  );
}
