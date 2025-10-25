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
    // Extraire le code QR de l'URL scannée
    const url = new URL(qrCodeData);
    const qrCode = url.pathname.split('/').pop();

    if (!qrCode) {
      return { success: false, error: 'QR code invalide' };
    }

    // Chercher le joueur avec ce QR code
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('qrCode', '==', qrCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Joueur non trouvé' };
    }

    const playerDoc = querySnapshot.docs[0];
    const playerData = playerDoc.data();

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
    console.error('Erreur de connexion:', error);
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
