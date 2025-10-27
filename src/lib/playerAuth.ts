import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function loginWithQRCode(qrCodeData: string): Promise<{
  success: boolean;
  playerId?: string;
  playerName?: string;
  role?: string;
  error?: string;
}> {
  try {
    console.log('🔐 Login avec QR code:', qrCodeData);
    
    let qrCode = qrCodeData.trim();
    
    // Essayer de parser comme URL (pour les anciens QR codes)
    try {
      const url = new URL(qrCodeData);
      qrCode = url.pathname.split('/').pop() || qrCodeData;
      console.log('📍 URL détectée, extraction:', qrCode);
    } catch {
      // Pas une URL, c'est juste un ID direct (nouveau format)
      console.log('📝 ID direct détecté:', qrCode);
    }
    
    // Nettoyer l'ID
    qrCode = qrCode.toLowerCase().trim();

    if (!qrCode) {
      return { success: false, error: 'QR code invalide' };
    }

    // Chercher le joueur avec cet ID directement
    const playerDoc = await getDoc(doc(db, 'players', qrCode));
    
    if (!playerDoc.exists()) {
      console.error('❌ Joueur non trouvé:', qrCode);
      return { success: false, error: 'Joueur non trouvé' };
    }

    const playerData = playerDoc.data();
    console.log('✅ Joueur trouvé:', playerData.name);

    // Sauvegarder dans localStorage
    localStorage.setItem('currentPlayer', JSON.stringify({
      id: playerData.id,
      name: playerData.name,
      role: playerData.role
    }));

    return {
      success: true,
      playerId: playerData.id,
      playerName: playerData.name,
      role: playerData.role
    };
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return { success: false, error: 'Erreur de connexion' };
  }
}

export function getCurrentPlayer(): {
  id: string;
  name: string;
  role: string;
} | null {
  const stored = localStorage.getItem('currentPlayer');
  return stored ? JSON.parse(stored) : null;
}

export function logout() {
  localStorage.removeItem('currentPlayer');
}
