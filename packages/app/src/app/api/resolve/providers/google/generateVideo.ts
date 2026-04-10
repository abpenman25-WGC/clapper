import { GoogleAuth } from 'google-auth-library'
import { ClapImageRatio } from '@aitube/clap'
import { ResolveRequest } from '@aitube/clapper-services'

const TAG = 'Google.generateVideo'

export async function generateVideo(request: ResolveRequest): Promise<string> {
  if (!request.settings.videoGenerationWorkflow.data) {
    throw new Error(
      `${TAG}: cannot generate without a valid videoGenerationWorkflow.data`
    )
  }

  const projectId = request.settings.googleProjectId
  const location = request.settings.googleLocation || 'us-central1'
  const model = request.settings.videoGenerationWorkflow.data

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

  // Veo only accepts 4, 6, or 8 seconds — snap to nearest valid value
  const rawDuration = Math.round(
    (request.segment.endTimeInMs - request.segment.startTimeInMs) / 1000
  )
  const validDurations = [4, 6, 8]
  const durationSeconds = validDurations.reduce((prev, curr) =>
    Math.abs(curr - rawDuration) < Math.abs(prev - rawDuration) ? curr : prev
  )

  const instance: Record<string, unknown> = {
    prompt: request.prompts.image.positive || '',
  }

  // Include the input image for image-to-video generation when available
  if (request.prompts.video.image) {
    const parts = request.prompts.video.image.split(';base64,')
    const bytesBase64Encoded = parts[1] || ''
    const mimeType =
      (parts[0] || 'data:image/jpeg').replace('data:', '') || 'image/jpeg'
    instance.image = {
      bytesBase64Encoded,
      mimeType,
    }
  }

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predictLongRunning`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        aspectRatio,
        sampleCount: 1,
        durationSeconds,
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${TAG}: ${response.status} — ${errorText}`)
  }

  const operation = await response.json()
  const operationName: string | undefined = operation.name

  if (!operationName) {
    throw new Error(`${TAG}: no operation name returned from Veo`)
  }

  console.log(`${TAG}: started long-running operation ${operationName}`)
  return await pollVideoOperation(operationName, token, location, projectId, model)
}

async function pollVideoOperation(
  operationName: string,
  token: string,
  location: string,
  projectId: string,
  model: string,
  maxPollingCount = 60,
  intervalMs = 10000
): Promise<string> {
  // Veo uses fetchPredictOperation (POST) rather than a standard GET LRO endpoint
  const pollEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:fetchPredictOperation`

  return new Promise((resolve, reject) => {
    let pollingCount = 0

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(pollEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operationName }),
          cache: 'no-store',
        })

        if (!res.ok) {
          clearInterval(intervalId)
          const errorText = await res.text()
          return reject(
            new Error(`${TAG}: polling error ${res.status} — ${errorText}`)
          )
        }

        const data = await res.json()

        if (data.error) {
          clearInterval(intervalId)
          return reject(new Error(`${TAG}: ${data.error.message}`))
        }

        if (!data.done) {
          pollingCount++
          if (pollingCount >= maxPollingCount) {
            clearInterval(intervalId)
            reject(new Error(`${TAG}: operation timed out after polling`))
          }
          return
        }

        clearInterval(intervalId)

        // Veo returns videos in response.predictions or response.videos
        const predictions =
          data.response?.predictions || data.response?.videos || []

        if (!predictions.length) {
          return reject(new Error(`${TAG}: no video returned from Veo`))
        }

        const videoData = predictions[0]
        const videoBytes =
          videoData.bytesBase64Encoded ||
          videoData.video?.bytesBase64Encoded ||
          videoData.video

        if (!videoBytes) {
          return reject(new Error(`${TAG}: no video bytes in Veo response`))
        }

        resolve(`data:video/mp4;base64,${videoBytes}`)
      } catch (error) {
        clearInterval(intervalId)
        reject(error)
      }
    }, intervalMs)
  })
}
