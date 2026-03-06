import { ClapSegmentCategory } from '@aitube/clap'
import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'

import { generateImage } from './generateImage'
import { generateVideo } from './generateVideo'
import {
  builtinProviderCredentialsGoogle,
  clapperApiKeyToUseBuiltinCredentials,
} from '@/app/api/globalSettings'

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  let apiKey = request.settings.googleApiKey

  if (!apiKey) {
    if (clapperApiKeyToUseBuiltinCredentials) {
      if (
        request.settings.clapperApiKey !== clapperApiKeyToUseBuiltinCredentials
      ) {
        throw new Error(`Missing API key for "Google"`)
      } else {
        apiKey = builtinProviderCredentialsGoogle
      }
    } else {
      apiKey = builtinProviderCredentialsGoogle
    }
  }

  const segment = request.segment

  if (request.segment.category === ClapSegmentCategory.IMAGE) {
    segment.assetUrl = await generateImage(request)
  } else if (request.segment.category === ClapSegmentCategory.VIDEO) {
    segment.assetUrl = await generateVideo(request)
  } else {
    throw new Error(
      `Clapper doesn't support ${request.segment.category} generation for provider "Google". Please open a pull request with (working code) to solve this!`
    )
  }

  return segment
}
