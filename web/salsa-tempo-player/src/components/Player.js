import React, { useState, useEffect } from 'react';
import { streamAudio } from './utils/audioHelper';
import { getRandomSalsaFigure } from './utils/salsaFigures';
import { announceAndDisplayFigure } from './utils/figure_announcer';  // Import the announcer function

const Player = ({ audioUrl }) => {
  const [audioContext] = useState(new (window.AudioContext || window.webkitAudioContext)());
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [currentGroup, setCurrentGroup] = useState('Arriba'); // Salsa figure group
  const [figure, setFigure] = useState(null);

  useEffect(() => {
    const loadAudio = async () => {
      const buffer = await streamAudio(audioUrl, audioContext, setAudioBuffer);
      if (buffer) {
        console.log('Audio buffered and ready to play');
      }
    };

    loadAudio();

    return () => {
      audioContext.close();
    };
  }, [audioUrl, audioContext]);

  useEffect(() => {
    // Announce and display the random salsa figure every time it's updated
    if (figure) {
      console.log(`Next salsa figure: ${figure.name}`);
      announceAndDisplayFigure(figure.name);  // Announce and display figure
    }
  }, [figure]);

  const playAudio = () => {
    if (audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      announceRandomFigure(); // Announce a salsa figure
    }
  };

  const announceRandomFigure = () => {
    const randomFigure = getRandomSalsaFigure(currentGroup);
    setFigure(randomFigure);
    // Switch salsa figure group after every announcement
    setCurrentGroup(currentGroup === 'Arriba' ? 'Guapea' : 'Arriba');
  };

  return (
    <div>
      <button onClick={playAudio}>Play Audio</button>
      {figure && <p id="figure-display">Current Figure: {figure.name}</p>}  {/* Display current figure */}
    </div>
  );
};

export default Player;