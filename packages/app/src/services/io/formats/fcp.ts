import { ClapProject, UUID } from '@aitube/clap'
import { TimelineStore, useTimeline } from '@aitube/timeline'
import {
  ExportableSegment,
  formatSegmentForExport,
} from '@/lib/utils/formatSegmentForExport'

export async function generateFCP(): Promise<string> {
  const timeline: TimelineStore = useTimeline.getState()
  const { title, width, height, getClap, segments: timelineSegments } = timeline

  const DEFAULT_FRAME_RATE = 24

  const formatFCPTime = (
    timeInMs: number,
    frameRate: number = DEFAULT_FRAME_RATE
  ): string => {
    const frames = Math.round((timeInMs / 1000) * frameRate)
    return `${frames}/${frameRate}s`
  }

  const clap: ClapProject | null = await getClap()
  if (!clap) {
    throw new Error('Cannot generate FCP XML without a valid CLAP project')
  }

  const createAssetFormat = (id: string): string => {
    return /* XML */ `<format id="${id}" name="FFVideoFormat${height}p${DEFAULT_FRAME_RATE}" frameDuration="${formatFCPTime(1000 / DEFAULT_FRAME_RATE)}" width="${width}" height="${height}"/>`
  }

  const resources: string[] = []
  const assetClips: string[] = []
  const formatId = `r${width}x${height}`

  resources.push(createAssetFormat(formatId))

  const exportableSegments: ExportableSegment[] = timelineSegments
    .map((segment, index) => formatSegmentForExport(segment, index))
    .filter(({ isExportableToFile }) => isExportableToFile)

  exportableSegments.forEach((exportableSegment: ExportableSegment) => {
    const { segment, filePath, category } = exportableSegment

    if (segment.assetUrl) {
      const assetId = UUID()
      resources.push(// want to see some colors? install es6-string-html in your VSCode
      /* XML */ `
        <asset id="${assetId}" name="${segment.label}" src="file://./${filePath}" start="0s" duration="${formatFCPTime(segment.assetDurationInMs)}" format="${formatId}"
          hasVideo="${category === 'video' || category === 'storyboard' ? 1 : 0}"
          hasAudio="${category === 'dialogue' || category === 'sound' || category === 'music' ? 1 : 0}"/>
      `)

      const audioRole =
        category === 'dialogue'
          ? 'dialogue'
          : category === 'sound'
            ? 'effects'
            : category === 'music'
              ? 'music'
              : ''

      assetClips.push(/* XML */ `
        <asset-clip name="${segment.label}" ref="${assetId}" offset="${formatFCPTime(segment.startTimeInMs)}" duration="${formatFCPTime(segment.endTimeInMs - segment.startTimeInMs)}" start="${formatFCPTime(0)}" 
          ${category === 'video' || category === 'storyboard' ? '' : `audioRole="${audioRole}"`}/>
      `)
    }
  })

  return /* XML */ `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    ${resources.join('\n')}
  </resources>
  <library>
    <event name="${title}">
      <project name="${title}">
        <sequence format="${formatId}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
            ${assetClips.join('\n')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`
}

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function generateFCP7XML(): Promise<string> {
  const timeline: TimelineStore = useTimeline.getState()
  const {
    title,
    width,
    height,
    segments: timelineSegments,
  } = timeline

  const FPS = 30
  const msToFrames = (ms: number): number => Math.round((ms / 1000) * FPS)

  // Separate video and stills, sorted by timeline position
  const allExportable: ExportableSegment[] = timelineSegments
    .map((segment, index) => formatSegmentForExport(segment, index))
    .filter(({ isExportableToFile, category }) =>
      isExportableToFile && (category === 'video' || category === 'storyboard')
    )
    .sort((a, b) => a.segment.startTimeInMs - b.segment.startTimeInMs)

  const videoSegments = allExportable.filter(({ category }) => category === 'video')
  const stillSegments = allExportable.filter(({ category }) => category === 'storyboard')

  const buildClipItem = (
    exportable: ExportableSegment,
    index: number,
    type: 'video' | 'still',
    cursor: { value: number }
  ): string => {
    const { segment, fileName, filePath } = exportable
    const num = index + 1

    const clipDurationMs =
      segment.assetDurationInMs > 0
        ? segment.assetDurationInMs
        : segment.endTimeInMs - segment.startTimeInMs
    const clipFrames = msToFrames(clipDurationMs)

    const startFrame = cursor.value + (type === 'still' ? 1 : 0)
    const endFrame = cursor.value + clipFrames + (type === 'still' ? 1 : 0)

    cursor.value += clipFrames

    return `\t\t\t<clipitem id="clipitem-${type}-${num}">
\t\t\t\t<name>${escapeXml(segment.label || fileName)}</name>
\t\t\t\t<masterclipid>masterclip-${type}-${num}</masterclipid>
\t\t\t\t<start>${startFrame}</start>
\t\t\t\t<end>${endFrame}</end>
\t\t\t\t<in>0</in>
\t\t\t\t<out>${clipFrames}</out>
\t\t\t\t<duration>${clipFrames}</duration>
\t\t\t\t<rate>
\t\t\t\t\t<timebase>${FPS}</timebase>
\t\t\t\t\t<ntsc>FALSE</ntsc>
\t\t\t\t</rate>
\t\t\t\t<file id="file-${type}-${num}">
\t\t\t\t\t<name>${escapeXml(filePath)}</name>
\t\t\t\t\t<pathurl>file://localhost/${filePath}</pathurl>
\t\t\t\t\t<rate>
\t\t\t\t\t\t<timebase>${FPS}</timebase>
\t\t\t\t\t\t<ntsc>FALSE</ntsc>
\t\t\t\t\t</rate>
\t\t\t\t\t<duration>${clipFrames}</duration>
\t\t\t\t\t<media>
\t\t\t\t\t\t<video/>
\t\t\t\t\t</media>
\t\t\t\t</file>
\t\t\t</clipitem>`
  }

  // Track 1: video clips
  const videoCursor = { value: 0 }
  const videoClipItems = videoSegments.map((seg, i) =>
    buildClipItem(seg, i, 'video', videoCursor)
  )

  // Track 2: still clips (with +1 frame offset)
  const stillCursor = { value: 0 }
  const stillClipItems = stillSegments.map((seg, i) =>
    buildClipItem(seg, i, 'still', stillCursor)
  )

  const totalFrames = Math.max(videoCursor.value, stillCursor.value)

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
\t<sequence>
\t\t<name>${escapeXml(title)}</name>
\t\t<duration>${totalFrames}</duration>
\t\t<rate>
\t\t\t<timebase>${FPS}</timebase>
\t\t\t<ntsc>FALSE</ntsc>
\t\t</rate>
\t\t<in>0</in>
\t\t<out>${totalFrames}</out>
\t\t<timecode>
\t\t\t<rate>
\t\t\t\t<timebase>${FPS}</timebase>
\t\t\t\t<ntsc>FALSE</ntsc>
\t\t\t</rate>
\t\t\t<string>00:00:00:00</string>
\t\t\t<frame>0</frame>
\t\t\t<displayformat>NDF</displayformat>
\t\t</timecode>
\t\t<media>
\t\t\t<video>
\t\t\t\t<format>
\t\t\t\t\t<samplecharacteristics>
\t\t\t\t\t\t<rate>
\t\t\t\t\t\t\t<timebase>${FPS}</timebase>
\t\t\t\t\t\t\t<ntsc>FALSE</ntsc>
\t\t\t\t\t\t</rate>
\t\t\t\t\t\t<width>${width}</width>
\t\t\t\t\t\t<height>${height}</height>
\t\t\t\t\t\t<pixelaspectratio>square</pixelaspectratio>
\t\t\t\t\t\t<fielddominance>none</fielddominance>
\t\t\t\t\t</samplecharacteristics>
\t\t\t\t</format>
\t\t\t\t<track>
${videoClipItems.join('\n')}
\t\t\t\t</track>
\t\t\t\t<track>
${stillClipItems.join('\n')}
\t\t\t\t</track>
\t\t\t</video>
\t\t</media>
\t</sequence>
</xmeml>`
}
