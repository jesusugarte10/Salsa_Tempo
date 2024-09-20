import sounddevice as sd
import numpy as np
import librosa
import time

# Load the audio file
file_path = "C:\\Users\\jesus\\OneDrive\\Escritorio\\Salsa\\songs\\fuga.wav"
y, sample_rate = librosa.load(file_path, sr=None)  # sr=None to use the file's original sample rate

# Preprocess: Get the tempo and beats beforehand
tempo, beats = librosa.beat.beat_track(y=y, sr=sample_rate)

# Convert beat frames to time in seconds
beat_times = librosa.frames_to_time(beats, sr=sample_rate)

# Initialize variables for beat detection
beat_detected = False
current_index = 0
audio_len = len(y)
beat_counter = 1  # Initialize beat counter

def calculate_beat_interval_and_threshold(current_time):
    # Calculate the nearest beat time to the current time
    closest_beat_time = min(beat_times, key=lambda beat_time: abs(beat_time - current_time))
    
    # Estimate beat interval based on the closest beat time
    next_beat_time = next((bt for bt in beat_times if bt > closest_beat_time), None)
    
    if next_beat_time:
        beat_interval = next_beat_time - closest_beat_time
    else:
        beat_interval = 60 / tempo  # Fallback to default if no next beat is found
    
    # Calculate dynamic threshold
    beat_threshold = beat_interval * 0.05  # 5% of the beat interval
    return beat_interval, beat_threshold

def audio_callback(outdata, frames, time_info, status):
    global beat_detected, current_index, beat_counter
    
    # Ensure we have enough frames to output
    if current_index + frames > audio_len:
        chunk_data = np.zeros(frames)  # Fill remaining buffer with silence
    else:
        chunk_data = y[current_index:current_index+frames]

    outdata[:len(chunk_data), 0] = chunk_data  # Copy audio data into output stream

    # Update current index
    current_index += frames
    if current_index >= audio_len:
        current_index = 0  # Loop the audio if needed

    # Perform beat detection using preprocessed beat timings
    current_time = current_index / sample_rate

    # Calculate dynamic beat interval and threshold
    beat_interval, beat_threshold = calculate_beat_interval_and_threshold(current_time)
    
    # Check if the current playback time is near a beat time using dynamic threshold
    beat_detected = any(abs(beat_time - current_time) < beat_threshold for beat_time in beat_times)
    
    # Print debugging information
    #print(f"Current time: {current_time:.2f}, Beat detected: {beat_detected}, Interval: {beat_interval:.2f}, Threshold: {beat_threshold:.2f}")

# Set up and start the audio stream
with sd.OutputStream(channels=1, samplerate=sample_rate, callback=audio_callback):
    try:
        while True:
            if beat_detected:
                print(beat_counter)  # Print the current beat number
                beat_counter += 1  # Increment the counter
                if beat_counter > 4:  # Reset the counter if it exceeds 4
                    beat_counter = 1
                beat_detected = False
            time.sleep(0.05)  # Small sleep to avoid high CPU usage
    except KeyboardInterrupt:
        print("Stream interrupted")
