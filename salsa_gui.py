import os
import tkinter as tk
from tkinter import ttk, messagebox
import pygame
import yt_dlp
import requests
from PIL import Image, ImageTk
from salsa_player import play_audio, stop_audio  # Import the play and stop functions
import sounddevice as sd  # To control sounddevice streams
import io

# Initialize Pygame mixer for sound playback
pygame.mixer.init()

songs_folder = os.path.join(os.getcwd(), "songs", "raw_audio")  # Folder containing raw audio files

# Function to download YouTube audio
def download_youtube_audio(url, output_folder):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_folder, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

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
        self.play_button.grid(row=1, column=1, padx=10, pady=10)

        # Stop button
        self.stop_button = tk.Button(root, text="Stop", command=self.stop_audio)
        self.stop_button.grid(row=1, column=2, padx=10, pady=10)

        # Search label and entry
        self.search_label = tk.Label(root, text="Search YouTube:")
        self.search_label.grid(row=3, column=0, padx=10, pady=10)
        self.search_entry = tk.Entry(root)
        self.search_entry.grid(row=3, column= 1, padx=10, pady=10)

        # Search button
        self.search_button = tk.Button(root, text="Search", command=self.search_youtube)
        self.search_button.grid(row=3, column=2, padx=10, pady=10)

        # Combobox for displaying search results
        self.result_dropdown = ttk.Combobox(root, values=[])
        self.result_dropdown.grid(row=4, column=1, padx=10, pady=10)
        self.result_dropdown.bind("<<ComboboxSelected>>", self.update_thumbnail)  # Bind to selection change


        # Thumbnail label
        self.thumbnail_label = tk.Label(root)
        self.thumbnail_label.grid(row=4, column=0, padx=10, pady=10)

        # Download button
        self.download_button = tk.Button(root, text="Download", command=self.download_selected_audio)
        self.download_button.grid(row=4, column=2, padx=10, pady=10)

        self.search_results = []  # To store search results

        # To track the current audio stream
        self.current_stream = None
        self.current_thumbnail_url = None

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


    # Function to search YouTube and populate the dropdown list
    def search_youtube(self):
        query = self.search_entry.get()
        if not query:
            messagebox.showerror("Error", "Please enter a search query.")
            return

        ydl_opts = {'format': 'bestaudio/best'}

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                results = ydl.extract_info(f"ytsearch:{query}", download=False)['entries']
            except Exception as e:
                messagebox.showerror("Error", f"Failed to fetch search results: {e}")
                return

            if not results:
                messagebox.showerror("Error", "No results found.")
                return

            # Debugging: Check if results were fetched
            print(f"Fetched {len(results)} results")

            self.search_results = results  # Store results for later use

            # Populate the dropdown with titles of the search results
            video_titles = [result['title'] for result in results]
            self.result_dropdown['values'] = video_titles

            # Force dropdown to update its value list
            self.result_dropdown.update_idletasks()

            if video_titles:
                self.result_dropdown.current(0)  # Select the first result by default
                self.update_thumbnail()  # Update thumbnail for the first result
            else:
                messagebox.showerror("Error", "No results found.")

        # Function to download audio for the selected video
    def download_selected_audio(self):
        selected_index = self.result_dropdown.current()

        if selected_index == -1:
            messagebox.showerror("Error", "Please select a video from the dropdown.")
            return

        selected_video = self.search_results[selected_index]
        thumbnail_url = selected_video['thumbnail']

        # Fetch and display the thumbnail
        img_data = requests.get(thumbnail_url).content
        img = Image.open(io.BytesIO(img_data))
        img = img.resize((200, 150), Image.LANCZOS)  # Resize for display
        img_tk = ImageTk.PhotoImage(img)
        self.thumbnail_label.config(image=img_tk)
        self.thumbnail_label.image = img_tk  # Keep a reference to avoid garbage collection

        # Prompt user to download
        if messagebox.askyesno("Download", f"Do you want to download the audio for '{selected_video['title']}'?"):
            video_url = selected_video['webpage_url']
            download_youtube_audio(video_url, songs_folder)

            # Refresh the song list and update the dropdown
            self.song_list = self.get_song_list()  # Refresh song list
            self.song_dropdown['values'] = self.song_list  # Update dropdown values

            if self.song_list:
                self.song_dropdown.current(len(self.song_list) - 1)  # Select the newly downloaded song

    # Function to update the thumbnail when a new video is selected
    def update_thumbnail(self, event=None):
        selected_index = self.result_dropdown.current()

        if selected_index == -1:
            return  # No valid selection made

        selected_video = self.search_results[selected_index]
        thumbnail_url = selected_video['thumbnail']

        # Fetch and display the thumbnail
        img_data = requests.get(thumbnail_url).content
        img = Image.open(io.BytesIO(img_data))
        img = img.resize((200, 150), Image.LANCZOS)  # Resize for display
        img_tk = ImageTk.PhotoImage(img)
        self.thumbnail_label.config(image=img_tk)
        self.thumbnail_label.image = img_tk  # Keep a reference to avoid garbage collection

# Main loop for the GUI
if __name__ == "__main__":
    root = tk.Tk()
    app = SalsaGUI(root)
    root.mainloop()
