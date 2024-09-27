import os
import tkinter as tk
from tkinter import ttk, messagebox
import pygame
from salsa_player import play_audio, stop_audio  # Import the play and stop functions
import sounddevice as sd  # To control sounddevice streams

# Initialize Pygame mixer for sound playback
pygame.mixer.init()

songs_folder = os.path.join(os.getcwd(), "songs", "raw_audio")  # Folder containing raw audio files

# GUI class for Salsa Tempo Player
class SalsaGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Salsa Tempo Player")

        # Song selection label
        self.song_label = tk.Label(root, text="Choose a song:")
        self.song_label.grid(row=0, column=0, padx=10, pady=10)

        # Get the list of available songs
        self.song_list = self.get_song_list()

        # Song dropdown menu
        if self.song_list:
            self.song_dropdown = ttk.Combobox(root, values=self.song_list)
            self.song_dropdown.grid(row=0, column=1, padx=10, pady=10)
            self.song_dropdown.current(0)  # Set the first song as the default if the list is not empty
        else:
            messagebox.showerror("Error", "No songs found in the folder.")
            self.song_dropdown = ttk.Combobox(root, values=["No songs available"])
            self.song_dropdown.grid(row=0, column=1, padx=10, pady=10)

        # Play button
        self.play_button = tk.Button(root, text="Play", command=self.play_selected_song)
        self.play_button.grid(row=1, column=0, padx=10, pady=10)

        # Stop button
        self.stop_button = tk.Button(root, text="Stop", command=self.stop_audio)
        self.stop_button.grid(row=1, column=1, padx=10, pady=10)

        # To track the current audio stream
        self.current_stream = None

    # Function to get the list of songs in the folder
    def get_song_list(self):
        if os.path.exists(songs_folder):
            song_files = [f for f in os.listdir(songs_folder) if f.endswith(".wav")]
            return [f.replace(".wav", "") for f in song_files]
        else:
            messagebox.showerror("Error", f"Folder not found: {songs_folder}")
            return []

    # Function to play the selected song using the player script
    def play_selected_song(self):
        selected_song = self.song_dropdown.get()
        if selected_song == "No songs available":
            messagebox.showerror("Error", "No song to play.")
        else:
            song_path = os.path.join(songs_folder, f"{selected_song}.wav")
            metadata_folder = os.path.join(os.getcwd(), "songs", "metadata") 
            metadata_path = os.path.join(metadata_folder, f"{selected_song}_metadata.pickle")

            if os.path.exists(song_path):
                print(f"Playing song: {selected_song}")
                if self.current_stream:  # Stop any existing stream before starting a new one
                    stop_audio(self.current_stream)
                self.current_stream = play_audio(song_path, metadata_path)  # Play new song and store stream
            else:
                messagebox.showerror("Error", f"Selected song not found: {selected_song}")

    # Function to stop the currently playing song
    def stop_audio(self):
        if self.current_stream:
            stop_audio(self.current_stream)
            self.current_stream = None
            print("Audio stream stopped.")
        if pygame.mixer.music.get_busy():
            pygame.mixer.music.stop()
            print("Pygame music stopped.")

# Main loop for the GUI
if __name__ == "__main__":
    root = tk.Tk()
    app = SalsaGUI(root)
    root.mainloop()
