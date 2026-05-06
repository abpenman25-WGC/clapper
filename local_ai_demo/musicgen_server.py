"""
MusicGen local server for Clapper.
Wraps Meta's AudioCraft MusicGen and exposes a simple HTTP endpoint.

Requirements (already installed in musicgen_env):
    torch, torchaudio  (CPU-only)
    audiocraft (Meta)
    flask, soundfile

Start:
    cd C:\\AI\\musicgen_env && Scripts\\activate && python musicgen_server.py

Endpoint:
    POST /generate
    Body: { "prompt": "...", "duration": 10, "model": "small" }
    Returns: audio/wav binary

Models: "small" (fastest), "medium" (slower), "large" (very slow on CPU)
"""

import io
import logging
import os

import soundfile as sf
from flask import Flask, Response, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Cache loaded models to avoid reloading on each request
_models: dict = {}


def get_model(model_name: str):
    if model_name not in _models:
        from audiocraft.models import MusicGen
        logger.info(f"Loading MusicGen model: facebook/musicgen-{model_name} (first run downloads weights) …")
        model = MusicGen.get_pretrained(f"facebook/musicgen-{model_name}")
        model.set_generation_params(duration=10)  # default, overridden per request
        _models[model_name] = model
        logger.info(f"MusicGen model '{model_name}' loaded.")
    return _models[model_name]


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True, silent=True) or {}
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    duration = float(data.get("duration", 10))
    duration = max(1.0, min(duration, 60.0))  # clamp 1–60 s

    model_name = data.get("model", "small").lower()
    if model_name not in ("small", "medium", "large", "melody"):
        model_name = "small"

    try:
        model = get_model(model_name)
        model.set_generation_params(duration=duration)

        logger.info(f"Generating {duration}s music [{model_name}] for prompt: {prompt!r}")
        wav = model.generate([prompt])  # returns (1, channels, samples) tensor

        # Convert tensor to numpy
        wav_np = wav[0].cpu().numpy()  # shape: (channels, samples)
        if wav_np.ndim == 2:
            # MusicGen outputs stereo; transpose to (samples, channels) for soundfile
            wav_np = wav_np.T

        sample_rate = model.sample_rate

        buf = io.BytesIO()
        sf.write(buf, wav_np, samplerate=sample_rate, format="WAV", subtype="PCM_16")
        buf.seek(0)

        return Response(buf.read(), mimetype="audio/wav")

    except Exception as exc:
        logger.exception("MusicGen generation failed")
        return jsonify({"error": str(exc)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("MUSICGEN_PORT", 5003))
    logger.info(f"MusicGen server starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
