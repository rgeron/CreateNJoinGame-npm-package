const CreateNJoin = require('create-and-join-game');
import CreateNJoin from 'create-and-join-game';

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

import { db } from './firebaseConfig';

import HomePage from './HomePage';
import InformationPage from './InformationPage';
import WaitingArea from './WaitingArea';
import GamePage from './GamePage';

const navigate = useNavigate();

// Initialize and use your class
const CreateNJoin = new CreateNJoin(db, navigate);

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/info/:pin" element={<InformationPage />} />
          <Route path="/waiting/:pin" element={<WaitingArea />} />
          <Route path="/game/:pin" element={<GamePage />} />
        </Routes>
      </Router>
    );
  }
  
  export default App;