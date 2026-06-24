import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { newId } from '../lib/ids'
import { delBlob } from './db'
import type { Block, Project, Selection, Subtopic, Topic } from '../lib/types'

export const LINE_H = 32 // keep in sync with --line-h in index.css

/* ---------- factories ---------- */
function makeSubtopic(name: string): Subtopic {
  return {
    id: newId(),
    name,
    lineNumbers: false,
    blocks: [{ id: newId(), type: 'text', value: '' }],
  }
}
function makeTopic(name: string): Topic {
  return { id: newId(), name, subtopics: [makeSubtopic('תת-נושא 1')] }
}
function makeProject(name: string): Project {
  return { id: newId(), name, topics: [makeTopic('נושא ראשון')] }
}

function seed(): { projects: Project[]; selection: Selection } {
  const p = makeProject('הפרויקט שלי')
  const t = p.topics[0]
  const s = t.subtopics[0]
  return { projects: [p], selection: { projectId: p.id, topicId: t.id, subtopicId: s.id } }
}

/* ---------- blob cleanup helpers ---------- */
function blockBlobKeys(b: Block): string[] {
  if (b.type === 'canvas') return [b.imageKey]
  if (b.type === 'image' || b.type === 'file') return [b.blobKey]
  return []
}
const subtopicBlobKeys = (s: Subtopic) => s.blocks.flatMap(blockBlobKeys)
const topicBlobKeys = (t: Topic) => t.subtopics.flatMap(subtopicBlobKeys)
const projectBlobKeys = (p: Project) => p.topics.flatMap(topicBlobKeys)
function purge(keys: string[]) {
  keys.forEach((k) => void delBlob(k))
}

/* ---------- draft lookups (immer) ---------- */
function findProject(projects: Project[], id: string | null) {
  return projects.find((p) => p.id === id)
}
function findTopic(projects: Project[], pid: string | null, tid: string | null) {
  return findProject(projects, pid)?.topics.find((t) => t.id === tid)
}
function findSelectedSubtopic(projects: Project[], sel: Selection): Subtopic | undefined {
  return findTopic(projects, sel.projectId, sel.topicId)?.subtopics.find(
    (s) => s.id === sel.subtopicId,
  )
}

interface Store {
  projects: Project[]
  selection: Selection

  selectProject(id: string): void
  selectTopic(id: string): void
  selectSubtopic(topicId: string, subtopicId: string): void

  addProject(name: string): void
  renameProject(id: string, name: string): void
  deleteProject(id: string): void

  addTopic(projectId: string, name: string): void
  renameTopic(projectId: string, topicId: string, name: string): void
  deleteTopic(projectId: string, topicId: string): void

  addSubtopic(projectId: string, topicId: string, name: string): void
  renameSubtopic(projectId: string, topicId: string, subtopicId: string, name: string): void
  deleteSubtopic(projectId: string, topicId: string, subtopicId: string): void

  // notebook actions operate on the currently selected subtopic
  setLineNumbers(value: boolean): void
  updateTextValue(blockId: string, value: string): void
  addTextBlock(): void
  addCanvasBlock(): void
  addImageBlock(blobKey: string, caption?: string): void
  addFileBlock(blobKey: string, fileName: string, mime: string, size: number): void
  addLinkBlock(url: string, title: string): void
  updateImageCaption(blockId: string, caption: string): void
  updateLinkTitle(blockId: string, title: string): void
  deleteBlock(blockId: string): void
  moveBlock(blockId: string, dir: -1 | 1): void
  makeBlank(blockId: string, startLine: number, endLine: number): void
  restoreLines(canvasBlockId: string): void
  bumpCanvasRev(blockId: string): void

  replaceAll(projects: Project[]): void
}

