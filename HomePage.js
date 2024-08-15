import React, { useState } from 'react';
import CreateNJoin from 'create-and-join-game';

function HomePage() {
  const [joining, setJoining] = useState(false);
  const [pin, setPin] = useState("");

  const joinGame = () => {
    setJoining(true); // Show the input field for the PIN code
  };


  return (
    <div className="home-container">
      <h1>Welcome to Guess Who I am</h1>
      <button onClick={CreateNJoin.createGameAsync(options={})}>Create a Game</button>
      <button onClick={joinGame}>Join a Game</button>
      {joining && (
        <div className="join-game-container">
          <input
            type="text"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button onClick={CreateNJoin.joinGameWithPinAsync(pin)}>Join</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;



/////// This is what Chat GPT tells me to do : 

import React, { useState } from 'react';
import CreateNJoin from 'create-and-join-game';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

function HomePage() {
  const [joining, setJoining] = useState(false);
  const [pin, setPin] = useState("");
  const navigate = useNavigate(); // React Router navigation

  // Function to create a game
  const createGame = async () => {
    try {
      const pin = await CreateNJoin.createGameAsync({
        onGameCreated: (newPin) => {
          console.log('A game has been created with PIN:', newPin);
          // Navigate to the info page with the new PIN
          navigate('/info', { state: { mode: 'create', pin: newPin } });
        },
        pathRR: '/info',
        stateRR: { mode: 'create' }
      });
      console.log('Game created with PIN:', pin);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  // Function to join a game
  const joinGame = async () => {
    setJoining(true); // Show the input field for the PIN code
  };

  const handleJoinGame = async () => {
    try {
      await CreateNJoin.joinGameWithPinAsync(pin, {
        onGameJoined: () => {
          console.log('Joined game with PIN:', pin);
          // Navigate to the game page or any other logic
          navigate('/game', { state: { pin } });
        },
        pathRR: '/game',
        stateRR: { pin }
      });
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to Guess Who I Am</h1>
      <button onClick={createGame}>Create a Game</button>
      <button onClick={joinGame}>Join a Game</button>
      {joining && (
        <div className="join-game-container">
          <input
            type="text"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button onClick={handleJoinGame}>Join</button>
        </div>
      )}
    </div>
  );
}

export default HomePage;


//// The problem is that, as my functions are asyncrhnous, it need to code a new function
//// and thus, it does not help the developers to have less lines of code