import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onSubmit: (value: string) => void
  onCancel: () => void
  className?: string
}

/** Controlled inline text input used while renaming a tab / chip. */
export default function InlineRename({ value, onSubmit, onCancel, className }: Props) {
  const [v, setV] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const commit = () => onSubmit(v.trim() || value)

  return (
    <input
      ref={ref}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        } else if (e.key === 'Escape') {
          onCancel()
        }
      }}
      onBlur={commit}
      className={
        className ??
        'min-w-0 rounded-md border border-sage bg-paper px-2 py-1 text-sm outline-none'
      }
    />
  )
}
