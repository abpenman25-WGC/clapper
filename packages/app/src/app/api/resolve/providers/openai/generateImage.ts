import { ClapImageRatio } from '@aitube/clap'
import { ResolveRequest } from '@aitube/clapper-services'

const TAG = 'OpenAI.generateImage'

// DALL-E 3 supported sizes: 1024x1024, 1024x1792, 1792x1024
// gpt-image-1 supported sizes: 1024x1024, 1536x1024, 1024x1536
function getSize(
  orientation: ClapImageRatio | undefined,
  model: string
): string {
  const isGptImage = model === 'gpt-image-1'
  if (orientation === ClapImageRatio.PORTRAIT)
    return isGptImage ? '1024x1536' : '1024x1792'
  if (orientation === ClapImageRatio.LANDSCAPE)
    return isGptImage ? '1536x1024' : '1792x1024'
  return '1024x1024'
}

export async function generateImage(
  apiKey: string,
  request: ResolveRequest
): Promise<string> {
  const model = request.settings.imageGenerationWorkflow.data || 'dall-e-3'

  console.log(`${TAG}: called with model=${model}, prompt="${request.prompts.image.positive?.slice(0, 60)}"`)

  if (!request.prompts.image.positive) {
    throw new Error(`${TAG}: cannot generate without a valid image prompt`)
  }

  const size = getSize(request.meta.orientation as ClapImageRatio, model)

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: request.prompts.image.positive,
      n: 1,
      size,
      ...(model === 'dall-e-3' ? { response_format: 'b64_json' } : {}),
      quality: model === 'dall-e-3' ? 'hd' : 'medium',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${TAG}: ${response.status} — ${errorText}`)
  }

  const data = await response.json()
  const item = data.data?.[0]

  // gpt-image-1 returns b64_json by default; DALL-E 3 may return a URL
  if (item?.b64_json) {
    return `data:image/png;base64,${item.b64_json}`
  }

  if (item?.url) {
    const imgResponse = await fetch(item.url)
    const buffer = await imgResponse.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    return `data:image/png;base64,${b64}`
  }

  throw new Error(`${TAG}: no image data returned — API response: ${JSON.stringify(data)}`)
}
