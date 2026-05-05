import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'
import { ClapSegmentCategory } from '@aitube/clap'

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  const segment: TimelineSegment = request.segment

  if (segment.category !== ClapSegmentCategory.DIALOGUE) {
    return segment
  }

  const text = request.prompts.voice.positive
  if (!text) {
    throw new Error(
      `BarkTTS.resolveSegment: cannot generate voice without a text prompt`
    )
  }

  const apiUrl =
    request.settings.barkTtsApiUrl?.replace(/\/$/, '') ||
    'http://localhost:5001'

  // The `data` field of the workflow holds the voice preset (e.g. "v2/en_speaker_6")
  const voicePreset = request.generationWorkflow?.data || null

  const response = await fetch(`${apiUrl}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      ...(voicePreset ? { voice_preset: voicePreset } : {}),
    }),
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
      `BarkTTS server error (${response.status})${detail ? ': ' + detail : ''}. ` +
        `Make sure the Bark server is running: cd C:\\AI\\bark && venv\\Scripts\\activate && python server.py`
    )
  }

  const audioBuffer = await response.arrayBuffer()
  const base64Audio = Buffer.from(audioBuffer).toString('base64')
  segment.assetUrl = `data:audio/wav;base64,${base64Audio}`

  return segment
}
