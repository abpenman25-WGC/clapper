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
  [char]: getTextWidthInCanvas(char, "400 13px Arial")  // Match actual WebGL rendering
}), {} as Record<string, number>)
let defaultCharLength = 7.5  // Updated for 13px font size

// Match the actual fontSize used in TextCell.tsx
const webglFontWidthFactor = 1.0  // Direct 1:1 mapping since we now measure at actual size

/**
 * Compute the text of a simple Arial text in a WebGL environmment
 * This actually just do a lookup + sum
 * 
 * @param text 
 * @returns 
 */
export function getWebGLCharWidth(char: string = ""): number {
  // Be very conservative to prevent any overflow
  const scaleFactor = 0.85  // Much more conservative to ensure text always fits
  return scaleFactor * webglFontWidthFactor * (charLength[char] || defaultCharLength)
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

  // Normalize text: collapse multiple spaces, preserve punctuation properly
  const text = `${input || ""}`
    .replace(/\n/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .trim()
  
  // Split by spaces but keep punctuation attached to words
  const words = text.split(' ').filter(w => w.length > 0)
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const wordWidth = getWebGLTextWidth(word)
    const spaceWidth = getWebGLCharWidth(' ')
    
    // Handle words that are individually too long
    if (wordWidth > maxWidthInPixels) {
      // If we have content in buffer, flush it first
      if (buffer.length > 0) {
        if (lines.length >= maxNbLines) {
          lines[maxNbLines - 1] = lines[maxNbLines - 1] + "..."
          return lines.slice(0, maxNbLines)
        }
        lines.push(buffer.trim())
        buffer = ""
        width = 0
      }
      
      // Truncate the long word to fit
      let truncatedWord = ""
      let truncatedWidth = 0
      const ellipsisWidth = getWebGLTextWidth("...")
      const targetWidth = maxWidthInPixels - ellipsisWidth
      
      for (let j = 0; j < word.length; j++) {
        const char = word[j]
        const charWidth = getWebGLCharWidth(char)
        if (truncatedWidth + charWidth > targetWidth) {
          break
        }
        truncatedWord += char
        truncatedWidth += charWidth
      }
      
      if (lines.length >= maxNbLines) {
        lines[maxNbLines - 1] = truncatedWord + "..."
        return lines.slice(0, maxNbLines)
      }
      lines.push(truncatedWord + "...")
      continue
    }
    
    // Width of current buffer + space + word
    const testWidth = buffer.length > 0 
      ? width + spaceWidth + wordWidth 
      : wordWidth
    
    if (testWidth > maxWidthInPixels && buffer.length > 0) {
      // Word doesn't fit, push current buffer to new line
      if (lines.length >= maxNbLines) {
        // Reached max lines, truncate and return
        lines[maxNbLines - 1] = lines[maxNbLines - 1].trim() + "..."
        return lines.slice(0, maxNbLines)
      }
      
      lines.push(buffer.trim())
      buffer = word
      width = wordWidth
    } else {
      // Word fits, add it to buffer
      if (buffer.length > 0) {
        buffer += ' ' + word
        width += spaceWidth + wordWidth
      } else {
        buffer = word
        width = wordWidth
      }
    }
  }

  // Add remaining buffer as final line
  if (buffer.length > 0) {
    if (lines.length >= maxNbLines) {
      // Replace last line with truncated version
      lines[maxNbLines - 1] = lines[maxNbLines - 1].trim() + "..."
      return lines.slice(0, maxNbLines)
    }
    lines.push(buffer.trim())
  }
  
  return lines.length > 0 ? lines : [""]
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