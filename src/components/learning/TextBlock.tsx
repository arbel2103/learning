import { useLayoutEffect, useRef } from 'react'
import { LINE_H, useStore } from '../../store/useStore'
import type { TextBlock as TextBlockT } from '../../lib/types'

interface Props {
  block: TextBlockT
  lineNumbers: boolean
}

export default function TextBlock({ block, lineNumbers }: Props) {
  const updateTextValue = useStore((s) => s.updateTextValue)
  const toggleTextBold = useStore((s) => s.toggleTextBold)
  const makeBlank = useStore((s) => s.makeBlank)
  const ref = useRef<HTMLTextAreaElement>(null)

  // auto-grow to fit content
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(LINE_H * 3, el.scrollHeight) + 'px'
  }, [block.value])

  const lineCount = block.value.length ? block.value.split('\n').length : 1

  const selectedRange = () => {
    const el = ref.current
    if (!el) return { startLine: 0, endLine: 0 }
    const startLine = block.value.slice(0, el.selectionStart).split('\n').length - 1
    const endLine = block.value.slice(0, el.selectionEnd).split('\n').length - 1
    return { startLine, endLine }
  }

  const applyBullet = () => {
    const prefix = '• '
    const { startLine, endLine } = selectedRange()
    const arr = block.value.split('\n')
    const allHave = arr.slice(startLine, endLine + 1).every((l) => l.startsWith(prefix))
    for (let i = startLine; i <= endLine; i++) {
      if (allHave) arr[i] = arr[i].slice(prefix.length)
      else if (!arr[i].startsWith(prefix)) arr[i] = prefix + arr[i]
    }
    updateTextValue(block.id, arr.join('\n'))
  }

  const applyNumbered = () => {
    const numbered = /^\d+\.\s/
    const { startLine, endLine } = selectedRange()
    const arr = block.value.split('\n')
    const allHave = arr.slice(startLine, endLine + 1).every((l) => numbered.test(l))
    let n = 1
    for (let i = startLine; i <= endLine; i++) {
      if (allHave) arr[i] = arr[i].replace(numbered, '')
      else arr[i] = `${n++}. ` + arr[i].replace(numbered, '')
    }
    updateTextValue(block.id, arr.join('\n'))
  }

  const onMakeBlank = () => {
    const { startLine, endLine } = selectedRange()
    makeBlank(block.id, startLine, endLine)
  }

  return (
    <div className="group/text relative">
      <div className="mb-1 flex flex-wrap items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/text:opacity-100">
        <button
          className={`rounded-md px-2 py-0.5 text-xs font-bold hover:bg-sand ${
            block.bold ? 'bg-ink text-cream hover:bg-ink' : ''
          }`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleTextBold(block.id)}
          title="הדגשה (מודגש)"
        >
          B
        </button>
        <button
          className="rounded-md px-2 py-0.5 text-xs hover:bg-sand"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyBullet}
        >
          • תבליט
        </button>
        <button
          className="rounded-md px-2 py-0.5 text-xs hover:bg-sand"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyNumbered}
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
        <textarea
          ref={ref}
          value={block.value}
          wrap={lineNumbers ? 'off' : 'soft'}
          onChange={(e) => updateTextValue(block.id, e.target.value)}
          placeholder="כתוב כאן את הסיכום…"
          spellCheck={false}
          className={`notebook-paper min-h-[96px] w-full bg-transparent px-1 text-[17px] text-ink outline-none placeholder:text-muted/40 ${
            block.bold ? 'font-bold' : ''
          } ${lineNumbers ? 'overflow-x-auto whitespace-pre' : ''}`}
        />
      </div>
    </div>
  )
}
