import { ClapImageRatio } from '@aitube/clap'
import { ResolveRequest } from '@aitube/clapper-services'

const TAG = 'OpenAI.generateImage'

// DALL-E 3 supported sizes
// 1024x1024, 1024x1792, 1792x1024
function getSize(
  orientation: ClapImageRatio | undefined
): '1024x1024' | '1024x1792' | '1792x1024' {
  if (orientation === ClapImageRatio.PORTRAIT) return '1024x1792'
  if (orientation === ClapImageRatio.LANDSCAPE) return '1792x1024'
  return '1024x1024'
}

export async function generateImage(
  apiKey: string,
  request: ResolveRequest
): Promise<string> {
  const model = request.settings.imageGenerationWorkflow.data || 'dall-e-3'

  if (!request.prompts.image.positive) {
    throw new Error(`${TAG}: cannot generate without a valid image prompt`)
  }

  const size = getSize(request.meta.orientation as ClapImageRatio)

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
      response_format: 'b64_json',
      quality: model === 'dall-e-3' ? 'hd' : 'standard',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${TAG}: ${response.status} — ${errorText}`)
  }

  const data = await response.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) {
    throw new Error(`${TAG}: no image data returned`)
  }

  return `data:image/png;base64,${b64}`
}
