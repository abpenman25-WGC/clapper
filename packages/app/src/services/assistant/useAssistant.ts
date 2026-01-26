'use client'

import { create } from 'zustand'
import {
  AssistantAction,
  AssistantMessage,
  AssistantRequest,
  AssistantStore,
  ChatEvent,
  ChatEventVisibility,
} from '@aitube/clapper-services'
import {
  ClapAssetSource,
  ClapOutputType,
  ClapScene,
  ClapSegment,
  ClapSegmentCategory,
  newSegment,
  UUID,
} from '@aitube/clap'
import {
  clapSegmentToTimelineSegment,
  DEFAULT_DURATION_IN_MS_PER_STEP,
  findFreeTrack,
  TimelineSegment,
  TimelineStore,
  useTimeline,
} from '@aitube/timeline'

import { getDefaultAssistantState } from './getDefaultAssistantState'
import { useSettings } from '../settings'

import { askAssistant } from './askAssistant'
import { useRenderer } from '../renderer'
import { useMonitor } from '../monitor/useMonitor'
import { parseRawInputToAction } from './parseRawInputToAction'
import { useAudio } from '../audio/useAudio'
import { updateStoryAndScene } from './updateStoryAndScene'
import { useScriptEditor } from '../editors/script-editor/useScriptEditor'

