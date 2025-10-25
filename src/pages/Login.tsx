import { motion } from 'framer-motion';
import { useState } from 'react';
import StaticNoise from '../components/effects/StaticNoise';
import DemogorgonParticles from '../components/effects/DemogorgonParticles';
import GlitchText from '../components/effects/GlitchText';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import QRScannerMobile from '../components/game/QRScannerMobile';
import PlayerSelector from '../components/game/PlayerSelector';
import { loginWithQRCode } from '../lib/playerAuth';

interface LoginProps {
  onNavigate: (page: 'home' | 'login' | 'player' | 'admin') => void;
}

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
      padding: '1rem', 
      backgroundColor: '#000000', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      <StaticNoise />
      <DemogorgonParticles />
      
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(to bottom, rgba(127, 29, 29, 0.2), #000000, #000000)' 
      }} />
      
      <Card className="max-w-md w-full" glow style={{ position: 'relative', zIndex: 10 }}>
        <GlitchText>
          <h2 style={{ 
            fontWeight: 'bold', 
            fontSize: '1.875rem', 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            color: '#dc2626'
          }}>
            IDENTIFICATION
          </h2>
        </GlitchText>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ 
            color: '#d1d5db', 
            fontFamily: 'monospace', 
            fontSize: '0.875rem', 
            marginBottom: '0.5rem' 
          }}>
            SYSTÈME DE SÉCURITÉ ACTIVÉ
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
            Scannez votre code d'accès personnel
          </p>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            backgroundColor: 'rgba(220, 38, 38, 0.2)', 
            border: '1px solid rgba(220, 38, 38, 0.5)', 
            borderRadius: '0.375rem' 
          }}>
            <p style={{ 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              ❌ {error}
            </p>
          </div>
        )}

        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(127, 29, 29, 0.2)', 
          border: '1px solid rgba(127, 29, 29, 0.5)', 
          borderRadius: '0.375rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: '#f87171', 
            fontSize: '0.75rem', 
            fontFamily: 'monospace' 
          }}>
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ●
            </motion.div>
            PROTOCOLE DE VÉRIFICATION EN COURS...
          </div>
        </div>

        <Button
          onClick={() => setScanning(true)}
          isLoading={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          📷 SCANNER LE QR CODE
        </Button>

        <Button
          onClick={() => setShowSelector(true)}
          variant="secondary"
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          👥 SÉLECTIONNER UN JOUEUR
        </Button>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={handleManualCode}
            style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              transition: 'color 0.3s', 
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            [ Code manuel ]
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => onNavigate('home')}
            style={{ 
              fontSize: '0.875rem', 
              color: '#991b1b', 
              transition: 'color 0.3s', 
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ← RETOUR
          </button>
        </div>
      </Card>

      {scanning && (
        <QRScannerMobile
          onScanSuccess={handleScanSuccess}
          onClose={() => setScanning(false)}
        />
      )}

      {showSelector && (
        <PlayerSelector
          onSelect={handlePlayerSelect}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}