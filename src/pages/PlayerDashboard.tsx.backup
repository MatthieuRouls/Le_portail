import { motion } from 'framer-motion';
import { useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';
import PortalGauge from '../components/ui/PortalGauge';

interface PlayerDashboardProps {
  onNavigate: (page: 'home' | 'login' | 'player') => void;
}

// Composant Card moderne et épuré
const ModernCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      backgroundColor: 'rgba(15, 15, 15, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(127, 29, 29, 0.3)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Bouton moderne
const ModernButton = ({ children, onClick, variant = 'primary' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: '100%',
        padding: '0.875rem 1.5rem',
        backgroundColor: isPrimary ? 'rgba(127, 29, 29, 0.6)' : 'rgba(40, 40, 40, 0.6)',
        border: isPrimary ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid rgba(75, 85, 99, 0.5)',
        borderRadius: '8px',
        color: '#e5e7eb',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)',
        boxShadow: isPrimary ? '0 0 15px rgba(220, 38, 38, 0.2)' : 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary ? 'rgba(127, 29, 29, 0.8)' : 'rgba(55, 55, 55, 0.8)';
        e.currentTarget.style.borderColor = isPrimary ? 'rgba(220, 38, 38, 0.8)' : 'rgba(107, 114, 128, 0.8)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isPrimary ? 'rgba(127, 29, 29, 0.6)' : 'rgba(40, 40, 40, 0.6)';
        e.currentTarget.style.borderColor = isPrimary ? 'rgba(220, 38, 38, 0.5)' : 'rgba(75, 85, 99, 0.5)';
      }}
    >
      {children}
    </motion.button>
  );
};

export default function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const [gameState] = useState({
    portalLevel: 10,
    maxLevel: 20
  });

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
      
      {/* Gradient radial au lieu de linéaire pour plus de profondeur */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(ellipse at center, rgba(127, 29, 29, 0.15) 0%, #000000 70%)' 
      }} />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1.5rem 0', 
        position: 'relative', 
        zIndex: 10 
      }}>
        {/* Header épuré */}
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
              transition: 'all 0.3s',
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            ← QUITTER
          </motion.button>
          
          <GlitchText style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <h1>TERMINAL</h1>
          </GlitchText>
          
          {/* Indicateur de connexion minimaliste */}
          <motion.div 
            style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              fontFamily: 'monospace', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.375rem' 
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: '#dc2626', 
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)'
            }} />
            CONNECTÉ
          </motion.div>
        </div>

        {/* Grid responsive avec auto-fit */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem'
        }}>
          {/* Portail - Pleine largeur */}
          <div style={{ gridColumn: '1 / -1' }}>
            <ModernCard>
              <PortalGauge level={gameState.portalLevel} maxLevel={gameState.maxLevel} />
            </ModernCard>
          </div>

          {/* Mission principale - Pleine largeur */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(127, 29, 29, 0.2)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>⚙</span>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: '#e5e7eb', 
                fontFamily: 'monospace',
                margin: 0
              }}>
                MISSION ACTIVE
              </h3>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(127, 29, 29, 0.15)', 
              borderRadius: '8px', 
              padding: '1.25rem',
              border: '1px solid rgba(127, 29, 29, 0.2)',
              marginBottom: '1rem'
            }}>
              <p style={{ 
                color: '#d1d5db', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem', 
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                "L'Ombre détecte quelqu'un qui a porté l'uniforme de la République avant de siéger dans les conseils..."
              </p>
              <p style={{ 
                fontSize: '0.8125rem', 
                color: '#9ca3af', 
                fontFamily: 'monospace',
                margin: 0
              }}>
                🎯 CIBLE : <span style={{ color: '#dc2626' }}>[INCONNUE]</span>
              </p>
            </div>
            
            <ModernButton>
              📷 SCANNER UN QR CODE
            </ModernButton>
          </ModernCard>

          {/* Rôle */}
          <ModernCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>👤</span>
              <div>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#e5e7eb', 
                  fontFamily: 'monospace',
                  marginBottom: '0.25rem'
                }}>
                  HUMAIN
                </h3>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  fontFamily: 'monospace',
                  margin: 0
                }}>
                  Fermer le portail
                </p>
              </div>
            </div>
          </ModernCard>

          {/* Progression */}
          <ModernCard>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Progression
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem' 
              }}>
                <span style={{ color: '#9ca3af' }}>Missions</span>
                <span style={{ color: '#e5e7eb', fontWeight: '600' }}>2/5</span>
              </div>
              <div style={{ 
                width: '100%', 
                backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                borderRadius: '999px', 
                height: '8px',
                overflow: 'hidden'
              }}>
                <motion.div 
                  style={{ 
                    background: 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%)', 
                    height: '100%', 
                    borderRadius: '999px'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </ModernCard>

          {/* Suspects - Large sur desktop */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Suspects surveillés
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {['Diana', 'Eliott'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ 
                    backgroundColor: 'rgba(127, 29, 29, 0.15)', 
                    borderRadius: '6px', 
                    padding: '0.875rem', 
                    border: '1px solid rgba(127, 29, 29, 0.2)', 
                    fontFamily: 'monospace', 
                    fontSize: '0.8125rem',
                    color: '#e5e7eb'
                  }}
                >
                  ▸ {name}
                </motion.div>
              ))}
            </div>
            <ModernButton variant="secondary">
              ➕ AJOUTER UN SUSPECT
            </ModernButton>
          </ModernCard>

          {/* Événements - Pleine largeur */}
          <ModernCard style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#9ca3af', 
              marginBottom: '1rem', 
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Événements récents
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.625rem', 
              fontSize: '0.8125rem', 
              fontFamily: 'monospace' 
            }}>
              {[
                'Matthieu a complété sa mission',
                'Le Portail a augmenté son niveau',
                'Une Réunion approche'
              ].map((event, i) => (
                <motion.div 
                  key={i}
                  style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span style={{ color: '#dc2626' }}>•</span> {event}
                </motion.div>
              ))}
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
}
