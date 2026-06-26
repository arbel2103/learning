import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { LINE_H, useStore } from '../../store/useStore'
import type { BoldRange, TextBlock as TextBlockT } from '../../lib/types'

interface Props {
  block: TextBlockT
  lineNumbers: boolean
}

/** Split value into display segments, marking which are bold. */
function buildSegments(value: string, ranges: BoldRange[]) {
  const pts = new Set<number>([0, value.length])
  for (const r of ranges) {
    pts.add(Math.max(0, Math.min(value.length, r.start)))
    pts.add(Math.max(0, Math.min(value.length, r.end)))
  }
  const sorted = [...pts].sort((a, b) => a - b)
  const segs: { text: string; bold: boolean }[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (b <= a) continue
    const bold = ranges.some((r) => r.start <= a && r.end >= b)
    segs.push({ text: value.slice(a, b), bold })
  }
  return segs
}

// shared text metrics so the mirror and the textarea align exactly
const metrics: CSSProperties = {
  fontFamily: 'Assistant, system-ui, sans-serif',
  fontSize: '17px',
  lineHeight: LINE_H + 'px',
  letterSpacing: 'normal',
  padding: '0 4px',
}

export default function TextBlock({ block, lineNumbers }: Props) {
  const updateTextValue = useStore((s) => s.updateTextValue)
  const toggleBold = useStore((s) => s.toggleBold)
  const setText = useStore((s) => s.setText)
  const makeBlank = useStore((s) => s.makeBlank)
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(LINE_H * 3, el.scrollHeight) + 'px'
  }, [block.value])

  const ranges = Array.isArray(block.bold) ? block.bold : []
  const lineCount = block.value.length ? block.value.split('\n').length : 1

  const selectedLineRange = () => {
    const el = ref.current
    if (!el) return { startLine: 0, endLine: 0 }
    const startLine = block.value.slice(0, el.selectionStart).split('\n').length - 1
    const endLine = block.value.slice(0, el.selectionEnd).split('\n').length - 1
    return { startLine, endLine }
  }

  const onBold = () => {
    const el = ref.current
    if (!el) return
    toggleBold(block.id, el.selectionStart, el.selectionEnd)
  }

  // map an old offset to a new offset after per-line prefix edits
  const mapPos = (pos: number, edits: { at: number; removeLen: number; addLen: number }[]) => {
    let p = pos
    for (const e of edits) {
      if (pos >= e.at + e.removeLen) p += e.addLen - e.removeLen
      else if (pos > e.at) p += e.addLen - (pos - e.at)
    }
    return Math.max(0, p)
  }

  const applyList = (mode: 'bullet' | 'number') => {
    const { startLine, endLine } = selectedLineRange()
    const arr = block.value.split('\n')
    const offsets: number[] = []
    let acc = 0
    for (let i = 0; i < arr.length; i++) {
      offsets[i] = acc
      acc += arr[i].length + 1
    }
    const edits: { at: number; removeLen: number; addLen: number }[] = []

    if (mode === 'bullet') {
      const prefix = '• '
      const allHave = arr.slice(startLine, endLine + 1).every((l) => l.startsWith(prefix))
      for (let i = startLine; i <= endLine; i++) {
        if (allHave) {
          arr[i] = arr[i].slice(prefix.length)
          edits.push({ at: offsets[i], removeLen: prefix.length, addLen: 0 })
        } else if (!arr[i].startsWith(prefix)) {
          arr[i] = prefix + arr[i]
          edits.push({ at: offsets[i], removeLen: 0, addLen: prefix.length })
        }
      }
    } else {
      const numbered = /^\d+\.\s/
      const allHave = arr.slice(startLine, endLine + 1).every((l) => numbered.test(l))
      let n = 1
      for (let i = startLine; i <= endLine; i++) {
        const m = arr[i].match(numbered)
        const oldLen = m ? m[0].length : 0
        if (allHave) {
          arr[i] = arr[i].replace(numbered, '')
          edits.push({ at: offsets[i], removeLen: oldLen, addLen: 0 })
        } else {
          const np = `${n++}. `
          arr[i] = np + arr[i].replace(numbered, '')
          edits.push({ at: offsets[i], removeLen: oldLen, addLen: np.length })
        }
      }
    }

    const newValue = arr.join('\n')
    const newRanges = ranges
      .map((r) => ({ start: mapPos(r.start, edits), end: mapPos(r.end, edits) }))
      .filter((r) => r.end > r.start)
    setText(block.id, newValue, newRanges)
  }

  const onMakeBlank = () => {
    const { startLine, endLine } = selectedLineRange()
    makeBlank(block.id, startLine, endLine)
  }

  const segments = buildSegments(block.value, ranges)
  const wrapClass = lineNumbers ? 'whitespace-pre' : 'whitespace-pre-wrap break-words'

  return (
    <div className="group/text relative">
      <div className="mb-1 flex flex-wrap items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/text:opacity-100">
        <button
          className="rounded-md px-2 py-0.5 text-xs font-bold hover:bg-sand"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBold}
          title="הדגשת הקטע המסומן (בחרו טקסט ולחצו)"
        >
          B
        </button>
        <button
          className="rounded-md px-2 py-0.5 text-xs hover:bg-sand"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyList('bullet')}
        >
          • תבליט
        </button>
        <button
          className="rounded-md px-2 py-0.5 text-xs hover:bg-sand"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyList('number')}
        >
          1. מספור
        </button>
        <button
          className="rounded-md px-2 py-0.5 text-xs text-sage-dark hover:bg-sage/10"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onMakeBlank}
          title="בחרו שורות והפכו אותן לאזור ציור חלק"
        >
          ▱ הפוך לחלק (ציור)
        </button>
      </div>

      <div className="flex">
        {lineNumbers && (
          <div
            aria-hidden
            className="select-none pe-2 text-end text-xs text-muted/70"
            style={{ lineHeight: LINE_H + 'px' }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} style={{ height: LINE_H }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div className="relative flex-1">
          {/* mirror: ruled lines + (faux-)bold text */}
          <div
            aria-hidden
            className={`notebook-paper pointer-events-none absolute inset-0 select-none overflow-hidden text-ink ${wrapClass}`}
            style={metrics}
          >
            {segments.map((sg, i) =>
              sg.bold ? (
                <span key={i} className="faux-bold">
                  {sg.text}
                </span>
              ) : (
                <span key={i}>{sg.text}</span>
              ),
            )}
            {'​'}
          </div>

          {/* editable layer: transparent text, visible caret */}
          <textarea
            ref={ref}
            value={block.value}
            wrap={lineNumbers ? 'off' : 'soft'}
            onChange={(e) => updateTextValue(block.id, e.target.value)}
            placeholder="כתוב כאן את הסיכום…"
            spellCheck={false}
            style={{ ...metrics, caretColor: '#2b2a28' }}
            className={`relative min-h-[96px] w-full border-0 bg-transparent text-transparent outline-none placeholder:text-muted/40 ${wrapClass} ${
              lineNumbers ? 'overflow-x-auto' : ''
            }`}
          />
        </div>
      </div>
    </div>
  )
}
