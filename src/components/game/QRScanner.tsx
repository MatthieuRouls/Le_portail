import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            scanner.stop();
            onScanSuccess(decodedText);
          },
          () => {
            // Erreur de scan ignorée (se produit continuellement)
          }
        );

        setScanning(true);
      } catch (err) {
        console.error('Erreur scanner:', err);
        setError('Impossible d\'accéder à la caméra');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}
      >
        <h2 style={{
          color: '#dc2626',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontFamily: 'monospace'
        }}>
          📷 SCANNER LE QR CODE
        </h2>

        <p style={{
          color: '#d1d5db',
          marginBottom: '2rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          Positionne le QR code dans le cadre
        </p>

        {error ? (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '2px solid #dc2626',
            borderRadius: '0.5rem',
            padding: '2rem',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#ef4444', fontFamily: 'monospace' }}>
              ❌ {error}
            </p>
          </div>
        ) : (
          <div
            id="qr-reader"
            style={{
              width: '100%',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '2px solid #dc2626'
            }}
          />
        )}

        <Button onClick={handleClose} variant="secondary">
          ANNULER
        </Button>
      </motion.div>
    </motion.div>
  );
}
