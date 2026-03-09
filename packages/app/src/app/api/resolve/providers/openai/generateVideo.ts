import { ClapImageRatio } from '@aitube/clap'
import { ResolveRequest } from '@aitube/clapper-services'

const TAG = 'OpenAI.generateVideo'

// Sora supports 480p and 1080p resolutions
// width x height options: 1920x1080, 1080x1920, 1080x1080, 1280x720, 720x1280, 720x720
// 480p options: 854x480, 480x854, 480x480
function getResolution(orientation: ClapImageRatio | undefined): {
  width: number
  height: number
} {
  if (orientation === ClapImageRatio.PORTRAIT) return { width: 1080, height: 1920 }
  if (orientation === ClapImageRatio.SQUARE) return { width: 1080, height: 1080 }
  return { width: 1920, height: 1080 }
}

export async function generateVideo(
  apiKey: string,
  request: ResolveRequest
): Promise<string> {
  const TAG_LOCAL = TAG

  if (!request.prompts.image.positive) {
    throw new Error(`${TAG_LOCAL}: cannot generate without a valid prompt`)
  }

  const { width, height } = getResolution(
    request.meta.orientation as ClapImageRatio
  )

  const durationSeconds = Math.min(
    20,
    Math.max(
      5,
      Math.round(
        (request.segment.endTimeInMs - request.segment.startTimeInMs) / 1000
      )
    )
  )

  // Submit the generation job
  const submitResponse = await fetch(
    'https://api.openai.com/v1/video/generations',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora',
        prompt: request.prompts.image.positive,
        width,
        height,
        n_seconds: durationSeconds,
        n_variants: 1,
      }),
    }
  )

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text()
    throw new Error(`${TAG_LOCAL}: job submission failed ${submitResponse.status} — ${errorText}`)
  }

  const job = await submitResponse.json()
  const jobId: string | undefined = job.id

  if (!jobId) {
    throw new Error(`${TAG_LOCAL}: no job ID returned from Sora`)
  }

  console.log(`${TAG_LOCAL}: started Sora job ${jobId}`)

  // Poll until complete
  return await pollSoraJob(apiKey, jobId)
}

async function pollSoraJob(
  apiKey: string,
  jobId: string,
  maxAttempts = 60,
  intervalMs = 10000
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs))

    const res = await fetch(
      `https://api.openai.com/v1/video/generations/${jobId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`OpenAI.pollSoraJob: poll failed ${res.status} — ${errorText}`)
    }

    const status = await res.json()

    if (status.status === 'completed' || status.status === 'succeeded') {
      // The video URL is in status.data[0].url or status.generations[0].url
      const videoUrl =
        status.data?.[0]?.url ||
        status.generations?.[0]?.url ||
        status.video_url

      if (!videoUrl) {
        throw new Error(
          `OpenAI.pollSoraJob: job completed but no video URL found`
        )
      }

      // Fetch the video and return as base64 data URI
      const videoRes = await fetch(videoUrl)
      if (!videoRes.ok) {
        throw new Error(
          `OpenAI.pollSoraJob: failed to download video (${videoRes.status})`
        )
      }
      const buffer = await videoRes.arrayBuffer()
      const b64 = Buffer.from(buffer).toString('base64')
      return `data:video/mp4;base64,${b64}`
    }

    if (status.status === 'failed' || status.status === 'error') {
      throw new Error(
        `OpenAI.pollSoraJob: job failed — ${status.error || JSON.stringify(status)}`
      )
    }

    console.log(
      `OpenAI.pollSoraJob: attempt ${attempt + 1}/${maxAttempts} — status: ${status.status}`
    )
  }

  throw new Error(`OpenAI.pollSoraJob: timed out waiting for Sora job ${jobId}`)
}