export const useStore = create<Store>()(
  persist(
    immer((set) => ({
      ...seed(),

      /* ----- selection ----- */
      selectProject: (id) =>
        set((d) => {
          d.selection.projectId = id
          const p = findProject(d.projects, id)
          d.selection.topicId = p?.topics[0]?.id ?? null
          d.selection.subtopicId = p?.topics[0]?.subtopics[0]?.id ?? null
        }),
      selectTopic: (id) =>
        set((d) => {
          d.selection.topicId = id
          const t = findTopic(d.projects, d.selection.projectId, id)
          d.selection.subtopicId = t?.subtopics[0]?.id ?? null
        }),
      selectSubtopic: (topicId, subtopicId) =>
        set((d) => {
          d.selection.topicId = topicId
          d.selection.subtopicId = subtopicId
        }),

      /* ----- projects ----- */
      addProject: (name) =>
        set((d) => {
          const p = makeProject(name.trim() || 'פרויקט חדש')
          d.projects.push(p)
          d.selection = {
            projectId: p.id,
            topicId: p.topics[0].id,
            subtopicId: p.topics[0].subtopics[0].id,
          }
        }),
      renameProject: (id, name) =>
        set((d) => {
          const p = findProject(d.projects, id)
          if (p) p.name = name.trim() || p.name
        }),
      deleteProject: (id) =>
        set((d) => {
          const idx = d.projects.findIndex((p) => p.id === id)
          if (idx < 0) return
          purge(projectBlobKeys(d.projects[idx]))
          d.projects.splice(idx, 1)
          if (d.selection.projectId === id) {
            const p = d.projects[0]
            d.selection = {
              projectId: p?.id ?? null,
              topicId: p?.topics[0]?.id ?? null,
              subtopicId: p?.topics[0]?.subtopics[0]?.id ?? null,
            }
          }
        }),

      /* ----- topics ----- */
      addTopic: (projectId, name) =>
        set((d) => {
          const p = findProject(d.projects, projectId)
          if (!p) return
          const t = makeTopic(name.trim() || 'נושא חדש')
          p.topics.push(t)
          d.selection = { projectId, topicId: t.id, subtopicId: t.subtopics[0].id }
        }),
      renameTopic: (projectId, topicId, name) =>
        set((d) => {
          const t = findTopic(d.projects, projectId, topicId)
          if (t) t.name = name.trim() || t.name
        }),
      deleteTopic: (projectId, topicId) =>
        set((d) => {
          const p = findProject(d.projects, projectId)
          if (!p) return
          const idx = p.topics.findIndex((t) => t.id === topicId)
          if (idx < 0) return
          purge(topicBlobKeys(p.topics[idx]))
          p.topics.splice(idx, 1)
          if (d.selection.topicId === topicId) {
            const t = p.topics[0]
            d.selection.topicId = t?.id ?? null
            d.selection.subtopicId = t?.subtopics[0]?.id ?? null
          }
        }),

      /* ----- subtopics ----- */
      addSubtopic: (projectId, topicId, name) =>
        set((d) => {
          const t = findTopic(d.projects, projectId, topicId)
          if (!t) return
          const s = makeSubtopic(name.trim() || 'תת-נושא חדש')
          t.subtopics.push(s)
          d.selection = { projectId, topicId, subtopicId: s.id }
        }),
      renameSubtopic: (projectId, topicId, subtopicId, name) =>
        set((d) => {
          const t = findTopic(d.projects, projectId, topicId)
          const s = t?.subtopics.find((x) => x.id === subtopicId)
          if (s) s.name = name.trim() || s.name
        }),
      deleteSubtopic: (projectId, topicId, subtopicId) =>
        set((d) => {
          const t = findTopic(d.projects, projectId, topicId)
          if (!t) return
          const idx = t.subtopics.findIndex((s) => s.id === subtopicId)
          if (idx < 0) return
          purge(subtopicBlobKeys(t.subtopics[idx]))
          t.subtopics.splice(idx, 1)
          if (d.selection.subtopicId === subtopicId) {
            d.selection.subtopicId = t.subtopics[0]?.id ?? null
          }
        }),

      /* ----- notebook (selected subtopic) ----- */
      setLineNumbers: (value) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          if (s) s.lineNumbers = value
        }),
      updateTextValue: (blockId, value) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          const b = s?.blocks.find((x) => x.id === blockId)
          if (b && b.type === 'text') b.value = value
        }),
      addTextBlock: () =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          s?.blocks.push({ id: newId(), type: 'text', value: '' })
        }),
      addCanvasBlock: () =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          s?.blocks.push({
            id: newId(),
            type: 'canvas',
            heightPx: LINE_H * 6,
            imageKey: 'canvas-' + newId(),
            rev: 0,
          })
        }),
      addImageBlock: (blobKey, caption = '') =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          s?.blocks.push({ id: newId(), type: 'image', blobKey, caption })
        }),
      addFileBlock: (blobKey, fileName, mime, size) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          s?.blocks.push({ id: newId(), type: 'file', blobKey, fileName, mime, size })
        }),
      addLinkBlock: (url, title) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          s?.blocks.push({ id: newId(), type: 'link', url, title })
        }),
      updateImageCaption: (blockId, caption) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          const b = s?.blocks.find((x) => x.id === blockId)
          if (b && b.type === 'image') b.caption = caption
        }),
      updateLinkTitle: (blockId, title) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          const b = s?.blocks.find((x) => x.id === blockId)
          if (b && b.type === 'link') b.title = title
        }),
      deleteBlock: (blockId) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          if (!s) return
          const idx = s.blocks.findIndex((x) => x.id === blockId)
          if (idx < 0) return
          purge(blockBlobKeys(s.blocks[idx]))
          s.blocks.splice(idx, 1)
          if (s.blocks.length === 0) s.blocks.push({ id: newId(), type: 'text', value: '' })
        }),
      moveBlock: (blockId, dir) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          if (!s) return
          const idx = s.blocks.findIndex((x) => x.id === blockId)
          const j = idx + dir
          if (idx < 0 || j < 0 || j >= s.blocks.length) return
          const [moved] = s.blocks.splice(idx, 1)
          s.blocks.splice(j, 0, moved)
        }),
      makeBlank: (blockId, startLine, endLine) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          if (!s) return
          const idx = s.blocks.findIndex((x) => x.id === blockId)
          if (idx < 0) return
          const blk = s.blocks[idx]
          if (blk.type !== 'text') return
          const lines = blk.value.split('\n')
          const start = Math.max(0, Math.min(startLine, lines.length - 1))
          const end = Math.max(start, Math.min(endLine, lines.length - 1))
          const count = end - start + 1
          const before: Block = { id: newId(), type: 'text', value: lines.slice(0, start).join('\n') }
          const canvas: Block = {
            id: newId(),
            type: 'canvas',
            heightPx: Math.max(LINE_H * 3, count * LINE_H),
            imageKey: 'canvas-' + newId(),
            rev: 0,
          }
          const after: Block = { id: newId(), type: 'text', value: lines.slice(end + 1).join('\n') }
          s.blocks.splice(idx, 1, before, canvas, after)
        }),
      restoreLines: (canvasBlockId) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          if (!s) return
          const idx = s.blocks.findIndex((x) => x.id === canvasBlockId)
          if (idx < 0) return
          const blk = s.blocks[idx]
          if (blk.type === 'canvas') purge([blk.imageKey])
          const prev = s.blocks[idx - 1]
          const next = s.blocks[idx + 1]
          if (prev && next && prev.type === 'text' && next.type === 'text') {
            prev.value = prev.value && next.value ? prev.value + '\n' + next.value : prev.value + next.value
            s.blocks.splice(idx, 2) // remove canvas + merged next
          } else {
            s.blocks.splice(idx, 1)
          }
          if (s.blocks.length === 0) s.blocks.push({ id: newId(), type: 'text', value: '' })
        }),
      bumpCanvasRev: (blockId) =>
        set((d) => {
          const s = findSelectedSubtopic(d.projects, d.selection)
          const b = s?.blocks.find((x) => x.id === blockId)
          if (b && b.type === 'canvas') b.rev += 1
        }),

      replaceAll: (projects) =>
        set((d) => {
          d.projects = projects
          const p = projects[0]
          d.selection = {
            projectId: p?.id ?? null,
            topicId: p?.topics[0]?.id ?? null,
            subtopicId: p?.topics[0]?.subtopics[0]?.id ?? null,
          }
        }),
    })),
    {
      name: 'learning-store',
      version: 1,
      partialize: (s) => ({ projects: s.projects, selection: s.selection }),
    },
  ),
)
