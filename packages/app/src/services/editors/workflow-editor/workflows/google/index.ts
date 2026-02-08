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

// Model names for Google AI Studio (using API key):
// https://ai.google.dev/gemini-api/docs/models/gemini
export const googleWorkflows: ClapWorkflow[] = [
  {
    id: 'google://gemini-pro',
    label: 'Gemini Pro',
    description: '',
    tags: ['Gemini', 'pro'],
    author: 'Google AI Studio',
    thumbnailUrl: '',
    nonCommercial: false,
    engine: ClapWorkflowEngine.REST_API,
    category: ClapWorkflowCategory.ASSISTANT,
    provider: ClapWorkflowProvider.GOOGLE,
    data: 'gemini-pro',
    schema: '',
    inputFields: [genericPrompt],
    inputValues: {
      prompt: genericPrompt.defaultValue,
    },
  },
]
