

/**
 * Determines whether a line is part of a dialogue block.
 *
 * Rules supported:
 * - Character names are ALL CAPS and not indented.
 * - Dialogue lines are typically indented, but some scripts do not indent the final line.
 * - Parentheticals are indented and wrapped in parentheses.
 * - Multi‑line dialogue blocks are allowed.
 *
 * This function does NOT trim leading whitespace, because indentation
 * is meaningful in screenplay formatting.
 */

export function isDialogueLine(
  fullLine: string,
  previousLineWasCharacterName: boolean
): boolean {

  // Preserve indentation — do NOT trim
  const raw = fullLine || "";

  // Empty lines are never dialogue
  if (raw.trim().length === 0) {
    return false;
  }

  // Detect indentation (spaces or tabs)
  const hasIndentation = /^[ \t]+/.test(raw);

  // Detect parentheticals (e.g., "(whispering)")
  const trimmed = raw.trim();
  const isParenthetical =
    hasIndentation &&
    trimmed.startsWith("(") &&
    trimmed.endsWith(")");

  // Dialogue rule #1:
  // If the previous line was a CHARACTER NAME, the next non-empty line
  // is dialogue — even if it is NOT indented.
  //
  // This fixes the bug where the *last line* of dialogue is not indented
  // and therefore gets misclassified as description.
  if (previousLineWasCharacterName) {
    return true;
  }

  // Dialogue rule #2:
  // Parentheticals inside dialogue blocks count as dialogue.
  if (isParenthetical) {
    return true;
  }

  // Dialogue rule #3:
  // Continuation lines inside a dialogue block are indented.
  if (hasIndentation) {
    return true;
  }

  // Otherwise, not dialogue.
  return false;
}