/**
 * Measure text width in a canvas using a given font.
 */
function getTextWidthInCanvas(text: string, font: string): number {
  if (typeof window === "undefined") return 0;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 0;

  context.font = font;
  return context.measureText(text).width;
}

// Precompute character widths for a specific font
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789()_-"+=,;:?/\\&@# '.split('');

const charLength: Record<string, number> = characters.reduce((acc, char) => {
  acc[char] = getTextWidthInCanvas(char, "400 13px Arial");
  return acc;
}, {} as Record<string, number>);

// Fallback width for characters we didn't precompute
let defaultCharLength = 7.5;

// Match actual font size used in WebGL
const webglFontWidthFactor = 1.0;

/**
 * Conservative width for a single character.
 */
export function getWebGLCharWidth(char: string = ""): number {
  const scaleFactor = 0.85;
  return scaleFactor * webglFontWidthFactor * (charLength[char] || defaultCharLength);
}

/**
 * Compute width of a full string.
 */
export function getWebGLTextWidth(text: string = ""): number {
  return text.split("").reduce((sum, c) => sum + getWebGLCharWidth(c), 0);
}

/**
 * Clamp a text to a given width and maximum number of lines.
 * NEW VERSION — preserves newlines and wraps each paragraph independently.
 */
export function clampWebGLText(
  input: string,
  maxWidthInPixels: number,
  maxNbLines: number
): string[] {
  if (!input) return [""];

  // Split into paragraphs by real newlines
  const paragraphs = input.split(/\r?\n/);

  const finalLines: string[] = [];

  for (const paragraph of paragraphs) {
    const text = paragraph.trim();

    // Preserve intentional blank lines
    if (!text) {
      finalLines.push("");
      continue;
    }

    // Split on spaces/tabs, but keep punctuation attached to words
    const words = text.split(/[ \t]+/).filter(Boolean);

    let buffer = "";
    let width = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = getWebGLTextWidth(word);
      const spaceWidth = getWebGLCharWidth(" ");

      // Handle extremely long words that exceed max width on their own
      if (wordWidth > maxWidthInPixels) {
        // Flush current buffer as a line first
        if (buffer.length > 0) {
          finalLines.push(buffer.trim());
          buffer = "";
          width = 0;
        }

        let truncated = "";
        let tw = 0;
        const ellipsisWidth = getWebGLTextWidth("...");
        const targetWidth = maxWidthInPixels - ellipsisWidth;

        for (let j = 0; j < word.length; j++) {
          const cw = getWebGLCharWidth(word[j]);
          if (tw + cw > targetWidth) break;
          truncated += word[j];
          tw += cw;
        }

        finalLines.push(truncated + "...");
        continue;
      }

      const testWidth =
        buffer.length > 0 ? width + spaceWidth + wordWidth : wordWidth;

      if (testWidth > maxWidthInPixels && buffer.length > 0) {
        // Word doesn't fit on this line, flush buffer
        finalLines.push(buffer.trim());
        buffer = word;
        width = wordWidth;
      } else {
        // Word fits, append to buffer
        if (buffer.length > 0) {
          buffer += " " + word;
          width += spaceWidth + wordWidth;
        } else {
          buffer = word;
          width = wordWidth;
        }
      }
    }

    // Flush final line of this paragraph
    if (buffer.length > 0) {
      finalLines.push(buffer.trim());
    }
  }

  // Enforce max lines with ellipsis on the last visible line
  if (finalLines.length > maxNbLines) {
    const truncated = finalLines.slice(0, maxNbLines);
    truncated[maxNbLines - 1] = truncated[maxNbLines - 1] + "...";
    return truncated;
  }

  return finalLines.length > 0 ? finalLines : [""];
}

/**
 * Legacy naive clamp (kept for compatibility).
 */
export function clampWebGLTextNaive(
  input: string = "",
  maxWidthInPixels: number = 0
): string {
  const maxInCharacters = Math.ceil(maxWidthInPixels / 3.4);
  const text = `${input || ""}`;

  return text.length >= maxInCharacters
    ? `${text.slice(0, maxInCharacters)}..`
    : text;
}