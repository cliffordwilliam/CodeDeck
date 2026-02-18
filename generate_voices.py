import json
import pathlib

import scipy.io.wavfile
from pocket_tts import TTSModel

FRAMES_JSON = "frames.json"
AUDIO_DIR = pathlib.Path("audio")


def main():
    with open(FRAMES_JSON) as f:
        frames = json.load(f)

    AUDIO_DIR.mkdir(exist_ok=True)

    print("Loading TTS model...")
    model = TTSModel.load_model()

    print("Loading voice...")
    voice_state = model.get_state_for_audio_prompt("eponine")

    total = len(frames)
    for i, frame in enumerate(frames):
        text = frame.get("text", "")
        filename = f"frame-{i:03d}.wav"
        output_path = AUDIO_DIR / filename

        audio = model.generate_audio(voice_state, text)
        scipy.io.wavfile.write(str(output_path), model.sample_rate, audio.numpy())

        print(f"[{i + 1}/{total}] Generated {filename}")


if __name__ == "__main__":
    main()
