import { cn } from '@aitube/timeline'

import { ComputeProvider } from '@aitube/clapper-services'
import { formatProvider } from '@/components/toolbars/top-menu/lists/formatProvider'

import { ComputeProviderLogo } from './ComputeProviderLogo'

export function ComputeProviderName({
  className = '',
  children = ComputeProvider.NONE,
}: {
  className?: string
  children?: ComputeProvider
}) {
  return (
    <div className={cn(`flex flex-row items-center space-x-2`, className)}>
      <ComputeProviderLogo
        provider={children}
        height={18}
        className={cn(`rounded-full`)}
      />
      <div>{formatProvider(children)}</div>
    </div>
  )
}
