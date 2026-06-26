import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Project } from '../lib/types'
import SubtopicList from './SubtopicList'
import ConfirmDialog from './common/ConfirmDialog'
import NamePrompt from './common/NamePrompt'
import InlineRename from './common/InlineRename'

interface Props {
  project: Project
}

export default function TopicTabs({ project }: Props) {
  const selectedTopicId = useStore((s) => s.selection.topicId)
  const selectTopic = useStore((s) => s.selectTopic)
  const addTopic = useStore((s) => s.addTopic)
  const renameTopic = useStore((s) => s.renameTopic)
  const deleteTopic = useStore((s) => s.deleteTopic)

  const [addOpen, setAddOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const confirmTopic = project.topics.find((t) => t.id === confirmId)

  return (
    <div className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
        {project.topics.map((t) => {
          const active = t.id === selectedTopicId
          if (editingId === t.id) {
            return (
              <InlineRename
                key={t.id}
                value={t.name}
                onSubmit={(v) => {
                  renameTopic(project.id, t.id, v)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            )
          }
          return (
            <div key={t.id} className="group/topic relative">
              <div
                className={`flex items-center gap-0.5 whitespace-nowrap rounded-full border px-1 transition-colors ${
                  active
                    ? 'border-sage bg-sage text-cream'
                    : 'border-line bg-paper text-ink hover:bg-sand'
                }`}
              >
                <button
                  className="px-3 py-1.5 text-sm font-semibold"
                  onClick={() => selectTopic(t.id)}
                >
                  {t.name}
                </button>
                <button
                  title="שנה שם"
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    active ? 'hover:bg-white/25' : 'opacity-0 hover:bg-sand-dark group-hover/topic:opacity-100'
                  }`}
                  onClick={() => setEditingId(t.id)}
                >
                  ✎
                </button>
                <button
                  title="מחק נושא"
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    active ? 'hover:bg-white/25' : 'opacity-0 hover:bg-sand-dark group-hover/topic:opacity-100'
                  }`}
                  onClick={() => setConfirmId(t.id)}
                >
                  ✕
                </button>
              </div>

              {/* subtopics dropdown — opens only on hover (kept open while editing) */}
              <div className="invisible absolute start-0 top-full z-40 pt-1 opacity-0 transition-opacity duration-100 group-hover/topic:visible group-hover/topic:opacity-100 group-focus-within/topic:visible group-focus-within/topic:opacity-100">
                <div className="card p-1 shadow-pop">
                  <SubtopicList projectId={project.id} topic={t} />
                </div>
              </div>
            </div>
          )
        })}

        <button
          className="ms-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-sage-dark hover:bg-sage/10"
          onClick={() => setAddOpen(true)}
        >
          ＋ נושא
        </button>
      </div>

      <NamePrompt
        open={addOpen}
        title="נושא חדש"
        placeholder="שם הנושא"
        onSubmit={(name) => addTopic(project.id, name)}
        onClose={() => setAddOpen(false)}
      />
      <ConfirmDialog
        open={!!confirmTopic}
        title="מחיקת נושא"
        message={`למחוק את הנושא "${confirmTopic?.name}"? כל תתי-הנושאים והסיכומים שבו יימחקו.`}
        onConfirm={() => {
          if (confirmId) deleteTopic(project.id, confirmId)
          setConfirmId(null)
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
