import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { exportBackup, importBackup } from '../store/backup'
import ConfirmDialog from './common/ConfirmDialog'
import NamePrompt from './common/NamePrompt'
import InlineRename from './common/InlineRename'

export default function ProjectBar() {
  const projects = useStore((s) => s.projects)
  const selectedId = useStore((s) => s.selection.projectId)
  const selectProject = useStore((s) => s.selectProject)
  const addProject = useStore((s) => s.addProject)
  const renameProject = useStore((s) => s.renameProject)
  const deleteProject = useStore((s) => s.deleteProject)

  const [addOpen, setAddOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const confirmProject = projects.find((p) => p.id === confirmId)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    try {
      await importBackup(file)
      alert('הגיבוי יובא בהצלחה ✔')
    } catch (err) {
      alert('שגיאה בייבוא הגיבוי: ' + (err as Error).message)
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        {/* brand + backup */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage text-cream">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4z" />
                <path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20z" />
              </svg>
            </span>
            <h1 className="text-lg font-extrabold tracking-tight">מרחב הלמידה</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="btn-ghost text-xs" onClick={() => void exportBackup()}>
              ⬇ ייצוא גיבוי
            </button>
            <button className="btn-ghost text-xs" onClick={() => fileRef.current?.click()}>
              ⬆ ייבוא גיבוי
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                void onImport(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
        </div>

        {/* project tabs ("page bar") */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3">
          {projects.map((p) => {
            const active = p.id === selectedId
            if (editingId === p.id) {
              return (
                <InlineRename
                  key={p.id}
                  value={p.name}
                  onSubmit={(v) => {
                    renameProject(p.id, v)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              )
            }
            return (
              <div
                key={p.id}
                className={`group flex items-center gap-1 whitespace-nowrap rounded-full border px-1 transition-colors ${
                  active ? 'border-ink bg-ink text-cream' : 'border-line bg-paper text-ink hover:bg-sand'
                }`}
              >
                <button className="px-3 py-1.5 text-sm font-medium" onClick={() => selectProject(p.id)}>
                  {p.name}
                </button>
                <button
                  title="שנה שם"
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    active ? 'hover:bg-white/20' : 'opacity-0 hover:bg-sand-dark group-hover:opacity-100'
                  }`}
                  onClick={() => setEditingId(p.id)}
                >
                  ✎
                </button>
                <button
                  title="מחק פרויקט"
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    active ? 'hover:bg-white/20' : 'opacity-0 hover:bg-sand-dark group-hover:opacity-100'
                  }`}
                  onClick={() => setConfirmId(p.id)}
                >
                  ✕
                </button>
              </div>
            )
          })}
          <button className="btn-soft whitespace-nowrap" onClick={() => setAddOpen(true)}>
            ＋ פרויקט חדש
          </button>
        </div>
      </div>

      <NamePrompt
        open={addOpen}
        title="פרויקט חדש"
        placeholder="שם הפרויקט"
        onSubmit={(name) => addProject(name)}
        onClose={() => setAddOpen(false)}
      />
      <ConfirmDialog
        open={!!confirmProject}
        title="מחיקת פרויקט"
        message={`למחוק את הפרויקט "${confirmProject?.name}"? כל הנושאים, תתי-הנושאים והסיכומים שבו יימחקו לצמיתות.`}
        onConfirm={() => {
          if (confirmId) deleteProject(confirmId)
          setConfirmId(null)
        }}
        onCancel={() => setConfirmId(null)}
      />
    </header>
  )
}
