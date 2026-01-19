import { useEffect, useState } from 'react'
import { useFilePicker } from 'use-file-picker'

import { parseFileName } from '@/services/io/parseFileName'
import { useIO } from '@/services/io/useIO'
import { importFdxTrelby } from '@/utils/importFdxTrelby'
import { importFdx } from '@/utils/importFdx'

const defaultSupportedExtensions = [
  'clap',
  'txt',
  'fdx',
  'fountain',
  'fade',
  'spx',
  'celtx',
  'mp4',
  'mp3',
  'fdx.trelby',
  'trelby',
]

export function useOpenFilePicker(
  {
    supportedExtensions = defaultSupportedExtensions,
  }: {
    supportedExtensions: string[]
  } = {
    supportedExtensions: defaultSupportedExtensions,
  }
) {
  const [isLoading, setIsLoading] = useState(false)
  const openClapBlob = useIO((s) => s.openClapBlob)
  const openScreenplay = useIO((s) => s.openScreenplay)
  const openVideo = useIO((s) => s.openVideo)

  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: supportedExtensions.map((ext) => `.${ext}`),
    readAs: 'ArrayBuffer',
  })

  const fileData = filesContent[0]

  useEffect(() => {
    const fn = async () => {
      if (!fileData || !fileData.name) {
        return
      }
      const input = fileData.name

      const { fileName, projectName, extension } = parseFileName(input)

      if (!defaultSupportedExtensions.includes(extension)) {
        console.error(`unsupported extension "${extension}"`)
        return
      }

      const blob = new Blob([fileData.content])

      if (extension === 'clap') {
        try {
          setIsLoading(true)
          await openClapBlob(projectName, fileName, blob)
        } catch (err) {
          console.error('failed to load the Clap file:', err)
        } finally {
          setIsLoading(false)
        }
      } else if (extension === 'fdx') {
        try {
          setIsLoading(true)
          // Convert ArrayBuffer to string and parse FDX XML
          const text = new TextDecoder().decode(fileData.content)
          const parsed = importFdx(text)
          await openScreenplay(
            projectName,
            fileName,
            new Blob([parsed])
          )
          console.log('FDX parsed:', parsed)
        } catch (err) {
          console.error('failed to load the FDX file:', err)
        } finally {
          setIsLoading(false)
        }
      } else if (extension === 'txt' || extension === 'fountain' || extension === 'fade' || extension === 'spx' || extension === 'celtx') {
        try {
          setIsLoading(true)
          await openScreenplay(projectName, fileName, blob)
        } catch (err) {
          console.error(`failed to load the ${extension} file:`, err)
        } finally {
          setIsLoading(false)
        }
      } else if (extension === 'mp4') {
        try {
          setIsLoading(true)
          await openVideo(projectName, fileName, blob)
        } catch (err) {
          console.error('failed to load the mp4 file:', err)
        } finally {
          setIsLoading(false)
        }
      } else if (extension === 'mp3') {
        alert('Initializing a project from a mp3 is not supported yet')
      } else if (extension === 'fdx.trelby' || extension === 'trelby') {
        try {
          setIsLoading(true)
          // Convert ArrayBuffer to string
          const text = new TextDecoder().decode(fileData.content)
          const parsed = importFdxTrelby(text)
          await openScreenplay(
            projectName,
            fileName,
            new Blob([parsed])
          )
          console.log(parsed)
        } catch (err) {
          console.error(`failed to load the ${extension} file:`, err)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fn()
  }, [
    fileData,
    fileData?.name,
    fileData?.content,
    openClapBlob,
    openScreenplay,
    openVideo,
  ])

  return {
    openFilePicker,
    filesContent,
    fileData,
    isLoading: loading || isLoading,
  }
}
