import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Player = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [accessToken, setAccessToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Retrieve the access token from local storage
    const token = localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const initPlayer = useCallback(() => {
    const playerInstance = new window.Spotify.Player({
      name: 'Salsa Rueda App Player',
      getOAuthToken: (cb) => { cb(accessToken); },
      volume: 1,
    });

    playerInstance.connect();

    playerInstance.on('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setPlayer(playerInstance);
      setIsReady(true);
    });

    playerInstance.on('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
      setIsReady(false);
    });

    playerInstance.on('initialization_error', ({ message }) => {
      console.error('Initialization Error:', message);
    });

    playerInstance.on('authentication_error', ({ message }) => {
      console.error('Authentication Error:', message);
    });

    playerInstance.on('account_error', ({ message }) => {
      console.error('Account Error:', message);
    });

    playerInstance.on('playback_error', ({ message }) => {
      console.error('Playback Error:', message);
    });

    setPlayer(playerInstance); // Ensure player instance is set here as well

  }, [accessToken]); // Add accessToken as a dependency

  useEffect(() => {
    if (!accessToken) return; // Don't run if there is no access token

    // Define the onSpotifyWebPlaybackSDKReady function
    window.onSpotifyWebPlaybackSDKReady = () => {
      initPlayer();
    };

    // Load the Spotify SDK
    const loadSpotifySDK = () => {
      const script = document.createElement('script');
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.onerror = (error) => {
        console.error('Failed to load Spotify SDK:', error);
      };
      document.body.appendChild(script);
    };

    loadSpotifySDK();
  }, [accessToken, initPlayer]); // Include initPlayer in the dependency array

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!accessToken){
      navigate('/'); // Redirect to SpotifyAuth if accessToken is missing
      return;
    } 
    else if (!searchTerm ){
      //Do Nothing
      return;
    } 

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: searchTerm,
          type: 'track',
          limit: 5, // Limit the number of results
        },
      });

      const trackResults = response.data.tracks.items;
      setTracks(trackResults);
      if (trackResults.length > 0) {
        setSelectedTrack(trackResults[0]); // Automatically select the first track
        setIsReady(true)
      }
    } catch (error) {
      console.error('Error searching for tracks:', error);
    }
  };

  const playAudio = () => {
    console.log('Player Ready:', isReady);
    console.log('Selected Track:', selectedTrack);
    console.log('Player Instance:', player); // Log player instance for debugging

    if (isReady && selectedTrack) {
      player.resume().then(() => {
        console.log(`Playing audio for: ${selectedTrack.name}`);
        player.play({
          uris: [`spotify:track:${selectedTrack.id}`],
        }).catch(error => {
          console.error('Error playing audio:', error);
        });
      }).catch(error => {
        console.error('Error resuming playback:', error);
      });
    } else {
      console.error('Player is not ready or no track selected');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Salsa Rueda App</h1>

      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Spotify"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Search</button>
      </form>

      {tracks.length > 0 && (
        <div style={styles.results}>
          <h3>Search Results:</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tracks.map((track) => (
              <li
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '5px',
                  backgroundColor: selectedTrack?.id === track.id ? '#e0f7fa' : '#ffffff',
                  transition: 'background-color 0.3s',
                }}
              >
                <img src={track.album.images[0].url} alt={track.name} style={{ width: '80px', height: '80px', marginRight: '10px', borderRadius: '5px' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{track.name}</span>
                  <span style={{ marginLeft: '5px', fontSize: '16px', color: '#555' }}>by {track.artists[0].name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedTrack && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <img 
            src={selectedTrack.album.images[0].url} 
            alt={selectedTrack.name} 
            style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }} 
          />
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedTrack.name}</p>
            <p style={{ fontSize: '16px', color: '#555' }}>{selectedTrack.artists[0].name}</p>
          </div>
          <button onClick={playAudio} style={styles.button}>Play Audio</button>
        </div>
      )}

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
  form: {
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    marginRight: '10px',
    width: '300px',
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    borderRadius: '5px',
    backgroundColor: '#1db954',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  results: {
    textAlign: 'left',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  },
  footer: {
    marginTop: 'auto',
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

export default Player;
