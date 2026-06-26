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

/** Vertical menu of a topic's subtopics, ending with an "add" row. */
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
    <div className="flex w-52 flex-col">
      {topic.subtopics.length === 0 && (
        <span className="px-3 py-1.5 text-xs text-muted">עדיין אין תתי-נושאים</span>
      )}

      {topic.subtopics.map((s) => {
        const active = s.id === selectedSubtopicId && topic.id === selectedTopicId
        if (editingId === s.id) {
          return (
            <div key={s.id} className="px-1 py-0.5">
              <InlineRename
                value={s.name}
                onSubmit={(v) => {
                  renameSubtopic(projectId, topic.id, s.id, v)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
                className="w-full rounded-md border border-sage bg-paper px-2 py-1 text-sm outline-none"
              />
            </div>
          )
        }
        return (
          <div
            key={s.id}
            className={`group/sub flex items-center gap-1 rounded-lg px-1 transition-colors ${
              active ? 'bg-sage text-cream' : 'hover:bg-sand'
            }`}
          >
            <button
              className="flex-1 truncate px-2 py-1.5 text-start text-sm font-medium"
              onClick={() => selectSubtopic(topic.id, s.id)}
              title={s.name}
            >
              {s.name}
            </button>
            <button
              title="שנה שם"
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${
                active ? 'hover:bg-white/25' : 'opacity-0 hover:bg-sand-dark group-hover/sub:opacity-100'
              }`}
              onClick={() => setEditingId(s.id)}
            >
              ✎
            </button>
            <button
              title="מחק תת-נושא"
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${
                active ? 'hover:bg-white/25' : 'opacity-0 hover:bg-sand-dark group-hover/sub:opacity-100'
              }`}
              onClick={() => setConfirmId(s.id)}
            >
              ✕
            </button>
          </div>
        )
      })}

      <button
        className="mt-0.5 rounded-lg px-3 py-1.5 text-start text-sm text-sage-dark hover:bg-sage/10"
        onClick={() => setAddOpen(true)}
      >
        ＋ הוסף תת-נושא
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
