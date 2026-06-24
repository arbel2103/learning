import { useEffect, useState } from 'react'
import Modal from './Modal'

interface Props {
  open: boolean
  title: string
  placeholder?: string
  initial?: string
  submitLabel?: string
  onSubmit: (value: string) => void
  onClose: () => void
}

export default function NamePrompt({
  open,
  title,
  placeholder = 'הקלד שם…',
  initial = '',
  submitLabel = 'הוסף',
  onSubmit,
  onClose,
}: Props) {
  const [value, setValue] = useState(initial)
  useEffect(() => {
    if (open) setValue(initial)
  }, [open, initial])

  const submit = () => {
    const v = value.trim()
    if (!v) return
    onSubmit(v)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-sage"
      />
      <div className="mt-5 flex justify-start gap-2">
        <button className="btn-primary" onClick={submit} disabled={!value.trim()}>
          {submitLabel}
        </button>
        <button className="btn-soft" onClick={onClose}>
          ביטול
        </button>
      </div>
    </Modal>
  )
}
