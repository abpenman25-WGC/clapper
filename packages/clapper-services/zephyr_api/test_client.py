import requests

API_URL = "http://127.0.0.1:8001/generate"

def query_zephyr(prompt, max_new_tokens=100):
    response = requests.post(API_URL, json={"prompt": prompt, "max_new_tokens": max_new_tokens})
    return response.json()["result"]

if __name__ == "__main__":
    prompt = "Hello, how can I help you today?"
    print("Prompt:", prompt)
    print("Response:", query_zephyr(prompt))
