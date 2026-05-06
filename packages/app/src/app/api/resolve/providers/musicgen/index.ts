import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'
import { ClapSegmentCategory } from '@aitube/clap'

// Local MusicGen server — runs at http://localhost:5003 by default.
// Start with:
//   cd C:\AI\musicgen_env && Scripts\activate && python musicgen_server.py
//
// POST /generate  { prompt: string, duration?: number, model?: string }
// Returns: audio/wav binary

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  const segment: TimelineSegment = request.segment

  if (
    segment.category !== ClapSegmentCategory.MUSIC &&
    segment.category !== ClapSegmentCategory.SOUND
  ) {
    throw new Error(
      `MusicGen only supports MUSIC and SOUND segments. Got: ${segment.category}`
    )
  }

  const prompt = request.segment.prompt
  if (!prompt) {
    throw new Error(`MusicGen.resolveSegment: cannot generate without a prompt`)
  }

  const apiUrl =
    (request.settings as any).musicGenApiUrl?.replace(/\/$/, '') ||
    'http://localhost:5003'

  // data field encodes "model|duration" e.g. "small|10" or just "small"
  const dataParts = (request.generationWorkflow?.data || 'small|10').split('|')
  const model = dataParts[0] || 'small'
  const duration = Number(dataParts[1]) || 10

  const response = await fetch(`${apiUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, duration, model }),
  })

  if (!response.ok) {
    let detail = ''
    try {
      const err = await response.json()
      detail = err?.error || ''
    } catch {
      detail = await response.text()
    }
    throw new Error(
      `MusicGen server error (${response.status})${detail ? ': ' + detail : ''}. ` +
        `Make sure the MusicGen server is running: ` +
        `cd C:\\AI\\musicgen_env && Scripts\\activate && python musicgen_server.py`
    )
  }

  const audioBuffer = await response.arrayBuffer()
  const base64Audio = Buffer.from(audioBuffer).toString('base64')
  segment.assetUrl = `data:audio/wav;base64,${base64Audio}`

  return segment
}