export const useAssistant = create<AssistantStore>((set, get) => ({
  ...getDefaultAssistantState(),

  processActionOrMessage: async (
    actionOrAssistantMessage: AssistantAction | AssistantMessage
  ): Promise<void> => {
    const { addEventToHistory } = get()
    const { mute, unmute } = useAudio.getState()
    const { togglePlayback } = useMonitor.getState()

    let response = ''

    const assistantMessage =
      typeof actionOrAssistantMessage === 'object'
        ? (actionOrAssistantMessage as AssistantMessage)
        : {
            comment: '',
            action: actionOrAssistantMessage,
            updatedStoryBlocks: [],
            updatedSceneSegments: [],
          }

    try {
      switch (assistantMessage.action) {
        case AssistantAction.PLAY_VIDEO:
          togglePlayback(true)
          break

        case AssistantAction.PAUSE_VIDEO:
          togglePlayback(false)
          break

        case AssistantAction.MUTE_AUDIO:
          mute()
          break

        case AssistantAction.UNMUTE_AUDIO:
          unmute()
          break

        case AssistantAction.UPDATE_STORY_AND_SCENE:
          // this is not processed in there
          break

          // note: in case we find a way to update a segment in place
          // (eg. if LLMs become good at preserving IDs)
          // we can also try to do this:

          // Object.assign(match, {
          //   prompt,
          //   label: prompt,
          // })

          // // tell the timeline that this individual segment should be redrawn
          // trackSilentChangeInSegment(match.id)

          break

        case AssistantAction.GO_BACK:
          // TODO
          break

        case AssistantAction.GO_FORWARD:
          // TODO
          break

        case AssistantAction.UNDO:
          // this should be the undo of the ASSISTANT actions
          break

        case AssistantAction.REDO:
          // this should be the redo of the ASSISTANT actions
          break

        case AssistantAction.NONE:
        default:
          if (assistantMessage.comment) {
            addEventToHistory({
              senderId: 'assistant',
              senderName: 'Assistant',
              message: assistantMessage.comment || '🤔', // or "???" for a "boomer" theme
            })
          } else {
            console.log(
              `processActionOrMessage: the message was empty or incomplete`
            )
          }
          return
      }
    } catch (err) {
      addEventToHistory({
        senderId: 'assistant',
        senderName: 'Assistant',
        message: `I'm sorry, I was unable to process your request. Error message: ${err}`,
      })
      return
    }

    if (response) {
      addEventToHistory({
        senderId: 'assistant',
        senderName: 'Assistant',
        message: response,
      })
    }
  },
  addEventToHistory: (event: Partial<ChatEvent>) => {
    const defaultEvent: ChatEvent = {
      eventId: UUID(),
      roomId: '',
      roomName: '',
      senderId: 'director',
      senderName: 'Director',
      sentAt: new Date().toISOString(),
      message: '',
      isCurrentUser: true,
      visibility: ChatEventVisibility.TO_BOTH,
    }
    const newEvent: ChatEvent = {
      ...defaultEvent,
      ...event,
      isCurrentUser: event.senderId !== 'assistant',
    }

    const { history } = get()

    set({
      history: history.concat(newEvent),
    })

    return newEvent
  },

  clearHistory: () => {
    set({ history: [] })
  },

  processUserMessage: async (input: string) => {
    console.log('🟦 1. processUserMessage START:', input)
    const message = input.trim()
    if (!message) {
      console.log('🟦 Message empty, returning')
      return
    }

    console.log('🟦 2. Message validated:', message)

    try {
      console.log('🟦 3. Getting state...')
      const { addEventToHistory, processActionOrMessage } = get()
      console.log('🟦 4. Got addEventToHistory and processActionOrMessage')

      console.log('🟦 5. Getting renderer state...')
      const {
        bufferedSegments: { activeSegments },
      } = useRenderer.getState()
      console.log('🟦 6. Got activeSegments:', activeSegments?.length)

      console.log('🟦 7. Getting timeline state...')
      const timeline: TimelineStore = useTimeline.getState()
      console.log('🟦 8. Got timeline')

      const { description, scenes, entityIndex } = timeline
      console.log('🟦 9. Extracted timeline data, scenes:', scenes?.length)

      // note: here `settings` is not the store's state itself (with methods etc)
      // but a snapshot of the serializable state values only
      //
      // when need that because we are going send those settings in HTTPS to our gateway
      console.log('🟦 10. Getting settings...')
      const settings = useSettings.getState().getRequestSettings()
      console.log(
        '🟦 11. Got settings, provider:',
        settings?.assistantWorkflow?.provider
      )

      console.log('🟦 12. Adding to history...')
      addEventToHistory({
        senderId: 'director',
        senderName: 'Director',
        message,
      })
      console.log('🟦 13. Added to history')

      // before calling any costly LLM (in terms of money or latency),
      // we first check if we have an immediate match for an action
      console.log('🟦 14. Checking for direct command...')
      const directVocalCommandAction = parseRawInputToAction(message)
      if (directVocalCommandAction !== AssistantAction.NONE) {
        console.log(
          `processUserMessage: we intercept a command! skipping LLM step..`
        )
        await processActionOrMessage(directVocalCommandAction)
        return
      }
      console.log('🟦 15. No direct command, continuing...')

      // Find the current scene based on cursor position
      const getCurrentSceneAtCursor = (): ClapScene | undefined => {
        const { cursorTimestampAtInMs } = timeline || {
          cursorTimestampAtInMs: 0,
        }

        console.log('🔍 Scene Detection Debug:')
        console.log('- Total scenes available:', scenes?.length || 0)
        console.log('- Cursor position (ms):', cursorTimestampAtInMs)
        console.log('- Active segments:', activeSegments?.length || 0)
        console.log('=== DEBUG: TIMELINE CLAP STATE ===')
        console.log(
          '- Timeline clap scenes:',
          timeline?.clap?.scenes?.length || 0
        )
        console.log(
          '- Timeline clap segments:',
          timeline?.clap?.segments?.length || 0
        )
        if (timeline?.clap?.scenes?.length === 0) {
          console.log(
            '🚨 PROBLEM: No scenes in timeline.clap - this is why AI cannot see script!'
          )
        }
        console.log('=================================')

        // Find segments that are active at the current cursor position
        const segmentsAtCursor = (activeSegments || []).filter(
          (segment) =>
            segment.startTimeInMs <= cursorTimestampAtInMs &&
            segment.endTimeInMs >= cursorTimestampAtInMs
        )

        console.log('- Segments at cursor:', segmentsAtCursor.length)

        // Look for a segment with a scene ID at the cursor position
        const segmentWithScene = segmentsAtCursor.find(
          (segment) => segment.sceneId
        )

        if (segmentWithScene?.sceneId) {
          const foundScene = (scenes || []).find(
            (s) => s.id === segmentWithScene.sceneId
          )
          console.log(
            '- Found scene via segment:',
            foundScene?.sequenceFullText?.substring(0, 100)
          )
          return foundScene
        }

        // Fallback: if no scene found at cursor, check all scenes by timeline position
        // Convert cursor time to approximate line number for scene matching
        if (scenes && scenes.length > 0) {
          console.log('- Using fallback scene selection...')
          // Simple approach: find the scene that would be "closest" to this timeline position
          const totalDurationInMs = timeline?.durationInMs || 0
          const progressRatio =
            totalDurationInMs > 0
              ? cursorTimestampAtInMs / totalDurationInMs
              : 0
          const estimatedSceneIndex = Math.min(
            Math.floor(progressRatio * scenes.length),
            scenes.length - 1
          )

          const fallbackScene = scenes[estimatedSceneIndex]
          console.log('- Estimated scene index:', estimatedSceneIndex)
          console.log(
            '- Fallback scene content:',
            fallbackScene?.sequenceFullText?.substring(0, 100)
          )
          return fallbackScene
        }

        console.log('- No scenes found!')
        return undefined
      }

      const referenceSegment: TimelineSegment | undefined =
        activeSegments?.at(0)
      const scene: ClapScene | undefined = getCurrentSceneAtCursor()

      // Get script from editor
      const scriptEditor = useScriptEditor.getState()
      const scriptFromEditor = scriptEditor.current || ''

      console.log('🎯 Script content check:')
      console.log('- Script editor content length:', scriptFromEditor.length)
      console.log(
        '- Script editor content preview:',
        scriptFromEditor.substring(0, 150)
      )
      console.log('- Scene found:', !!scene)
      console.log(
        '- Scene content length:',
        scene?.sequenceFullText?.length || 0
      )

      // we should be careful with how we filter and send the segments to the API
      //
      // - we need to remove elements that are specific to the browser (eg. audio context nodes)
      // - we may need to remove binary files (base64 assets) like for sound and music,
      //  although some AI models could support it
      // - we don't want to keep all the kinds of segments
      const existingSegments: TimelineSegment[] = (activeSegments || []).filter(
        (s) =>
          // we only keep the camera
          s.category === ClapSegmentCategory.CAMERA ||
          s.category === ClapSegmentCategory.LOCATION ||
          s.category === ClapSegmentCategory.TIME ||
          s.category === ClapSegmentCategory.LIGHTING ||
          s.category === ClapSegmentCategory.ACTION ||
          s.category === ClapSegmentCategory.CHARACTER ||
          s.category === ClapSegmentCategory.DIALOGUE ||
          s.category === ClapSegmentCategory.WEATHER ||
          s.category === ClapSegmentCategory.ERA ||
          s.category === ClapSegmentCategory.MUSIC ||
          s.category === ClapSegmentCategory.SOUND ||
          s.category === ClapSegmentCategory.STYLE ||
          s.category === ClapSegmentCategory.GENERIC
      )

      // this is where we filter out expensive or heavy binary elements
      const serializableSegments: TimelineSegment[] = existingSegments.map(
        (segment) => ({
          ...segment,

          // we remove things that cannot be serialized easily
          audioBuffer: undefined,
          textures: {},

          // we also remove this since it might contain heavy information
          // although at some point we will want to put it back for some types,
          // as the most advanced LLMs can handle images and sound files
          assetUrl: '',
          assetSourceType: ClapAssetSource.EMPTY,
        })
      )

      // Use script content from editor (already retrieved above)
      const request: AssistantRequest = {
        settings,
        prompt: message,
        segments: serializableSegments,
        fullScene: scriptFromEditor,
        actionLine: scene?.line || '',
        entities: entityIndex,
        projectInfo: description,
        history: get().history,
      }

      console.log('📤 SENDING TO AI:')
      console.log('   Script length:', request.fullScene.length, 'characters')
      console.log('   Script preview:', request.fullScene.substring(0, 200))
      console.log('   Number of segments:', request.segments.length)

      console.log(`processUserMessage: calling askAssistant() with:`, request)
      const assistantMessage = await askAssistant(request)
      console.log(
        `processUserMessage: result from askAssistant():`,
        assistantMessage
      )

      if (assistantMessage.action === AssistantAction.UPDATE_STORY_AND_SCENE) {
        await updateStoryAndScene({
          assistantMessage,
          existingSegments,
        })
      } else {
        await processActionOrMessage(assistantMessage)
      }
    } catch (error) {
      console.error('🔴 ERROR in processUserMessage:', error)
      console.error('🔴 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack',
      })
      // Don't throw - show error in chat instead
      const { addEventToHistory } = get()
      addEventToHistory({
        senderId: 'assistant',
        senderName: 'Assistant',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  },
}))
