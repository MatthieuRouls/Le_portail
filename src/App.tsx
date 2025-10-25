import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import PlayerDashboard from './pages/PlayerDashboard';
import { initializeGame, checkIfGameExists } from './lib/initializeGame';
import AdminDashboard from './pages/AdminDashboard';

type Page = 'home' | 'login' | 'player' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [gameInitialized, setGameInitialized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkGame = async () => {
      const exists = await checkIfGameExists();
      setGameInitialized(exists);
      setChecking(false);
    };
    checkGame();
  }, []);

  const handleInitialize = async () => {
    const success = await initializeGame();
    if (success) {
      setGameInitialized(true);
      alert('✅ Jeu initialisé ! Vérifie la console Firebase.');
    } else {
      alert('❌ Erreur lors de l\'initialisation');
    }
  };

  if (checking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#d1d5db',
        fontFamily: 'monospace'
      }}>
        ⏳ Chargement...
      </div>
    );
  }

  // Bouton d'initialisation (temporaire - à retirer après la première init)
  if (!gameInitialized && currentPage === 'home') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#dc2626', fontSize: '3rem', fontFamily: 'monospace' }}>
          🎮 INITIALISATION DU JEU
        </h1>
        <p style={{ color: '#d1d5db', textAlign: 'center', maxWidth: '600px' }}>
          Le jeu n'est pas encore initialisé. Clique sur le bouton ci-dessous pour créer les 20 joueurs, les missions et l'état du jeu dans Firebase.
        </p>
        <button
          onClick={handleInitialize}
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            border: '2px solid #991b1b',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          🚀 INITIALISER LE JEU
        </button>
        <button
          onClick={() => setGameInitialized(true)}
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            padding: '0.5rem 1rem',
            border: 'none',
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'monospace'
          }}
        >
          (Ignorer et continuer quand même)
        </button>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'player' && <PlayerDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'admin' && <AdminDashboard onNavigate={setCurrentPage} />}
    </>
  );
}

export default App;
