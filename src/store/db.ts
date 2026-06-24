import { get, set, del, createStore } from 'idb-keyval'

// Dedicated IndexedDB store for binary attachments (images / files / drawings).
export const blobStore = createStore('learning-app', 'blobs')

export function putBlob(key: string, blob: Blob): Promise<void> {
  return set(key, blob, blobStore)
}

export function getBlob(key: string): Promise<Blob | undefined> {
  return get<Blob>(key, blobStore)
}

export function delBlob(key: string): Promise<void> {
  return del(key, blobStore)
}
