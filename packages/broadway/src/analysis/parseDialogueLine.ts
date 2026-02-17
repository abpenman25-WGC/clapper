export function parseDialogueLine(line: string): string {
  let lineWithSpaces = ` ${line || ""} `;

  if (line === " .. " || line === " ... ") {
    return "";
  }

  // Only treat ALL CAPS as a character name if it's a single "word"
  const trimmed = lineWithSpaces.trim();
  const isSingleWord = !trimmed.includes(" ");

  if (isAllCaps(trimmed) && isSingleWord) {
    return "";
  }

  // Remove fancy quotes
  lineWithSpaces = lineWithSpaces.replaceAll("“", "").replaceAll("”", "");

  return lineWithSpaces.trim();
}