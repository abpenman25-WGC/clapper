'use server'

import { ClapWorkflowProvider } from '@aitube/clap'
import { RunnableLike } from '@langchain/core/runnables'
import { ChatPromptValueInterface } from '@langchain/core/prompt_values'
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
} from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { ChatGroq } from '@langchain/groq'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatCohere } from '@langchain/cohere'
import { ChatMistralAI } from '@langchain/mistralai'
import { ChatVertexAI } from '@langchain/google-vertexai'
// to properly support Replicate and Hugging Face we need the following packages:
// import { ChatReplicate } from "@langchain/replicate"
// import { ChatHuggingFace } from "@langchain/huggingface"

import {
  AssistantInput,
  AssistantAction,
  AssistantMessage,
  AssistantRequest,
  AssistantSceneSegment,
  AssistantStoryBlock,
  ChatEventVisibility,
} from '@aitube/clapper-services'

import { examples, humanTemplate, systemTemplate } from './templates'
import { isValidNumber } from '@/lib/utils'
import { assistantMessageParser, formatInstructions } from './parser'
import { parseRawInputToAction } from '@/services/assistant/parseRawInputToAction'
import { parseLangChainResponse } from './parseLangChainResponse'
import { getApiKey } from '../getApiKey'
import {
  builtinProviderCredentialsAnthropic,
  builtinProviderCredentialsCohere,
  builtinProviderCredentialsGoogle,
  builtinProviderCredentialsGroq,
  builtinProviderCredentialsMistralai,
  builtinProviderCredentialsOpenai,
} from '../globalSettings'

/**
 * Query the preferred language model on the user prompt + the segments of the current scene
 *
 * @param userPrompt
 * @param segments
 * @returns
 */
