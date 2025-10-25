import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface QRScannerMobileProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScannerMobile({ onScanSuccess, onClose }: QRScannerMobileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Demander l'accès à la caméra arrière
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Erreur caméra:', err);
        setError('Impossible d\'accéder à la caméra. Vérifie les permissions dans les réglages Safari.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Simuler la lecture du QR code depuis l'image
      // En production, tu utiliserais une bibliothèque de décodage QR
      const imageData = event.target?.result as string;
      console.log('Image chargée:', imageData);
      
      // Pour l'instant, on simule une connexion
      alert('📸 Photo reçue ! En production, le QR serait décodé ici.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h2 style={{
          color: '#dc2626',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontFamily: 'monospace'
        }}>
          📷 SCANNER LE QR CODE
        </h2>

        {error ? (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '2px solid #dc2626',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <p style={{ 
              color: '#ef4444', 
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              ❌ {error}
            </p>
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '0.75rem',
              marginBottom: '1rem'
            }}>
              Solution : Active l'accès caméra dans Réglages → Safari → Caméra
            </p>
          </div>
        ) : hasPermission ? (
          <div style={{
            position: 'relative',
            width: '100%',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            border: '3px solid #dc2626'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            
            {/* Cadre de visée */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '250px',
              border: '3px solid #10b981',
              borderRadius: '1rem',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Coins du cadre */}
              <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '30px', height: '30px', borderTop: '5px solid #10b981', borderLeft: '5px solid #10b981' }} />
              <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '30px', height: '30px', borderTop: '5px solid #10b981', borderRight: '5px solid #10b981' }} />
              <div style={{ position: 'absolute', bottom: '-3px', left: '-3px', width: '30px', height: '30px', borderBottom: '5px solid #10b981', borderLeft: '5px solid #10b981' }} />
              <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '30px', height: '30px', borderBottom: '5px solid #10b981', borderRight: '5px solid #10b981' }} />
            </div>
          </div>
        ) : (
          <div style={{
            padding: '3rem',
            color: '#fbbf24',
            fontFamily: 'monospace'
          }}>
            ⏳ Demande d'accès à la caméra...
          </div>
        )}

        {/* Bouton upload photo en alternative */}
        <label style={{
          display: 'block',
          backgroundColor: '#7c3aed',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}>
          📸 OU PRENDRE UNE PHOTO
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>

        <Button onClick={onClose} variant="secondary" style={{ width: '100%' }}>
          ANNULER
        </Button>
      </div>
    </motion.div>
  );
}
