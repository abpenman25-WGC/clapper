import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'
import { genericPrompt } from '../common/defaultValues'

// ------------------------------------------------------------------------------
// Piper TTS workflows — local voice generation via piper.exe
// https://github.com/rhasspy/piper
//
// The `data` field stores the voice model filename (without path).
// The resolver uses settings.piperTtsVoicesPath to build the full .onnx path.
// ------------------------------------------------------------------------------
export const piperTtsWorkflows: ClapWorkflow[] = [
  {
    id: 'pipertts://en_US-lessac-medium',
    label: 'Local Piper TTS: Lessac (US English, Medium)',
    description: 'High-quality US English voice, CPU-friendly',
    tags: ['TTS', 'local', 'English'],
    author: 'Rhasspy / Piper',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.PIPERTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'en_US-lessac-medium.onnx',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'pipertts://en_US-amy-medium',
    label: 'Local Piper TTS: Amy (US English, Medium)',
    description: 'US English female voice, CPU-friendly',
    tags: ['TTS', 'local', 'English'],
    author: 'Rhasspy / Piper',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.PIPERTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'en_US-amy-medium.onnx',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
  {
    id: 'pipertts://en_GB-alba-medium',
    label: 'Local Piper TTS: Alba (GB English, Medium)',
    description: 'British English female voice, CPU-friendly',
    tags: ['TTS', 'local', 'English', 'British'],
    author: 'Rhasspy / Piper',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    provider: ClapWorkflowProvider.PIPERTTS,
    category: ClapWorkflowCategory.VOICE_GENERATION,
    data: 'en_GB-alba-medium.onnx',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      [genericPrompt.id]: genericPrompt.defaultValue,
    },
  },
]
