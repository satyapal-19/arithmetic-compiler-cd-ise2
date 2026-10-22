import React, { useRef, useEffect } from 'react'
import { Code2, Copy, Check, Sparkles } from 'lucide-react'

export interface Preset {
  id: string
  name: string
  tag: string
  code: string
  description: string
  defaultVars: Record<string, number>
}

export const PRESETS: Preset[] = [
  {
    id: 'precedence',
    name: '1. Arithmetic Precedence',
    tag: 'Precedence & Parentheses',
    code: 'result = (a + b) * (c - 4) / 2 + 10;',
    description: 'Demonstrates hierarchical precedence climbing with parentheses and mixed operators.',
    defaultVars: { a: 10, b: 6, c: 8 },
  },
  {
    id: 'optimization',
    name: '2. Optimizer Showcase',
    tag: 'Folding + CSE + Algebraic',
    code: 'ans = (x + y) * (x + y) + 12 / 4 + z * 1;',
    description: 'Triggers constant folding (12/4 -> 3), algebraic simplification (z*1 -> z), and CSE ((x+y) reuse).',
    defaultVars: { x: 3, y: 2, z: 7 },
  },
  {
    id: 'semantic_err',
    name: '3. Division by Zero',
    tag: 'Semantic Guard',
    code: 'val = (p + q) / 0;',
    description: 'Triggers compile-time semantic error detection on constant zero division.',
    defaultVars: { p: 15, q: 25 },
  },
  {
    id: 'multi_statement',
    name: '4. Multi-Statement',
    tag: 'Dependencies & Propagation',
    code: 'a = 15;\nb = 5;\nc = a + b * 2;\nd = (a + b * 2) - 10;',
    description: 'Compiles sequential statement execution, variable symbol offsets, and subexpression reuse.',
    defaultVars: {},
  },
  {
    id: 'power_expr',
    name: '5. Exponent & Unary',
    tag: 'Right-Associativity',
    code: 'total = -base ^ 2 + 3 * (rate - 1);',
    description: 'Demonstrates right-associative exponentiation (^) combined with unary negation (-).',
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
    setTimeout(() => setCopied(false), 2000)
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
    <div className="flex flex-col gap-3">
      {/* Presets Row */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Select Preset Example</span>
          </label>
          <span className="text-[11px] text-slate-500">Pick to auto-populate</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p)}
                className={`p-2 rounded-lg text-left transition border ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-semibold truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{p.tag}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Editor Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg flex flex-col">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Code2 className="h-4 w-4 text-indigo-400" />
            <span>Source Code (C++ / Arithmetic CFG)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}, {code.length} chars
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
              title="Copy source code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Input Area with Line Numbers */}
        <div className="relative flex font-mono text-sm leading-relaxed min-h-[140px] max-h-[220px] bg-slate-950/70">
          {/* Line Numbers */}
          <div className="select-none py-3 px-2.5 text-right text-slate-600 bg-slate-950/90 border-r border-slate-800/80 w-10 shrink-0 text-xs font-mono">
            {lines.map((num) => (
              <div key={num} className="leading-6">
                {num}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your arithmetic expression or assignment here (e.g. result = (a + 5) * b / 2;)"
            spellCheck={false}
            className="w-full py-3 px-3.5 bg-transparent text-slate-200 placeholder-slate-600 outline-none resize-none overflow-y-auto leading-6 focus:ring-0"
          />
        </div>

        {/* Quick Operator Insertion Bar */}
        <div className="flex items-center justify-between flex-wrap gap-1 px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-slate-500 mr-1">Quick Insert:</span>
            {['+', '-', '*', '/', '%', '^', '=', '(', ')', ';'].map((tok) => (
              <button
                key={tok}
                onClick={() => insertToken(tok)}
                className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-xs transition active:scale-90"
              >
                {tok}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl + Enter</kbd> to compile
          </div>
        </div>
      </div>
    </div>
  )
}
