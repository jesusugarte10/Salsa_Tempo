import axios from 'axios';

// Function to stream audio and buffer it locally in memory while playing
export const streamAudio = async (url, audioContext, onBuffer) => {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer', // Streaming audio as arraybuffer
    });

    // Decode the audio data to buffer it temporarily in the AudioContext
    const audioBuffer = await audioContext.decodeAudioData(response.data);

    if (onBuffer) {
      onBuffer(audioBuffer);
    }
    
    return audioBuffer;
  } catch (error) {
    console.error('Error streaming audio:', error);
    return null;
  }
};