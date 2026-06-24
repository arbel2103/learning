import { useBlobUrl } from '../../lib/useBlobUrl'
import type { FileBlock as FileBlockT } from '../../lib/types'

function formatBytes(n: number): string {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileBlock({ block }: { block: FileBlockT }) {
  const url = useBlobUrl(block.blobKey)

  return (
    <a
      href={url}
      download={block.fileName}
      className="my-2 flex max-w-md items-center gap-3 rounded-xl border border-line bg-cream px-3 py-2 transition-colors hover:bg-sand"
    >
      <span className="text-2xl">📎</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{block.fileName}</span>
        <span className="block text-xs text-muted">{formatBytes(block.size)} · לחצו להורדה</span>
      </span>
    </a>
  )
}
