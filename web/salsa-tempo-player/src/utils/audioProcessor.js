import { Howl } from 'howler';

// Function to load and play the audio using Howler.js
export const playAudio = (audioUrl) => {
  const sound = new Howl({
    src: [audioUrl],
    html5: true,  // Enable for large files to stream audio
    volume: 0.5
  });

  sound.play();

  return sound;
};

// Function to announce salsa figure (text-to-speech simulation)
export const announceFigure = (figureName) => {
  const msg = new SpeechSynthesisUtterance(figureName);
  msg.lang = "es";
  window.speechSynthesis.speak(msg);
};