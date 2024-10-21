// src/components/SpotifySearch.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpotifySearch = ({ onTrackSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`, // Use the stored access token
        },
        params: {
          q: searchTerm,
          type: 'track',
          limit: 5, // Get top 5 results
        },
      });

      setTracks(response.data.tracks.items);
      setSelectedTrack(response.data.tracks.items[0]); // Automatically select the first track
      onTrackSelect(response.data.tracks.items[0]); // Notify the parent component of the selected track
    } catch (error) {
      console.error('Error fetching tracks from Spotify:', error);
    }
  };

  const handleTrackSelect = (track) => {
    setSelectedTrack(track);
    onTrackSelect(track); // Notify the parent component of the selected track
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Spotify"
        />
        <button type="submit">Search</button>
      </form>
      {tracks.length > 0 && (
        <select value={selectedTrack?.id} onChange={(e) => handleTrackSelect(tracks.find(track => track.id === e.target.value))}>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name} by {track.artists[0].name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default SpotifySearch;
