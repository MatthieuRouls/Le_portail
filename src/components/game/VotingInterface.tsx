import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  castVote, 
  subscribeToVotingSession,
  getActiveVotingSession 
} from '../../lib/votingSystem';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface VotingSession {
  id: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: number;
  status: 'active' | 'completed' | 'cancelled';
  votes: { [playerId: string]: string };
  eligibleVoters: string[];
  results?: {
    eliminated: string;
    eliminatedName: string;
    voteCount: { [playerId: string]: number };
    totalVotes: number;
  };
  endedAt?: number;
}

interface VotingInterfaceProps {
  currentPlayerId: string;
  onClose: () => void;
}

export default function VotingInterface({ currentPlayerId, onClose }: VotingInterfaceProps) {
  const [session, setSession] = useState<VotingSession | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [voteMessage, setVoteMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVotingSession();
  }, []);

  useEffect(() => {
    if (session?.id) {
      const unsubscribe = subscribeToVotingSession(session.id, (updatedSession) => {
        if (updatedSession) {
          setSession(updatedSession);
          
          if (updatedSession.votes[currentPlayerId]) {
            setHasVoted(true);
          }
          
          if (updatedSession.status === 'completed') {
            setTimeout(() => {
              onClose();
            }, 5000);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [session?.id, currentPlayerId]);

  const loadVotingSession = async () => {
    try {
      const activeSession = await getActiveVotingSession();
      
      if (!activeSession) {
        setVoteMessage('❌ Aucune session de vote active');
        setLoading(false);
        return;
      }

      setSession(activeSession);
      
      if (activeSession.votes[currentPlayerId]) {
        setHasVoted(true);
      }

      const playersSnapshot = await getDocs(collection(db, 'players'));
      const playersData = playersSnapshot.docs
        .map(doc => doc.data())
        .filter(p => !p.isEliminated && p.id !== currentPlayerId)
        .sort((a, b) => a.name.localeCompare(b.name));

      setPlayers(playersData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement session:', error);
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedTarget || !session) return;

    const result = await castVote(session.id, currentPlayerId, selectedTarget);
    
    if (result.success) {
      setHasVoted(true);
      setVoteMessage(result.message);
    } else {
      setVoteMessage(`❌ ${result.message}`);
    }

    setTimeout(() => setVoteMessage(''), 3000);
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const votesReceived = session ? Object.keys(session.votes).length : 0;
  const totalVoters = session?.eligibleVoters.length || 0;
  const votingProgress = totalVoters > 0 ? (votesReceived / totalVoters) * 100 : 0;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <Card style={{ maxWidth: '600px', width: '100%' }}>
          <p style={{ textAlign: 'center', color: '#9ca3af', fontFamily: 'monospace' }}>
            ⏳ Chargement du vote...
          </p>
        </Card>
      </motion.div>
    );
  }

  if (!session || session.status !== 'active') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <Card style={{ maxWidth: '600px', width: '100%' }}>
          <p style={{ 
            textAlign: 'center', 
            color: '#ef4444', 
            fontFamily: 'monospace',
            marginBottom: '1rem'
          }}>
            {voteMessage || 'Aucune session de vote active'}
          </p>
          <Button onClick={onClose} variant="secondary" style={{ width: '100%' }}>
            FERMER
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'auto'
      }}
    >
      <Card style={{ 
        maxWidth: '700px', 
        width: '100%', 
        maxHeight: '90vh', 
        overflow: 'auto',
        border: '2px solid #dc2626'
      }}>
        <h2 style={{
          color: '#dc2626',
          fontSize: '1.75rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          fontFamily: 'monospace',
          textAlign: 'center'
        }}>
          🗳️ SESSION DE VOTE
        </h2>

        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          Initié par {session.initiatedByName}
        </p>

        {/* Progression */}
        <div style={{
          backgroundColor: 'rgba(127, 29, 29, 0.2)',
          border: '1px solid rgba(220, 38, 38, 0.5)',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{ color: '#d1d5db', fontFamily: 'monospace', fontSize: '0.875rem' }}>
              Progression
            </span>
            <span style={{ 
              color: '#dc2626', 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {votesReceived}/{totalVoters} votes
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 100%)',
                borderRadius: '999px'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${votingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {voteMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: voteMessage.includes('✅')
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              border: voteMessage.includes('✅')
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'center',
              color: voteMessage.includes('✅') ? '#10b981' : '#ef4444',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            {voteMessage}
          </motion.div>
        )}

        {/* Résultats */}
        {session.status === 'completed' && session.results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            <h3 style={{
              color: '#ef4444',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              marginBottom: '0.5rem'
            }}>
              ❌ JOUEUR ÉLIMINÉ
            </h3>
            <p style={{
              color: '#fca5a5',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              marginBottom: '1rem'
            }}>
              {session.results.eliminatedName}
            </p>
            <div style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              fontFamily: 'monospace'
            }}>
              {Object.entries(session.results.voteCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([playerId, count]) => (
                  <div key={playerId} style={{ marginBottom: '0.25rem' }}>
                    {playerId}: {count} vote{count > 1 ? 's' : ''}
                  </div>
                ))}
            </div>
            <p style={{
              color: '#6b7280',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              marginTop: '1rem'
            }}>
              Fermeture automatique...
            </p>
          </motion.div>
        )}

        {/* Interface de vote */}
        {!hasVoted && session.status === 'active' ? (
          <>
            <h3 style={{
              color: '#e5e7eb',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              fontFamily: 'monospace'
            }}>
              Qui veux-tu éliminer ?
            </h3>

            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#111827',
                border: '2px solid #374151',
                borderRadius: '0.375rem',
                color: '#d1d5db',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            />

            <div style={{
              display: 'grid',
              gap: '0.5rem',
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '1rem'
            }}>
              {filteredPlayers.map((player) => (
                <motion.button
                  key={player.id}
                  onClick={() => setSelectedTarget(player.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '1rem',
                    backgroundColor: selectedTarget === player.id
                      ? 'rgba(220, 38, 38, 0.5)'
                      : 'rgba(127, 29, 29, 0.3)',
                    border: selectedTarget === player.id
                      ? '2px solid #dc2626'
                      : '2px solid rgba(220, 38, 38, 0.5)',
                    borderRadius: '0.375rem',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{player.name}</span>
                  <span style={{ fontSize: '1.25rem' }}>
                    {selectedTarget === player.id ? '☑️' : '⬜'}
                  </span>
                </motion.button>
              ))}
            </div>

            <Button
              onClick={handleVote}
              variant="primary"
              disabled={!selectedTarget}
              style={{
                width: '100%',
                marginBottom: '0.5rem',
                opacity: selectedTarget ? 1 : 0.5
              }}
            >
              ✅ CONFIRMER LE VOTE
            </Button>

            <Button onClick={onClose} variant="secondary" style={{ width: '100%' }}>
              ANNULER
            </Button>
          </>
        ) : hasVoted && session.status === 'active' ? (
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}
            >
              ⏳
            </motion.div>
            <p style={{
              color: '#10b981',
              fontSize: '1rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              ✅ Ton vote a été enregistré
            </p>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              marginBottom: '1.5rem'
            }}>
              En attente des autres joueurs...
            </p>
            <Button onClick={onClose} variant="secondary" style={{ width: '100%' }}>
              FERMER
            </Button>
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
