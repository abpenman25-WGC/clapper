import path from 'path'
import os from 'os'
import fs from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'

import { TimelineSegment } from '@aitube/timeline'
import { ResolveRequest } from '@aitube/clapper-services'
import { ClapSegmentCategory } from '@aitube/clap'

const execFileAsync = promisify(execFile)

export async function resolveSegment(
  request: ResolveRequest
): Promise<TimelineSegment> {
  const segment: TimelineSegment = request.segment

  if (segment.category !== ClapSegmentCategory.DIALOGUE) {
    // Piper only handles voice/dialogue
    return segment
  }

  const text = request.prompts.voice.positive
  if (!text) {
    throw new Error(
      `PiperTTS.resolveSegment: cannot generate voice without a text prompt`
    )
  }

  const exePath =
    request.settings.piperTtsExePath ||
    'C:\\AI\\PiperTTS\\piper\\piper.exe'

  const voicesDir =
    request.settings.piperTtsVoicesPath ||
    'C:\\AI\\PiperTTS\\voices'

  // `data` holds the voice model filename, e.g. "en_US-lessac-medium.onnx"
  const modelFile = request.generationWorkflow?.data || 'en_US-lessac-medium.onnx'
  const modelPath = path.join(voicesDir, modelFile)

  if (!fs.existsSync(modelPath)) {
    throw new Error(
      `PiperTTS: voice model not found at "${modelPath}". ` +
      `Please download it from https://huggingface.co/rhasspy/piper-voices and place it in "${voicesDir}".`
    )
  }

  // Write text to a temp file to avoid shell injection via stdin piping
  const tmpDir = os.tmpdir()
  const tmpInput = path.join(tmpDir, `piper_in_${Date.now()}.txt`)
  const tmpOutput = path.join(tmpDir, `piper_out_${Date.now()}.wav`)

  try {
    fs.writeFileSync(tmpInput, text, 'utf-8')

    await execFileAsync(exePath, [
      '--model', modelPath,
      '--output_file', tmpOutput,
    ], {
      // feed the text via stdin by reading the file through a shell pipe isn't possible
      // with execFile directly — use input option instead
      input: text,
      timeout: 60000,
      maxBuffer: 50 * 1024 * 1024,
    } as Parameters<typeof execFileAsync>[2] & { input?: string })

    if (!fs.existsSync(tmpOutput)) {
      throw new Error(`PiperTTS: output WAV file was not created`)
    }

    const wavBuffer = fs.readFileSync(tmpOutput)
    const base64Audio = wavBuffer.toString('base64')
    segment.assetUrl = `data:audio/wav;base64,${base64Audio}`
  } finally {
    if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput)
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput)
  }

  return segment
}
