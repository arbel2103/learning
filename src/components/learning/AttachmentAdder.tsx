import { useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { putBlob } from '../../store/db'
import { newId } from '../../lib/ids'
import Modal from '../common/Modal'

export default function AttachmentAdder() {
  const addTextBlock = useStore((s) => s.addTextBlock)
  const addCanvasBlock = useStore((s) => s.addCanvasBlock)
  const addImageBlock = useStore((s) => s.addImageBlock)
  const addFileBlock = useStore((s) => s.addFileBlock)
  const addLinkBlock = useStore((s) => s.addLinkBlock)

  const imgRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  const onImage = async (f: File | undefined) => {
    if (!f) return
    const key = 'img-' + newId()
    await putBlob(key, f)
    addImageBlock(key)
  }
  const onFile = async (f: File | undefined) => {
    if (!f) return
    const key = 'file-' + newId()
    await putBlob(key, f)
    addFileBlock(key, f.name, f.type, f.size)
  }
  const submitLink = () => {
    const u = url.trim()
    if (!u) return
    addLinkBlock(u, title.trim())
    setUrl('')
    setTitle('')
    setLinkOpen(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-soft text-xs" onClick={addTextBlock}>
        ＋ שורות סיכום
      </button>
      <button className="btn-soft text-xs" onClick={addCanvasBlock}>
        ＋ אזור ציור
      </button>
      <button className="btn-soft text-xs" onClick={() => imgRef.current?.click()}>
        ＋ תמונת עזר
      </button>
      <button className="btn-soft text-xs" onClick={() => fileRef.current?.click()}>
        ＋ קובץ עזר
      </button>
      <button className="btn-soft text-xs" onClick={() => setLinkOpen(true)}>
        ＋ קישור סרטון
      </button>

      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onImage(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="הוספת קישור / סרטון">
        <div className="space-y-2">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitLink()}
            placeholder="כתובת (URL) — למשל קישור ל-YouTube"
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-sage"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitLink()}
            placeholder="כותרת / תיאור (לא חובה)"
            className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-sage"
          />
        </div>
        <div className="mt-5 flex justify-start gap-2">
          <button className="btn-primary" onClick={submitLink} disabled={!url.trim()}>
            הוסף
          </button>
          <button className="btn-soft" onClick={() => setLinkOpen(false)}>
            ביטול
          </button>
        </div>
      </Modal>
    </div>
  )
}
