"""
AudioLDM local server for Clapper.
Wraps the AudioLDM library and exposes a simple HTTP endpoint.

Requirements (install inside audioldm_env):
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    pip install git+https://github.com/haoheliu/AudioLDM.git
    pip install flask

Start:
    cd C:\\AI\\audioldm_env && Scripts\\activate && python audioldm_server.py

Endpoint:
    POST /generate
    Body: { "prompt": "...", "duration": 5 }
    Returns: audio/wav binary
"""

import io
import logging
import os
import sys
import tempfile

from flask import Flask, Response, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Lazy-load the model on first request to keep startup fast
_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        logger.info("Loading AudioLDM model (audioldm-s-full) — first run downloads ~450 MB …")
        from audioldm import text_to_audio, build_model
        _pipeline = build_model(model_name="audioldm-s-full")
        logger.info("AudioLDM model loaded.")
    return _pipeline


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True, silent=True) or {}
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    duration = float(data.get("duration", 5))
    duration = max(1.0, min(duration, 30.0))  # clamp 1–30 s

    try:
        from audioldm import text_to_audio
        pipeline = get_pipeline()

        logger.info(f"Generating {duration}s audio for prompt: {prompt!r}")
        waveforms = text_to_audio(
            pipeline,
            text=prompt,
            duration=duration,
            guidance_scale=2.5,
            n_candidate_gen_per_text=1,
            batchsize=1,
        )

        # waveforms is a list of numpy arrays (float32, mono, 16 kHz)
        import numpy as np
        import soundfile as sf

        wav = waveforms[0]
        if wav.ndim == 2:
            wav = wav[0]

        buf = io.BytesIO()
        sf.write(buf, wav, samplerate=16000, format="WAV", subtype="PCM_16")
        buf.seek(0)

        return Response(buf.read(), mimetype="audio/wav")

    except Exception as exc:
        logger.exception("AudioLDM generation failed")
        return jsonify({"error": str(exc)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("AUDIOLDM_PORT", 5002))
    logger.info(f"AudioLDM server starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
