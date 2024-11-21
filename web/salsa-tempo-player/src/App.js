import React from 'react';
import { HashRouter  as Router, Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import SpotifyAuth from './components/SpotifyAuth';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SpotifyAuth />} />
          <Route path="/player" element={<Player />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;