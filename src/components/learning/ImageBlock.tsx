import { useBlobUrl } from '../../lib/useBlobUrl'
import { useStore } from '../../store/useStore'
import type { ImageBlock as ImageBlockT } from '../../lib/types'

export default function ImageBlock({ block }: { block: ImageBlockT }) {
  const url = useBlobUrl(block.blobKey)
  const updateImageCaption = useStore((s) => s.updateImageCaption)

  return (
    <div className="my-2">
      {url ? (
        <img
          src={url}
          alt={block.caption || 'תמונת עזר'}
          className="max-h-96 rounded-xl border border-line"
        />
      ) : (
        <div className="grid h-40 w-full max-w-md place-items-center rounded-xl border border-dashed border-line text-sm text-muted">
          טוען תמונה…
        </div>
      )}
      <input
        value={block.caption}
        onChange={(e) => updateImageCaption(block.id, e.target.value)}
        placeholder="כיתוב לתמונה (לא חובה)"
        className="mt-1 w-full max-w-md bg-transparent text-sm text-muted outline-none placeholder:text-muted/40"
      />
    </div>
  )
}
