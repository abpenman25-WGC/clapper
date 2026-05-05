import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'
import { genericPrompt } from '../common/defaultValues'

// ------------------------------------------------------------------------------
// Bark TTS workflows — local voice generation via the Bark server
// https://github.com/suno-ai/bark
//
// Requires the Bark API server running at the configured URL (default: http://localhost:5001).
// Start with:
//   cd C:\AI\bark && venv\Scripts\activate && python server.py
//
// The `data` field stores the voice preset (Bark speaker ID), or empty for auto.
// ------------------------------------------------------------------------------
export const barkTtsWorkflows: ClapWorkflow[] = [
  {
    id: 'barktts://auto',
    label: 'Local Bark TTS: Auto (neutral)',
    description: 'Bark TTS with automatic voice selection',
    tags: ['TTS', 'local', 'Bark', 'Suno'],
    author: 'Suno AI / Bark',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.BARKTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: '',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'barktts://v2/en_speaker_0',
    label: 'Local Bark TTS: English Speaker 0',
    description: 'Bark TTS – English male voice 0',
    tags: ['TTS', 'local', 'Bark', 'English'],
    author: 'Suno AI / Bark',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.BARKTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'v2/en_speaker_0',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'barktts://v2/en_speaker_1',
    label: 'Local Bark TTS: English Speaker 1',
    description: 'Bark TTS – English voice 1',
    tags: ['TTS', 'local', 'Bark', 'English'],
    author: 'Suno AI / Bark',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.BARKTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'v2/en_speaker_1',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'barktts://v2/en_speaker_6',
    label: 'Local Bark TTS: English Speaker 6 (warm)',
    description: 'Bark TTS – warm English voice 6, good for narration',
    tags: ['TTS', 'local', 'Bark', 'English', 'narration'],
    author: 'Suno AI / Bark',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.BARKTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'v2/en_speaker_6',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'barktts://v2/en_speaker_9',
    label: 'Local Bark TTS: English Speaker 9',
    description: 'Bark TTS – English voice 9',
    tags: ['TTS', 'local', 'Bark', 'English'],
    author: 'Suno AI / Bark',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.BARKTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'v2/en_speaker_9',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
]
