import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import '../styles/GamePage.css';

function GamePage() {
    
  const { pin } = useParams();
  const location = useLocation();
  const { playerKey, playerName } = location.state;
  const navigate = useNavigate();
  
  const [gameData, setGameData] = useState(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const gameRef = doc(db, 'games', pin);

    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setGameData(data);
        // Determine if the current player is the creator
        setIsCreator(playerKey === 'creator');


      // Redirect players if the game status is "finished"
      if (data.gameStatus === 'finished') {
        navigate('/');
      }
    }
      
      


    });

    return () => unsubscribe();
  }, [pin, playerKey, navigate]);



  const handleEndGame = async () => {
    try {
      const gameRef = doc(db, 'games', pin);
      // Update the game status to "finished"
      await updateDoc(gameRef, {
        gameStatus: 'finished',
        // players: {}  // Possible to clear the players
      });

    } catch (error) {
      console.error('Error ending the game:', error);
    }
  };

  if (!gameData) {
    return <div>Loading game data...</div>;
  }

  // Filter out the current player from the list of players
  const otherPlayers = Object.entries(gameData.players).filter(([key]) => key !== playerKey);

  return (
    <div className="game-page">
      <div className="game-header">
        <h1>Game Page</h1>
      </div>

      {/* Display current player's name */}
      <div className="player-name">
        <h2>Welcome, {playerName}!</h2>
      </div>

      <div className="other-players">
        <h3>Other Players</h3>
        <ul className="player-list">
          {otherPlayers.map(([key, player]) => (
            <li key={key} className="player-list-item">
              <div className="player-name-header">{player.name}</div>
              <div className="player-celebrity">Assigned Celebrity: {player.assignedCelebrity}</div>
            </li>
          ))}
        </ul>
      </div>

      {isCreator && (
        <button className="end-game-btn" onClick={handleEndGame}>
          End Game
        </button>
      )}
    </div>
  );
}

export default GamePage;
