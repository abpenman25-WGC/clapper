import { SpaceEntry, SpaceRuntime } from '@huggingface/hub'
// import type { ApiInfo, EndpointInfo, JsApiData } from '@gradio/client/dist/types.js'

// Using any for Gradio types to avoid import issues with React 19/Next.js 16
type ApiInfo = any
type EndpointInfo = any
type JsApiData = any

export interface HFSpace {
  name?: string
  cardData: unknown
  runtime: SpaceRuntime
  tags: string[]
  models: string[]
}

export interface HFSpaceStatus {
  _id: string
  id: string
  author: string
  sha: string
  lastModified: string
  private: boolean
  gated: boolean
  disabled: boolean
  host: string
  subdomain: string
  tags: string[]
  likes: number
  sdk: string
  runtime: SpaceRuntime
  createdAt: string
}

export type HFHubCategory = 'spaces' | 'models'

export type GradioApiInfo = any

export type SupportedFields = {
  inputPositiveTextPrompt: string
  hasPositiveTextPrompt: boolean

  inputNegativeTextPrompt: string
  hasNegativeTextPrompt: boolean

  inputImage: string
  hasInputImage: boolean

  inputAudio: string
  hasInputAudio: boolean

  inputWidth: string | number
  hasInputWidth: boolean

  inputHeight: string | number
  hasInputHeight: boolean

  inputSteps: string | number
  hasInputSteps: boolean

  inputGuidance: string | number
  hasInputGuidance: boolean

  inputSeed: string | number
  hasInputSeed: boolean
}

export type GradioEndpoint = {
  isNamed: boolean
  name: string
  endpoint: any
  fields: Record<string, Partial<SupportedFields>>
  score: number
}
