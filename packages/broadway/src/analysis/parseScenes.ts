import { UUID } from "@aitube/clap"

import { isAllCaps } from "@/utils/isAllCaps"
import { analyzeLine } from "@/analysis/analyzeLine"
import { Scene, SceneEvent, ScreenplaySequence } from "@/types"

import { parseCharacterName } from "@/analysis/parseCharacterName"

/**
 * Detects screenplay scene headers in Trelby-style scripts.
 */
function isSceneHeader(line: string): boolean {
  if (!line) return false

  const trimmed = line.trim()

  // Standard screenplay headers
  const sceneHeaderRegex = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|EST\.)/i

  // Trelby sometimes omits the dot:
  // INT - HOUSE - DAY
  const looseHeaderRegex = /^(INT|EXT)[\s\-]/i

  // Handles dash-separated headers with unicode dashes
  const dashHeaderRegex = /^(INT\.|EXT\.)\s+.+[\-–—]\s*.+/i

  return (
    sceneHeaderRegex.test(trimmed) ||
    looseHeaderRegex.test(trimmed) ||
    dashHeaderRegex.test(trimmed)
  )
}

/**
 * Check whether the given line contains a character dialogue or action bitmap.
 */
function isDialogueLine(fullLine: string): boolean {
  const containsTabulation = fullLine.startsWith("        ")
  if (!containsTabulation) return false
  return true
}

/**
 * Check whether the given line contains a character name.
 */
function isCharacterLine(fullLine: string): boolean {
  const containsTabulation = fullLine.startsWith("            ")
  return containsTabulation
}

/**
 * Parse screenplay script into scenes and events.
 */
export function parseScenes(screenplaySequence: ScreenplaySequence): Scene[] {
  try {
    const screenplay = screenplaySequence.fullText

    let currentScene: Scene | undefined = undefined
    let currentEvents: SceneEvent[] = []
    let currentEvent: SceneEvent | undefined = undefined

    let currentDialogueAction = ""
    let lastCharacter = ""

    let lineNumber = screenplaySequence.startAtLine
    const scenes: Scene[] = []

    for (const lineWithSpaces of screenplay.split("\n")) {
      const line = lineWithSpaces.trim()

      // Skip page numbers like "12."
      if (/^\d+\.$/.test(line)) {
        lineNumber += 1
        continue
      }

      // --- SCENE HEADER DETECTION -----------------------------------------
      if (isSceneHeader(lineWithSpaces)) {
        if (currentScene) {
          if (currentEvent) {
            currentEvents.push(currentEvent)
            currentEvent = undefined
          }

          currentScene.events = currentEvents
          scenes.push(currentScene)

          currentEvents = []
          currentScene = undefined
        }

        currentScene = {
          id: UUID(),
          scene: line.trim(),
          line,
          rawLine: lineWithSpaces,
          sequenceFullText: screenplaySequence.fullText,
          sequenceStartAtLine: screenplaySequence.startAtLine,
          sequenceEndAtLine: screenplaySequence.endAtLine,
          startAtLine: lineNumber,
          endAtLine: lineNumber,
          events: [],
        }

        currentDialogueAction = ""
        lastCharacter = ""

        lineNumber += 1
        continue
      }
      // --------------------------------------------------------------------

      // CHARACTER LINE DETECTION
      const maybeCharacter = parseCharacterName(lineWithSpaces)
      const isCharacter = isCharacterLine(lineWithSpaces)

      if (isCharacter && maybeCharacter) {
        lastCharacter = maybeCharacter

        if (currentScene) {
          if (currentEvent) {
            currentEvents.push(currentEvent)
          }
          currentEvent = undefined

          currentScene.events = currentEvents
          scenes.push(currentScene)

          currentEvents = []
          currentScene = undefined
        }

        currentScene = {
          id: UUID(),
          scene: "",
          line,
          rawLine: lineWithSpaces,
          sequenceFullText: screenplaySequence.fullText,
          sequenceStartAtLine: screenplaySequence.startAtLine,
          sequenceEndAtLine: screenplaySequence.endAtLine,
          startAtLine: lineNumber,
          endAtLine: lineNumber,
          events: [],
        }

        currentDialogueAction = ""
        lineNumber += 1
        continue
      }

      // EMPTY LINE TERMINATES CURRENT EVENT
      if (!line.length) {
        if (currentEvent) {
          currentEvents.push(currentEvent)
          currentEvent = undefined
        }

        lineNumber += 1
        continue
      }

      // ACTION / DIALOGUE / DESCRIPTION LOGIC
      const startOfAction = line.startsWith("(")
      const endOfAction = line.endsWith(")")
      const isDialogue = isDialogueLine(lineWithSpaces)

      if (startOfAction) {
        if (currentEvent) {
          currentEvents.push(currentEvent)
          currentEvent = undefined
        }

        const action = endOfAction
          ? line.replaceAll("(", "").replaceAll(")", "")
          : line.replaceAll("(", "")

        currentDialogueAction = action

        currentEvent = {
          id: UUID(),
          type: "action",
          character: lastCharacter,
          description: action,
          behavior: "",
          startAtLine: lineNumber,
          endAtLine: lineNumber,
        }
      } else if (endOfAction && currentEvent?.type === "action") {
        const action = currentEvent.description.trim()
          ? `${currentEvent.description.trim()} ${line.replace(")", "")}`
          : line.replace(")", "")

        currentEvent.description = action
        currentDialogueAction = action

        currentEvent.endAtLine = lineNumber
        currentEvents.push(currentEvent)
        currentEvent = undefined
      } else if (currentEvent) {
        const typeHasChanged = isDialogue && currentEvent.type !== "dialogue"

        if (currentEvent.type === "description") {
          currentDialogueAction = ""
        }

        if (typeHasChanged) {
          currentEvents.push(currentEvent)
          currentEvent = undefined

          currentEvent = {
            id: UUID(),
            type: isDialogue ? "dialogue" : "action",
            character: lastCharacter,
            description: line,
            behavior: isDialogue ? currentDialogueAction : "",
            startAtLine: lineNumber,
            endAtLine: lineNumber,
          }
        } else {
          currentEvent.description = currentEvent.description.trim()
            ? `${currentEvent.description.trim()} ${line}`
            : `${line}`

          currentEvent.endAtLine = lineNumber
        }
      } else {
        currentEvent = {
          id: UUID(),
          type: lastCharacter && isDialogue ? "dialogue" : "description",
          character: lastCharacter && isDialogue ? lastCharacter : "",
          description: `${line}`,
          behavior: isDialogue ? currentDialogueAction : "",
          startAtLine: lineNumber,
          endAtLine: lineNumber,
        }
      }

      lineNumber += 1
    }

    // FINAL FLUSH AT EOF
    if (currentScene) {
      if (currentEvent) {
        currentEvents.push(currentEvent)
      }

      currentScene.events = currentEvents
      scenes.push(currentScene)
    }

    // SPLIT ACTION EVENTS INTO SENTENCES
    for (const scene of scenes) {
      const sceneEvents: SceneEvent[] = []

      for (const event of scene.events) {
        if (event.type === "action") {
          const sentences = event.description.split(/[\.!?]\s+/)

          for (const sentence of sentences) {
            const trimmed = sentence.trim()
            if (!trimmed) continue

            sceneEvents.push({
              ...event,
              description: trimmed,
            })
          }
        } else {
          sceneEvents.push(event)
        }
      }

      scene.events = sceneEvents
    }

    return scenes
  } catch (err) {
    console.error(err)
    return []
  }
}