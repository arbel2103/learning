import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { getBlob, putBlob } from '../../store/db'
import type { CanvasBlock as CanvasBlockT } from '../../lib/types'
import DrawingToolbar from './DrawingToolbar'

export default function CanvasBlock({ block }: { block: CanvasBlockT }) {
  const restoreLines = useStore((s) => s.restoreLines)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [color, setColor] = useState('#2b2a28')
  const [width, setWidth] = useState(3)

  // Size the canvas and load any saved drawing (once per image / height).
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const w = Math.max(1, Math.floor(wrap.clientWidth))
    canvas.width = w
    canvas.height = block.heightPx
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    let cancelled = false
    getBlob(block.imageKey).then((blob) => {
      if (cancelled || !blob || !ctx) return
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, block.heightPx)
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
    return () => {
      cancelled = true
    }
  }, [block.imageKey, block.heightPx])

  const applyStroke = (ctx: CanvasRenderingContext2D) => {
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = tool === 'eraser' ? width * 3 : width
  }

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const r = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    }
  }

  const save = () => {
    canvasRef.current?.toBlob((b) => {
      if (b) void putBlob(block.imageKey, b)
    }, 'image/png')
  }

  const onDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* some environments lack an active pointer; drawing still works */
    }
    drawing.current = true
    const p = getPos(e)
    last.current = p
    applyStroke(ctx)
    ctx.beginPath()
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx || !last.current) return
    const p = getPos(e)
    applyStroke(ctx)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }

  const onUp = (e: React.PointerEvent) => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    save()
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    save()
  }

  return (
    <div className="my-1 flex gap-2">
      <DrawingToolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        width={width}
        setWidth={setWidth}
        onClear={clear}
        onRestore={() => restoreLines(block.id)}
      />
      <div
        ref={wrapRef}
        className="relative flex-1 overflow-hidden rounded-lg border border-dashed border-sand-dark bg-paper"
      >
        <span className="pointer-events-none absolute start-2 top-1 text-[10px] text-muted/70">
          אזור ציור חופשי
        </span>
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            height: block.heightPx,
            width: '100%',
            touchAction: 'none',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
          className="block"
        />
      </div>
    </div>
  )
}
