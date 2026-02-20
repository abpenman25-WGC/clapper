/**
 * Trelby importer aligned with parseScenes indentation rules.
 *
 * - Scene headings: no indent
 * - Character names: 12 spaces
 * - Dialogue: 8 spaces
 * - Action: no indent
 */
export function importFdxTrelby(trelbyText: string): string {
  if (!trelbyText || typeof trelbyText !== "string") {
    throw new Error("Invalid Trelby file content");
  }

  const lines = trelbyText.split("\n");
  let inScriptSection = false;
  const out: string[] = [];

  const CHAR_INDENT = "            "; // 12 spaces
  const DIALOG_INDENT = "        ";   // 8 spaces

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Start of script
    if (line === "#Start-Script") {
      inScriptSection = true;
      continue;
    }

    if (!inScriptSection) continue;

    // Preserve blank lines (they terminate events)
    if (line.length === 0) {
      out.push("");
      continue;
    }

    // Skip metadata
    if (line.startsWith("#Title-String") || line.startsWith("#Header-")) {
      continue;
    }

    // Dot-prefix system
    if (line.startsWith(".")) {
      const content = line.slice(1);

      // Scene heading: .=INT. HOUSE - DAY
      if (content.startsWith("=")) {
        out.push(content.slice(1).trim());
        continue;
      }

      // Character: ._JOHN
      if (content.startsWith("_")) {
        const name = content.slice(1).trim().toUpperCase();
        out.push(""); // blank line before character
        out.push(CHAR_INDENT + name);
        continue;
      }

      // Transition: ./FADE OUT:
      if (content.startsWith("/")) {
        out.push(content.slice(1).trim());
        continue;
      }

      // Special formatting: .\ACT 1
      if (content.startsWith("\\")) {
        out.push(content.slice(1).trim());
        continue;
      }

      // Action: ..Lights flicker
      if (content.startsWith(".")) {
        out.push(content.slice(1).trim());
        continue;
      }

      // Fallback: treat as action
      out.push(content.trim());
      continue;
    }

    // > prefix system
    if (line.startsWith(">")) {
      const content = line.slice(1);

      // Dialogue: >:Hello there
      if (content.startsWith(":")) {
        const dialog = content.slice(1).trim();
        out.push(DIALOG_INDENT + dialog);
        continue;
      }

      // Action: >The ship descends
      out.push(content.trim());
      continue;
    }

    // Continued dialogue: .:Hello again
    if (line.startsWith(".:")) {
      const dialog = line.slice(2).trim();
      out.push(DIALOG_INDENT + dialog);
      continue;
    }

    // Fallback: treat as action
    out.push(line);
  }

  if (out.length === 0) {
    throw new Error("No screenplay content found in Trelby file");
  }

  const clean = out
    .map(l => l.replace(/^\.+/, "").trimEnd()) // strip stray leading dots
    .join("\n")
    .replace(/\r/g, "");

  return clean + "\n";
}