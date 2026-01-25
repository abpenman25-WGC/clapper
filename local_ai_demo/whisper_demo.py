import whisper

model = whisper.load_model("large")
# Replace 'your_audio_file.wav' with your audio file path
AUDIO_FILE = "your_audio_file.wav"

print(f"Transcribing {AUDIO_FILE}...")
result = model.transcribe(AUDIO_FILE)
print("Transcription:", result["text"])
