/**
  * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
  * 
  * @param {String} text The text to be rendered.
  * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
  * 
  * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
  */

import { useTimeline } from ".."

function getTextWidthInCanvas(text: string, font: string) {
  if (typeof window === "undefined") {
    return 0
  }
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) { return 0 }

  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
}


// one option could be to pre-compute some of the width
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789()_-"+=,;:?/\\&@#'.split('')
const charLength = characters.reduce((acc, char) => ({
  ...acc,
  [char]: getTextWidthInCanvas(char, "bold Arial")
}), {} as Record<string, number>)
let defaultCharLength = 5.561523437

// change this whenever you modify the font size
// Drastically reduced to prevent any truncation - characters are much narrower than estimated
const webglFontWidthFactor = 0.3

/**
 * Compute the text of a simple Arial text in a WebGL environmment
 * This actually just do a lookup + sum
 * 
 * @param text 
 * @returns 
 */
export function getWebGLCharWidth(char: string = ""): number {

  const cellWidthInPixels = useTimeline.getState().cellWidth

  // Much lower multiplier to prevent truncation - actual character widths are smaller
  let responsiveHack = 0.3

  if (cellWidthInPixels < 16) {
    responsiveHack = 0.35
  } else if (cellWidthInPixels < 24) {
    responsiveHack = 0.33
  } else if (cellWidthInPixels < 48) {
    responsiveHack = 0.31
  } else if (cellWidthInPixels < 128) {
    responsiveHack = 0.3
  } else {
    responsiveHack = 0.28
  }
  return responsiveHack * webglFontWidthFactor * (charLength[char] || defaultCharLength)
}

/**
 * Compute the text of a simple Arial text in a WebGL environmment
 * This actually just do a lookup + sum
 * 
 * @param text 
 * @returns 
 */
export function getWebGLTextWidth(text: string = ""): number {
  return text.split('').reduce((s, c) => (s + getWebGLCharWidth(c)), 0)
}

/**
 * Clamp a text to a given width and maximum number of lines
 * @param input - The text to wrap
 * @param maxWidthInPixels - Maximum width in pixels per line
 * @param maxNbLines - Maximum number of lines to allow
 * @returns Array of wrapped text lines
 */
export function clampWebGLText(
  input: string,
  maxWidthInPixels: number,
  maxNbLines: number
): string[] {
  let buffer = ""
  let width = 0
  let lines: string[] = []

  const text = `${input || ""}`.replace('\n', ' ').trim()
  const characters = text.split('')
  for (const c of characters) {
    width += getWebGLCharWidth(c)
    buffer += c
    if (width >= maxWidthInPixels) {
      // Check if we've reached max lines before adding more
      if (lines.length >= maxNbLines - 1) {
        // Last line - truncate with ellipsis if needed
        const words = buffer.split(" ")
        if (words.length > 1) {
          lines.push(words.slice(0, -1).join(" ") + "...")
        } else {
          lines.push(buffer + "...")
        }
        return lines
      }
      
      // Never truncate with "..", just wrap to next line
      const words = buffer.split(" ")
      const lastWord = (words.at(-1) || "")
      if (lastWord.length) {
        lines.push(words.slice(0, -1).join(" "))
        buffer = lastWord
        width = getWebGLTextWidth(lastWord)
      } else {
         lines.push(buffer)
         buffer = ""
         width = 0
      }
    }
  }

  if (buffer.length) {
    // Check if we've exceeded max lines
    if (lines.length >= maxNbLines) {
      // Replace last line with truncated version
      lines[maxNbLines - 1] = lines[maxNbLines - 1] + "..."
      return lines.slice(0, maxNbLines)
    }
    lines.push(buffer)
  }
  
  return lines
}

export function clampWebGLTextNaive(input: string = "", maxWidthInPixels: number = 0): string {
  // this cutoff is very approximate as we should make it dependent on each character's width
  // a simple heuristic can be to count the uppercase / lower case
  const maxhInCharacter = Math.ceil(maxWidthInPixels / 3.4)

  const text = `${input || ""}`

  return (text.length >= maxhInCharacter)
              ? `${text.slice(0, maxhInCharacter)}..`
              : text
   
}