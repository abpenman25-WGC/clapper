import { computeProviderShortNames } from '@/components/settings/constants'
import { ComputeProvider } from '@aitube/clapper-services'

export function formatProvider(computeProvider?: ComputeProvider): string {
  return `${
    (computeProviderShortNames as any)[computeProvider || ''] || 'None'
  }`
}
