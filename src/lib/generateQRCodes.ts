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
      
      // Créer l'URL de connexion (sera utilisée pour scanner)
      const loginUrl = `${window.location.origin}/scan/${player.qrCode}`;
      
      // Générer le QR code en Data URL (base64)
      const dataUrl = await QRCode.toDataURL(loginUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#dc2626',  // Rouge
          light: '#000000'  // Fond noir
        }
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
    // Petit délai entre chaque téléchargement
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  console.log('✅ Tous les QR codes téléchargés !');
}
