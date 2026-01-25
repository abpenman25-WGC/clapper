from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32)
pipe = pipe.to("cpu")

prompt = "A fantasy landscape, trending on artstation"
print(f"Generating image for prompt: {prompt}")
image = pipe(prompt).images[0]
image.save("fantasy_landscape.png")
print("Image saved as fantasy_landscape.png")
