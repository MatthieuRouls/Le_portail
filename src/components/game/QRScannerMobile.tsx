import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import Button from '../ui/Button';

interface QRScannerMobileProps {
  onScanSuccess: (playerId: string) => void;
  onClose: () => void;
}

export default function QRScannerMobile({ onScanSuccess, onClose }: QRScannerMobileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number>();
  const scanCountRef = useRef<number>(0);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Ton navigateur ne supporte pas l\'accès à la caméra. Utilise la saisie manuelle.');
        setShowManualInput(true);
        return;
      }

      console.log('📷 Demande d\'accès à la caméra...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setHasPermission(true);
          setScanning(true);
          console.log('✅ Caméra activée - Résolution:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          
          scanningRef.current = true;
          startScanning();
        };
      }
    } catch (err: any) {
      console.error('❌ Erreur caméra:', err);
      
      let errorMessage = 'Impossible d\'accéder à la caméra.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Accès à la caméra refusé. Active les permissions dans Réglages → Safari → Caméra';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra détectée sur cet appareil.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La caméra est déjà utilisée par une autre application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Les contraintes de la caméra ne peuvent pas être satisfaites.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Erreur de sécurité. Utilise HTTPS ou localhost.';
      }
      
      setError(errorMessage);
      setShowManualInput(true);
    }
  };

  const startScanning = () => {
    const scan = () => {
      if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(scan);
        return;
      }

      // Ajuster la taille du canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dessiner la frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Obtenir les données de l'image
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Chercher un QR code avec plusieurs options
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth', // Essayer inversé aussi
      });

      scanCountRef.current++;
      
      // Debug toutes les 30 frames (environ 1 seconde)
      if (scanCountRef.current % 30 === 0) {
        setDebugInfo(`Scan #${scanCountRef.current} - ${canvas.width}x${canvas.height}px`);
        console.log(`🔍 Scan #${scanCountRef.current}`, code ? '✅ QR détecté' : '⭕ Rien');
      }

      if (code && code.data) {
        console.log('🎯 QR Code détecté !', code.data);
        console.log('📍 Position:', code.location);
        
        // Éviter les scans répétés
        if (code.data !== lastScan) {
          setLastScan(code.data);
          handleQRCodeDetected(code.data);
          return;
        }
      }

      // Continuer le scan
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const handleQRCodeDetected = (qrData: string) => {
    console.log('✅ QR Code scanné:', qrData);
    scanningRef.current = false;
    
    // Le QR code contient maintenant juste l'ID du joueur
    let playerId = qrData.trim().toLowerCase();
    
    console.log('👤 Player ID extrait:', playerId);
    
    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    stopCamera();
    onScanSuccess(playerId);
  };

  const stopCamera = () => {
    scanningRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      console.log('🛑 Caméra arrêtée');
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      alert('Entre un code joueur valide');
      return;
    }
    stopCamera();
    onScanSuccess(manualCode.trim().toLowerCase());
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
        padding: '1rem',
        overflowY: 'auto'
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

        {scanning && !error && (
          <div>
            <motion.p
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                color: '#10b981',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                marginBottom: '0.5rem'
              }}
            >
              🔍 Recherche en cours...
            </motion.p>
            {debugInfo && (
              <p style={{
                color: '#6b7280',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                marginBottom: '1rem'
              }}>
                {debugInfo}
              </p>
            )}
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                border: '2px solid #dc2626',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}
            >
              <p style={{ 
                color: '#ef4444', 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                lineHeight: '1.6'
              }}>
                ❌ {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!error && (
          <div style={{
            position: 'relative',
            width: '100%',
            marginBottom: '1rem',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            border: '3px solid #dc2626',
            backgroundColor: '#111'
          }}>
            {!hasPermission && (
              <div style={{
                padding: '3rem',
                color: '#fbbf24',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                ⏳ Demande d'accès à la caméra...<br/>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Autorise l'accès si demandé
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: 'auto',
                display: hasPermission ? 'block' : 'none'
              }}
            />

            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            
            {hasPermission && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '250px',
                height: '250px',
                border: '3px solid #10b981',
                borderRadius: '1rem',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                pointerEvents: 'none'
              }}>
                {scanning && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 10px #10b981'
                    }}
                    animate={{
                      top: ['0%', '100%', '0%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                )}
                
                <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '30px', height: '30px', borderTop: '5px solid #10b981', borderLeft: '5px solid #10b981' }} />
                <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '30px', height: '30px', borderTop: '5px solid #10b981', borderRight: '5px solid #10b981' }} />
                <div style={{ position: 'absolute', bottom: '-3px', left: '-3px', width: '30px', height: '30px', borderBottom: '5px solid #10b981', borderLeft: '5px solid #10b981' }} />
                <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '30px', height: '30px', borderBottom: '5px solid #10b981', borderRight: '5px solid #10b981' }} />
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {showManualInput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'rgba(127, 29, 29, 0.2)',
                border: '2px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}
            >
              <p style={{
                color: '#d1d5db',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                💡 Entre manuellement le code du joueur :
              </p>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ex: matthieu, julien, chloe..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#111827',
                  border: '2px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#d1d5db',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleManualSubmit();
                }}
              />
              <button
                onClick={handleManualSubmit}
                style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ✅ VALIDER
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          {!showManualInput && (
            <button
              onClick={() => setShowManualInput(true)}
              style={{
                width: '100%',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ⌨️ SAISIE MANUELLE
            </button>
          )}
        </div>

        <Button onClick={() => { stopCamera(); onClose(); }} variant="secondary" style={{ width: '100%' }}>
          ANNULER
        </Button>

        <p style={{
          color: '#6b7280',
          fontSize: '0.7rem',
          marginTop: '1rem',
          fontFamily: 'monospace',
          lineHeight: '1.4'
        }}>
          💡 Place le QR code dans le cadre vert. Tiens ton téléphone stable.
        </p>
      </div>
    </motion.div>
  );
}
