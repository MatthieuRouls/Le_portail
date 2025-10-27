import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';

export async function addSuspect(
  playerId: string,
  suspectId: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔍 Ajout suspect:', suspectId, 'par', playerId);
    
    // Vérifier que le suspect existe
    const suspectDoc = await getDoc(doc(db, 'players', suspectId));
    if (!suspectDoc.exists()) {
      return { success: false, message: 'Joueur introuvable' };
    }
    
    const suspectData = suspectDoc.data();
    
    // Vérifier que le joueur n'ajoute pas lui-même
    if (suspectId === playerId) {
      return { success: false, message: 'Tu ne peux pas t\'ajouter toi-même !' };
    }
    
    // Récupérer le joueur actuel
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    const playerData = playerDoc.data();
    
    // Vérifier si le suspect est déjà dans la liste
    if (playerData?.suspicions?.includes(suspectId)) {
      return { 
        success: false, 
        message: `${suspectData.name} est déjà dans tes suspects` 
      };
    }
    
    // Ajouter le suspect
    await updateDoc(doc(db, 'players', playerId), {
      suspicions: arrayUnion(suspectId)
    });
    
    // Créer un événement
    await GameEvents.suspicionAdded(suspectData.name, playerData?.name);
    
    console.log('✅ Suspect ajouté');
    
    return { 
      success: true, 
      message: `✅ ${suspectData.name} ajouté à tes suspects` 
    };
    
  } catch (error) {
    console.error('❌ Erreur ajout suspect:', error);
    return { 
      success: false, 
      message: 'Erreur lors de l\'ajout du suspect' 
    };
  }
}

export async function removeSuspect(
  playerId: string,
  suspectId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    const playerData = playerDoc.data();
    
    if (!playerData?.suspicions?.includes(suspectId)) {
      return { success: false, message: 'Ce joueur n\'est pas dans tes suspects' };
    }
    
    // Retirer le suspect
    const updatedSuspicions = playerData.suspicions.filter((id: string) => id !== suspectId);
    await updateDoc(doc(db, 'players', playerId), {
      suspicions: updatedSuspicions
    });
    
    const suspectDoc = await getDoc(doc(db, 'players', suspectId));
    const suspectData = suspectDoc.data();
    
    console.log('✅ Suspect retiré');
    
    return { 
      success: true, 
      message: `${suspectData?.name} retiré de tes suspects` 
    };
    
  } catch (error) {
    console.error('❌ Erreur retrait suspect:', error);
    return { 
      success: false, 
      message: 'Erreur lors du retrait du suspect' 
    };
  }
}
