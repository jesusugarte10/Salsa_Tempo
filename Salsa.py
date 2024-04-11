from pydub import AudioSegment
import numpy as np
import threading
import random
import time
import aubio

# Sample salsa dance figures with counts
salsa_figures = [
    {"name": "Sombrero", "count": 16},
    {"name": "Kentucky", "count": 24},
    {"name": "Dile que no", "count": 8},
    {"name": "Enchufla", "count": 16},
    {"name": "Adios con la vecina", "count": 16},
    # Add more salsa figures as needed
]

# Function to initialize aubio's tempo detection
def init_tempo_detection():
    samplerate = 44100  # Adjust based on your audio file's sample rate
    win_s = 512
    hop_s = 256
    tempo_detection = aubio.tempo("default", win_s, hop_s, samplerate)
    return tempo_detection

# Function to get tempo in real-time
def get_tempo(tempo_detection, audio_data):
    if tempo_detection:
        tempo = tempo_detection(audio_data)[0]
        return tempo
    return None

# Function to choose a random salsa figure
def choose_salsa_figure():
    return random.choice(salsa_figures)

# Function to load audio data from an MP3 file
def load_audio_data(file_path):
    audio = AudioSegment.from_mp3(file_path)
    samples = np.array(audio.get_array_of_samples())
    return samples, audio.frame_rate

# Main program
def main():
    try:
        tempo_detection = init_tempo_detection()

        # Load audio data from the MP3 file
        audio_data, frame_rate = load_audio_data("./Esposa.mp3")

        while True:
            tempo = get_tempo(tempo_detection, audio_data)

            if tempo is not None:
                print(f"Tempo: {tempo} BPM")
                selected_figure = choose_salsa_figure()
                figure_name = selected_figure["name"]
                figure_count = selected_figure["count"]
                print(f"Selected Salsa Figure: {figure_name} ({figure_count} counts)")

                # Calculate the duration of each count based on tempo
                seconds_per_beat = 60 / tempo
                figure_duration = figure_count * seconds_per_beat

                # Start a new thread to execute the salsa figure
                threading.Timer(figure_duration, lambda: print("Finished", figure_name)).start()
            else:
                print("Error: Tempo not detected.")
    except KeyboardInterrupt:
        print("Program terminated by user.")

if __name__ == "__main__":
    main()
