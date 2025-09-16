export function importFdxTrelby(fileContent: string) {
  try {    
    return { raw: fileContent }
  } catch (err) {
    console.error('importFdxTrelby error:', err)
    return { raw: '' }
  }
}
