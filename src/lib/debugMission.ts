import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function debugScanResult(scannedData: string, currentPlayerId: string) {
  console.log('\n🔍 === DIAGNOSTIC DE SCAN ===');
  console.log('📱 Données scannées brutes:', scannedData);
  console.log('👤 Joueur actuel:', currentPlayerId);
  
  // Vérifier que le joueur actuel existe
  const currentPlayerDoc = await getDoc(doc(db, 'players', currentPlayerId));
  console.log('✅ Joueur actuel existe:', currentPlayerDoc.exists());
  if (currentPlayerDoc.exists()) {
    console.log('   Nom:', currentPlayerDoc.data().name);
    console.log('   Mission:', currentPlayerDoc.data().currentMission);
  }
  
  // Vérifier que le joueur scanné existe
  const scannedPlayerDoc = await getDoc(doc(db, 'players', scannedData));
  console.log('✅ Joueur scanné existe:', scannedPlayerDoc.exists());
  if (scannedPlayerDoc.exists()) {
    console.log('   Nom:', scannedPlayerDoc.data().name);
  } else {
    console.log('❌ ERREUR: Le joueur scanné n\'existe pas !');
    
    // Lister tous les IDs disponibles
    const playersSnapshot = await getDocs(collection(db, 'players'));
    console.log('📋 IDs disponibles dans Firebase:');
    playersSnapshot.forEach(doc => {
      console.log('   -', doc.id, '→', doc.data().name);
    });
  }
  
  console.log('=== FIN DIAGNOSTIC ===\n');
}
