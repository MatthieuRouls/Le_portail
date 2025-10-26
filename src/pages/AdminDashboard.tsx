import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlitchText from '../components/effects/GlitchText';
import EventTester from '../components/admin/EventTester';
import { generateAllQRCodes, downloadQRCode, downloadAllQRCodes } from '../lib/generateQRCodes';
import { diagnoseGame, repairGame } from '../lib/repairGame';
import { resetAndReassignMissions } from '../lib/resetGame';

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
  const [diagnostic, setDiagnostic] = useState<string>('');
  const [repairing, setRepairing] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  const handleDiagnose = async () => {
    setDiagnostic('🔍 Diagnostic en cours...');
    console.clear();
    const result = await diagnoseGame();
    setDiagnostic(`✅ Game State: ${result.hasGameState ? 'OK' : '❌ Manquant'}
👥 Joueurs: ${result.totalPlayers}
✅ Avec mission: ${result.playersWithMissions}
⚠️  Sans mission: ${result.playersWithoutMissions}
📋 Missions créées: ${result.totalMissions}`);
  };

  const handleRepair = async () => {
    if (!confirm('Assigner les missions Tier 1 à tous les joueurs ?')) return;
    
    setRepairing(true);
    console.clear();
    await repairGame();
    await handleDiagnose();
    setRepairing(false);
    alert('✅ Réparation terminée ! Vérifie la console et rafraîchis le PlayerDashboard.');
  };

  const handleReset = async () => {
    const confirmed = confirm('⚠️ ATTENTION ⚠️\n\nCette action va:\n• Remettre le portail à 10\n• Supprimer TOUS les événements\n• Réinitialiser TOUS les joueurs\n• Réinitialiser TOUTES les missions\n• Réassigner les missions Tier 1\n\nContinuer ?');
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm('Es-tu VRAIMENT sûr ? Cette action est irréversible !');
    if (!doubleConfirm) return;
    
    setResetting(true);
    console.clear();
    console.log('🔴 RÉINITIALISATION COMPLÈTE EN COURS...\n');
    
    const success = await resetAndReassignMissions();
    
    if (success) {
      await handleDiagnose();
      alert('🎉 Jeu réinitialisé avec succès !\n\nLe jeu est prêt pour une nouvelle partie.\nTous les joueurs ont leur mission Tier 1.\nLe portail est à 10/20.');
    } else {
      alert('❌ Erreur lors de la réinitialisation. Vérifie la console.');
    }
    
    setResetting(false);
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
              🎮 ADMIN - DASHBOARD
            </h1>
          </GlitchText>
          <div style={{ width: '100px' }} />
        </div>

        {/* RESET COMPLET - ZONE DANGER */}
        <Card style={{ 
          marginBottom: '2rem',
          border: '2px solid #dc2626',
          backgroundColor: 'rgba(127, 29, 29, 0.2)'
        }}>
          <h2 style={{
            color: '#dc2626',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            🔴 ZONE DANGER - RESET COMPLET
          </h2>

          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#fca5a5'
          }}>
            ⚠️ Cette action va TOUT remettre à zéro :<br/>
            • Portail remis à 10/20<br/>
            • Tous les événements supprimés<br/>
            • Tous les joueurs réinitialisés<br/>
            • Toutes les missions réinitialisées<br/>
            • Missions Tier 1 réassignées
          </div>

          <Button 
            onClick={handleReset} 
            variant="danger" 
            isLoading={resetting}
            style={{
              backgroundColor: '#991b1b',
              borderColor: '#dc2626'
            }}
          >
            🔄 RESET COMPLET DU JEU
          </Button>

          <p style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '1rem',
            fontFamily: 'monospace'
          }}>
            À utiliser avant le jour J ou pour recommencer les tests
          </p>
        </Card>

        {/* Diagnostic et Réparation */}
        <Card glow style={{ marginBottom: '2rem' }}>
          <h2 style={{
            color: '#dc2626',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            🔧 DIAGNOSTIC & RÉPARATION
          </h2>

          {diagnostic && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#10b981',
              whiteSpace: 'pre-line'
            }}>
              {diagnostic}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <Button onClick={handleDiagnose} variant="secondary">
              🔍 DIAGNOSTIQUER
            </Button>
            <Button onClick={handleRepair} variant="primary" isLoading={repairing}>
              🔧 RÉPARER
            </Button>
          </div>

          <p style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '1rem',
            fontFamily: 'monospace'
          }}>
            Le diagnostic vérifie l'état du jeu. La réparation assigne les missions Tier 1.
          </p>
        </Card>

        {/* Testeur d'événements */}
        <EventTester />

        {/* Actions QR Codes */}
        <Card glow style={{ marginBottom: '2rem' }}>
          <h2 style={{
            color: '#dc2626',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            📱 QR CODES
          </h2>

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
