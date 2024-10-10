import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Player = () => {
  const [accessToken, setAccessToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    // Retrieve the access token from local storage
    const token = localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm || !accessToken) return;

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
      }
    } catch (error) {
      console.error('Error searching for tracks:', error);
    }
  };

  const playAudio = () => {
    if (selectedTrack) {
      // Here you would implement the logic to play the audio
      console.log(`Playing audio for: ${selectedTrack.name}`);
      // Optionally, implement logic to play the track using the Spotify Web Playback SDK
    }
  };

  return (
    <div style={styles.container}>
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
          <ul style={{ listStyleType: 'none', padding: 0 }}> {/* Remove bullets and padding */}
            {tracks.map((track) => (
              <li
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }} // Flex for better layout
              >
                <img src={track.album.images[0].url} alt={track.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} /> {/* Thumbnail */}
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{track.name}</span> {/* Increased font size for track name */}
                <span style={{ marginLeft: '5px', fontSize: '16px' }}>by {track.artists[0].name}</span> {/* Increased font size for artist name */}
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
            style={{ width: '200px', height: '200px', objectFit: 'cover' }} // Large image
          />
          <div style={{ marginTop: '10px', fontSize: '14px' }}> {/* Smaller font size for text */}
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedTrack.name}</p> {/* Bold and larger track name */}
            <p style={{ fontSize: '16px' }}>{selectedTrack.artists[0].name}</p> {/* Larger artist name */}
          </div>
          <button onClick={playAudio}>Play Audio</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    minHeight: '100vh', // Full viewport height
    textAlign: 'center', // Center text
  },
  form: {
    display: 'flex',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    marginRight: '10px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
  },
  results: {
    marginTop: '20px',
  },
};

export default Player;
