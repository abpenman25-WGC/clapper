import { UUID } from "@aitube/clap"

import { analyzeLine } from "@/analysis/analyzeLine"
import { Screenplay, ScreenplaySequence } from "@/types"
import { parseScenes } from "@/analysis/parseScenes"

/**
 * Splits the screenplay into sequences (scene headings + their content).
 * This version fixes the classic "last line disappears" bug by ensuring
 * the final text buffer is ALWAYS flushed, even if the screenplay ends
 * with dialogue, action, or transitions.
 */
export async function getScreenplayFromText(fullText: string): Promise<Screenplay> {
  // Split into lines, preserving empty lines
  const lines = fullText.split(/\r?\n/)

  const sequences: ScreenplaySequence[] = []

  let pendingTransition = "Cut to"
  let textBuffer = ""
  let lineNumberBuffer = 0

  let reconstructedFullText = ""

  lines.forEach((rawLine, lineNumber) => {
    // Normalize CRLF
    const line = rawLine.replaceAll("\r", "")
    reconstructedFullText += `${line}\n`

    // Ignore page numbers like "12."
    if (line.match(/^\d+\.$/)) {
      return
    }

    const {
      isTransition,
      isSceneDescription,
      timeType,
      transitionType,
      locationName,
      locationType
    } = analyzeLine(line)

    // Track transitions like "CUT TO:", "DISSOLVE TO:", etc.
    if (isTransition && transitionType) {
      pendingTransition = transitionType
    }

    // If NOT a scene heading → append to buffer and continue
    if (!isSceneDescription) {
      textBuffer += `${line}\n`
      lineNumberBuffer = lineNumber
      return
    }

    // If we reach a new scene heading, flush the previous buffer
    const previousSequence = sequences.at(-1)
    if (previousSequence) {
      previousSequence.fullText = textBuffer
      previousSequence.endAtLine = lineNumberBuffer
    }

    // Reset buffer for the new scene
    textBuffer = `${line}\n`
    lineNumberBuffer = lineNumber

    // Create new sequence
    sequences.push({
      id: UUID(),
      location:
        locationName
          ? [locationName]
          : previousSequence
            ? previousSequence.location
            : ["Unknown location"],
      type:
        locationType !== "UNKNOWN"
          ? locationType
          : previousSequence
            ? previousSequence.type
            : "UNKNOWN",
      time:
        timeType !== "UNKNOWN"
          ? timeType
          : previousSequence
            ? previousSequence.time
            : "UNKNOWN",
      transition: transitionType || pendingTransition,
      fullText: "",
      startAtLine: lineNumber,
      endAtLine: lineNumber,
      scenes: []
    })
  })

  // 🔥 FINAL FLUSH — ALWAYS flush the last buffer
  const lastSequence = sequences.at(-1)
  if (lastSequence) {
    lastSequence.fullText = textBuffer
    lastSequence.endAtLine = lineNumberBuffer
  }

  // Parse scenes inside each sequence
  for (const sequence of sequences) {
    sequence.scenes = parseScenes(sequence)
  }

  return {
    fullText: reconstructedFullText,
    sequences
  }
}