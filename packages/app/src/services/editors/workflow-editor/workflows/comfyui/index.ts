import {
  ClapWorkflow,
  ClapWorkflowCategory,
  ClapWorkflowEngine,
  ClapWorkflowProvider,
} from '@aitube/clap'

import { genericImage, genericPrompt, genericNegativePrompt } from '../common/defaultValues'
import { text_to_image_demo_workflow } from '../common/comfyui/text_to_image_demo_workflow'
import { flux_schnell_mini_workflow } from '../common/comfyui/flux_schnell_mini_workflow'
import { useSettings } from '@/services'

// ------------------------------------------------------------------------------
// if a user is already using one of those workflows and you change its settings,
// they will have to reselect it in the UI for changes to be taken into account.
//
// -> we can create a ticket to fix this
// ------------------------------------------------------------------------------
export const comfyuiWorkflows: ClapWorkflow[] = [
  {
    id: 'comfyui://text_to_image_demo_workflow',
    label: "WIP DEMO (DOESN'T WORK)",
    description: '',
    tags: [],
    author: '',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
    provider: ClapWorkflowProvider.COMFYUI,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    data: JSON.stringify(text_to_image_demo_workflow),
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'comfyui://local/sd15',
    label: 'Local SD 1.5 (v1-5-pruned-emaonly)',
    description: 'Stable Diffusion 1.5 running on local ComfyUI',
    tags: ['local', 'sd1.5', 'image generation'],
    author: 'local',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
    provider: ClapWorkflowProvider.COMFYUI,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    data: JSON.stringify({
      '3': {
        inputs: {
          seed: 42,
          steps: 20,
          cfg: 7,
          sampler_name: 'euler',
          scheduler: 'normal',
          denoise: 1,
          model: ['4', 0],
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0],
        },
        class_type: 'KSampler',
        _meta: { title: 'KSampler' },
      },
      '4': {
        inputs: { ckpt_name: 'v1-5-pruned-emaonly.safetensors' },
        class_type: 'CheckpointLoaderSimple',
        _meta: { title: 'Load Checkpoint' },
      },
      '5': {
        inputs: { width: 512, height: 512, batch_size: 1 },
        class_type: 'EmptyLatentImage',
        _meta: { title: 'Empty Latent Image' },
      },
      '6': {
        inputs: { text: '', clip: ['4', 1] },
        class_type: 'CLIPTextEncode',
        _meta: { title: 'Positive Prompt' },
      },
      '7': {
        inputs: { text: 'text, watermark, blurry, ugly', clip: ['4', 1] },
        class_type: 'CLIPTextEncode',
        _meta: { title: 'Negative Prompt' },
      },
      '8': {
        inputs: { samples: ['3', 0], vae: ['4', 2] },
        class_type: 'VAEDecode',
        _meta: { title: 'VAE Decode' },
      },
      '9': {
        inputs: { filename_prefix: 'SD15', images: ['8', 0] },
        class_type: 'SaveImage',
        _meta: { title: 'Save Image' },
      },
    }),
    schema: '',
    inputFields: [genericPrompt, genericNegativePrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
      [genericNegativePrompt.id]: genericNegativePrompt.defaultValue,
    },
  },
  {
    id: 'comfyui://local/flux-schnell-mini',
    label: 'Local FLUX.1-Schnell (flux-mini)',
    description: 'FLUX.1-Schnell small model running on local ComfyUI',
    tags: ['local', 'flux', 'flux-schnell', 'image generation'],
    author: 'local',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
    provider: ClapWorkflowProvider.COMFYUI,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    data: JSON.stringify(flux_schnell_mini_workflow),
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
]

// this define dynamic comfyui workflow
//
// a dynamic workflow can come from a 3rd party website, a database,
// the local storage
//
// note: we should be careful because there is a 10 Mb for the local storage,
// I think.
// so users should not put too much stuff in here
export async function getDynamicComfyuiWorkflows(): Promise<ClapWorkflow[]> {
  const settings = useSettings.getState()

  const workflows: ClapWorkflow[] = [
    {
      id: 'comfyui://settings.comfyWorkflowForImage',
      label: 'Custom Image Workflow',
      description: 'Custom ComfyUI workflow to generate images',
      tags: ['custom', 'image generation'],
      author: 'You',
      thumbnailUrl: '',
      nonCommercial: false,
      engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
      provider: ClapWorkflowProvider.COMFYUI,
      category: ClapWorkflowCategory.IMAGE_GENERATION,
      data: settings.comfyClapWorkflowForImage?.data,
      schema: '',
      inputFields: settings.comfyClapWorkflowForImage?.inputFields || [
        genericPrompt,
      ],
      inputValues: settings.comfyClapWorkflowForImage?.inputValues || {
        [genericPrompt.id]: genericPrompt.defaultValue,
      },
    },
    {
      id: 'comfyui://settings.comfyWorkflowForVideo',
      label: 'Custom Video Workflow',
      description: 'Custom ComfyUI workflow to generate videos',
      tags: ['custom', 'video generation'],
      author: 'You',
      thumbnailUrl: '',
      nonCommercial: false,
      engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
      provider: ClapWorkflowProvider.COMFYUI,
      category: ClapWorkflowCategory.VIDEO_GENERATION,
      data: settings.comfyClapWorkflowForVideo.data,
      schema: '',
      inputFields: settings.comfyClapWorkflowForVideo.inputFields || [
        genericImage,
      ],
      inputValues: settings.comfyClapWorkflowForVideo.inputValues || {
        [genericImage.id]: genericImage.defaultValue,
      },
    },
    {
      id: 'comfyui://settings.comfyWorkflowForVoice',
      label: 'Custom Voice Workflow',
      description: 'Custom ComfyUI workflow to generate voice',
      tags: ['custom', 'voice generation'],
      author: 'You',
      thumbnailUrl: '',
      nonCommercial: false,
      engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
      provider: ClapWorkflowProvider.COMFYUI,
      category: ClapWorkflowCategory.VOICE_GENERATION,
      data: settings.comfyWorkflowForVoice,
      schema: '',
      inputFields: [genericPrompt],
      inputValues: {
        [genericPrompt.id]: genericPrompt.defaultValue,
      },
    },
    {
      id: 'comfyui://settings.comfyWorkflowForMusic',
      label: 'Custom Music Workflow',
      description: 'Custom ComfyUI workflow to generate music',
      tags: ['custom', 'music generation'],
      author: 'You',
      thumbnailUrl: '',
      nonCommercial: false,
      engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
      provider: ClapWorkflowProvider.COMFYUI,
      category: ClapWorkflowCategory.MUSIC_GENERATION,
      data: settings.comfyWorkflowForMusic,
      schema: '',
      inputFields: [genericPrompt],
      inputValues: {
        [genericPrompt.id]: genericPrompt.defaultValue,
      },
    },
    {
      id: 'comfyui://settings.comfyWorkflowForSound',
      label: 'Custom Sound Workflow',
      description: 'Custom ComfyUI workflow to generate sound',
      tags: ['custom', 'sound generation'],
      author: 'You',
      thumbnailUrl: '',
      nonCommercial: false,
      engine: ClapWorkflowEngine.COMFYUI_WORKFLOW,
      provider: ClapWorkflowProvider.COMFYUI,
      category: ClapWorkflowCategory.SOUND_GENERATION,
      data: settings.comfyWorkflowForSound,
      schema: '',
      inputFields: [genericPrompt],
      inputValues: {
        [genericPrompt.id]: genericPrompt.defaultValue,
      },
    },
  ]

  return workflows
}
