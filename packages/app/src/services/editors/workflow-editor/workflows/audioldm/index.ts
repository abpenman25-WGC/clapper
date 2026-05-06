import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'
import { genericPrompt } from '../common/defaultValues'

// ------------------------------------------------------------------------------
// AudioLDM workflows — local sound/music generation via the AudioLDM server
// https://github.com/haoheliu/AudioLDM
//
// Requires the AudioLDM API server running at the configured URL (default: http://localhost:5002).
// Start with:
//   cd C:\AI\audioldm_env && Scripts\activate && python audioldm_server.py
//
// The `data` field stores the duration in seconds (as a string).
// ------------------------------------------------------------------------------

export const audioLdmWorkflows: ClapWorkflow[] = [
  {
    id: 'audioldm://sound/5s',
    label: 'AudioLDM-S (local) — 5s sound',
    description: 'Local AudioLDM-S: text-to-sound, 5 seconds',
    tags: ['sound', 'local', 'audioldm', 'cpu'],
    author: 'haoheliu / AudioLDM',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.AUDIOLDM,
    category: ClapWorkflowCategory.SOUND_GENERATION,
    data: '5',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'audioldm://sound/10s',
    label: 'AudioLDM-S (local) — 10s sound',
    description: 'Local AudioLDM-S: text-to-sound, 10 seconds',
    tags: ['sound', 'local', 'audioldm', 'cpu'],
    author: 'haoheliu / AudioLDM',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.AUDIOLDM,
    category: ClapWorkflowCategory.SOUND_GENERATION,
    data: '10',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
]
