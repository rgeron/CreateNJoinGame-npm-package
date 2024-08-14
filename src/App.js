import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CreateNJoin } from 'create-and-join-game'; /// my package
import { db } from './firebaseConfig';
import HomePage from './components/HomePage';
import InformationPage from './components/InformationPage';
import WaitingArea from './components/WaitingArea';
import GamePage from './components/GamePage';

// Create an instance of CreateNJoin
export const createNJoin = new CreateNJoin(db);

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