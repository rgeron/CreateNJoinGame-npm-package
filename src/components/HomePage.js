import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNJoin } from '../App';

function HomePage() {
  const navigate = useNavigate();
  const [joiningPin, setJoiningPin] = useState('');

  const handleCreateGame = async () => {
    try {
      const pin = await createNJoin.createGameAsync();
      navigate(`/info/${pin}`, { state: { mode: 'create' } });
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = async () => {
    try {
      const exists = await createNJoin.joinGameWithPinAsync(joiningPin);
      if (exists) {
        navigate(`/info/${joiningPin}`, { state: { mode: 'join' } });
      } else {
        alert('Invalid PIN');
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  return (
    <div>
      <h1>Welcome to the Game</h1>
      <button onClick={handleCreateGame}>Create Game</button>
      <div>
        <input 
          type="text" 
          value={joiningPin} 
          onChange={(e) => setJoiningPin(e.target.value)} 
          placeholder="Enter game PIN"
        />
        <button onClick={handleJoinGame}>Join Game</button>
      </div>
    </div>
  );
}

export default HomePage;