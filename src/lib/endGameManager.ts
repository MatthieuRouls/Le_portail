import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { GameEvents } from './gameEvents';

export interface PlayerStats {
  id: string;
  name: string;
  role: 'human' | 'altered';
  missionsCompleted: number;
  isEliminated: boolean;
  eliminatedAt?: number;
  suspicions: string[];
  votesReceived?: number;
}

export interface EndGameStats {
  winner: 'humans' | 'altered';
  endReason: 'portal_closed' | 'portal_opened' | 'all_altered_eliminated' | 'all_humans_eliminated';
  finalPortalLevel: number;
  totalMissionsCompleted: number;
  playersStats: PlayerStats[];
  mvp?: {
    playerId: string;
    playerName: string;
    reason: string;
  };
  duration: number;
  endedAt: number;
}

export async function checkGameEnd(): Promise<{
  isEnded: boolean;
  winner?: 'humans' | 'altered';
  reason?: string;
}> {
  try {
    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    if (!gameStateDoc.exists()) return { isEnded: false };
    
    const gameState = gameStateDoc.data();
    const portalLevel = gameState.portalLevel || 10;
    
    // Victoire des humains - Portail fermé
    if (portalLevel <= 0) {
      return {
        isEnded: true,
        winner: 'humans',
        reason: 'Le Portail a été refermé ! Les Humains ont sauvé la réalité.'
      };
    }
    
    // Victoire des altérés - Portail ouvert
    if (portalLevel >= 20) {
      return {
        isEnded: true,
        winner: 'altered',
        reason: 'Le Portail est grand ouvert ! Les Altérés ont gagné.'
      };
    }
    
    // Vérifier si tous les altérés ou tous les humains sont éliminés
    const playersSnapshot = await getDocs(collection(db, 'players'));
    const alivePlayers = playersSnapshot.docs
      .map(doc => doc.data())
      .filter(p => !p.isEliminated);
    
    const aliveHumans = alivePlayers.filter(p => p.role === 'human');
    const aliveAltered = alivePlayers.filter(p => p.role === 'altered');
    
    if (aliveAltered.length === 0 && aliveHumans.length > 0) {
      return {
        isEnded: true,
        winner: 'humans',
        reason: 'Tous les Altérés ont été éliminés ! Les Humains ont gagné.'
      };
    }
    
    if (aliveHumans.length === 0 && aliveAltered.length > 0) {
      return {
        isEnded: true,
        winner: 'altered',
        reason: 'Tous les Humains ont été éliminés ! Les Altérés ont gagné.'
      };
    }
    
    return { isEnded: false };
    
  } catch (error) {
    console.error('❌ Erreur vérification fin de partie:', error);
    return { isEnded: false };
  }
}

export async function triggerGameEnd(winner: 'humans' | 'altered', reason: string): Promise<EndGameStats | null> {
  try {
    console.log('🏁 FIN DE PARTIE -', winner, 'gagnent !');
    
    // Mettre à jour le game state
    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    const gameState = gameStateDoc.data();
    
    await updateDoc(doc(db, 'game_state', 'current'), {
      status: 'ended',
      winner: winner,
      endReason: reason,
      endedAt: Date.now()
    });
    
    // Créer l'événement de victoire
    if (winner === 'humans') {
      await GameEvents.humanVictory();
    } else {
      await GameEvents.alteredVictory();
    }
    
    // Collecter les stats
    const stats = await generateEndGameStats(winner, reason, gameState);
    
    // Sauvegarder les stats
    await updateDoc(doc(db, 'game_state', 'current'), {
      endGameStats: stats
    });
    
    console.log('✅ Statistiques de fin sauvegardées');
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erreur déclenchement fin de partie:', error);
    return null;
  }
}

async function generateEndGameStats(
  winner: 'humans' | 'altered',
  endReason: string,
  gameState: any
): Promise<EndGameStats> {
  const playersSnapshot = await getDocs(collection(db, 'players'));
  const playersData = playersSnapshot.docs.map(doc => doc.data());
  
  // Stats des joueurs
  const playersStats: PlayerStats[] = playersData.map(player => ({
    id: player.id,
    name: player.name,
    role: player.role,
    missionsCompleted: player.missionsCompleted?.length || 0,
    isEliminated: player.isEliminated || false,
    eliminatedAt: player.eliminatedAt,
    suspicions: player.suspicions || []
  }));
  
  // Calculer les votes reçus
  const votingSessionsSnapshot = await getDocs(collection(db, 'voting_sessions'));
  const voteCounts: { [playerId: string]: number } = {};
  
  votingSessionsSnapshot.docs.forEach(doc => {
    const session = doc.data();
    Object.values(session.votes).forEach((targetId: any) => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });
  });
  
  playersStats.forEach(player => {
    player.votesReceived = voteCounts[player.id] || 0;
  });
  
  // Trouver le MVP
  const mvp = calculateMVP(playersStats, winner);
  
  // Durée de la partie
  const duration = Date.now() - (gameState.startedAt || Date.now());
  
  // Total missions complétées
  const totalMissionsCompleted = playersStats.reduce((sum, p) => sum + p.missionsCompleted, 0);
  
  return {
    winner,
    endReason: endReason as any,
    finalPortalLevel: gameState.portalLevel || 10,
    totalMissionsCompleted,
    playersStats,
    mvp,
    duration,
    endedAt: Date.now()
  };
}

function calculateMVP(playersStats: PlayerStats[], winner: 'humans' | 'altered'): {
  playerId: string;
  playerName: string;
  reason: string;
} | undefined {
  // Filtrer les joueurs de l'équipe gagnante non éliminés
  const winningTeam = playersStats.filter(p => 
    (winner === 'humans' ? p.role === 'human' : p.role === 'altered') && !p.isEliminated
  );
  
  if (winningTeam.length === 0) {
    // Si toute l'équipe gagnante est éliminée, prendre le meilleur de l'équipe
    const allWinningTeam = playersStats.filter(p => 
      winner === 'humans' ? p.role === 'human' : p.role === 'altered'
    );
    
    if (allWinningTeam.length === 0) return undefined;
    
    const mvp = allWinningTeam.reduce((best, current) => 
      current.missionsCompleted > best.missionsCompleted ? current : best
    );
    
    return {
      playerId: mvp.id,
      playerName: mvp.name,
      reason: `${mvp.missionsCompleted} missions complétées (éliminé mais héroïque)`
    };
  }
  
  // Trouver le joueur avec le plus de missions complétées
  const mvp = winningTeam.reduce((best, current) => 
    current.missionsCompleted > best.missionsCompleted ? current : best
  );
  
  return {
    playerId: mvp.id,
    playerName: mvp.name,
    reason: `${mvp.missionsCompleted} missions complétées`
  };
}

export async function getEndGameStats(): Promise<EndGameStats | null> {
  try {
    const gameStateDoc = await getDoc(doc(db, 'game_state', 'current'));
    if (!gameStateDoc.exists()) return null;
    
    const gameState = gameStateDoc.data();
    return gameState.endGameStats || null;
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    return null;
  }
}
