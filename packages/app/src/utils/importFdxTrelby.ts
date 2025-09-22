export function importFdxTrelby(fileContent: string) {
  try {
    return { raw: fileContent }
  } catch (err) {
    console.error('importFdxTrelby error:', err)
    alert('Error in importFdxTrelby: ' + err)
    return { raw: '' }
  }
}
