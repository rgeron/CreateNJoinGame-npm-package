import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

class CreateNJoin {
  constructor(db, navigate) {
    this.db = db;
    this.navigate = navigate; /// to handle routing
  }

////////////////////////// CREATE GAME

/// This function create the game code PIN and setup some informations about the game in firebase and return this pin
async createGameAsync(
  additionalGameInfo = {}, 
  initialInfo = {}, 
  onGameCreated = (pin) => { console.log(`Game created with PIN: ${pin}`); },
) {
  try {
    const pin = this.generatePIN();
    const gameRef = doc(this.db, 'games', pin);
    
    await setDoc(gameRef, {
      gameStatus: "Not started",
      game_info: {
        created_at: serverTimestamp(),
        ...additionalGameInfo
      },
      players: {},
      ...initialInfo
    });

    // Call the user-provided function or the default one after the game is created
    onGameCreated(pin);

    

    return pin; // Return the PIN code
  } catch (error) {
    console.error('Error creating the game:', error);
    throw error;
  }
}

//////////////////////// JOIN GAME

/// you can spark a function by entering a game with the pin code.
async joinGameWithPinAsync(
  pin, 
  onPinExists, 
  onPinDoesNotExist = () => { throw new Error('Invalid PIN: The game with the provided PIN does not exist.'); }
  ) {
  
    try {
    const gameRef = doc(this.db, 'games', pin);
    const gameDoc = await getDoc(gameRef);
    
    if (gameDoc.exists()) {
      // Call the function provided for when the PIN exists : give it the pin again and the gameDoc
      onPinExists(gameDoc, pin);
    } else {
      // Call the default or provided function for when the PIN does not exist
      onPinDoesNotExist();
    }
  } catch (error) {
    console.error('Error checking PIN existence:', error);
    // You can also handle errors here if needed
  }
}

///////////////////////// SUBMIT NEW INFO

async handleSubmitAsync(
  pin, 
  userName, 
  additionalPlayerInfo = {}, 
  onSubmit = (playerKey) => { console.log(`Player ${playerKey} has joined the game.`); }
) {
  try {
    const gameRef = doc(this.db, 'games', pin);
    const gameSnap = await getDoc(gameRef);
    const gameData = gameSnap.data();

    // Initialize playerKey
    let playerKey;

    if (!gameData.playerCount) {
      // If the playerCount field doesn't exist, assume the creator is joining and set the count to 1
      playerKey = 'creator';
      await updateDoc(gameRef, { playerCount: 1 });
    } else {
      // Increment player count and use it for the player key
      playerKey = `joiner${gameData.playerCount}`;
      await updateDoc(gameRef, { playerCount: gameData.playerCount + 1 });
    }

    await updateDoc(gameRef, {
      [`players.${playerKey}`]: {
        name: userName,
        isReady: playerKey === 'creator', // Automatically set to true if the player is the creator
        ...additionalPlayerInfo
      }
    });

    // Call the user-provided function or the default one after submission
    onSubmit(playerKey);

    return playerKey; // Return the player key
  } catch (error) {
    console.error('Error saving information:', error);
    throw error;
  }
}


/////////////////// START GAME

async handleStartGameAsync(pin, customGameLogic = (gameData) => gameData) {
  try {
    const gameRef = doc(this.db, 'games', pin);
    const gameSnap = await getDoc(gameRef);
    const gameData = gameSnap.data();

    if (!gameData) {
      throw new Error('Game data not found');
    }

    // Use custom game logic or default to just returning the game data unchanged
    const updatedGameData = await customGameLogic(gameData);

    await updateDoc(gameRef, {
      ...updatedGameData,
      gameStatus: 'inProgress'
    });

  } catch (error) {
    console.error('Error starting the game:', error);
    throw error;
  }
}

////////////////////// SAY YOU ARE READY

  async handleIAmReadyAsync(pin, playerKey) {
    try {
      const gameRef = doc(this.db, 'games', pin);
      await updateDoc(gameRef, {
        [`players.${playerKey}.isReady`]: true
      });
    } catch (error) {
      console.error('Error marking ready:', error);
      throw error;
    }
  }


///////////////////// END GAME

  async handleEndGameAsync(pin, onGameEnd = null) {
    try {
      const gameRef = doc(this.db, 'games', pin);
      
      // Update the game status to 'finished'
      await updateDoc(gameRef, {
        gameStatus: 'finished',
      });
  
      // Execute any additional logic provided by the user
      if (onGameEnd) {
        await onGameEnd(gameRef);
      }
  
    } catch (error) {
      console.error('Error ending the game:', error);
      throw error;
    }
  }
  

  // HELPER FUNCTION
  /// Other useful function in the context of game creation


  
  //////////////////// Generate PIN

  generatePIN() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  
  //////////////////////


  //////////////////////// Shuffle 

  shuffleArray(array, allowSamePosition = true) {
    if (!allowSamePosition) {
      // Shuffle array without allowing elements to stay in the same position
      // This is known as the Derangement algorithm
      const n = array.length;
      const result = [...array];
      const deranged = derange(result);
      return deranged;
    } else {
      // Fisher-Yates shuffle (allowing elements to stay in the same position)
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  }
  
  derange(array) {
    // Helper function to get a derangement (no element stays in its original position)
    const n = array.length;
    const result = [...array];
    let attempt = 0;
    while (!isDeranged(result)) {
      attempt++;
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      if (attempt > 100) {
        throw new Error("Unable to find a derangement in reasonable time.");
      }
    }
    return result;
  }
  
  isDeranged(array) {
    // Helper function to check if the array is a derangement
    return array.every((value, index) => value !== index);
  }


  //////////////////////


  ///////////////////// Function that spark the onUpdate function each time something change in the game data
  
  setupGameListener(pin, onUpdate) {
    const gameRef = doc(this.db, 'games', pin);
    return onSnapshot(gameRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        onUpdate(data);
      }
    });
  }
}

//////////////////////



module.exports = CreateNJoin