import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'
import { ClapSegmentCategory } from '@aitube/clap'

// Local AudioLDM server — runs at http://localhost:5002 by default.
// Start with:
//   cd C:\AI\audioldm_env && Scripts\activate && python audioldm_server.py
//
// POST /generate  { prompt: string, duration?: number }
// Returns: audio/wav binary

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  const segment: TimelineSegment = request.segment

  if (
    segment.category !== ClapSegmentCategory.SOUND &&
    segment.category !== ClapSegmentCategory.MUSIC
  ) {
    throw new Error(
      `AudioLDM only supports SOUND and MUSIC segments. Got: ${segment.category}`
    )
  }

  const prompt = request.segment.prompt
  if (!prompt) {
    throw new Error(`AudioLDM.resolveSegment: cannot generate without a prompt`)
  }

  const apiUrl =
    (request.settings as any).audioLdmApiUrl?.replace(/\/$/, '') ||
    'http://localhost:5002'

  // duration comes from the workflow data field (seconds), default 5
  const duration = Number(request.generationWorkflow?.data) || 5

  const response = await fetch(`${apiUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, duration }),
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
      `AudioLDM server error (${response.status})${detail ? ': ' + detail : ''}. ` +
        `Make sure the AudioLDM server is running: ` +
        `cd C:\\AI\\audioldm_env && Scripts\\activate && python audioldm_server.py`
    )
  }

  const audioBuffer = await response.arrayBuffer()
  const base64Audio = Buffer.from(audioBuffer).toString('base64')
  segment.assetUrl = `data:audio/wav;base64,${base64Audio}`

  return segment
}
