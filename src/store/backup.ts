import { entries, set as idbSet } from 'idb-keyval'
import { blobStore } from './db'
import { useStore } from './useStore'
import type { Project } from '../lib/types'

interface BackupBlob {
  key: string
  mime: string
  dataB64: string
}
interface BackupFile {
  app: 'learning'
  version: 1
  exportedAt: string
  projects: Project[]
  blobs: BackupBlob[]
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve((r.result as string).split(',')[1] ?? '')
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}
function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** Download a full backup (projects tree + all attachments) as a single JSON file. */
export async function exportBackup(): Promise<void> {
  const projects = useStore.getState().projects
  const all = await entries(blobStore)
  const blobs: BackupBlob[] = []
  for (const [key, value] of all) {
    const blob = value as Blob
    blobs.push({ key: String(key), mime: blob.type, dataB64: await blobToBase64(blob) })
  }
  const data: BackupFile = {
    app: 'learning',
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    blobs,
  }
  const out = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(out)
  const a = document.createElement('a')
  a.href = url
  a.download = `learning-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Restore from a backup JSON file, replacing all current data. */
export async function importBackup(file: File): Promise<void> {
  const data = JSON.parse(await file.text()) as BackupFile
  if (data.app !== 'learning' || !Array.isArray(data.projects)) {
    throw new Error('קובץ הגיבוי אינו תקין')
  }
  for (const b of data.blobs ?? []) {
    await idbSet(b.key, base64ToBlob(b.dataB64, b.mime), blobStore)
  }
  useStore.getState().replaceAll(data.projects)
}
