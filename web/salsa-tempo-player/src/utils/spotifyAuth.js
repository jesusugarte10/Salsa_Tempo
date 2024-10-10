// src/utils/spotifyAuth.js
const CLIENT_ID = 'f89b2122149340869ba4c525f0196ca1'; // Replace with your Client ID
const REDIRECT_URI = 'http://localhost:3000'; // Replace with your redirect URI
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-playback-state,user-modify-playback-state`;

export const loginWithSpotify = () => {
  window.location.href = AUTH_URL;
};

export const getAccessToken = () => {
    const hash = window.location.hash;
    let token = null;
  
    if (hash) {
      token = hash.split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      // Optionally, remove the token from the URL for a cleaner address
      window.location.hash = '';
    }
  
    return token;
  };
  