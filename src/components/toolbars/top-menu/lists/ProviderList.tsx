'use client'

import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar'

import { computeProviderShortNames } from '@/components/settings/constants'

import { ComputeProvider } from '@aitube/clapper-services'
import { TagColor } from '@/components/tags/types'
import { Tag } from '@/components/tags/Tag'
import { hasNoPublicAPI } from './hasNoPublicAPI'

const defaultProviders: ComputeProvider[] = Object.keys(
  computeProviderShortNames
) as ComputeProvider[]

export function ProviderList({
  providers = defaultProviders,
  current,
  setter,
}: {
  providers?: ComputeProvider[]
  current?: ComputeProvider
  setter: (provider: ComputeProvider) => void
}) {
  return (
    <MenubarSub>
      <MenubarSubTrigger>
        <Tag size="lg" color={TagColor.GRAY}>
          cloud&nbsp;vendor
        </Tag>
        {(computeProviderShortNames as any)[current || ''] || 'None'}
      </MenubarSubTrigger>
      <MenubarSubContent>
        {providers.map((provider) => (
          <MenubarCheckboxItem
            key={provider}
            checked={current === provider}
            disabled={hasNoPublicAPI(provider)}
            className={
              hasNoPublicAPI(provider) ||
              hasNoPublicAPI(computeProviderShortNames[provider])
                ? 'opacity-50'
                : 'opacity-100'
            }
            onClick={(e) => {
              if (
                hasNoPublicAPI(provider) ||
                hasNoPublicAPI(computeProviderShortNames[provider])
              ) {
                e.stopPropagation()
                e.preventDefault()
                return false
              }
              setter(provider)
              e.stopPropagation()
              e.preventDefault()
              return false
            }}
          >
            {computeProviderShortNames[provider]}
          </MenubarCheckboxItem>
        ))}
      </MenubarSubContent>
    </MenubarSub>
  )
}
