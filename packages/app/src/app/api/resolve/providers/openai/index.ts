import { ClapSegmentCategory } from '@aitube/clap'
import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'

import { generateImage } from './generateImage'
import { generateVideo } from './generateVideo'
import {
  builtinProviderCredentialsOpenai,
  clapperApiKeyToUseBuiltinCredentials,
} from '@/app/api/globalSettings'

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  let apiKey = request.settings.openaiApiKey

  if (!apiKey) {
    if (clapperApiKeyToUseBuiltinCredentials) {
      if (
        request.settings.clapperApiKey !== clapperApiKeyToUseBuiltinCredentials
      ) {
        throw new Error(`Missing API key for "OpenAI"`)
      } else {
        apiKey = builtinProviderCredentialsOpenai
      }
    } else {
      apiKey = builtinProviderCredentialsOpenai
    }
  }

  if (!apiKey) {
    throw new Error(`Missing API key for "OpenAI"`)
  }

  const segment: TimelineSegment = request.segment

  if (request.segment.category === ClapSegmentCategory.IMAGE) {
    segment.assetUrl = await generateImage(apiKey, request)
  } else if (request.segment.category === ClapSegmentCategory.VIDEO) {
    segment.assetUrl = await generateVideo(apiKey, request)
  } else {
    throw new Error(
      `Clapper doesn't support ${request.segment.category} generation for provider "OpenAI". Please open a pull request with (working code) to solve this!`
    )
  }

  return segment
}
