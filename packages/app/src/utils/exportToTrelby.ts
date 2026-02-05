/**
 * Convert standard screenplay format to Trelby format (.trelby)
 *
 * Trelby uses a proprietary text format with special prefixes:
 * - .= for scene headings (INT./EXT.)
 * - ._ for character names
 * - >: for dialogue lines
 * - .: for continued dialogue
 * - .. for action/description
 * - ./ for transitions
 *
 * @param screenplayText - Plain text screenplay content
 * @returns Trelby-formatted text ready to paste into Trelby
 */
export function exportToTrelby(screenplayText: string): string {
  if (!screenplayText || typeof screenplayText !== 'string') {
    return ''
  }

  const lines = screenplayText.split('\n')
  const trelbyLines: string[] = []
  
  let insideDialogue = false
  let previousLineWasCharacter = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Skip completely empty lines
    if (trimmedLine.length === 0) {
      insideDialogue = false
      previousLineWasCharacter = false
      continue
    }

    // Check if it's a scene heading (INT. or EXT. or similar)
    if (/^(INT|EXT|INT\/EXT|EXT\/INT)[\.\s]/i.test(trimmedLine)) {
      trelbyLines.push(`.=${trimmedLine}`)
      insideDialogue = false
      previousLineWasCharacter = false
      continue
    }

    // Check if it's a transition (ALL CAPS ending with :)
    if (/^[A-Z\s]+:$/.test(trimmedLine) && trimmedLine.length < 50) {
      trelbyLines.push(`./${trimmedLine}`)
      insideDialogue = false
      previousLineWasCharacter = false
      continue
    }

    // Check if it's a character name (ALL CAPS, not too long, not a scene heading)
    const isAllCaps = trimmedLine === trimmedLine.toUpperCase()
    const isReasonableLength = trimmedLine.length > 0 && trimmedLine.length < 40
    const notSceneHeading = !/^(INT|EXT)/.test(trimmedLine)
    const noLowerCase = !/[a-z]/.test(trimmedLine)
    
    if (isAllCaps && isReasonableLength && notSceneHeading && noLowerCase) {
      // Check if the next line looks like dialogue (indented or regular text)
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
      const nextLineIsDialogue = nextLine.length > 0 && !/^(INT|EXT|FADE|CUT)/.test(nextLine)
      
      if (nextLineIsDialogue) {
        trelbyLines.push(`._${trimmedLine}`)
        insideDialogue = true
        previousLineWasCharacter = true
        continue
      }
    }

    // Check if it's dialogue (line after character name, or indented)
    const isIndented = line.startsWith('    ') || line.startsWith('\t')
    
    if (insideDialogue || previousLineWasCharacter || isIndented) {
      // Remove indentation for dialogue
      const dialogueLine = trimmedLine
      
      if (previousLineWasCharacter) {
        // First line of dialogue after character
        trelbyLines.push(`>:${dialogueLine}`)
        previousLineWasCharacter = false
        insideDialogue = true
      } else if (insideDialogue) {
        // Continued dialogue
        trelbyLines.push(`.:${dialogueLine}`)
      }
      continue
    }

    // Everything else is action/description
    trelbyLines.push(`..${trimmedLine}`)
    insideDialogue = false
    previousLineWasCharacter = false
  }

  // Add Trelby file header and ensure trailing newline for last dialogue line
  const trelbyContent = `#Title-String
#Start-Script

${trelbyLines.join('\n')}

`

  console.log('🎬 exportToTrelby stats:')
  console.log('  Input lines:', lines.length)
  console.log('  Output Trelby lines:', trelbyLines.length)  
  console.log('  Last input line:', lines[lines.length - 1]?.trim())
  console.log('  Last Trelby line:', trelbyLines[trelbyLines.length - 1])

  return trelbyContent
}
