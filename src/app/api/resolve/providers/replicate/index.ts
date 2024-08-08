import Replicate from 'replicate'

import { ClapSegmentCategory } from '@aitube/clap'
import { ResolveRequest } from '@aitube/clapper-services'
import { TimelineSegment } from '@aitube/timeline'

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  if (!request.settings.replicateApiKey) {
    throw new Error(`Missing API key for "Replicate.com"`)
  }
  const replicate = new Replicate({ auth: request.settings.replicateApiKey })

  if (request.segment.category !== ClapSegmentCategory.STORYBOARD) {
    throw new Error(
      `Clapper doesn't support ${request.segment.category} generation for provider "Replicate". Please open a pull request with (working code) to solve this!`
    )
  }

  const segment = request.segment

  // this mapping isn't great, we should use something auto-adapting
  // like we are doing for Hugging Face (match the fields etc)
  if (request.segment.category === ClapSegmentCategory.STORYBOARD) {
    let params: object = {}
    if (
      request.settings.imageGenerationWorkflow.data === 'fofr/pulid-lightning'
    ) {
      params = {
        prompt: request.prompts.image.positive,
        face_image: request.prompts.image.identity,
      }
    } else if (
      request.settings.imageGenerationWorkflow.data === 'zsxkib/pulid'
    ) {
      params = {
        prompt: request.prompts.image.positive,
        main_face_image: request.prompts.image.identity,
      }
    } else {
      params = {
        prompt: request.prompts.image.positive,
      }
    }
    const response = (await replicate.run(
      request.settings.imageGenerationWorkflow as any,
      { input: params }
    )) as any
    segment.assetUrl = `${response.output || ''}`
  } else if (request.segment.category === ClapSegmentCategory.DIALOGUE) {
    const response = (await replicate.run(
      request.settings.voiceGenerationWorkflow.data as any,
      {
        input: {
          text: request.prompts.voice.positive,
          audio: request.prompts.voice.identity,
        },
      }
    )) as any
    segment.assetUrl = `${response.output || ''}`
  } else if (request.segment.category === ClapSegmentCategory.VIDEO) {
    const response = (await replicate.run(
      request.settings.videoGenerationWorkflow.data as any,
      {
        input: {
          image: request.prompts.video.image,
        },
      }
    )) as any
    segment.assetUrl = `${response.output || ''}`
  } else {
    throw new Error(
      `Clapper doesn't support ${request.segment.category} generation for provider "Replicate". Please open a pull request with (working code) to solve this!`
    )
  }

  return segment
}
