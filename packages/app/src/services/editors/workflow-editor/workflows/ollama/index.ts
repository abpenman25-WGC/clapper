import {
  ClapWorkflow,
  ClapWorkflowEngine,
  ClapWorkflowCategory,
  ClapWorkflowProvider,
} from '@aitube/clap'

import { genericPrompt } from '../common/defaultValues'

// ------------------------------------------------------------------------------
// Ollama workflows — local OpenAI-compatible LLM server (https://ollama.com)
// These require Ollama to be installed and running on localhost:11434
// Install: https://ollama.com/download/windows
// Run a model first, e.g.: ollama pull phi3
// ------------------------------------------------------------------------------
export const ollamaWorkflows: ClapWorkflow[] = [
  {
    id: 'ollama://phi3',
    label: 'Phi-3 Mini (fastest, CPU-friendly)',
    description:
      'Microsoft Phi-3 Mini — small, fast, great for assistant tasks. Run: ollama pull phi3',
    tags: ['Phi-3', 'local', 'CPU'],
    author: 'Microsoft',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OLLAMA,
    data: 'phi3',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'ollama://llama3.2',
    label: 'Llama 3.2 3B (balanced)',
    description:
      'Meta Llama 3.2 3B — balanced speed and quality. Run: ollama pull llama3.2',
    tags: ['Llama3', 'local', 'CPU'],
    author: 'Meta',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OLLAMA,
    data: 'llama3.2',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'ollama://llama3.1',
    label: 'Llama 3.1 8B (best reasoning)',
    description:
      'Meta Llama 3.1 8B — best reasoning, slower on CPU. Run: ollama pull llama3.1',
    tags: ['Llama3', 'local', 'CPU'],
    author: 'Meta',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OLLAMA,
    data: 'llama3.1',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
  {
    id: 'ollama://mistral',
    label: 'Mistral 7B Instruct',
    description:
      'Mistral 7B Instruct — good all-rounder. Run: ollama pull mistral',
    tags: ['Mistral', 'local', 'CPU'],
    author: 'Mistral AI',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.OLLAMA,
    data: 'mistral',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
]
