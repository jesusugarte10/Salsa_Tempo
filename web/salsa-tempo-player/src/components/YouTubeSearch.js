import React, { useState } from 'react';
import axios from 'axios';

const YouTubeSearch = ({ onVideoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [video, setVideo] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`);
    const videoIdMatch = response.data.match(/"videoId":"([^"]+)"/);
    
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
      setVideo({ id: videoId, thumbnail });
      onVideoSelect(videoId);  // Notify the parent component of the selected video
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search YouTube"
        />
        <button type="submit">Search</button>
      </form>
      {video && (
        <div>
          <h3>Selected Video:</h3>
          <img src={video.thumbnail} alt="Video Thumbnail" />
          <p>YouTube Video ID: {video.id}</p>
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;