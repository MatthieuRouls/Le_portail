import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import DemogorgonParticles from '../components/effects/DemogorgonParticles';
import GlitchText from '../components/effects/GlitchText';
import QRScannerMobile from '../components/game/QRScannerMobile';
import PlayerSelector from '../components/game/PlayerSelector';
import { loginWithQRCode } from '../lib/playerAuth';

interface LoginProps {
  onNavigate: (page: 'home' | 'login' | 'player' | 'admin') => void;
}

// Card moderne pour la page login
const LoginCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    style={{
      backgroundColor: 'rgba(15, 15, 15, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(127, 29, 29, 0.4)',
      borderRadius: '16px',
      padding: '2.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 60px rgba(220, 38, 38, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '480px',
      width: '100%',
      margin: '0 1rem'
    }}
  >
    {/* Effet de glow subtil */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.6), transparent)',
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
    }} />
    
    {children}
  </motion.div>
);

// Bouton login moderne
const LoginButton = ({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  delay = 0
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
  delay?: number;
}) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.8) 0%, rgba(220, 38, 38, 0.6) 100%)',
      border: '1px solid rgba(220, 38, 38, 0.6)',
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
      hoverShadow: '0 0 30px rgba(220, 38, 38, 0.5), 0 0 60px rgba(220, 38, 38, 0.2)'
    },
    secondary: {
      background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.8) 0%, rgba(60, 60, 60, 0.6) 100%)',
      border: '1px solid rgba(100, 100, 100, 0.5)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
      hoverShadow: '0 8px 25px rgba(0, 0, 0, 0.8)'
    },
    tertiary: {
      background: 'transparent',
      border: '1px solid rgba(75, 85, 99, 0.3)',
      boxShadow: 'none',
      hoverShadow: '0 0 15px rgba(75, 85, 99, 0.3)'
    }
  };

  const currentStyle = styles[variant];
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: currentStyle.hoverShadow
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        width: '100%',
        padding: variant === 'tertiary' ? '0.75rem 1.5rem' : '1rem 2rem',
        fontSize: variant === 'tertiary' ? '0.875rem' : '1rem',
        fontWeight: '600',
        fontFamily: 'monospace',
        color: disabled ? '#6b7280' : '#ffffff',
        background: disabled ? 'rgba(40, 40, 40, 0.5)' : currentStyle.background,
        border: currentStyle.border,
        borderRadius: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backdropFilter: 'blur(10px)',
        boxShadow: disabled ? 'none' : currentStyle.boxShadow,
        transition: 'all 0.3s ease',
        letterSpacing: '0.05em',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Effet de brillance */}
      {!disabled && variant !== 'tertiary' && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            pointerEvents: 'none'
          }}
          animate={{
            left: ['-100%', '200%']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'linear'
          }}
        />
      )}
      
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>
    </motion.button>
  );
};

// Badge de statut
const StatusBadge = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      backgroundColor: 'rgba(127, 29, 29, 0.2)',
      border: '1px solid rgba(127, 29, 29, 0.4)',
      borderRadius: '8px',
      marginBottom: '2rem',
      backdropFilter: 'blur(10px)'
    }}
  >
    <motion.div
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        width: '8px',
        height: '8px',
        backgroundColor: '#dc2626',
        borderRadius: '50%',
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.8)'
      }}
    />
    <span style={{
      color: '#f87171',
      fontSize: '0.8125rem',
      fontFamily: 'monospace',
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    }}>
      Système actif
    </span>
  </motion.div>
);

// Section d'information
const InfoSection = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.6 }}
    style={{
      padding: '1rem 1.25rem',
      backgroundColor: 'rgba(127, 29, 29, 0.15)',
      border: '1px solid rgba(127, 29, 29, 0.3)',
      borderRadius: '8px',
      marginBottom: '1.75rem'
    }}
  >
    <p style={{
      color: '#9ca3af',
      fontSize: '0.8125rem',
      fontFamily: 'monospace',
      lineHeight: '1.6',
      margin: 0,
      textAlign: 'center'
    }}>
      Scanne ton <span style={{ color: '#dc2626', fontWeight: 'bold' }}>code d'accès personnel</span> pour te connecter au système
    </p>
  </motion.div>
);

