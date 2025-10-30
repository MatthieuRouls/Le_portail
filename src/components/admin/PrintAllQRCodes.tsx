import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Player {
  id: string;
  name: string;
  role: 'human' | 'altered';
}

interface PrintAllQRCodesProps {
  players: Player[];
  onClose: () => void;
}

export default function PrintAllQRCodes({ players, onClose }: PrintAllQRCodesProps) {
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    players.forEach(async (player) => {
      const canvas = canvasRefs.current[player.id];
      if (!canvas) return;

      try {
        await QRCode.toCanvas(canvas, player.id, {
          width: 250,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (error) {
        console.error(`Erreur QR ${player.name}:`, error);
      }
    });
  }, [players]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1400px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Card>
          <div className="no-print" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            padding: '1rem 0',
            zIndex: 10
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#dc2626',
              fontFamily: 'monospace'
            }}>
              📱 QR CODES D'IDENTITÉ ({players.length})
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button onClick={handlePrint} variant="secondary">
                🖨️ IMPRIMER
              </Button>
              <Button onClick={onClose} variant="primary">
                FERMER
              </Button>
            </div>
          </div>

          <div
            className="qr-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}
          >
            {players.map((player) => (
              <div
                key={player.id}
                className="qr-card"
                style={{
                  padding: '2rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  border: '3px solid #e5e7eb',
                  textAlign: 'center',
                  pageBreakInside: 'avoid'
                }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '0.75rem'
                }}>
                  {player.role === 'human' ? '👤' : '👻'}
                </div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  fontFamily: 'monospace',
                  marginBottom: '0.5rem'
                }}>
                  {player.name}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: player.role === 'human' ? '#10b981' : '#dc2626',
                  fontFamily: 'monospace',
                  marginBottom: '1.5rem',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  padding: '0.5rem 1rem',
                  backgroundColor: player.role === 'human' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '0.5rem',
                  display: 'inline-block'
                }}>
                  {player.role === 'human' ? '🟢 HUMAIN' : '🔴 ALTÉRÉ'}
                </p>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  display: 'inline-block',
                  border: '2px solid #e5e7eb'
                }}>
                  <canvas
                    ref={(el) => (canvasRefs.current[player.id] = el)}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  fontWeight: '600'
                }}>
                  🆔 {player.id}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  marginTop: '1rem',
                  lineHeight: '1.6',
                  padding: '0.75rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '0.5rem',
                  border: '1px solid #fbbf24'
                }}>
                  ⚠️ Scannez ce code pour sélectionner {player.name}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              .no-print {
                display: none !important;
              }
              body * {
                visibility: hidden;
              }
              .qr-grid,
              .qr-grid * {
                visibility: visible;
              }
              .qr-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              .qr-grid {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 2cm !important;
                padding: 0.5cm;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}
