import React, { useRef, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

export interface Preset {
  id: string
  name: string
  code: string
  defaultVars: Record<string, number>
}

export const PRESETS: Preset[] = [
  {
    id: 'precedence',
    name: 'Precedence',
    code: 'result = (a + b) * (c - 4) / 2 + 10;',
    defaultVars: { a: 10, b: 6, c: 8 },
  },
  {
    id: 'optimization',
    name: 'Optimizer Showcase',
    code: 'ans = (x + y) * (x + y) + 12 / 4 + z * 1;',
    defaultVars: { x: 3, y: 2, z: 7 },
  },
  {
    id: 'semantic_err',
    name: 'Div by Zero Error',
    code: 'val = (p + q) / 0;',
    defaultVars: { p: 15, q: 25 },
  },
  {
    id: 'multi_statement',
    name: 'Multi-Statement',
    code: 'a = 15;\nb = 5;\nc = a + b * 2;\nd = (a + b * 2) - 10;',
    defaultVars: {},
  },
  {
    id: 'power_expr',
    name: 'Power & Unary',
    code: 'total = -base ^ 2 + 3 * (rate - 1);',
    defaultVars: { base: 4, rate: 5 },
  },
]

interface CodeEditorProps {
  code: string
  onChange: (val: string) => void
  onCompile: () => void
  selectedPreset: string
  onSelectPreset: (preset: Preset) => void
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onCompile,
  selectedPreset,
  onSelectPreset,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = React.useState(false)

  const lineCount = code.split('\n').length
  const lines = Array.from({ length: Math.max(lineCount, 6) }, (_, i) => i + 1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onCompile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCompile])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const insertToken = (token: string) => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const nextCode = code.substring(0, start) + token + code.substring(end)
    onChange(nextCode)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    }, 10)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Minimal Preset Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 text-[11px] font-mono mr-1 shrink-0">Presets:</span>
        {PRESETS.map((p) => {
          const isSelected = selectedPreset === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={`px-2.5 py-1 rounded text-xs transition border whitespace-nowrap ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {p.name}
            </button>
          )
        })}
      </div>

      {/* Editor Box */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950 text-xs">
          <span className="font-mono text-zinc-400 text-[11px]">input.cpp</span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500">
              {lineCount} lines, {code.length} chars
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition"
              title="Copy code"
            >
              {copied ? <Check className="h-3 w-3 text-zinc-200" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Textarea Area */}
        <div className="relative flex font-mono text-xs leading-relaxed min-h-[140px] max-h-[200px] bg-zinc-950">
          <div className="select-none py-3 px-2.5 text-right text-zinc-600 border-r border-zinc-800/60 w-9 shrink-0 text-xs">
            {lines.map((num) => (
              <div key={num} className="leading-6">
                {num}
              </div>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="result = (a + b) * (c - 4) / 2 + 10;"
            spellCheck={false}
            className="w-full py-3 px-3 bg-transparent text-zinc-200 placeholder-zinc-600 outline-none resize-none overflow-y-auto leading-6 focus:ring-0"
          />
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 border-t border-zinc-800/80 bg-zinc-950 text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-zinc-500 mr-1 font-mono">Tokens:</span>
            {['+', '-', '*', '/', '%', '^', '=', '(', ')', ';'].map((tok) => (
              <button
                key={tok}
                onClick={() => insertToken(tok)}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs border border-zinc-800/80 transition"
              >
                {tok}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
            Ctrl + Enter to run
          </span>
        </div>
      </div>
    </div>
  )
}
