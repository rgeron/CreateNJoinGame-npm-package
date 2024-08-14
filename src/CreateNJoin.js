import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

/**
 * A class to manage game creation, joining, and other related functionalities using Firebase Firestore.
 */
class CreateNJoin {
  
  /**
   * Creates an instance of the CreateNJoin class.
   * 
   * @param {FirebaseFirestore} db - The Firestore database instance.
   * @param {Function} [navigate] - Optional. Function to handle routing, e.g., React Router's navigate function.
   */
  constructor(db, navigate = null) {
    this.db = db;
    this.navigate = navigate; // Store navigate function if available
  }

  ////////////////////////// CREATE GAME

  /**
   * Creates a new game, sets up initial information in Firestore, and returns the game PIN.
   *
   * @param {Object} additionalGameInfo - Additional information to be stored in the game document.
   * @param {Object} initialInfo - Initial information for the game.
   * @param {Function} onGameCreated - Callback function executed after the game is created. Receives the PIN as an argument.
   * @param {string} [pathRR] - Optional path to navigate to using React Router.
   * @param {Object} [stateRR] - Optional state to pass with React Router navigation.
   * @param {string} [path] - Optional path for standard navigation with window location href.
   * @returns {Promise<string>} The generated game PIN.
   * @throws {Error} If there's an error creating the game.
   */
  async createGameAsync(
    additionalGameInfo = {}, 
    initialInfo = {}, 
    onGameCreated = (pin) => { console.log(`Game created with PIN: ${pin}`); },
    pathRR = null, // Path for React Router
    stateRR = null, // State for React Router
    path = null // Path for standard navigation
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

      // Handle React Router navigation if pathRR is provided
      if (pathRR) {
        if (this.navigate) {
          this.navigate(pathRR.replace(':pin', pin), { state: stateRR });
        } else {
          console.warn('React Router navigation requested but navigate function is not available.');
        }
      }

      // Handle standard navigation if path is provided
      if (path && !pathRR) { // Only perform standard navigation if React Router navigation is not used
        window.location.href = path.replace(':pin', pin); // Replace :pin with actual PIN
      }

      return pin; // Return the PIN code
    } catch (error) {
      console.error('Error creating the game:', error);
      throw error;
    }
  }

  ////////////////////////// JOIN GAME

  /**
   * Checks if a game with the given PIN exists and executes a callback based on the result.
   *
   * @param {string} pin - The PIN of the game to join.
   * @param {Function} onPinExists - Callback function executed if the game exists. Receives the game document and PIN as arguments.
   * @param {Function} [onPinDoesNotExist] - Callback function executed if the game does not exist. Defaults to throwing an error.
   * @param {string} [pathRR] - Optional path to navigate to using React Router.
   * @param {Object} [stateRR] - Optional state to pass with React Router navigation.
   * @param {string} [path] - Optional path for standard navigation with window location href.
   * @returns {Promise<void>}
   * @throws {Error} If there's an error checking the PIN existence.
   */
  async joinGameWithPinAsync(
    pin, 
    onPinExists, 
    onPinDoesNotExist = () => { throw new Error('Invalid PIN: The game with the provided PIN does not exist.'); },
    pathRR = null, // Path for React Router
    stateRR = null, // State for React Router
    path = null // Path for standard navigation
  ) {
    try {
      const gameRef = doc(this.db, 'games', pin);
      const gameDoc = await getDoc(gameRef);
      
      if (gameDoc.exists()) {
        // Call the function provided for when the PIN exists
        onPinExists(gameDoc, pin);

        // Handle React Router navigation if pathRR is provided
        if (pathRR) {
          if (this.navigate) {
            this.navigate(pathRR, { state: stateRR });
          } else {
            console.warn('React Router navigation requested but navigate function is not available.');
          }
        }

        // Handle standard navigation if path is provided
        if (path && !pathRR) { // Only perform standard navigation if React Router navigation is not used
          window.location.href = path.replace(':pin', pin); // Replace :pin with actual PIN
        }
      } else {
        // Call the default or provided function for when the PIN does not exist
        onPinDoesNotExist();
      }
    } catch (error) {
      console.error('Error checking PIN existence:', error);
      throw error;
    }
  }

  ////////////////////////// SUBMIT NEW INFO

  /**
   * Submits information for a player joining the game and updates the game document.
   *
   * @param {string} pin - The PIN of the game.
   * @param {string} userName - The name of the player.
   * @param {Object} [additionalPlayerInfo] - Additional information for the player.
   * @param {Function} [onSubmit] - Callback function executed after the player joins. Receives the player key as an argument.
   * @param {string} [pathRR] - Optional path to navigate to using React Router.
   * @param {Object} [stateRR] - Optional state to pass with React Router navigation.
   * @param {string} [path] - Optional path for standard navigation with window location href.
   * @returns {Promise<string>} The key assigned to the player.
   * @throws {Error} If there's an error saving the information.
   */
  async handleSubmitAsync(
    pin, 
    userName, 
    additionalPlayerInfo = {}, 
    onSubmit = (playerKey) => { console.log(`Player ${playerKey} has joined the game.`); },
    pathRR = null, // Path for React Router
    stateRR = null, // State for React Router
    path = null // Path for standard navigation
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

      // Handle React Router navigation if pathRR is provided
      if (pathRR) {
        if (this.navigate) {
          this.navigate(pathRR.replace(':pin', pin), { state: stateRR });
        } else {
          console.warn('React Router navigation requested but navigate function is not available.');
        }
      }

      // Handle standard navigation if path is provided
      if (path && !pathRR) { // Only perform standard navigation if React Router navigation is not used
        window.location.href = path.replace(':pin', pin); // Replace :pin with actual PIN
      }

      return playerKey; // Return the player key
    } catch (error) {
      console.error('Error saving information:', error);
      throw error;
    }
  }

  ////////////////////////// START GAME

  /**
   * Starts the game by updating the game status and applying custom game logic if provided.
   *
   * @param {string} pin - The PIN of the game.
   * @param {Function} [customGameLogic] - Optional function to apply custom logic to the game data before updating the game status.
   * @param {string} [pathRR] - Optional path to navigate to using React Router.
   * @param {Object} [stateRR] - Optional state to pass with React Router navigation.
   * @param {string} [path] - Optional path for standard navigation with window location href.
   * @returns {Promise<void>}
   * @throws {Error} If there's an error starting the game.
   */
  async handleStartGameAsync(
    pin, 
    customGameLogic = (gameData) => gameData,
    pathRR = null, // Path for React Router
    stateRR = null, // State for React Router
    path = null // Path for standard navigation
  ) {
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

      // Handle React Router navigation if pathRR is provided
      if (pathRR) {
        if (this.navigate) {
          this.navigate(pathRR, { state: stateRR });
        } else {
          console.warn('React Router navigation requested but navigate function is not available.');
        }
      }

      // Handle standard navigation if path is provided
      if (path && !pathRR) { // Only perform standard navigation if React Router navigation is not used
        window.location.href = path.replace(':pin', pin); // Replace :pin with actual PIN
      }

    } catch (error) {
      console.error('Error starting the game:', error);
      throw error;
    }
  }

  /////////////////////////// END GAME

  /**
   * Ends the game by updating the game status and executing any additional logic provided by the user.
   *
   * @param {string} pin - The PIN of the game.
   * @param {Function} [onGameEnd] - Optional callback function to execute after the game ends. Receives the game reference as an argument.
   * @param {string} [pathRR] - Optional path to navigate to using React Router.
   * @param {Object} [stateRR] - Optional state to pass with React Router navigation.
   * @param {string} [path] - Optional path for standard navigation with window location href.
   * @returns {Promise<void>}
   * @throws {Error} If there's an error ending the game.
   */
  async handleEndGameAsync(
    pin, 
    onGameEnd = null,
    pathRR = null, // Path for React Router
    stateRR = null, // State for React Router
    path = null // Path for standard navigation
  ) {
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

      // Handle React Router navigation if pathRR is provided
      if (pathRR) {
        if (this.navigate) {
          this.navigate(pathRR, { state: stateRR });
        } else {
          console.warn('React Router navigation requested but navigate function is not available.');
        }
      }

      // Handle standard navigation if path is provided
      if (path && !pathRR) { // Only perform standard navigation if React Router navigation is not used
        window.location.href = path.replace(':pin', pin); // Replace :pin with actual PIN
      }

    } catch (error) {
      console.error('Error ending the game:', error);
      throw error;
    }
  }

  // HELPER FUNCTION

  //////////////////// Generate PIN

  /**
   * Generates a random 5-digit PIN.
   *
   * @returns {string} The generated PIN.
   */
  generatePIN() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  
  //////////////////////

  //////////////////////// Shuffle 

  /**
   * Shuffles an array using either the Fisher-Yates algorithm or the Derangement algorithm.
   *
   * @param {Array} array - The array to shuffle.
   * @param {boolean} [allowSamePosition=true] - Whether to allow elements to stay in the same position.
   * @returns {Array} The shuffled array.
   */
  shuffleArray(array, allowSamePosition = true) {
    if (!allowSamePosition) {
      // Shuffle array without allowing elements to stay in the same position
      // This is known as the Derangement algorithm
      const n = array.length;
      const result = [...array];
      const deranged = this.derange(result);
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
  
  /**
   * Gets a derangement of an array where no element stays in its original position.
   *
   * @param {Array} array - The array to derange.
   * @returns {Array} The deranged array.
   * @throws {Error} If unable to find a derangement in a reasonable time.
   */
  derange(array) {
    // Helper function to get a derangement (no element stays in its original position)
    const n = array.length;
    const result = [...array];
    let attempt = 0;
    while (!this.isDeranged(result)) {
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
  
  /**
   * Checks if an array is a derangement (no element stays in its original position).
   *
   * @param {Array} array - The array to check.
   * @returns {boolean} True if the array is a derangement, false otherwise.
   */
  isDeranged(array) {
    // Helper function to check if the array is a derangement
    return array.every((value, index) => value !== index);
  }

  //////////////////////

  ///////////////////// Function that sparks the onUpdate function each time something changes in the game data

  /**
   * Sets up a listener to observe changes in the game data and executes a callback when changes occur.
   *
   * @param {string} pin - The PIN of the game.
   * @param {Function} onUpdate - Callback function executed when the game data is updated. Receives the updated game data as an argument.
   * @returns {Function} A function to unsubscribe from the snapshot listener.
   */
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

module.exports = CreateNJoin;
