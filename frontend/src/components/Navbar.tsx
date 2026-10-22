import React from 'react'
import { Cpu, Play, Trash2, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'

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
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                Arithmetic Compiler Studio
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CD ISE 2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 6-Stage Optimizing Compiler & Virtual CPU Assembly Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {success && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Compilation Succeeded</span>
            </div>
          )}

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
            title="Clear editor"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
            title="View Compiler Design notes and stages guide"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Theory & Notes</span>
          </button>

          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Compile (Ctrl + Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
