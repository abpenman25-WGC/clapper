from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import uvicorn

app = FastAPI()

MODEL_ID = "HuggingFaceH4/zephyr-7b-beta"
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(MODEL_ID, torch_dtype=torch.float32)
gen_pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, device=-1)

class PromptRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 100

@app.post("/generate")
def generate_text(req: PromptRequest):
    result = gen_pipe(req.prompt, max_new_tokens=req.max_new_tokens)
    return {"result": result[0]["generated_text"]}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
