import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createNJoin } from '../App';

function GamePage() {
  const navigate = useNavigate();
  const { pin } = useParams();
  const { state } = useLocation();
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const unsubscribe = createNJoin.setupGameListener(pin, (data) => {
      setGameData(data);
      if (data.gameStatus === 'finished') {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [pin, navigate]);

  const handleEndGame = async () => {
    try {
      await createNJoin.handleEndGameAsync(pin);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  if (!gameData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Game in Progress</h2>
      <p>Your celebrity: {gameData.players[state.playerKey].assignedCelebrity}</p>
      {/* Add your game logic here */}
      {state.playerKey === 'creator' && (
        <button onClick={handleEndGame}>End Game</button>
      )}
    </div>
  );
}

export default GamePage;