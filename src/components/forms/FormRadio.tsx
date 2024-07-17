import { MdOutlineCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md'

import { cn } from '@/lib/utils'

import { FormField } from './FormField'

export function FormRadio({
  label,
  className,
  selected,
  items,
  horizontal,
  centered,
}: {
  label?: string
  className?: string
  selected?: string
  items?: { name: string; label: string; disabled?: boolean }[]
  horizontal?: boolean
  centered?: boolean
}) {
  return (
    <FormField
      label={label}
      className={cn(`flex-row space-x-5`, className)}
      horizontal={horizontal}
      centered={centered}
    >
      {items?.map((item) => (
        <div
          key={item.name}
          className={cn(
            `flex flex-row items-center space-x-2`,
            selected === item.name
              ? `font-light text-stone-200`
              : item.disabled
                ? `font-light text-stone-600`
                : `font-light text-stone-400`
          )}
        >
          {selected === item.name ? (
            <MdOutlineCheckCircle className="text-lg" />
          ) : (
            <MdRadioButtonUnchecked className="text-lg" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </FormField>
  )
}
