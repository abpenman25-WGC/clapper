export function importFdxTrelby(fileContent: string) {
  try {
    const lines = fileContent.split('\n')
    const scenes: string[] = []
    const transitions: string[] = []

    for (const line of lines) {
      // Example: Extract scene headings (starts with INT. or EXT.)
      if (line.trim().match(/^(INT\.|EXT\.)/)) {
        scenes.push(line.trim())
      }
      // Example: Extract transitions (ends with TO:)
      if (line.trim().endsWith('TO:')) {
        transitions.push(line.trim())
      }
    }

    return {
      raw: fileContent,
      scenes,
      transitions,
    }
  } catch (err) {
    console.error('importFdxTrelby error:', err)
    alert('Error in importFdxTrelby: ' + err)
    return { raw: '' }
  }
}