export default function Login({ onNavigate }: LoginProps) {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(false);
    setLoading(true);
    setError('');

    const result = await loginWithQRCode(decodedText);

    if (result.success) {
      setTimeout(() => {
        onNavigate('player');
      }, 500);
    } else {
      setError(result.error || 'Erreur de connexion');
      setLoading(false);
    }
  };

  const handleManualCode = () => {
    const code = prompt('Entre ton code joueur:');
    if (code) {
      alert('Connexion manuelle à implémenter');
    }
  };

  const handlePlayerSelect = async (playerId: string, playerName: string, role: string) => {
    setShowSelector(false);
    setLoading(true);
    setError('');
    
    localStorage.setItem('currentPlayer', JSON.stringify({
      id: playerId,
      name: playerName,
      role: role
    }));
    
    setTimeout(() => {
      setLoading(false);
      onNavigate('player');
    }, 500);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem 1rem', 
      backgroundColor: '#000000', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <StaticNoise />
      <DemogorgonParticles />
      
      {/* Gradient radial pour focus */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(ellipse at center, rgba(127, 29, 29, 0.2) 0%, #000000 60%)',
        opacity: 0.8
      }} />
      
      {/* Vignette sur les bords */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 80%)',
        pointerEvents: 'none'
      }} />
      
      <LoginCard>
        {/* Header avec titre */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlitchText>
              <h2 style={{ 
                fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
                color: '#dc2626',
                fontWeight: 'bold',
                margin: '0 0 0.75rem 0',
                textShadow: '0 0 30px rgba(220, 38, 38, 0.6)',
                letterSpacing: '0.1em'
              }}>
                IDENTIFICATION
              </h2>
            </GlitchText>
          </motion.div>

          <StatusBadge delay={0.3} />
        </div>

        {/* Section d'information */}
        <InfoSection delay={0.5} />

        {/* Message d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem 1.25rem', 
                backgroundColor: 'rgba(220, 38, 38, 0.15)', 
                border: '1px solid rgba(220, 38, 38, 0.4)', 
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <p style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem', 
                fontFamily: 'monospace',
                textAlign: 'center',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚠</span>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons principaux */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <LoginButton
            onClick={() => setScanning(true)}
            disabled={loading}
            delay={0.7}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⚙
                </motion.span>
                CONNEXION...
              </span>
            ) : (
              '📷 SCANNER LE QR CODE'
            )}
          </LoginButton>

          {/* Bouton de sélection manuelle - style temporaire */}
          <LoginButton
            onClick={() => setShowSelector(true)}
            variant="tertiary"
            delay={0.9}
          >
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              color: '#6b7280'
            }}>
              <span style={{ fontSize: '0.875rem' }}>⚙</span>
              SÉLECTION MANUELLE (DEV)
            </span>
          </LoginButton>
        </div>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          margin: '1.5rem 0'
        }}>
          <div style={{ 
            flex: 1, 
            height: '1px', 
            background: 'linear-gradient(90deg, transparent, rgba(75, 85, 99, 0.3), transparent)' 
          }} />
          <span style={{ 
            color: '#4b5563', 
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            letterSpacing: '0.1em'
          }}>
            OPTIONS
          </span>
          <div style={{ 
            flex: 1, 
            height: '1px', 
            background: 'linear-gradient(90deg, transparent, rgba(75, 85, 99, 0.3), transparent)' 
          }} />
        </div>

        {/* Bouton code manuel */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <motion.button 
            onClick={handleManualCode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            whileHover={{ color: '#9ca3af' }}
            style={{ 
              fontSize: '0.8125rem', 
              color: '#6b7280', 
              transition: 'color 0.3s', 
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            [ Entrer un code manuellement ]
          </motion.button>
        </div>

        {/* Bouton retour */}
        <div style={{ textAlign: 'center' }}>
          <motion.button 
            onClick={() => onNavigate('home')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            whileHover={{ 
              color: '#dc2626',
              x: -5
            }}
            style={{ 
              fontSize: '0.875rem', 
              color: '#4b5563', 
              transition: 'all 0.3s', 
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              letterSpacing: '0.05em'
            }}
          >
            <span>←</span> RETOUR
          </motion.button>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(75, 85, 99, 0.2)',
            textAlign: 'center'
          }}
        >
          <p style={{
            color: '#4b5563',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            lineHeight: '1.5',
            margin: 0
          }}>
            Système d'authentification sécurisé<br/>
            <span style={{ color: '#6b7280' }}>v2.0 - Halloween Edition</span>
          </p>
        </motion.div>
      </LoginCard>

      {/* Scanner QR */}
      {scanning && (
        <QRScannerMobile
          onScanSuccess={handleScanSuccess}
          onClose={() => setScanning(false)}
        />
      )}

      {/* Sélecteur de joueur */}
      {showSelector && (
        <PlayerSelector
          onSelect={handlePlayerSelect}
          onClose={() => setShowSelector(false)}
        />
      )}

      {/* Particules décoratives autour de la card */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0]
            }}
            transition={{
              duration: 2.5 + Math.random() * 1.5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}