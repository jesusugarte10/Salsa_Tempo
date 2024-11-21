// src/components/SpotifyAuth.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CLIENT_ID = 'f89b2122149340869ba4c525f0196ca1'; // Replace with your client ID
const REDIRECT_URI = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://jesusugarte10.github.io/Salsa_Tempo'; // Production URL
const SCOPES = 'streaming user-read-email user-read-private';

const SpotifyAuth = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash.split('&')[0].split('=')[1];
      localStorage.setItem('access_token', token);
      window.location.hash = ''; // Clear the hash from the URL
      navigate('/player'); // Navigate to the player screen after retrieving the token
    }
  }, [navigate]); // Add navigate to the dependency array

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl; // Redirect to Spotify login
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Salsa Rueda App</h2>
      <button onClick={handleLogin} style={styles.button}>Log in with Spotify</button>
      
      <footer style={styles.footer}>
        <img src="https://avatars.githubusercontent.com/u/19676534?v=4" alt="Logo" style={styles.logo} />
        <span style={{ color: '#777' }}>Made with ❤️ by Jesus Ugarte</span>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: '36px',
    marginBottom: '20px',
  },
  button: {
    padding: '20px 45px',
    fontSize: '16px',
    borderRadius: '40px',
    backgroundColor: '#1db954',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  footer: {
    marginTop: '20px',
    padding: '20px',
    borderTop: '1px solid #ddd',
    marginBottom: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  logo: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginBottom: '10px',
  },
};

export default SpotifyAuth;
