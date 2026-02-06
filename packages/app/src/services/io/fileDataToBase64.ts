// import { FileData } from '@ffmpeg/ffmpeg/dist/esm/types'
type FileData = any

export function fileDataToBase64(fileData: FileData): string {
  // Convert Uint8Array to Base64 string without using btoa
  let binary = ''
  const bytes = new Uint8Array(fileData as any)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return window.btoa(binary)
}
