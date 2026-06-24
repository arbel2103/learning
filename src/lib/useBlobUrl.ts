import { useEffect, useState } from 'react'
import { getBlob } from '../store/db'

/** Loads a blob from IndexedDB and exposes a transient object URL, revoked on cleanup. */
export function useBlobUrl(key: string | undefined): string | undefined {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let active = true
    let created: string | undefined
    if (!key) {
      setUrl(undefined)
      return
    }
    getBlob(key).then((blob) => {
      if (!active || !blob) return
      created = URL.createObjectURL(blob)
      setUrl(created)
    })
    return () => {
      active = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [key])

  return url
}
