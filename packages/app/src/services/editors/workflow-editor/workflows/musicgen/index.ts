import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'
import { genericPrompt } from '../common/defaultValues'

// ------------------------------------------------------------------------------
// MusicGen workflows — local music generation via Meta's AudioCraft MusicGen
// https://github.com/facebookresearch/audiocraft
//
// Requires the MusicGen API server running at the configured URL (default: http://localhost:5003).
// Start with:
//   cd C:\AI\musicgen_env && Scripts\activate && python musicgen_server.py
//
// The `data` field encodes "model|duration_seconds", e.g. "small|10"
// ------------------------------------------------------------------------------

export const musicGenWorkflows: ClapWorkflow[] = [
  {
    id: 'musicgen://small/10s',
    label: 'MusicGen-Small (local) — 10s',
    description: 'Local Meta MusicGen-Small: text-to-music, 10 seconds. Fast on CPU.',
    tags: ['music', 'local', 'musicgen', 'meta', 'cpu'],
    author: 'Meta / AudioCraft',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.MUSICGEN,
    category: ClapWorkflowCategory.MUSIC_GENERATION,
    data: 'small|10',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'musicgen://small/20s',
    label: 'MusicGen-Small (local) — 20s',
    description: 'Local Meta MusicGen-Small: text-to-music, 20 seconds.',
    tags: ['music', 'local', 'musicgen', 'meta', 'cpu'],
    author: 'Meta / AudioCraft',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.MUSICGEN,
    category: ClapWorkflowCategory.MUSIC_GENERATION,
    data: 'small|20',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'musicgen://medium/10s',
    label: 'MusicGen-Medium (local) — 10s ⚠️ Slow on CPU',
    description: 'Local Meta MusicGen-Medium: text-to-music, 10 seconds. Slower on CPU.',
    tags: ['music', 'local', 'musicgen', 'meta', 'cpu'],
    author: 'Meta / AudioCraft',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.MUSICGEN,
    category: ClapWorkflowCategory.MUSIC_GENERATION,
    data: 'medium|10',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
]
