import { HfInference, HfInferenceEndpoint } from '@huggingface/inference'

import { ResolveRequest } from '@aitube/clapper-services'
import { ClapSegmentCategory } from '@aitube/clap'

import { generateImage } from './generateImage'
import { generateVoice } from './generateVoice'
import { generateVideo } from './generateVideo'
import { TimelineSegment } from '@aitube/timeline'

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  if (!request.settings.huggingFaceApiKey) {
    throw new Error(`Missing API key for "Hugging Face"`)
  }

  const segment = request.segment

  const hf: HfInferenceEndpoint = new HfInference(
    request.settings.huggingFaceApiKey
  )

  if (request.segment.category === ClapSegmentCategory.STORYBOARD) {
    segment.assetUrl = await generateImage(request)
  } else if (request.segment.category === ClapSegmentCategory.DIALOGUE) {
    segment.assetUrl = await generateVoice(request)
  } else if (request.segment.category === ClapSegmentCategory.VIDEO) {
    segment.assetUrl = await generateVideo(request)
  } else {
    throw new Error(
      `Clapper doesn't support ${request.segment.category} generation for provider "Hugging Face". Please open a pull request with (working code) to solve this!`
    )
  }
  return segment
}
