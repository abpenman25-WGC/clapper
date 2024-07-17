import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { FormLabel } from './FormLabel'

export function FormField({
  label,
  children,
  className,
  horizontal = false,
  centered = false,
}: {
  label?: ReactNode
  children?: ReactNode
  className?: string
  horizontal?: boolean
  centered?: boolean
}) {
  return (
    <div
      className={cn(
        `flex flex-col space-y-3`,
        `text-base font-thin text-stone-400`,
        horizontal ? '' : 'w-full'
      )}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <div
        className={cn(
          `flex`,
          horizontal ? '' : 'w-full',
          centered ? (horizontal ? 'items-center' : 'justify-center') : '',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
