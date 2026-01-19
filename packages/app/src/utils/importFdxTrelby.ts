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
  let isInContentSection = false
  const contentLines: string[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip version and configuration sections
    if (trimmedLine.startsWith('#Version') || 
        trimmedLine.startsWith('#Begin-') || 
        trimmedLine.startsWith('#End-') ||
        trimmedLine.startsWith('AutoCompletion/') ||
        trimmedLine.startsWith('FontSize:') ||
        trimmedLine.startsWith('Margin/') ||
        trimmedLine.startsWith('Paper/') ||
        trimmedLine.startsWith('PageBreak')) {
      continue
    }
    
    // Look for content markers
    if (trimmedLine.startsWith('Line/') && trimmedLine.includes(':')) {
      // Extract the actual screenplay content from Trelby line format
      // Format is typically: Line/X/Type:Content
      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex !== -1) {
        const content = trimmedLine.substring(colonIndex + 1)
        if (content) {
          contentLines.push(content)
        }
      }
      continue
    }
    
    // Handle lines that might contain screenplay content directly
    if (!trimmedLine.startsWith('#') && 
        !trimmedLine.includes(':') && 
        trimmedLine.length > 0) {
      contentLines.push(trimmedLine)
    }
  }
  
  // If we didn't find structured content, try to extract from the raw text
  if (contentLines.length === 0) {
    // Look for lines that look like screenplay content
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Skip configuration lines
      if (trimmedLine.startsWith('#') || 
          trimmedLine.includes('FontSize:') ||
          trimmedLine.includes('Margin/') ||
          trimmedLine.includes('Paper/') ||
          trimmedLine.includes('PageBreak') ||
          trimmedLine.includes('AutoCompletion/')) {
        continue
      }
      
      // Include lines that might be screenplay content
      if (trimmedLine.length > 0) {
        contentLines.push(trimmedLine)
      }
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