export async function askAnyAssistant({
  settings,

  prompt,

  // the slice to edit
  segments = [],

  fullScene = '',

  actionLine = '',

  // used to provide more context
  entities = {},

  // used to provide more context
  projectInfo = '',

  history = [],
}: AssistantRequest): Promise<AssistantMessage> {
  const workflow = settings.assistantWorkflow
  const provider = workflow.provider
  const modelName = workflow.data

  console.log('askAnyAssistant: provider =', provider, 'model =', modelName)
  console.log('askAnyAssistant: groqApiKey length =', settings.groqApiKey?.length || 0)

  if (!provider) {
    throw new Error(`Missing assistant provider`)
  }

  let coerceable:
    | undefined
    | RunnableLike<ChatPromptValueInterface, AIMessageChunk> =
    provider === ClapWorkflowProvider.GROQ
      ? (() => {
          const apiKey = getApiKey(
            settings.groqApiKey,
            builtinProviderCredentialsGroq,
            settings.clapperApiKey
          )
          console.log('askAnyAssistant: final apiKey length =', apiKey?.length || 0)
          console.log('askAnyAssistant: creating ChatGroq with model =', modelName)
          return new ChatGroq({
            apiKey,
            modelName,
            // temperature: 0.7,
          })
        })()
      : provider === ClapWorkflowProvider.OPENAI
        ? new ChatOpenAI({
            openAIApiKey: getApiKey(
              settings.openaiApiKey,
              builtinProviderCredentialsOpenai,
              settings.clapperApiKey
            ),
            modelName,
            // temperature: 0.7,
          })
        : provider === ClapWorkflowProvider.ANTHROPIC
          ? new ChatAnthropic({
              anthropicApiKey: getApiKey(
                settings.anthropicApiKey,
                builtinProviderCredentialsAnthropic,
                settings.clapperApiKey
              ),
              modelName,
              // temperature: 0.7,
            })
          : provider === ClapWorkflowProvider.COHERE
            ? new ChatCohere({
                apiKey: getApiKey(
                  settings.cohereApiKey,
                  builtinProviderCredentialsCohere,
                  settings.clapperApiKey
                ),
                model: modelName,
                // temperature: 0.7,
              })
            : provider === ClapWorkflowProvider.MISTRALAI
              ? new ChatMistralAI({
                  apiKey: getApiKey(
                    settings.mistralAiApiKey,
                    builtinProviderCredentialsMistralai,
                    settings.clapperApiKey
                  ),
                  modelName,
                  // temperature: 0.7,
                })
              : provider === ClapWorkflowProvider.GOOGLE
                ? new ChatVertexAI({
                    apiKey: getApiKey(
                      settings.googleApiKey,
                      builtinProviderCredentialsGoogle,
                      settings.clapperApiKey
                    ),
                    modelName,
                    // temperature: 0.7,
                  })
                : undefined

  if (!coerceable) {
    throw new Error(
      `Provider ${provider} is not supported yet. If a LangChain bridge exists for this provider, then you can add it to Clapper.`
    )
  }

  const chatPrompt = ChatPromptTemplate.fromMessages([
    ['system', systemTemplate],
    new MessagesPlaceholder('chatHistory'),
    ['human', humanTemplate],
  ])

  //const storyBlocks: AssistantStorySentence[] = fullScene.split(/(?:. |\n)/).map(storySentence => {
  //})

  const storyBlocks: AssistantStoryBlock[] = [
    {
      blockId: 0,
      block: fullScene,
    },
    {
      blockId: 1,
      block: actionLine,
    },
  ]

  // we don't give the whole thing to the LLM as to not confuse it,
  // and also to keep things tight and performant
  const sceneSegments: AssistantSceneSegment[] = segments.map((segment, i) => ({
    segmentId: i,
    prompt: segment.prompt,
    startTimeInMs: segment.startTimeInMs,
    endTimeInMs: segment.endTimeInMs,
    category: segment.category,
  }))

  // TODO put this into a type
  const inputData: AssistantInput = {
    directorRequest: prompt,
    storyBlocks,
    sceneSegments,
  }

  // console.log("INPUT:", JSON.stringify(inputData, null, 2))

  const chain = chatPrompt
    .pipe(coerceable)
    // .pipe(assistantMessageParser)  // temporarily disable structured parsing

  let assistantMessage: AssistantMessage = {
    comment: '',
    action: AssistantAction.NONE,
    updatedStoryBlocks: [],
    updatedSceneSegments: [],
  }
  
  // For simple greetings, return a friendly response without calling the LLM
  const simpleGreetings = ['hello', 'hi', 'hey', 'test']
  if (simpleGreetings.some(greeting => prompt.toLowerCase().includes(greeting))) {
    assistantMessage.comment = `Hello! I'm your AI assistant. I can help you create and edit video scenes. Try asking me to "create a scene" or describe what you'd like to see in your video.`
    return assistantMessage
  }

  try {
    const rawResponse = await chain.invoke({
      formatInstructions,
      examples,
      projectInfo,
      inputData: JSON.stringify(inputData),

      // we don't use this capability yet, but we can create a "fake"
      // chat history that will contain JSON and will only be shown to the AI
      // by using the `visibility` setting
      chatHistory: history
        .filter(
          (event) => event.visibility !== ChatEventVisibility.TO_USER_ONLY
        )
        .map(
          ({
            eventId,
            senderId,
            senderName,
            roomId,
            roomName,
            sentAt,
            message,
            isCurrentUser,
            visibility,
          }) => {
            if (isCurrentUser) {
              return new HumanMessage(message)
            } else {
              return new AIMessage(message)
            }
          }
        ),
    })
    console.log("askAnyAssistant: raw response from LLM:")
    console.log(JSON.stringify(rawResponse, null, 2))
    console.log("askAnyAssistant: attempting to parse response...")

    assistantMessage = parseLangChainResponse(rawResponse as any)
    console.log("askAnyAssistant: parsing successful!")
    // console.log('assistantMessage:', assistantMessage)
  } catch (err) {
    // LangChain failure (this happens quite often, actually)

    // console.log(`Langchain error:\n${err}`)
    let errorPlainText = `${err}`

    // Markdown formatting failure
    errorPlainText = `${errorPlainText.split('```').unshift() || errorPlainText}`

    // JSON parsing exception failure
    errorPlainText =
      errorPlainText.split(`Error: Failed to parse. Text: "`).pop() ||
      errorPlainText

    errorPlainText =
      errorPlainText.split(`". Error: SyntaxError`).shift() || errorPlainText

    if (errorPlainText) {
      console.log(
        `failed to parse the response from the LLM, trying to repair the output from LangChain..`
      )
      console.log("Raw error response that failed to parse:")
      console.log(errorPlainText)

      try {
        assistantMessage = parseLangChainResponse(JSON.parse(errorPlainText))
      } catch (err) {
        console.log(`repairing the output failed!`, err)
        console.log("Final parsed errorPlainText:", errorPlainText)
        
        // Since parsing failed, let's create a helpful response for the user
        assistantMessage.comment = `Hello! I received your message "${prompt}" but I'm having trouble with the response format. The AI is working but there seems to be a formatting issue. ${errorPlainText ? 'Raw response: ' + errorPlainText : ''}`
        assistantMessage.action = AssistantAction.NONE
        assistantMessage.updatedSceneSegments = []
        assistantMessage.updatedStoryBlocks = []
        if (!errorPlainText) {
          throw new Error(
            `failed to repair the output from LangChain (empty string)`
          )
        }
      }
    } else {
      throw new Error(
        `couldn't process the request or parse the response (${err})`
      )
    }
  }

  return assistantMessage
}
