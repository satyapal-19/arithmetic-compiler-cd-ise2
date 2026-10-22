import React from 'react'
import { Play, Trash2, BookOpen, Terminal } from 'lucide-react'

interface NavbarProps {
  onCompile: () => void
  onClear: () => void
  onOpenDoc: () => void
  isCompiling: boolean
  success: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  onCompile,
  onClear,
  onOpenDoc,
  isCompiling,
  success,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-mono font-bold text-sm">
            C
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">
              Arithmetic Compiler
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              ISE 2
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {success && (
            <span className="hidden sm:inline-block text-xs font-mono text-zinc-400 mr-2">
              Status: 0 Errors
            </span>
          )}

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title="Clear Editor"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            title="Compiler Theory & CFG"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Docs</span>
          </button>

          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-950 font-medium text-xs transition disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>{isCompiling ? 'Compiling...' : 'Run Compiler'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
