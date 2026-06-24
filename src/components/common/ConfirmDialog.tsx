import Modal from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'מחק',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-5 flex justify-start gap-2">
        <button className="btn bg-clay-dark text-cream hover:bg-clay" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn-soft" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </Modal>
  )
}
