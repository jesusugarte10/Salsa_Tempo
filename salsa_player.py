import sounddevice as sd
import numpy as np
import librosa
import random
from gtts import gTTS
import os
import pygame
import pickle  # For saving binary data efficiently
from figures.salsa_figures import salsa_figures

# Initialize pygame mixer for sound playback
pygame.mixer.init()

# Create a relative path based on the current working directory (pwd)
base_folder = os.path.join(os.getcwd())

# Function to load audio and metadata
def load_audio_and_metadata(file_path, metadata_path):
    if os.path.exists(metadata_path):
        with open(metadata_path, 'rb') as f:
            metadata = pickle.load(f)
        print("Metadata loaded from cache.")
        y, sample_rate = metadata['y'], metadata['sample_rate']
        tempo, beats, beat_times = metadata['tempo'], metadata['beats'], metadata['beat_times']
    else:
        y, sample_rate = librosa.load(file_path, sr=None)
        tempo, beats = librosa.beat.beat_track(y=y, sr=sample_rate)
        beat_times = librosa.frames_to_time(beats, sr=sample_rate)

        metadata = {
            'y': y,
            'sample_rate': sample_rate,
            'tempo': tempo,
            'beats': beats,
            'beat_times': beat_times
        }
        with open(metadata_path, 'wb') as f:
            pickle.dump(metadata, f)
        print("Metadata processed and saved.")
    return y, sample_rate, tempo, beats, beat_times

# Function to announce a salsa figure using text-to-speech (TTS)
def announce_figure(figure_name):
    tts_file = os.path.join(base_folder, "figures", "figures_audio", "computer_generated", f"{figure_name}.mp3")
    if not os.path.exists(tts_file):
        tts = gTTS(text=figure_name, lang='es', slow=False)
        tts.save(tts_file)
    pygame.mixer.music.load(tts_file)

    # Get the current music volume (between 0.0 and 1.0)
    current_volume = pygame.mixer.music.get_volume()

    tts_volume = 4.0

    # Set the volume for the TTS audio
    pygame.mixer.music.set_volume(tts_volume)

    pygame.mixer.music.play()

    pygame.mixer.music.set_volume(current_volume)

# Function to switch salsa figure groups
def switch_group(current_group):
    print("\nSwitching Groups\n")
    if current_group == "Guapea":
        current_group = "Arriba"
        return {"name": "Dile que no y Arriba", "count": 8}, current_group
    else:
        current_group = "Guapea"
        return {"name": "Dile que no", "count": 8}, current_group

# Main audio processing function to handle beat detection and play audio
def play_audio(file_path, metadata_path):
    # Load audio and metadata
    y, sample_rate, tempo, beats, beat_times = load_audio_and_metadata(file_path, metadata_path)

    # Initialize variables for beat detection
    current_index = 0
    audio_len = len(y)
    beat_counter = 1
    beats_since_last_figure = 0
    figure_in_progress = None
    current_group = "Arriba"

    def calculate_beat_interval_and_threshold(current_time):
        closest_beat_time = min(beat_times, key=lambda beat_time: abs(beat_time - current_time))
        next_beat_time = next((bt for bt in beat_times if bt > closest_beat_time), None)
        beat_interval = (next_beat_time - closest_beat_time) if next_beat_time else 60 / tempo
        beat_threshold = beat_interval * 0.05
        return beat_interval, beat_threshold

    def audio_callback(outdata, frames, time_info, status):
        nonlocal current_index, beat_counter, beats_since_last_figure, figure_in_progress, current_group

        chunk_data = y[current_index:current_index + frames] if current_index + frames <= audio_len else np.zeros(frames)
        outdata[:, 0] = chunk_data * 0.5 # Apply the volume reduction
        current_index += frames
        if current_index >= audio_len:
            current_index = 0

        current_time = current_index / sample_rate
        beat_interval, beat_threshold = calculate_beat_interval_and_threshold(current_time)
        beat_detected = any(abs(beat_time - current_time) < beat_threshold for beat_time in beat_times)

        if beat_detected:
            print(f"{beat_counter}")
            beat_counter += 1
            beats_since_last_figure += 1
            if beat_counter > 8:
                print("\n")
                beat_counter = 1
            if figure_in_progress:
                figure_in_progress["count"] -= 1
                if figure_in_progress["count"] == 0:
                    figure_in_progress = None
                    beats_since_last_figure = 0
            elif beats_since_last_figure >= 24 and not figure_in_progress:
                if random.random() < (0.7 if current_group == "Arriba" else 0.005):
                    figure_in_progress, current_group = switch_group(current_group)
                else:
                    figure_in_progress = random.choice(salsa_figures[current_group]).copy()
                if figure_in_progress:
                    announce_figure(figure_in_progress['name'])
                    print(figure_in_progress['name'])
                    print()

    # Set up and start the audio stream
    stream = sd.OutputStream(channels=1, samplerate=sample_rate, callback=audio_callback)
    stream.start()
    return stream  # Return the stream so it can be controlled outside the function

# Function to stop the audio stream
def stop_audio(stream):
    if stream and stream.active:
        stream.stop()
        stream.close()
        print("Audio stream stopped.")
