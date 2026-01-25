from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

model_id = "HuggingFaceH4/zephyr-7b-beta"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float32)

pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, device=-1)

prompt = "Hello, how can I help you today?"
result = pipe(prompt, max_new_tokens=100)
print("Prompt:", prompt)
print("Response:", result[0]['generated_text'])
