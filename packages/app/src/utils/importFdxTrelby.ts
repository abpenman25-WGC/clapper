export function importFdxTrelby(fileContent: string) {
  try {
    // For now, just return the raw content so you can verify the import works
    return { raw: fileContent }
  } catch (err) {
    console.error('importFdxTrelby error:', err)
    return { raw: '' }
  }
}
