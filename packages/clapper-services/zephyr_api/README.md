# Zephyr API Service

This is a simple FastAPI service that runs the Zephyr-7B LLM locally and exposes a /generate endpoint for text generation.

## Setup

1. Open a terminal in this folder.
2. Install dependencies:
   pip install -r requirements.txt
3. Start the API server:
   uvicorn main:app --host 127.0.0.1 --port 8001

## Usage

Send a POST request to http://127.0.0.1:8001/generate with JSON body:

    {
      "prompt": "Your prompt here",
      "max_new_tokens": 100
    }

The response will be:

    {
      "result": "...generated text..."
    }

You can now connect clapper to this local API for chat/inference.
