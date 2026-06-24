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

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Subtopics shown below: the hovered tab's, falling back to the selected tab's.
  const dropdownTopic =
    project.topics.find((t) => t.id === hoveredId) ??
    project.topics.find((t) => t.id === selectedTopicId) ??
    null

  const confirmTopic = project.topics.find((t) => t.id === confirmId)

  return (
    <div
      className="border-b border-line bg-paper"
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-1 overflow-x-auto pt-3">
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
              <div
                key={t.id}
                onMouseEnter={() => setHoveredId(t.id)}
                className={`group flex items-center gap-0.5 whitespace-nowrap rounded-t-xl border-b-2 px-1 transition-colors ${
                  active
                    ? 'border-sage text-ink'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                <button className="px-3 py-2 text-sm font-semibold" onClick={() => selectTopic(t.id)}>
                  {t.name}
                </button>
                <button
                  title="שנה שם"
                  className="grid h-6 w-6 place-items-center rounded-full text-xs opacity-0 hover:bg-sand group-hover:opacity-100"
                  onClick={() => setEditingId(t.id)}
                >
                  ✎
                </button>
                <button
                  title="מחק נושא"
                  className="grid h-6 w-6 place-items-center rounded-full text-xs opacity-0 hover:bg-sand group-hover:opacity-100"
                  onClick={() => setConfirmId(t.id)}
                >
                  ✕
                </button>
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

        {dropdownTopic ? (
          <SubtopicList projectId={project.id} topic={dropdownTopic} />
        ) : (
          <div className="py-2.5 text-xs text-muted">אין נושאים עדיין — הוסיפו נושא ראשון 👆</div>
        )}
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
