"""
MusicGen local server for Clapper.
Uses HuggingFace Transformers to run Meta's MusicGen locally (CPU-only).

Requirements (installed in musicgen_env):
    torch, torchaudio  (CPU-only)
    transformers>=4.31.0
    flask, soundfile

Start:
    cd C:\\AI\\musicgen_env && Scripts\\activate && python musicgen_server.py

Endpoint:
    POST /generate
    Body: { "prompt": "...", "duration": 10, "model": "small" }
    Returns: audio/wav binary

Models: "small" (fastest), "medium" (slower), "large" (very slow on CPU)
First run downloads model weights from HuggingFace Hub (~300 MB for small).
"""

import io
import logging
import os

import soundfile as sf
import torch
from flask import Flask, Response, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Cache loaded models/processors to avoid reloading on each request
_models: dict = {}
_processors: dict = {}


def get_model_and_processor(model_name: str):
    if model_name not in _models:
        from transformers import MusicgenForConditionalGeneration, AutoProcessor

        hf_name = f"facebook/musicgen-{model_name}"
        logger.info(f"Loading {hf_name} (first run downloads weights) …")

        processor = AutoProcessor.from_pretrained(hf_name)
        model = MusicgenForConditionalGeneration.from_pretrained(hf_name)
        model.eval()

        _processors[model_name] = processor
        _models[model_name] = model
        logger.info(f"MusicGen '{model_name}' loaded.")

    return _models[model_name], _processors[model_name]


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
        model, processor = get_model_and_processor(model_name)
        sample_rate = model.config.audio_encoder.sampling_rate  # 32000 Hz

        # tokens_per_second is 50 for MusicGen
        max_new_tokens = int(duration * 50)

        logger.info(f"Generating {duration}s music [{model_name}] for: {prompt!r}")

        inputs = processor(text=[prompt], padding=True, return_tensors="pt")

        with torch.no_grad():
            audio_values = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
            )

        # audio_values shape: (batch, channels, samples)
        wav_np = audio_values[0].cpu().numpy()  # (channels, samples)
        if wav_np.ndim == 2:
            wav_np = wav_np.T  # -> (samples, channels)

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
