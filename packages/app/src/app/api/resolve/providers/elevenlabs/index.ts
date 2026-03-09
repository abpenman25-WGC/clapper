import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'
import { ClapSegmentCategory } from '@aitube/clap'

import {
  builtinProviderCredentialsElevenlabs,
  clapperApiKeyToUseBuiltinCredentials,
} from '@/app/api/globalSettings'

// ElevenLabs free-tier default voice: Rachel
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

// Free-tier compatible model (multilingual v2 works on free plan)
const DEFAULT_TTS_MODEL = 'eleven_multilingual_v2'

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  let apiKey = request.settings.elevenLabsApiKey

  if (!apiKey) {
    if (clapperApiKeyToUseBuiltinCredentials) {
      if (
        request.settings.clapperApiKey !== clapperApiKeyToUseBuiltinCredentials
      ) {
        throw new Error(`Missing API key for "ElevenLabs"`)
      } else {
        apiKey = builtinProviderCredentialsElevenlabs
      }
    } else {
      apiKey = builtinProviderCredentialsElevenlabs
    }
  }

  if (!apiKey) {
    throw new Error(`Missing API key for "ElevenLabs"`)
  }

  const segment: TimelineSegment = request.segment

  if (request.segment.category === ClapSegmentCategory.DIALOGUE) {
    const text = request.prompts.voice.positive
    if (!text) {
      throw new Error(
        `ElevenLabs.resolveSegment: cannot generate voice without a text prompt`
      )
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: DEFAULT_TTS_MODEL,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `ElevenLabs TTS request failed (${response.status}): ${errorText}`
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    segment.assetUrl = `data:audio/mpeg;base64,${base64Audio}`
  } else if (request.segment.category === ClapSegmentCategory.SOUND) {
    const text = request.segment.prompt
    if (!text) {
      throw new Error(
        `ElevenLabs.resolveSegment: cannot generate sound without a prompt`
      )
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/sound-generation`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          duration_seconds: 5,
          prompt_influence: 0.3,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `ElevenLabs sound generation request failed (${response.status}): ${errorText}`
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    segment.assetUrl = `data:audio/mpeg;base64,${base64Audio}`
  } else {
    throw new Error(
      `Clapper doesn't support ${request.segment.category} generation for provider "ElevenLabs". Please open a pull request with (working code) to solve this!`
    )
  }

  return segment
}
