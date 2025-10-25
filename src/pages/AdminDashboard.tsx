import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlitchText from '../components/effects/GlitchText';
import { generateAllQRCodes, downloadQRCode, downloadAllQRCodes } from '../lib/generateQRCodes';

interface QRCodeData {
  playerId: string;
  playerName: string;
  qrCode: string;
  dataUrl: string;
}

interface AdminDashboardProps {
  onNavigate: (page: 'home' | 'login' | 'player' | 'admin') => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const codes = await generateAllQRCodes();
    setQrCodes(codes);
    setGenerated(true);
    setLoading(false);
  };

  const handleDownloadAll = async () => {
    await downloadAllQRCodes(qrCodes);
    alert('✅ Tous les QR codes ont été téléchargés !');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      padding: '2rem',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              color: '#dc2626',
              fontFamily: 'monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← RETOUR
          </button>
          <GlitchText>
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: '#dc2626', 
              fontWeight: 'bold',
              margin: 0
            }}>
              🎮 ADMIN - QR CODES
            </h1>
          </GlitchText>
          <div style={{ width: '100px' }} />
        </div>

        {/* Actions */}
        <Card glow style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Button
              onClick={handleGenerate}
              isLoading={loading}
              disabled={generated}
            >
              📱 GÉNÉRER LES QR CODES
            </Button>
            
            {generated && (
              <Button
                onClick={handleDownloadAll}
                variant="secondary"
              >
                💾 TÉLÉCHARGER TOUS LES QR CODES
              </Button>
            )}
          </div>
          
          {generated && (
            <p style={{ 
              textAlign: 'center', 
              marginTop: '1rem', 
              color: '#10b981',
              fontFamily: 'monospace'
            }}>
              ✅ {qrCodes.length} QR codes générés
            </p>
          )}
        </Card>

        {/* Grid des QR codes */}
        {generated && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {qrCodes.map((qr, index) => (
              <motion.div
                key={qr.playerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      color: '#dc2626', 
                      fontFamily: 'monospace',
                      marginBottom: '1rem',
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
                    }}>
                      {qr.playerName}
                    </h3>
                    
                    <div style={{ 
                      backgroundColor: '#000000',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <img 
                        src={qr.dataUrl} 
                        alt={`QR ${qr.playerName}`}
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          imageRendering: 'pixelated'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => downloadQRCode(qr.dataUrl, qr.playerName)}
                      style={{
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: '2px solid #6d28d9',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        width: '100%'
                      }}
                    >
                      💾 TÉLÉCHARGER
                    </button>

                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      marginTop: '0.5rem',
                      fontFamily: 'monospace'
                    }}>
                      ID: {qr.playerId}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
