/**
 * Parse Trelby screenplay format (.fdx.trelby, .trelby files)
 *
 * Trelby is an open-source screenplay writing software that saves files
 * in a proprietary text format with configuration and content sections.
 *
 * @param trelbyText - Raw text content from a .trelby file
 * @returns Plain text screenplay content suitable for Broadway parsing
 */
export function importFdxTrelby(trelbyText: string): string {
  if (!trelbyText || typeof trelbyText !== 'string') {
    throw new Error('Invalid Trelby file content')
  }

  const lines = trelbyText.split('\n')
  let inScriptSection = false
  const contentLines: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Start script content detection
    if (trimmedLine === '#Start-Script') {
      inScriptSection = true
      continue
    }

    // Skip lines until we're in the script section
    if (!inScriptSection) {
      continue
    }

    // Skip empty lines and title strings outside of script
    if (trimmedLine.length === 0 || trimmedLine.startsWith('#Title-String') || trimmedLine.startsWith('#Header-')) {
      continue
    }

    // Parse Trelby content format
    if (trimmedLine.startsWith('.')) {
      const content = trimmedLine.substring(1) // Remove the leading dot

      if (content.startsWith('/')) {
        // Transition: ./FADE IN:
        contentLines.push(content.substring(1)) // Remove slash, keep transition
      } else if (content.startsWith('\\')) {
        // Special formatting or scene continuation: .\(ACT 1)
        const text = content.substring(1) // Remove backslash
        contentLines.push(text)
      } else if (content.startsWith('=')) {
        // Scene heading: .=Ext. Night - earth orbit
        contentLines.push(content.substring(1)) // Remove equals, keep scene heading
      } else if (content.startsWith('_')) {
        // Character name: ._Sid v.O.
        const charName = content.substring(1) // Remove underscore
        contentLines.push('') // Add empty line before character
        contentLines.push(charName.toUpperCase()) // Character names in caps
      } else if (content.startsWith('.')) {
        // Action/description: ..Lights start to become visible on Earth.
        const actionText = content.substring(1) // Remove extra dot
        contentLines.push(actionText)
      }
    } else if (trimmedLine.startsWith('>')) {
      // Action or dialogue
      const content = trimmedLine.substring(1) // Remove >

      if (content.startsWith(':')) {
        // Dialogue: >:For so many years we gazed
        const dialogue = content.substring(1) // Remove colon
        contentLines.push('    ' + dialogue) // Indent dialogue
      } else {
        // Action: >Shot from orbit, Earth is dark
        contentLines.push(content)
      }
    } else if (trimmedLine.startsWith('.:')) {
      // Continued dialogue: .:crisis. Then it happened.
      const dialogue = trimmedLine.substring(2) // Remove .:
      contentLines.push('    ' + dialogue) // Indent dialogue
    }
  }

  if (contentLines.length === 0) {
    throw new Error('No screenplay content found in Trelby file')
  }

  // Join lines and clean up the text
  const cleanText = contentLines
    .join('\n')
    .replace(/\\n/g, '\n') // Convert escaped newlines
    .replace(/\r/g, '') // Remove carriage returns
    .trim()

  if (!cleanText) {
    throw new Error('Empty screenplay content after parsing Trelby file')
  }

  return cleanText
}
