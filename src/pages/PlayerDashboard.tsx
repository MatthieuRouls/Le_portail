import { motion } from 'framer-motion';
import { useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import FlickeringLights from '../components/effects/FlickeringLights';
import GlitchText from '../components/effects/GlitchText';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PortalGauge from '../components/ui/PortalGauge';

interface PlayerDashboardProps {
  onNavigate: (page: 'home' | 'login' | 'player') => void;
}

export default function PlayerDashboard({ onNavigate }: PlayerDashboardProps) {
  const [gameState] = useState({
    portalLevel: 10,
    maxLevel: 20
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
      <StaticNoise />
      <FlickeringLights />
      
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #000000, rgba(127, 29, 29, 0.1), #000000)' }} />
      
      <div style={{ maxWidth: '48rem', margin: '0 auto', paddingTop: '2rem', paddingBottom: '2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={() => onNavigate('home')}
            style={{ color: '#dc2626', transition: 'color 0.3s', fontFamily: 'monospace' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#dc2626'}
          >
            ← QUITTER
          </button>
          <GlitchText className="text-2xl font-bold" style={{ color: '#dc2626' }}>
            <h1>TERMINAL</h1>
          </GlitchText>
          <div style={{ width: '5rem', textAlign: 'right' }}>
            <motion.div 
              style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#10b981', borderRadius: '9999px' }} />
              ACTIF
            </motion.div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glow>
            <PortalGauge level={gameState.portalLevel} maxLevel={gameState.maxLevel} />
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <motion.span 
                style={{ fontSize: '2.25rem' }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                👤
              </motion.span>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>RÔLE : HUMAIN</h3>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontFamily: 'monospace' }}>OBJECTIF : FERMER LE PORTAIL</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '1rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                ⚙
              </motion.span>
              MISSION EN COURS
            </h3>
            <div style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)', borderRadius: '0.5rem', padding: '1rem', border: '2px solid rgba(127, 29, 29, 0.3)' }}>
              <p style={{ color: '#d1d5db', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.625' }}>
                "L'Ombre détecte quelqu'un qui a porté l'uniforme de la République avant de siéger dans les conseils..."
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem', fontFamily: 'monospace' }}>🎯 CIBLE : [INCONNUE]</p>
              <Button variant="secondary" className="w-full">
                📷 SCANNER UN QR CODE
              </Button>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#60a5fa', marginBottom: '1rem', fontFamily: 'monospace' }}>✓ PROGRESSION</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                <span style={{ color: '#d1d5db' }}>Missions complétées</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>2/5</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#111827', borderRadius: '9999px', height: '0.75rem', border: '1px solid #1f2937' }}>
                <motion.div 
                  style={{ background: 'linear-gradient(to right, #059669, #10b981)', height: '100%', borderRadius: '9999px', position: 'relative', overflow: 'hidden' }}
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <motion.div
                    style={{ position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.3)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '1rem', fontFamily: 'monospace' }}>🔍 SUSPECTS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Diana', 'Eliott'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ backgroundColor: 'rgba(113, 63, 18, 0.2)', borderRadius: '0.375rem', padding: '0.75rem', border: '1px solid rgba(113, 63, 18, 0.3)', fontFamily: 'monospace', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ color: '#d1d5db' }}>▸ {name}</span>
                  <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>SURVEILLÉ</span>
                </motion.div>
              ))}
              <Button variant="secondary" className="w-full mt-3">
                ➕ AJOUTER UN SUSPECT
              </Button>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#f87171', marginBottom: '1rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚠
              </motion.span>
              ÉVÉNEMENTS RÉCENTS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
              <motion.div 
                style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span style={{ color: '#10b981' }}>►</span> Matthieu a complété sa mission ✓
              </motion.div>
              <motion.div 
                style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span style={{ color: '#ef4444' }}>►</span> Le Portail a grandi... ⚠
              </motion.div>
              <motion.div 
                style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span style={{ color: '#f59e0b' }}>►</span> Une Réunion approche... !
              </motion.div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
