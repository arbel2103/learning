import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Topic } from '../lib/types'
import ConfirmDialog from './common/ConfirmDialog'
import NamePrompt from './common/NamePrompt'
import InlineRename from './common/InlineRename'

interface Props {
  projectId: string
  topic: Topic
}

export default function SubtopicList({ projectId, topic }: Props) {
  const selectedSubtopicId = useStore((s) => s.selection.subtopicId)
  const selectedTopicId = useStore((s) => s.selection.topicId)
  const selectSubtopic = useStore((s) => s.selectSubtopic)
  const addSubtopic = useStore((s) => s.addSubtopic)
  const renameSubtopic = useStore((s) => s.renameSubtopic)
  const deleteSubtopic = useStore((s) => s.deleteSubtopic)

  const [addOpen, setAddOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const confirmSub = topic.subtopics.find((s) => s.id === confirmId)

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line/70 py-2.5">
      <span className="text-xs font-medium text-muted">תתי-נושאים:</span>
      {topic.subtopics.length === 0 && (
        <span className="text-xs text-muted">עדיין אין — הוסיפו אחד 👇</span>
      )}
      {topic.subtopics.map((s) => {
        const active = s.id === selectedSubtopicId && topic.id === selectedTopicId
        if (editingId === s.id) {
          return (
            <InlineRename
              key={s.id}
              value={s.name}
              onSubmit={(v) => {
                renameSubtopic(projectId, topic.id, s.id, v)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          )
        }
        return (
          <div
            key={s.id}
            className={`group flex items-center gap-1 rounded-full border px-1 text-sm transition-colors ${
              active
                ? 'border-sage bg-sage text-cream'
                : 'border-line bg-paper text-ink hover:bg-sand'
            }`}
          >
            <button
              className="px-2.5 py-1 font-medium"
              onClick={() => selectSubtopic(topic.id, s.id)}
            >
              {s.name}
            </button>
            <button
              title="שנה שם"
              className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                active ? 'hover:bg-white/25' : 'opacity-0 hover:bg-sand-dark group-hover:opacity-100'
              }`}
              onClick={() => setEditingId(s.id)}
            >
              ✎
            </button>
            <button
              title="מחק תת-נושא"
              className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                active ? 'hover:bg-white/25' : 'opacity-0 hover:bg-sand-dark group-hover:opacity-100'
              }`}
              onClick={() => setConfirmId(s.id)}
            >
              ✕
            </button>
          </div>
        )
      })}
      <button
        className="rounded-full border border-dashed border-sage px-2.5 py-1 text-sm text-sage-dark hover:bg-sage/10"
        onClick={() => setAddOpen(true)}
      >
        ＋ תת-נושא
      </button>

      <NamePrompt
        open={addOpen}
        title="תת-נושא חדש"
        placeholder="שם תת-הנושא"
        onSubmit={(name) => addSubtopic(projectId, topic.id, name)}
        onClose={() => setAddOpen(false)}
      />
      <ConfirmDialog
        open={!!confirmSub}
        title="מחיקת תת-נושא"
        message={`למחוק את תת-הנושא "${confirmSub?.name}"? כל הסיכומים והציורים שבו יימחקו.`}
        onConfirm={() => {
          if (confirmId) deleteSubtopic(projectId, topic.id, confirmId)
          setConfirmId(null)
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
