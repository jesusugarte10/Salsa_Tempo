// utils/audioHelper.js
export const streamAudio = async (audioUrl, audioContext, setAudioBuffer) => {
  try {
    const response = await fetch(audioUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audio');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    setAudioBuffer(buffer); // Set the audio buffer state
    return buffer; // Return the buffer
  } catch (error) {
    console.error('Error streaming audio:', error);
    return null; // Return null in case of error
  }
};
