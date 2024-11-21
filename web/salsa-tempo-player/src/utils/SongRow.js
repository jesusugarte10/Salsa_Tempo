import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SongRow.css';  // Import your CSS file here

const SongRow = ({ albumId }) => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const accessToken = localStorage.getItem('access_token'); // Retrieve Spotify access token
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${albumId}/tracks?limit=50`, {
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

  return (
    <div className="song-row">
      {songs.map((song, index) => (
        <div className="song-item" key={index}>
          <img src={song.track.album.images[1].url} alt={song.track.name} className="song-logo" />
          <p className="song-name">{song.track.name}</p>
        </div>
      ))}
    </div>
  );
};

export default SongRow;
