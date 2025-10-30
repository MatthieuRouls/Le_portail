import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface PlayerConnectionQRProps {
  playerId: string;
  playerName: string;
  onClose: () => void;
}

export default function PlayerConnectionQR({ playerId, playerName, onClose }: PlayerConnectionQRProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsGenerating(true);
        setError(null);
        
        // IMPORTANT : Générer le QR code avec JUSTE l'ID du joueur
        // Pas d'URL complète, juste l'ID comme avant !
        console.log('📝 Génération QR pour ID:', playerId);
        
        // Générer le QR code avec juste l'ID
        console.log('🎨 Génération du QR code...');
        const dataUrl = await QRCode.toDataURL(playerId, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
        
        console.log('✅ QR code généré avec succès pour:', playerId);
        setQrDataUrl(dataUrl);
        setIsGenerating(false);
      } catch (err) {
        console.error('❌ Erreur génération QR code:', err);
        setError(`Erreur: ${err}`);
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [playerId]);

  const handleDownload = () => {
    if (!qrDataUrl) {
      alert('❌ QR code non disponible');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.download = `QR-Connexion-${playerName}.png`;
      link.href = qrDataUrl;
      link.click();
      console.log('✅ QR code téléchargé');
    } catch (err) {
      console.error('❌ Erreur téléchargement:', err);
      alert(`Erreur téléchargement: ${err}`);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(playerId)
      .then(() => {
        alert(`✅ ID copié : ${playerId}`);
      })
      .catch((err) => {
        console.error('❌ Erreur copie:', err);
        alert(`Erreur copie: ${err}`);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px', width: '100%' }}
      >
        <Card>
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#dc2626',
              fontFamily: 'monospace',
              marginBottom: '0.5rem'
            }}>
              🔐 QR CODE DE CONNEXION
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#e5e7eb',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}>
              {playerName}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontFamily: 'monospace',
              marginTop: '0.75rem',
              lineHeight: '1.5'
            }}>
              Scannez ce code sur la page de connexion pour accéder à votre dashboard
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '1rem',
            border: '2px solid rgba(220, 38, 38, 0.3)',
            minHeight: '340px',
            alignItems: 'center'
          }}>
            {error ? (
              <div style={{
                color: '#ef4444',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                textAlign: 'center',
                padding: '1rem'
              }}>
                ❌ {error}
              </div>
            ) : isGenerating ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                color: '#9ca3af',
                fontFamily: 'monospace'
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ fontSize: '2rem' }}
                >
                  ⏳
                </motion.div>
                <div>Génération en cours...</div>
              </div>
            ) : (
              <img
                src={qrDataUrl}
                alt={`QR Code ${playerName}`}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            )}
          </div>

          {/* ID du joueur */}
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              flex: 1,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                marginBottom: '0.25rem'
              }}>
                ID du joueur
              </div>
              <div style={{
                fontSize: '1.25rem',
                color: '#e5e7eb',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}>
                {playerId}
              </div>
            </div>
            <button
              onClick={handleCopyId}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'rgba(127, 29, 29, 0.6)',
                border: '1px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '0.375rem',
                color: '#e5e7eb',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              📋 COPIER
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <Button onClick={handleDownload} variant="secondary" disabled={isGenerating || !!error}>
              💾 TÉLÉCHARGER
            </Button>
            <Button onClick={() => window.print()} variant="secondary" disabled={isGenerating || !!error}>
              🖨️ IMPRIMER
            </Button>
          </div>

          <Button onClick={onClose} variant="primary">
            FERMER
          </Button>

          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                img {
                  visibility: visible;
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  transform: translate(-50%, -50%);
                }
              }
            `}
          </style>
        </Card>
      </motion.div>
    </motion.div>
  );
}
