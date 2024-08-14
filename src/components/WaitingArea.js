import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createNJoin } from '../App';

function WaitingArea() {
  const navigate = useNavigate();
  const { pin } = useParams();
  const { state } = useLocation();
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const unsubscribe = createNJoin.setupGameListener(pin, (data) => {
      setGameData(data);
      if (data.gameStatus === 'inProgress') {
        navigate(`/game/${pin}`, { state });
      }
    });

    return () => unsubscribe();
  }, [pin, navigate, state]);

  const handleStartGame = async () => {
    try {
      await createNJoin.handleStartGameAsync(pin);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleReady = async () => {
    try {
      await createNJoin.handleIAmReadyAsync(pin, state.playerKey);
    } catch (error) {
      console.error('Error marking as ready:', error);
    }
  };

  if (!gameData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Waiting Room</h2>
      <p>Game PIN: {pin}</p>
      <ul>
        {Object.entries(gameData.players).map(([key, player]) => (
          <li key={key}>{player.name} {player.isReady ? '(Ready)' : ''}</li>
        ))}
      </ul>
      {state.playerKey === 'creator' ? (
        <button onClick={handleStartGame}>Start Game</button>
      ) : (
        <button onClick={handleReady}>I'm Ready</button>
      )}
    </div>
  );
}

export default WaitingArea;