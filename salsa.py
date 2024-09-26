import sounddevice as sd
import numpy as np
import librosa
import time
import random
from gtts import gTTS
from playsound import playsound
import os
import pygame
from salsa_figures import salsa_figures

# Initialize pygame mixer for sound playback
pygame.mixer.init()

# Load the audio file
file_path = "C:\\Users\\jesus\\OneDrive\\Escritorio\\Salsa\\songs\\medicen.wav"
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
beats_since_last_figure = 0
figure_in_progress = None  # Track the current figure
current_group = "Arriba"
beats_since_last_group_change = 0

def switch_group():
    global current_group
    print("\nSwitching Groups\n")
    if current_group == "Guapea":
        current_group = "Arriba"
        return {"name": "Dile que no y Arriba", "count": 8}  # Transition figure for 8 counts
    else:
        current_group = "Guapea"
        return {"name": "Dile que no", "count": 8}

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

def announce_figure(figure_name):
    # Create or load the TTS audio file for the figure name
    folder_path = "C:\\Users\\jesus\\OneDrive\\Escritorio\\Salsa\\TTS_Files\\"
    tts_file = f"{folder_path}{figure_name}.mp3"

    # Check if the TTS file already exists, else generate it
    if not os.path.exists(tts_file):
        tts = gTTS(text=figure_name, lang='es', slow=False)
        tts.save(tts_file)

    # Play the pre-recorded or generated TTS audio using pygame
    pygame.mixer.music.load(tts_file)
    pygame.mixer.music.set_volume(1.0)  # Set to maximum
    pygame.mixer.music.play()


def audio_callback(outdata, frames, time_info, status):
    global beat_detected, current_index, beat_counter, beats_since_last_figure, figure_in_progress
    
    # Ensure we have enough frames to output
    if current_index + frames > audio_len:
        chunk_data = np.zeros(frames)  # Fill remaining buffer with silence
    else:
        chunk_data = y[current_index:current_index+frames]

    outdata[:, 0] = chunk_data  # Copy audio data into output stream (mono channel)

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

# Set up and start the audio stream
with sd.OutputStream(channels=1, samplerate=sample_rate, callback=audio_callback):
    try:
        while True:
            if beat_detected:
                print(f"{beat_counter}")
                beat_counter += 1
                beats_since_last_figure += 1
                beats_since_last_group_change += 1

                if beat_counter > 8:
                    beat_counter = 1
                    print("")

                if figure_in_progress:
                    figure_in_progress["count"] -= 1
                    if figure_in_progress["count"] == 0:
                        figure_in_progress = None
                        beats_since_last_figure = 0

                elif beats_since_last_figure >= 24 and figure_in_progress is None:
                    if  current_group == "Arriba":
                        group_switch_probability = 0.7  # 70% from arriba to guapea
                    else:
                        group_switch_probability = 0.005 #0.5% Probability from Guapea to Arriba

                    if random.random() < group_switch_probability:  # % chance to switch groups
                        figure_in_progress = switch_group()
                        beats_since_last_group_change = 0
                    else:
                        figure_in_progress = random.choice(salsa_figures[current_group]).copy()

                    # Make sure figure_in_progress is set before trying to access its name
                    if figure_in_progress:
                        figure_name = figure_in_progress['name']
                        print(f"{figure_name}\n")
                        announce_figure(figure_name)

                beat_detected = False

    except KeyboardInterrupt:
        print("Stream interrupted")
