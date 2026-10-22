import React from 'react'
import { X } from 'lucide-react'

interface DocsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-lg bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
          <span className="font-semibold text-zinc-100">Compiler Documentation & CFG</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-zinc-300 leading-relaxed">
          {/* Phases */}
          <div>
            <div className="font-bold text-white mb-2">The 6 Canonical Phases:</div>
            <div className="space-y-1.5 text-zinc-400">
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-800/80">
                <span className="text-white font-medium">1. Lexical Analysis:</span> Scans raw source characters, removes comments, and emits tokens.
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-800/80">
                <span className="text-white font-medium">2. Syntax Analysis:</span> Top-down Recursive Descent parser generates the Abstract Syntax Tree.
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-800/80">
                <span className="text-white font-medium">3. Semantic Analysis:</span> Validates identifier scopes, byte offset memory layout, and division-by-zero protection.
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-800/80">
                <span className="text-white font-medium">4. Intermediate Code Generation:</span> Generates machine-independent Three-Address Code, Quadruples, and Postfix (RPN).
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-800/80">
                <span className="text-white font-medium">5. Code Optimization:</span> Constant Folding, Algebraic Simplification, and Common Subexpression Elimination (CSE).
              </div>
              <div className="p-2 rounded bg-zinc-900/40 border border-zinc-800/80">
                <span className="text-white font-medium">6. Target Code Generation:</span> 32-bit Virtual RISC accumulator instructions with register allocation descriptors (R0-R5).
              </div>
            </div>
          </div>

          {/* Grammar */}
          <div>
            <div className="font-bold text-white mb-2">Arithmetic Context-Free Grammar (CFG):</div>
            <pre className="p-3 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-[11px] leading-relaxed overflow-x-auto">
{`Program       -> Statement*
Statement     -> [Type] Identifier '=' Expression ';' | Expression ';'
Type          -> 'int' | 'float'
Expression    -> Term ( ('+' | '-') Term )*
Term          -> Power ( ('*' | '/' | '%') Power )*
Power         -> Factor ( '^' Power )?          // Right-associative
Factor        -> ('+' | '-') Factor | Primary    // Unary operators
Primary       -> IDENTIFIER | NUMBER | '(' Expression ')'`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
