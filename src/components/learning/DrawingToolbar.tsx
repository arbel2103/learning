interface Props {
  tool: 'pen' | 'eraser'
  setTool: (t: 'pen' | 'eraser') => void
  color: string
  setColor: (c: string) => void
  width: number
  setWidth: (n: number) => void
  onClear: () => void
  onRestore: () => void
}

export default function DrawingToolbar({
  tool,
  setTool,
  color,
  setColor,
  width,
  setWidth,
  onClear,
  onRestore,
}: Props) {
  const btn = (active: boolean) =>
    `grid h-9 w-9 place-items-center rounded-lg text-base transition-colors ${
      active ? 'bg-ink text-cream' : 'bg-paper text-ink hover:bg-sand'
    }`

  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-2 rounded-xl border border-line bg-cream p-1.5">
      <button className={btn(tool === 'pen')} title="עט" onClick={() => setTool('pen')}>
        ✏️
      </button>
      <button className={btn(tool === 'eraser')} title="מחק" onClick={() => setTool('eraser')}>
        🧽
      </button>

      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="צבע העט"
        className="h-7 w-7 cursor-pointer rounded-full border border-line bg-transparent p-0"
      />

      {/* thickness gauge */}
      <div className="flex flex-col items-center gap-1 py-1">
        <span
          className="rounded-full bg-ink"
          style={{ width: Math.max(2, width), height: Math.max(2, width) }}
        />
        <input
          type="range"
          min={1}
          max={30}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          title="עובי העט"
          className="accent-sage"
          style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 90, width: 20 }}
        />
        <span className="text-[10px] text-muted">{width}px</span>
      </div>

      <button
        className="grid h-8 w-9 place-items-center rounded-lg bg-paper text-sm text-clay-dark hover:bg-sand"
        title="נקה את אזור הציור"
        onClick={onClear}
      >
        🗑
      </button>
      <button
        className="rounded-lg bg-paper px-1 py-1 text-[10px] leading-tight text-sage-dark hover:bg-sand"
        title="החזר שורות (הסר את אזור הציור)"
        onClick={onRestore}
      >
        החזר<br />שורות
      </button>
    </div>
  )
}
