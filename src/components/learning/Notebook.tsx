import type { ReactNode } from 'react'
import { useStore } from '../../store/useStore'
import type { Subtopic } from '../../lib/types'
import AttachmentAdder from './AttachmentAdder'
import TextBlock from './TextBlock'
import CanvasBlock from './CanvasBlock'
import ImageBlock from './ImageBlock'
import FileBlock from './FileBlock'
import LinkBlock from './LinkBlock'

function BlockShell({
  blockId,
  canUp,
  canDown,
  children,
}: {
  blockId: string
  canUp: boolean
  canDown: boolean
  children: ReactNode
}) {
  const moveBlock = useStore((s) => s.moveBlock)
  const deleteBlock = useStore((s) => s.deleteBlock)
  return (
    <div className="group/block relative rounded-lg px-1 py-1 transition-colors hover:bg-cream/60">
      <div className="absolute start-1 top-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
        <button
          className="grid h-6 w-6 place-items-center rounded-full bg-paper text-xs shadow-soft disabled:opacity-30"
          disabled={!canUp}
          onClick={() => moveBlock(blockId, -1)}
          title="הזז למעלה"
        >
          ↑
        </button>
        <button
          className="grid h-6 w-6 place-items-center rounded-full bg-paper text-xs shadow-soft disabled:opacity-30"
          disabled={!canDown}
          onClick={() => moveBlock(blockId, 1)}
          title="הזז למטה"
        >
          ↓
        </button>
        <button
          className="grid h-6 w-6 place-items-center rounded-full bg-paper text-xs text-clay-dark shadow-soft"
          onClick={() => deleteBlock(blockId)}
          title="מחק בלוק"
        >
          🗑
        </button>
      </div>
      {children}
    </div>
  )
}

export default function Notebook({ subtopic }: { subtopic: Subtopic }) {
  const setLineNumbers = useStore((s) => s.setLineNumbers)
  const blocks = subtopic.blocks

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{subtopic.name}</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={subtopic.lineNumbers}
            onChange={(e) => setLineNumbers(e.target.checked)}
            className="h-4 w-4 accent-sage"
          />
          מספור שורות
        </label>
      </div>

      <AttachmentAdder />

      <div className="card mt-4 p-3 sm:p-6">
        {blocks.map((b, i) => (
          <BlockShell
            key={b.id}
            blockId={b.id}
            canUp={i > 0}
            canDown={i < blocks.length - 1}
          >
            {b.type === 'text' && <TextBlock block={b} lineNumbers={subtopic.lineNumbers} />}
            {b.type === 'canvas' && <CanvasBlock block={b} />}
            {b.type === 'image' && <ImageBlock block={b} />}
            {b.type === 'file' && <FileBlock block={b} />}
            {b.type === 'link' && <LinkBlock block={b} />}
          </BlockShell>
        ))}
      </div>
    </div>
  )
}
