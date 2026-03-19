import { RenderingStrategy } from '@aitube/timeline'

import {
  RendererState,
  RenderingBufferSizes,
  RenderingStrategies,
} from '@aitube/clapper-services'

import { getDefaultBufferedSegments } from './getDefaultBufferedSegments'

export function getDefaultRendererState(): RendererState {
  // Default to ON_DEMAND so the resolver never fires requests before the
  // useRenderLoop useEffect has had a chance to sync the user's saved settings
  // into the renderer state. Without this, video segments get submitted on the
  // very first resolver tick (before React has mounted and synced settings),
  // even when the user has video set to ON_DEMAND.
  const renderingStrategies: RenderingStrategies = {
    imageRenderingStrategy: RenderingStrategy.ON_DEMAND,
    videoRenderingStrategy: RenderingStrategy.ON_DEMAND,
    soundRenderingStrategy: RenderingStrategy.ON_DEMAND,
    voiceRenderingStrategy: RenderingStrategy.ON_DEMAND,
    musicRenderingStrategy: RenderingStrategy.ON_DEMAND,
  }

  /**
   * Tells how many segments should be renderer in advanced during playback, for each segment category
   */
  const bufferSizes: RenderingBufferSizes = {
    imageBufferSize: 32,
    videoBufferSize: 32,
    soundBufferSize: 32,
    voiceBufferSize: 32,
    musicBufferSize: 8, // music segments are longer, so no need to generate that many
  }

  const state: RendererState = {
    ...bufferSizes,

    ...renderingStrategies,

    bufferedSegments: getDefaultBufferedSegments(),

    dataUriBuffer1: undefined,
    dataUriBuffer2: undefined,
    activeBufferNumber: 1,
    currentSegment: undefined,
    preloadSegment: undefined,
    currentSegmentKey: '',
    preloadSegmentKey: '',
    dataUriBuffer1Key: '',
    dataUriBuffer2Key: '',
  }
  return state
}
