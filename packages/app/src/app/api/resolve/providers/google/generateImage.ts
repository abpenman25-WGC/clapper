import { GoogleAuth } from 'google-auth-library'
import { ClapImageRatio } from '@aitube/clap'
import { ResolveRequest } from '@aitube/clapper-services'

const TAG = `Google.generateImage`

export async function generateImage(request: ResolveRequest): Promise<string> {
  if (!request.settings.imageGenerationWorkflow.data) {
    throw new Error(
      `${TAG}: cannot generate without a valid imageGenerationWorkflow.data`
    )
  }

  if (!request.prompts.image.positive) {
    throw new Error(
      `${TAG}: cannot generate without a valid positive image prompt`
    )
  }

  const projectId = request.settings.googleProjectId
  const location = request.settings.googleLocation || 'us-central1'
  const model = request.settings.imageGenerationWorkflow.data

  if (!projectId) {
    throw new Error(
      `${TAG}: missing Google Project ID — set it in Settings under Google`
    )
  }

  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  })

  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token

  if (!token) {
    throw new Error(
      `${TAG}: failed to obtain a Google access token — check that GOOGLE_APPLICATION_CREDENTIALS is set`
    )
  }

  const aspectRatio =
    request.meta.orientation === ClapImageRatio.SQUARE
      ? '1:1'
      : request.meta.orientation === ClapImageRatio.PORTRAIT
        ? '9:16'
        : '16:9'

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [
        {
          prompt: request.prompts.image.positive,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio,
        outputOptions: {
          mimeType: 'image/jpeg',
        },
        addWatermark: false,
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${TAG}: ${response.status} — ${errorText}`)
  }

  const data = await response.json()
  const prediction = data.predictions?.[0]

  if (!prediction?.bytesBase64Encoded) {
    throw new Error(`${TAG}: no image data returned from Imagen`)
  }

  const mimeType = prediction.mimeType || 'image/jpeg'
  return `data:${mimeType};base64,${prediction.bytesBase64Encoded}`
}
