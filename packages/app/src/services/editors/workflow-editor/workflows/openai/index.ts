import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'

import {
  genericHeight1024,
  genericHeight2048,
  genericImage,
  genericPrompt,
  genericVideo,
  genericWidth1024,
  genericWidth2048,
} from '../common/defaultValues'

// ------------------------------------------------------------------------------
// if a user is already using one of those workflows and you change its settings,
// they will have to reselect it in the UI for changes to be taken into account.
//
// -> we can create a ticket to fix this
// ------------------------------------------------------------------------------
export const openaiWorkflows: ClapWorkflow[] = [
  // ============================================================================
  // ASSISTANT
  // ============================================================================
  {
    id: 'openai://gpt-4o-mini',
    label: 'GPT-4o (mini)',
    description: '',
    tags: ['GPT-4o', 'mini'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'gpt-4o-mini',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'openai://gpt-4o',
    label: 'GPT-4o',
    description: '',
    tags: ['GPT-4o'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'gpt-4o',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'openai://gpt-4-mini',
    label: 'GPT-4 (mini)',
    description: '',
    tags: ['GPT-4', 'mini'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'gpt-4o-mini',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'openai://gpt-4-turbo',
    label: 'GPT-4 (Turbo)',
    description: '',
    tags: ['GPT-4', 'turbo'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'gpt-4-turbo',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },

  // ============================================================================
  // IMAGE GENERATION
  // ============================================================================
  {
    id: 'openai://dall-e-3',
    label: 'DALL-E 3 ✅',
    description:
      'High-quality image generation. Supports 1024×1024, 1792×1024, 1024×1792. Billed per image.',
    tags: ['DALL-E', 'image'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'dall-e-3',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'openai://gpt-image-1',
    label: 'GPT-Image-1 ✅',
    description:
      'Latest OpenAI image model. Higher quality than DALL-E 3. Billed per image.',
    tags: ['gpt-image', 'image'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.IMAGE_GENERATION,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'gpt-image-1',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },

  // ============================================================================
  // VIDEO GENERATION
  // ============================================================================
  {
    id: 'openai://sora',
    label: 'Sora ✅',
    description:
      'OpenAI Sora text-to-video. Supports up to 1080p, up to 20 seconds. Billed per second of video.',
    tags: ['sora', 'video'],
    author: 'OpenAI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.VIDEO_GENERATION,
    provider: ClapWorkflowProvider.OPENAI,
    data: 'sora',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
]
