// src/components/SpotifyAuth.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CLIENT_ID = 'f89b2122149340869ba4c525f0196ca1'; // Replace with your client ID
const REDIRECT_URI = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://jesusugarte10.github.io/Salsa_Tempo'; // Production URL
const SCOPES = 'streaming user-read-email user-read-private';

const SpotifyAuth = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    
    // Open the Spotify login URL in a new window
    const width = 1;
    const height = 1;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    const authWindow = window.open(
      authUrl,
      'Spotify Login',
      `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
    );
  
    // Check the new window for the access token
    const interval = setInterval(() => {
      try {
        if (authWindow.closed) {
          clearInterval(interval); // Stop checking if the window is closed
          return;
        }
  
        const hash = authWindow.location.hash;
        if (hash) {
          const token = hash.split('&')[0].split('=')[1];
          localStorage.setItem('access_token', token);
          authWindow.close(); // Close the pop-up window
          window.location.hash = ''; // Clear the hash from the URL
          navigate('/player'); // Navigate to the player screen after retrieving the token
          clearInterval(interval); // Clear the interval
        }
      } catch (error) {
        // Handle any cross-origin issues (the pop-up window is not fully loaded yet)
      }
    }, 1000); // Check the pop-up every second for the token
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
    fontWeight: 'bold'
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
