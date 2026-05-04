// FLUX.1-Schnell (flux-mini) workflow for ComfyUI
// Uses split-format model files:
//   - unet/flux-mini.safetensors
//   - clip/t5xxl_fp16.safetensors + clip/clip_l.safetensors
//   - vae/ae.safetensors
export const flux_schnell_mini_workflow = {
  '6': {
    inputs: {
      text: '',
      clip: ['11', 0],
    },
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Prompt' },
  },
  '8': {
    inputs: {
      samples: ['13', 0],
      vae: ['10', 0],
    },
    class_type: 'VAEDecode',
    _meta: { title: 'VAE Decode' },
  },
  '9': {
    inputs: {
      filename_prefix: 'FLUX-mini',
      images: ['8', 0],
    },
    class_type: 'SaveImage',
    _meta: { title: 'Save Image' },
  },
  '10': {
    inputs: {
      vae_name: 'ae.safetensors',
    },
    class_type: 'VAELoader',
    _meta: { title: 'Load VAE' },
  },
  '11': {
    inputs: {
      clip_name1: 't5xxl_fp16.safetensors',
      clip_name2: 'clip_l.safetensors',
      type: 'flux',
      device: 'default',
    },
    class_type: 'DualCLIPLoader',
    _meta: { title: 'Dual CLIP Loader' },
  },
  '12': {
    inputs: {
      unet_name: 'flux-mini.safetensors',
      weight_dtype: 'default',
    },
    class_type: 'UNETLoader',
    _meta: { title: 'Load Diffusion Model (flux-mini)' },
  },
  '13': {
    inputs: {
      noise: ['25', 0],
      guider: ['22', 0],
      sampler: ['16', 0],
      sigmas: ['17', 0],
      latent_image: ['27', 0],
    },
    class_type: 'SamplerCustomAdvanced',
    _meta: { title: 'Sampler' },
  },
  '16': {
    inputs: {
      sampler_name: 'euler',
    },
    class_type: 'KSamplerSelect',
    _meta: { title: 'KSamplerSelect' },
  },
  '17': {
    inputs: {
      scheduler: 'simple',
      steps: 4,
      denoise: 1,
      model: ['12', 0],
    },
    class_type: 'BasicScheduler',
    _meta: { title: 'BasicScheduler' },
  },
  '22': {
    inputs: {
      model: ['12', 0],
      conditioning: ['6', 0],
    },
    class_type: 'BasicGuider',
    _meta: { title: 'BasicGuider' },
  },
  '25': {
    inputs: {
      noise_seed: 42,
    },
    class_type: 'RandomNoise',
    _meta: { title: 'RandomNoise' },
  },
  '27': {
    inputs: {
      width: 768,
      height: 432,
      batch_size: 1,
    },
    class_type: 'EmptySD3LatentImage',
    _meta: { title: 'Empty Latent Image' },
  },
}
