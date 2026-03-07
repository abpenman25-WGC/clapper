import {
  ExportableSegment,
  formatDuration,
  formatSegmentForExport,
} from '@/lib/utils'
import { ClapSegmentCategory } from '@aitube/clap'
import { TimelineStore, useTimeline } from '@aitube/timeline'

/**
 * Generates a Kdenlive-compatible MLT XML project file.
 *
 * Media resource paths use relative `media/<filename>` paths so that
 * the caller can bundle the assets alongside the .kdenlive file in a ZIP.
 */
export async function generateKdenlive(): Promise<string> {
  const timeline: TimelineStore = useTimeline.getState()
  const { title, width, height, durationInMs, segments: timelineSegments } =
    timeline

  const segments: ExportableSegment[] = timelineSegments
    .map((segment, i) => formatSegmentForExport(segment, i))
    .filter(({ isExportableToFile }) => isExportableToFile)

  const videos: ExportableSegment[] = segments.filter(
    ({ segment }) => segment.category === ClapSegmentCategory.VIDEO
  )
  const storyboards: ExportableSegment[] = segments.filter(
    ({ segment }) => segment.category === ClapSegmentCategory.IMAGE
  )
  const dialogues: ExportableSegment[] = segments.filter(
    ({ segment }) => segment.category === ClapSegmentCategory.DIALOGUE
  )
  const sounds: ExportableSegment[] = segments.filter(
    ({ segment }) => segment.category === ClapSegmentCategory.SOUND
  )
  const music: ExportableSegment[] = segments.filter(
    ({ segment }) => segment.category === ClapSegmentCategory.MUSIC
  )

  const allAudio = [...dialogues, ...sounds, ...music]

  const dur = formatDuration(durationInMs)

  // Each media file will be placed in a sibling `media/` folder inside the ZIP.
  const mediaPath = (fileName: string) => `media/${fileName}`

  return /* XML */ `<?xml version="1.0" encoding="utf-8"?>
<mlt LC_NUMERIC="C" producer="main_bin" version="7.24.0">
 <profile
  description="${width}x${height} 25fps"
  width="${width}"
  height="${height}"
  progressive="1"
  sample_aspect_num="1"
  sample_aspect_den="1"
  display_aspect_num="16"
  display_aspect_den="9"
  frame_rate_num="25"
  frame_rate_den="1"
  colorspace="709"
 />

 <!-- Blank / black fill producer -->
 <producer id="black_track" in="00:00:00.000" out="${dur}">
  <property name="length">${dur}</property>
  <property name="eof">continue</property>
  <property name="resource">black</property>
  <property name="aspect_ratio">1</property>
  <property name="mlt_service">color</property>
  <property name="mlt_image_format">rgb24a</property>
  <property name="set.test_audio">0</property>
 </producer>

 <!-- Video / image producers -->
 ${[...videos, ...storyboards]
   .map(
     ({ shortId, fileName, segment }) => /* XML */ `
 <producer id="${shortId}" in="00:00:00.000" out="${formatDuration(segment.assetDurationInMs)}">
  <property name="length">${formatDuration(segment.assetDurationInMs)}</property>
  <property name="eof">pause</property>
  <property name="resource">${mediaPath(fileName)}</property>
  <property name="ttl">1</property>
  <property name="aspect_ratio">1</property>
  <property name="meta.media.progressive">1</property>
  <property name="seekable">1</property>
  <property name="meta.media.width">${width}</property>
  <property name="meta.media.height">${height}</property>
  <property name="mlt_service">avformat-novalidate</property>
  <property name="kdenlive:clipname">${fileName}</property>
 </producer>`
   )
   .join('\n')}

 <!-- Audio chains -->
 ${allAudio
   .map(
     ({ shortId, fileName, segment }) => /* XML */ `
 <chain id="${shortId}" out="${formatDuration(segment.assetDurationInMs)}">
  <property name="length">${formatDuration(segment.assetDurationInMs)}</property>
  <property name="eof">pause</property>
  <property name="resource">${mediaPath(fileName)}</property>
  <property name="mlt_service">avformat-novalidate</property>
  <property name="audio_index">0</property>
  <property name="video_index">-1</property>
  <property name="kdenlive:clipname">${fileName}</property>
 </chain>`
   )
   .join('\n')}

 <!-- main_bin playlist (Kdenlive document metadata + media bin) -->
 <playlist id="main_bin">
  <property name="kdenlive:docproperties.activeTrack">0</property>
  <property name="kdenlive:docproperties.audioChannels">2</property>
  <property name="kdenlive:docproperties.audioTarget">1</property>
  <property name="kdenlive:docproperties.disablepreview">0</property>
  <property name="kdenlive:docproperties.groups">[]</property>
  <property name="kdenlive:docproperties.kdenliveversion">21.08.1</property>
  <property name="kdenlive:docproperties.version">1.02</property>
  <property name="kdenlive:expandedFolders"/>
  <property name="kdenlive:documentnotes">Exported from Clapper</property>
  <property name="xml_retain">1</property>
  ${[...videos, ...storyboards, ...allAudio]
    .map(({ shortId }) => `<entry producer="${shortId}"/>`)
    .join('\n  ')}
 </playlist>

 <!-- Video track playlist -->
 <playlist id="playlist_video">
  <property name="kdenlive:timeline_active">1</property>
  ${videos
    .map(
      ({ shortId, segment }) =>
        `<entry producer="${shortId}" in="00:00:00.000" out="${formatDuration(segment.assetDurationInMs)}"/>`
    )
    .join('\n  ')}
 </playlist>
 <playlist id="playlist_video_b"/>

 <!-- Storyboard / image track playlist -->
 <playlist id="playlist_storyboard">
  <property name="kdenlive:timeline_active">1</property>
  ${storyboards
    .map(
      ({ shortId, segment }) =>
        `<entry producer="${shortId}" in="00:00:00.000" out="${formatDuration(segment.assetDurationInMs)}"/>`
    )
    .join('\n  ')}
 </playlist>
 <playlist id="playlist_storyboard_b"/>

 <!-- Dialogue track playlist -->
 <playlist id="playlist_dialogue">
  <property name="kdenlive:audio_track">1</property>
  <property name="kdenlive:timeline_active">1</property>
  ${dialogues
    .map(
      ({ shortId, segment }) =>
        `<entry producer="${shortId}" in="00:00:00.000" out="${formatDuration(segment.assetDurationInMs)}"/>`
    )
    .join('\n  ')}
 </playlist>
 <playlist id="playlist_dialogue_b">
  <property name="kdenlive:audio_track">1</property>
 </playlist>

 <!-- Sound effects track playlist -->
 <playlist id="playlist_sound">
  <property name="kdenlive:audio_track">1</property>
  <property name="kdenlive:timeline_active">1</property>
  ${sounds
    .map(
      ({ shortId, segment }) =>
        `<entry producer="${shortId}" in="00:00:00.000" out="${formatDuration(segment.assetDurationInMs)}"/>`
    )
    .join('\n  ')}
 </playlist>
 <playlist id="playlist_sound_b">
  <property name="kdenlive:audio_track">1</property>
 </playlist>

 <!-- Music track playlist -->
 <playlist id="playlist_music">
  <property name="kdenlive:audio_track">1</property>
  <property name="kdenlive:timeline_active">1</property>
  ${music
    .map(
      ({ shortId, segment }) =>
        `<entry producer="${shortId}" in="00:00:00.000" out="${formatDuration(segment.assetDurationInMs)}"/>`
    )
    .join('\n  ')}
 </playlist>
 <playlist id="playlist_music_b">
  <property name="kdenlive:audio_track">1</property>
 </playlist>

 <!-- Per-track tractors -->
 <tractor id="tractor_video" in="00:00:00.000" out="${dur}">
  <property name="kdenlive:trackheight">67</property>
  <property name="kdenlive:timeline_active">1</property>
  <property name="kdenlive:collapsed">0</property>
  <property name="kdenlive:track_name">Video</property>
  <track producer="playlist_video"/>
  <track producer="playlist_video_b"/>
 </tractor>

 <tractor id="tractor_storyboard" in="00:00:00.000" out="${dur}">
  <property name="kdenlive:trackheight">67</property>
  <property name="kdenlive:timeline_active">1</property>
  <property name="kdenlive:collapsed">0</property>
  <property name="kdenlive:track_name">Storyboards</property>
  <track producer="playlist_storyboard"/>
  <track producer="playlist_storyboard_b"/>
 </tractor>

 <tractor id="tractor_dialogue" in="00:00:00.000" out="${dur}">
  <property name="kdenlive:audio_track">1</property>
  <property name="kdenlive:trackheight">67</property>
  <property name="kdenlive:timeline_active">1</property>
  <property name="kdenlive:collapsed">0</property>
  <property name="kdenlive:track_name">Dialogue</property>
  <track hide="video" producer="playlist_dialogue"/>
  <track hide="video" producer="playlist_dialogue_b"/>
 </tractor>

 <tractor id="tractor_sound" in="00:00:00.000" out="${dur}">
  <property name="kdenlive:audio_track">1</property>
  <property name="kdenlive:trackheight">67</property>
  <property name="kdenlive:timeline_active">1</property>
  <property name="kdenlive:collapsed">0</property>
  <property name="kdenlive:track_name">Sound Effects</property>
  <track hide="video" producer="playlist_sound"/>
  <track hide="video" producer="playlist_sound_b"/>
 </tractor>

 <tractor id="tractor_music" in="00:00:00.000" out="${dur}">
  <property name="kdenlive:audio_track">1</property>
  <property name="kdenlive:trackheight">67</property>
  <property name="kdenlive:timeline_active">1</property>
  <property name="kdenlive:collapsed">0</property>
  <property name="kdenlive:track_name">Music</property>
  <track hide="video" producer="playlist_music"/>
  <track hide="video" producer="playlist_music_b"/>
 </tractor>

 <!-- Main timeline tractor -->
 <tractor id="tractor_main" title="${title}" in="00:00:00.000" out="${dur}">
  <track producer="black_track"/>
  <track producer="tractor_video"/>
  <track producer="tractor_storyboard"/>
  <track hide="video" producer="tractor_dialogue"/>
  <track hide="video" producer="tractor_sound"/>
  <track hide="video" producer="tractor_music"/>
 </tractor>
</mlt>
`
}
