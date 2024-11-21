import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SongRow.css';  // Import your CSS file here

const SongRow = ({ albumId, setSelectedTrack, isPlaying}) => {
  const [songs, setSongs] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const accessToken = localStorage.getItem('access_token'); // Retrieve Spotify access token
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${albumId}/tracks`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSongs(response.data.items);
      } catch (error) {
        console.error('Error fetching song data:', error);
      }
    };

    if (albumId) {
      fetchSongs();
    }
  }, [albumId]);

  const handlePlayPreview = (previewUrl) => {
    if (!previewUrl) return; // If no preview is available, do nothing
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  
      if (!isPlaying){
        const audio = new Audio(previewUrl);
        audio.play()
        .then(() => setCurrentAudio(audio)) // Set the new audio as the current playing one
        .catch((error) => console.error('Error playing audio:', error));
      }
  };

  const handlePausePreview = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null); // Clear the current audio when paused
    }
  };

  const handleCLick = (song) => {
    handlePausePreview()
    setSelectedTrack(song)
  };

  return (
    <div className="song-row">
      {songs.map((song, index) => (
        <div 
          className="song-item"
          key={index}
          onMouseEnter={() => handlePlayPreview(song.track.preview_url)}
          onMouseLeave={handlePausePreview}
          onClick={() => handleCLick(song.track)} 
        >
          <img src={song.track.album.images[1].url} alt={song.track.name} className="song-logo" />
          {/* <p className="song-name">{song.track.name}</p> */}
        </div>
      ))}
    </div>
  );
};

export default SongRow;
