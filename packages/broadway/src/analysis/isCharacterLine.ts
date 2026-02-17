

/**
 * Determines whether a line is a CHARACTER NAME line.
 *
 * Rules:
 * - Character names are ALL CAPS.
 * - They may be centered or lightly indented.
 * - They contain no trailing punctuation except optional colon or period.
 * - They are usually short (1–4 words).
 * - They are NOT scene headers or transitions.
 */

export function isCharacterLine(fullLine: string): boolean {
  const raw = fullLine || "";
  const trimmed = raw.trim();

  // Empty lines are never character names
  if (trimmed.length === 0) {
    return false;
  }

  // Must be ALL CAPS (letters, spaces, numbers, apostrophes, hyphens)
  if (!/^[A-Z0-9 '\-\.]+$/.test(trimmed)) {
    return false;
  }

  // Remove optional trailing punctuation
  const cleaned = trimmed.replace(/[.:]$/, "");

  // Character names are usually short (1–4 words)
  const words = cleaned.split(/\s+/);
  if (words.length > 4) {
    return false;
  }

  // Reject scene headers (INT., EXT., DAY, NIGHT, etc.)
  if (/^(INT|EXT|INT\/EXT|I\/E)\b/.test(cleaned)) {
    return false;
  }
  if (/\b(DAY|NIGHT|NOON|MORNING|EVENING)\b/.test(cleaned)) {
    return false;
  }

  // Reject transitions
  if (/\b(CUT TO|FADE IN|FADE OUT|DISSOLVE TO)\b/.test(cleaned)) {
    return false;
  }

  // Reject parentheticals
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    return false;
  }

  // If it passed all filters, it's a character name
  return true;
}