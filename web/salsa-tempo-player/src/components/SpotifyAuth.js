// src/components/SpotifyAuth.js
import React, { useEffect } from 'react';

const CLIENT_ID = 'f89b2122149340869ba4c525f0196ca1'; // Replace with your client ID
const REDIRECT_URI = 'http://localhost:3000'; // Make sure this matches your Spotify app settings
const SCOPES = 'streaming user-read-email user-read-private';

const SpotifyAuth = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash.split('&')[0].split('=')[1];
      localStorage.setItem('access_token', token);
      window.location.hash = ''; // Clear the hash from the URL
    }
  }, []);

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl; // Redirect to Spotify login
  };

  return (
    <div>
      <h2>Please log in to Spotify</h2>
      <button onClick={handleLogin}>Log in with Spotify</button>
    </div>
  );
};

export default SpotifyAuth;
