import { useStore } from '../../store/useStore'
import { youtubeId } from '../../lib/youtube'
import type { LinkBlock as LinkBlockT } from '../../lib/types'

export default function LinkBlock({ block }: { block: LinkBlockT }) {
  const updateLinkTitle = useStore((s) => s.updateLinkTitle)
  const ytid = youtubeId(block.url)

  return (
    <div className="my-2 max-w-xl">
      {ytid ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-line">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${ytid}`}
            title={block.title || 'סרטון עזר'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2 text-sm transition-colors hover:bg-sand"
        >
          <span className="text-lg">🔗</span>
          <span className="truncate text-sage-dark underline">{block.title || block.url}</span>
        </a>
      )}
      <input
        value={block.title}
        onChange={(e) => updateLinkTitle(block.id, e.target.value)}
        placeholder="כותרת / תיאור (לא חובה)"
        className="mt-1 w-full bg-transparent text-sm text-muted outline-none placeholder:text-muted/40"
      />
    </div>
  )
}
