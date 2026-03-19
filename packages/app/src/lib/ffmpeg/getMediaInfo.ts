import { tmpdir } from 'node:os'
import { writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

import ffmpeg from 'fluent-ffmpeg'

export type MediaMetadata = {
  durationInSec: number
  durationInMs: number
  hasAudio: boolean
}

/**
 * Get the media info of a base64 or file path
 * @param input
 * @returns
 */
export async function getMediaInfo(input: string): Promise<MediaMetadata> {
  // If the input is a base64 string
  if (input.startsWith('data:')) {
    // Extract the base64 content
    // Extract the base64 content
    const [head, tail] = input.split(';base64,')
    if (!tail) {
      throw new Error('Invalid base64 data')
    }

    const extension = head.split('/').pop() || ''
    const base64Content = tail || ''

    // Decode the base64 content to a buffer
    const buffer = Buffer.from(base64Content, 'base64')

    // Generate a temporary file name
    const tempFileName = join(tmpdir(), `temp-media-${Date.now()}.${extension}`)

    // Write the buffer to a temporary file
    await writeFile(tempFileName, buffer)

    // Get metadata from the temporary file then delete the file
    try {
      return await getMetaDataFromPath(tempFileName)
    } finally {
      await rm(tempFileName)
    }
  }

  // If the input is a path to the file
  return await getMetaDataFromPath(input)
}

async function getMetaDataFromPath(filePath: string): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    let finished = false
    const done = (results: MediaMetadata) => {
      if (!finished) {
        finished = true
        resolve(results)
      }
    }

    const defaultResults: MediaMetadata = {
      durationInSec: 0,
      durationInMs: 0,
      hasAudio: false,
    }

    try {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          console.error(
            'getMediaInfo(): failed to analyze the source (might happen with empty files or missing ffprobe)',
            err
          )
          done(defaultResults)
          return
        }

        try {
          const results: MediaMetadata = {
            durationInSec: metadata?.format?.duration || 0,
            durationInMs: (metadata?.format?.duration || 0) * 1000,
            hasAudio: (metadata?.streams || []).some(
              (stream) => stream.codec_type === 'audio'
            ),
          }
          done(results)
        } catch (err) {
          console.error(
            `getMediaInfo(): failed to analyze the source (might happen with empty files)`,
            err
          )
          done(defaultResults)
        }
      })
    } catch (err) {
      // ffprobe binary not found or other synchronous error
      console.error('getMediaInfo(): ffprobe unavailable, skipping media analysis', err)
      done(defaultResults)
    }
  })
}
