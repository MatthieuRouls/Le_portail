import QRCode from 'qrcode';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function generateAllQRCodes() {
  try {
    console.log('📱 Génération des QR codes...');
    
    const playersSnapshot = await getDocs(collection(db, 'players'));
    const qrCodes: { playerId: string; playerName: string; qrCode: string; dataUrl: string }[] = [];

    for (const doc of playersSnapshot.docs) {
      const player = doc.data();
      
      // Données à encoder : juste l'ID du joueur pour simplifier
      const qrData = player.id;
      
      console.log(`Génération QR pour ${player.name} avec data:`, qrData);
      
      // Générer le QR code en Data URL (base64)
      // NOIR SUR BLANC pour un meilleur scan
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',  // Noir (le QR code lui-même)
          light: '#FFFFFF'  // Blanc (le fond)
        },
        errorCorrectionLevel: 'H' // Haute correction d'erreur
      });

      qrCodes.push({
        playerId: player.id,
        playerName: player.name,
        qrCode: player.qrCode,
        dataUrl: dataUrl
      });

      console.log(`✅ QR code généré pour ${player.name}`);
    }

    console.log('🎉 Tous les QR codes générés !');
    return qrCodes;
  } catch (error) {
    console.error('❌ Erreur lors de la génération des QR codes:', error);
    return [];
  }
}

export async function downloadQRCode(dataUrl: string, playerName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `qr_${playerName.toLowerCase().replace(/\s+/g, '_')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAllQRCodes(qrCodes: { playerId: string; playerName: string; dataUrl: string }[]) {
  for (const qr of qrCodes) {
    await downloadQRCode(qr.dataUrl, qr.playerName);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  console.log('✅ Tous les QR codes téléchargés !');
}
