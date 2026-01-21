/**
 * Parse Final Draft FDX format (.fdx files)
 *
 * Final Draft FDX is an XML-based screenplay format used by Final Draft software.
 * This parser extracts the screenplay content from the XML structure.
 *
 * @param fdxText - Raw XML content from an FDX file
 * @returns Plain text screenplay content suitable for Broadway parsing
 */
export function importFdx(fdxText: string): string {
  if (!fdxText || typeof fdxText !== 'string') {
    throw new Error('Invalid FDX file content')
  }

  // Parse XML by extracting text content from specific elements
  const lines: string[] = []

  try {
    // Remove XML declarations and comments
    let cleanXml = fdxText
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim()

    // Extract content from FDX structure
    // FDX files typically have <Content> containing <Paragraph> elements

    // Find all paragraph elements
    const paragraphMatches = cleanXml.match(
      /<Paragraph[^>]*>[\s\S]*?<\/Paragraph>/gi
    )

    if (paragraphMatches) {
      for (const paragraph of paragraphMatches) {
        // Extract the Type attribute to understand the element type
        const typeMatch = paragraph.match(/Type="([^"]*)"/)
        const type = typeMatch ? typeMatch[1] : ''

        // Extract text content from <Text> elements within the paragraph
        const textMatches = paragraph.match(/<Text[^>]*>([\s\S]*?)<\/Text>/gi)

        if (textMatches) {
          let lineText = ''

          for (const textElement of textMatches) {
            // Extract the actual text content, handling HTML entities
            const textContent = textElement
              .replace(/<Text[^>]*>/gi, '')
              .replace(/<\/Text>/gi, '')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim()

            if (textContent) {
              lineText += textContent + ' '
            }
          }

          lineText = lineText.trim()

          if (lineText) {
            // Format based on paragraph type
            switch (type) {
              case 'Scene Heading':
                lines.push(lineText.toUpperCase())
                break
              case 'Character':
                lines.push(`\n${lineText.toUpperCase()}`)
                break
              case 'Parenthetical':
                lines.push(`(${lineText})`)
                break
              case 'Dialogue':
                lines.push(lineText)
                break
              case 'Action':
                lines.push(`\n${lineText}`)
                break
              case 'Transition':
                lines.push(`\n${lineText.toUpperCase()}`)
                break
              default:
                lines.push(lineText)
            }
          }
        }
      }
    }

    // If no paragraphs found, try to extract any text content
    if (lines.length === 0) {
      // Fallback: extract all text content between tags
      const textContent = cleanXml
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (textContent) {
        // Split into lines and clean up
        const fallbackLines = textContent.split(/[.!?]\s+/)
        lines.push(...fallbackLines.filter((line) => line.trim().length > 0))
      }
    }
  } catch (error) {
    // If XML parsing fails, try to extract text content as fallback
    console.warn('FDX parsing failed, falling back to text extraction:', error)

    const textContent = fdxText
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (textContent) {
      return textContent
    }
  }

  if (lines.length === 0) {
    throw new Error('No screenplay content found in FDX file')
  }

  // Join lines and clean up
  const result = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .trim()

  if (!result) {
    throw new Error('Empty screenplay content after parsing FDX file')
  }

  return result
}
