import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameEvents } from '../../lib/gameEvents';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function EventTester() {
  const [feedback, setFeedback] = useState('');

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(''), 3000);
  };

  const testMissionCompleted = async () => {
    await GameEvents.missionCompleted('Matthieu', 'matthieu');
    showFeedback('✅ Événement "Mission complétée" créé !');
  };

  const testPortalIncreased = async () => {
    await GameEvents.portalIncreased(15);
    showFeedback('✅ Événement "Portail augmenté" créé !');
  };

  const testPortalDecreased = async () => {
    await GameEvents.portalDecreased(8);
    showFeedback('✅ Événement "Portail diminué" créé !');
  };

  const testPlayerEliminated = async () => {
    await GameEvents.playerEliminated('Eliott', 'eliott');
    showFeedback('✅ Événement "Joueur éliminé" créé !');
  };

  const testReunionScheduled = async () => {
    await GameEvents.reunionScheduled();
    showFeedback('✅ Événement "Réunion planifiée" créé !');
  };

  const testSuspicionAdded = async () => {
    await GameEvents.suspicionAdded('Diana', 'Matthieu');
    showFeedback('✅ Événement "Suspect ajouté" créé !');
  };

  return (
    <Card glow style={{ marginBottom: '2rem' }}>
      <h2 style={{
        color: '#dc2626',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        🧪 TESTEUR D'ÉVÉNEMENTS
      </h2>

      <p style={{
        color: '#9ca3af',
        fontSize: '0.875rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontFamily: 'monospace'
      }}>
        Clique sur les boutons pour créer des événements de test
      </p>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center',
            color: '#10b981',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        >
          {feedback}
        </motion.div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <Button onClick={testMissionCompleted} variant="primary">
          ✅ Mission complétée
        </Button>

        <Button onClick={testPortalIncreased} variant="danger">
          📈 Portail +
        </Button>

        <Button onClick={testPortalDecreased} variant="secondary">
          📉 Portail -
        </Button>

        <Button onClick={testPlayerEliminated} variant="danger">
          💀 Joueur éliminé
        </Button>

        <Button onClick={testReunionScheduled} variant="primary">
          📅 Réunion planifiée
        </Button>

        <Button onClick={testSuspicionAdded} variant="secondary">
          🔍 Suspect ajouté
        </Button>
      </div>

      <p style={{
        color: '#6b7280',
        fontSize: '0.75rem',
        textAlign: 'center',
        marginTop: '1.5rem',
        fontFamily: 'monospace'
      }}>
        Les événements apparaîtront instantanément dans tous les dashboards
      </p>
    </Card>
  );
}
