import { parseRawInputToAction } from '@/services/assistant/parseRawInputToAction'
import { ClapSegmentCategory, isValidNumber } from '@aitube/clap'
import { AssistantAction, AssistantMessage } from '@aitube/clapper-services'

export function parseLangChainResponse(
  langChainResponse?: AssistantMessage | string | any
): AssistantMessage {
  const assistantMessage: AssistantMessage = {
    comment: '',
    action: AssistantAction.NONE,
    updatedStoryBlocks: [],
    updatedSceneSegments: [],
  }

  console.log('[parseLangChainResponse] Input type:', typeof langChainResponse)
  console.log('[parseLangChainResponse] Input value:', langChainResponse)

  // this is a fallback in case of langChain failure
  if (!langChainResponse) {
    console.log('[parseLangChainResponse] Empty response')
    return assistantMessage
  } else if (typeof langChainResponse === 'string') {
    console.log(
      '[parseLangChainResponse] String response, length:',
      langChainResponse.length
    )
    let trimmed = langChainResponse.trim()
    if (!trimmed) {
      console.log('[parseLangChainResponse] Empty string after trim')
      return assistantMessage
    }

    // Try to extract JSON from markdown code blocks
    const jsonMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      console.log(
        '[parseLangChainResponse] Found JSON in code block, extracting...'
      )
      try {
        const parsed = JSON.parse(jsonMatch[1])
        console.log(
          '[parseLangChainResponse] Successfully parsed JSON from code block'
        )
        // Recursively process the parsed JSON object
        return parseLangChainResponse(parsed)
      } catch (err) {
        console.log(
          '[parseLangChainResponse] Failed to parse JSON from code block:',
          err
        )
        // Fall through to use the original trimmed string
      }
    }

    assistantMessage.action = parseRawInputToAction(trimmed)
    console.log(
      '[parseLangChainResponse] Detected action:',
      assistantMessage.action
    )
    if (assistantMessage.action === AssistantAction.NONE) {
      assistantMessage.comment = trimmed
      console.log('[parseLangChainResponse] Set comment to full response')
    }
  } else {
    assistantMessage.comment =
      typeof langChainResponse.comment === 'string'
        ? langChainResponse.comment
        : ''

    assistantMessage.action = Object.keys(AssistantAction).includes(
      `${langChainResponse.action || ''}`.toUpperCase()
    )
      ? langChainResponse.action
      : AssistantAction.NONE

    let i = 0
    for (const segment of langChainResponse.updatedSceneSegments || []) {
      i++
      const segmentId = isValidNumber(segment.segmentId)
        ? segment.segmentId!
        : i

      const category: ClapSegmentCategory =
        segment.category &&
        Object.keys(ClapSegmentCategory).includes(
          segment.category.toUpperCase()
        )
          ? (segment.category as ClapSegmentCategory)
          : ClapSegmentCategory.GENERIC

      const startTimeInMs: number = isValidNumber(segment.startTimeInMs)
        ? segment.startTimeInMs
        : 0
      const endTimeInMs: number = isValidNumber(segment.endTimeInMs)
        ? segment.endTimeInMs
        : 0

      const prompt = segment?.prompt || ''

      // we assume no prompt is an error
      if (prompt) {
        assistantMessage.updatedSceneSegments.push({
          segmentId,
          prompt,
          startTimeInMs,
          endTimeInMs,
          category,
        })
      }
    }

    i = 0
    for (const block of langChainResponse.updatedStoryBlocks || []) {
      i++
      const blockId = isValidNumber(block.blockId) ? block.blockId! : i

      // TODO: rename block.block to block.text or block.content it would be better
      const textBlock = `${block.block || ''}`
      // we assume no prompt is an error
      if (textBlock) {
        assistantMessage.updatedStoryBlocks.push({
          blockId,
          block: textBlock,
        })
      }
    }
  }

  return assistantMessage
}
