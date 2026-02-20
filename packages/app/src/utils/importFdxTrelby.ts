/**
 * Trelby importer aligned with parseScenes indentation rules.
 *
 * - Scene headings: no indent
 * - Character names: 12 spaces
 * - Dialogue: 8 spaces
 * - Action: no indent
 *
 * IMPORTANT:
 * We must NOT trim indentation before classification.
 * Trelby sometimes emits wrapped dialogue lines starting with ":" but indented.
 * If we trim first, we lose the indentation signal and misclassify them.
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
    // 🔍 DEBUG: Show the exact raw line, including hidden characters
    console.log("RAW:", JSON.stringify(rawLine));

    const trimmed = rawLine.trim();   // for content
    const line = rawLine;             // preserve indentation for classification

    // Start of script
    if (trimmed === "#Start-Script") {
      inScriptSection = true;
      continue;
    }

    if (!inScriptSection) continue;

    // Preserve blank lines (they terminate events)
    if (trimmed.length === 0) {
      out.push("");
      continue;
    }

    // Skip metadata
    if (trimmed.startsWith("#Title-String") || trimmed.startsWith("#Header-")) {
      continue;
    }

    // -------------------------
    // DOT PREFIX SYSTEM
    // -------------------------
    if (trimmed.startsWith(".")) {
      const content = trimmed.slice(1);

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

    // -------------------------
    // > PREFIX SYSTEM
    // -------------------------
    if (trimmed.startsWith(">")) {
      const content = trimmed.slice(1);

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

    // -------------------------
    // CONTINUED DIALOGUE: .:Hello again
    // -------------------------
    if (trimmed.startsWith(".:")) {
      const dialog = trimmed.slice(2).trim();
      out.push(DIALOG_INDENT + dialog);
      continue;
    }

    // -------------------------
    // *** CRITICAL FIX ***
    // Wrapped dialogue lines that begin with ":" but are indented.
    //
    // Example raw input:
    //     "        :for action."
    //
    // We must detect indentation BEFORE trimming.
    // -------------------------
    const leadingSpaces = rawLine.match(/^\s*/)?.[0].length ?? 0;

    if (leadingSpaces >= 4 && trimmed.startsWith(":")) {
      const dialog = trimmed.slice(1).trim();
      out.push(DIALOG_INDENT + dialog);
      continue;
    }

    // -------------------------
    // Fallback: treat as action
    // -------------------------
    out.push(trimmed);
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