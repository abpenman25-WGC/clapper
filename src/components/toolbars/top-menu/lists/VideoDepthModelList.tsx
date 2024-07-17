'use client'

import {
  MenubarCheckboxItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar'

import { TagColor } from '@/components/tags/types'
import { Tag } from '@/components/tags/Tag'
import { ComputeProvider } from '@aitube/clapper-services'
import { availableModelsForVideoDepth } from '@/components/settings/constants'
import { useSettings } from '@/services/settings'
import { ComputeProviderName } from '@/components/core/providers/ComputeProviderName'
import { ComputeProviderLogo } from '@/components/core/providers/ComputeProviderLogo'
import { cn } from '@/lib/utils'

import { hasNoPublicAPI } from './hasNoPublicAPI'
import { formatProvider } from './formatProvider'

export function VideoDepthModelList() {
  const provider = useSettings((s) => s.videoDepthProvider)
  const setProvider = useSettings((s) => s.setVideoDepthProvider)
  const model = useSettings((s) => s.videoDepthModel)
  const setModel = useSettings((s) => s.setVideoDepthModel)

  const availableProviders = Object.keys(
    availableModelsForVideoDepth
  ) as ComputeProvider[]
  if (!availableProviders) {
    return null
  }

  return (
    <MenubarSub>
      <MenubarSubTrigger>
        <Tag size="lg" color={TagColor.SLATE}>
          depth&nbsp;mapper
        </Tag>
        <div className={cn(`flex flex-row items-center space-x-2`)}>
          <ComputeProviderLogo
            provider={provider && model ? provider : undefined}
            height={18}
            className={cn(`rounded-full`)}
          />
          <div>{model || 'None'}</div>
        </div>
      </MenubarSubTrigger>
      <MenubarSubContent>
        {availableProviders.map((p) => (
          <MenubarSub key={p}>
            <MenubarSubTrigger>
              <ComputeProviderName>{p}</ComputeProviderName>
            </MenubarSubTrigger>
            <MenubarSubContent>
              {(availableModelsForVideoDepth[p] || []).map((m) => (
                <MenubarCheckboxItem
                  key={m}
                  checked={provider === p && model === m}
                  disabled={hasNoPublicAPI(m)}
                  onClick={(e) => {
                    if (hasNoPublicAPI(m)) {
                      e.stopPropagation()
                      e.preventDefault()
                      return false
                    }
                    setProvider(p)
                    setModel(m)
                    e.stopPropagation()
                    e.preventDefault()
                    return false
                  }}
                >
                  {m}
                </MenubarCheckboxItem>
              ))}
            </MenubarSubContent>
          </MenubarSub>
        ))}
      </MenubarSubContent>
    </MenubarSub>
  )
}
