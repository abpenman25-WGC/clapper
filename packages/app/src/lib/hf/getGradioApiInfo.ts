import { Client } from '@gradio/client'

import { GradioApiInfo } from './types'
import { parseHuggingFaceHubId } from './parseHuggingFaceHubId'

export async function getGradioApiInfo({
  url,
  apiKey,
}: {
  url: string
  apiKey?: string
}): Promise<GradioApiInfo> {
  const { ownerAndId } = parseHuggingFaceHubId(url, 'spaces')

  const token = apiKey as `hf_${string}` | undefined

  const app = await Client.connect(ownerAndId, {
    token,
  })
  const apiInfo: GradioApiInfo = await app.view_api()
  return apiInfo
}
