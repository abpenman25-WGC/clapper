import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'
import {
  genericHeight2048,
  genericPrompt,
  genericWidth2048,
} from '../common/defaultValues'

// ------------------------------------------------------------------------------
// if a user is already using one of those workflows and you change its settings,
// they will have to reselect it in the UI for changes to be taken into account.
//
// -> we can create a ticket to fix this
// ------------------------------------------------------------------------------
//
// VERIFIED WORKING MODELS FOR HUGGING FACE PRO (as of Feb 2026):
// ✅ IMAGE GENERATION:
//    - black-forest-labs/FLUX.1-schnell (fast, stable)
//    - black-forest-labs/FLUX.1-dev (high quality, stable)
//    - jbilcke-hf/flux-dev-panorama-lora-2 (panoramas)
//
// ✅ VOICE/TTS GENERATION (most reliable):
//    - parler-tts/parler_tts_mini_v0.1
//    - parler-tts/parler-tts-mini-expresso
//
// ❌ AI ASSISTANT - NOT SUPPORTED YET
//    - Hugging Face assistant models (Mixtral, Zephyr) are NOT implemented
//    - Backend needs @langchain/huggingface package which is not installed
//    - Use these WORKING alternatives instead:
//      • Mistral AI provider (requires Mistral AI API key from platform.mistral.ai)
//      • Groq provider (free API, very fast inference)
//      • OpenAI provider (GPT models)
//      • Google provider (Gemini models)
//      • Anthropic provider (Claude models)
//
// ⚠️ DEPRECATED/UNRELIABLE (commented out below):
//    - Spaces-based models (often down or rate-limited)
//    - Some TTS models with API changes
//    - Video generation spaces (unstable)
//
// ------------------------------------------------------------------------------
export const huggingfaceWorkflows: ClapWorkflow[] = [
  // VIDEO GENERATION - Commented out: Spaces are unreliable and often discontinued
  // {
  //   id: 'huggingface://spaces/hpcai-tech/open-sora',
  //   label: 'Open-Sora (Video, Free) - DEPRECATED',
  //   description:
  //     'Text-to-video generation using the open-sora model (Hugging Face Spaces, free tier) - Often unavailable',
  //   tags: ['video', 'open-sora', 'free', 'deprecated'],
  //   author: 'hpcai-tech',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.VIDEO_GENERATION,
  //   data: 'spaces/hpcai-tech/open-sora',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },

  // ============================================================================
  // IMAGE GENERATION - These models are verified and stable
  // ============================================================================
  {
    id: 'huggingface://models/black-forest-labs/FLUX.1-schnell',
    label: 'FLUX.1 [schnell] ✅ RECOMMENDED',
    description: 'Fast, high-quality image generation (most reliable)',
    tags: ['flux', 'recommended'],
    author: 'BFL (https://BlackForestLabs.ai)',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    data: 'black-forest-labs/FLUX.1-schnell',
    schema: '',
    inputFields: [genericPrompt, genericWidth2048, genericHeight2048],
    inputValues: {
      prompt: genericPrompt.defaultValue,
      width: genericWidth2048.defaultValue,
      height: genericHeight2048.defaultValue,
    },
  },
  {
    id: 'huggingface://models/black-forest-labs/FLUX.1-dev',
    label: 'FLUX.1 [dev] ✅ RECOMMENDED',
    description: 'High-quality image generation with more control',
    tags: ['flux', 'recommended'],
    author: 'BFL (https://BlackForestLabs.ai)',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    data: 'black-forest-labs/FLUX.1-dev',
    schema: '',
    /**
     * Inputs of the workflow (this is used to build an UI for the workflow automatically)
     */
    inputFields: [
      genericPrompt,
      genericWidth2048,
      genericHeight2048,

      // TODO: add guidance scale and number of steps
    ],
    inputValues: {
      prompt: genericPrompt.defaultValue,
      width: genericWidth2048.defaultValue,
      height: genericHeight2048.defaultValue,

      // TODO: add guidance scale and number of steps
    },
  },
  {
    id: 'huggingface://models/jbilcke-hf/flux-dev-panorama-lora-2',
    label: 'FLUX.1 Panorama ✅ RECOMMENDED',
    description: 'Generate 360° panoramas using Flux',
    tags: ['flux', '360°', 'panorama', 'recommended'],
    author: '@jbilcke-hf',
    // TODO add specific field about licensing?
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    data: 'jbilcke-hf/flux-dev-panorama-lora-2',
    schema: '',
    inputFields: [genericPrompt, genericWidth2048, genericHeight2048],
    inputValues: {
      prompt: genericPrompt.defaultValue,
      width: genericWidth2048.defaultValue,
      height: genericHeight2048.defaultValue,
    },
  },

  // ============================================================================
  // VOICE/TTS GENERATION - Recommended: Use ParlerTTS models
  // ============================================================================

  // Note: Some TTS models may have API compatibility issues
  // Commented out models that are known to have issues:
  // - Coqui XTTS-v2 (API changes)
  // - MyShell.ai models (unreliable API)
  // - WhisperSpeech (compatibility issues)
  // - MetaVoice (API changes)

  // {
  //   id: 'huggingface://models/coqui/XTTS-v2',
  //   label: 'Coqui XTTS-v2 - MAY HAVE ISSUES',
  //   description: 'May have API compatibility issues',
  //   tags: ['TTS'],
  //   author: 'Coqui',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.VOICE_GENERATION,
  //   data: 'coqui/XTTS-v2',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },
  // {
  //   id: 'huggingface://models/myshell-ai/OpenVoiceV2',
  //   label: 'MyShell.ai OpenVoiceV2 - MAY HAVE ISSUES',
  //   description: 'May have API compatibility issues',
  //   tags: ['TTS'],
  //   author: 'MyShell.ai',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.VOICE_GENERATION,
  //   data: 'myshell-ai/OpenVoiceV2',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },
  // {
  //   id: 'huggingface://models/myshell-ai/OpenVoice',
  //   label: 'MyShell.ai OpenVoice - MAY HAVE ISSUES',
  //   description: 'May have API compatibility issues',
  //   tags: ['TTS'],
  //   author: 'MyShell.ai',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.VOICE_GENERATION,
  //   data: 'myshell-ai/OpenVoice',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },
  // {
  //   id: 'huggingface://models/WhisperSpeech/WhisperSpeech',
  //   label: 'WhisperSpeech - MAY HAVE ISSUES',
  //   description: 'May have API compatibility issues',
  //   tags: ['TTS'],
  //   author: 'WhisperSpeech',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.VOICE_GENERATION,
  //   data: 'WhisperSpeech/WhisperSpeech',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },
  // {
  //   id: 'huggingface://models/metavoiceio/metavoice-1B-v0.1',
  //   label: 'MetaVoice 1B v0.1 - MAY HAVE ISSUES',
  //   description: 'May have API compatibility issues',
  //   tags: ['TTS'],
  //   author: 'MetaVoice (themetavoice.xyz)',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.VOICE_GENERATION,
  //   data: 'metavoiceio/metavoice-1B-v0.1',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },
  // ParlerTTS models - RECOMMENDED for TTS (most reliable)
  {
    id: 'huggingface://models/parler-tts/parler_tts_mini_v0.1',
    label: 'ParlerTTS Mini v0.1 ✅ RECOMMENDED',
    description: 'Reliable text-to-speech model',
    tags: ['TTS', 'recommended'],
    author: 'ParlerTTS',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'parler-tts/parler_tts_mini_v0.1',
    schema: '',
    /**
     * Inputs of the workflow (this is used to build an UI for the workflow automatically)
     */
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'huggingface://models/parler-tts/parler-tts-mini-expresso',
    label: 'ParlerTTS Mini Expresso ✅ RECOMMENDED',
    description: 'Reliable expressive text-to-speech model',
    tags: ['TTS', 'recommended'],
    author: 'ParlerTTS',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'parler-tts/parler-tts-mini-expresso',
    schema: '',
    /**
     * Inputs of the workflow (this is used to build an UI for the workflow automatically)
     */
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },

  // ============================================================================
  // AI ASSISTANT - NOT IMPLEMENTED YET
  // ============================================================================
  // ⚠️ Hugging Face ASSISTANT models are NOT supported yet in Clapper
  // The backend code needs ChatHuggingFace from LangChain which is not installed
  // 
  // These models are COMMENTED OUT because they don't work:
  // {
  //   id: 'huggingface://models/HuggingFaceH4/zephyr-7b-beta',
  //   label: 'Zephyr 7b (beta) - NOT IMPLEMENTED',
  //   description: 'Not supported - use Groq or other providers instead',
  //   tags: ['Zephyr', 'not-implemented'],
  //   author: 'Hugging Face H4',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.ASSISTANT,
  //   data: 'HuggingFaceH4/zephyr-7b-beta',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },
  // {
  //   id: 'huggingface://models/mistralai/Mixtral-8x7B-Instruct-v0.1',
  //   label: 'Mixtral 8x7b - NOT IMPLEMENTED',
  //   description: 'Not supported - use Mistral AI provider directly instead',
  //   tags: ['Mixtral', 'not-implemented'],
  //   author: 'Mistral AI',
  //   thumbnailUrl: '',
  //   nonCommercial: false,
  //   engine: ClapWorkflowEngine.REST_API,
  //   provider: ClapWorkflowProvider.HUGGINGFACE,
  //   category: ClapWorkflowCategory.ASSISTANT,
  //   data: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  //   schema: '',
  //   inputFields: [genericPrompt],
  //   inputValues: {
  //     prompt: genericPrompt.defaultValue,
  //   },
  // },

  // ============================================================================
  // MUSIC GENERATION - May have compatibility issues
  // ============================================================================
  {
    id: 'huggingface://models/cvssp/audioldm2-music',
    label: 'AudioLDM2 Music ⚠️ May have issues',
    description:
      'Text-to-music generation using AudioLDM2 (may have API compatibility issues)',
    tags: ['music', 'audioldm2', 'free'],
    author: 'CVSSP',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.MUSIC_GENERATION,
    data: 'cvssp/audioldm2-music',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },

  // ============================================================================
  // SOUND GENERATION - May have compatibility issues
  // ============================================================================
  {
    id: 'huggingface://models/haoheliu/audio-ldm-s-full',
    label: 'AudioLDM-S ⚠️ May have issues',
    description:
      'Text-to-sound generation using AudioLDM-S (may have API compatibility issues)',
    tags: ['sound', 'audioldm', 'free'],
    author: 'haoheliu',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.SOUND_GENERATION,
    data: 'haoheliu/audio-ldm-s-full',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },

  {
    id: 'huggingface://models/rvencu/AudioLDM-sound-effect',
    label: 'AudioLDM Sound Effect ⚠️ May have issues',
    description:
      'Text-to-sound effect generation using AudioLDM (may have API compatibility issues)',
    tags: ['sound', 'audioldm', 'free'],
    author: 'rvencu',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.HUGGINGFACE,
    category: ClapWorkflowCategory.SOUND_GENERATION,
    data: 'rvencu/AudioLDM-sound-effect',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
]
