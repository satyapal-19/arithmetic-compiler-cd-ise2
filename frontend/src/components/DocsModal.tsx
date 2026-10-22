import React from 'react'
import { X, BookOpen, Layers, Terminal, Sparkles, CheckCircle2 } from 'lucide-react'

interface DocsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Compiler Design Reference Guide & Viva Notes
              </h3>
              <p className="text-xs text-slate-400">
                Course: Compiler Design (CD) • ISE 2 Examination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>The 6 Phases of Compiler Design</span>
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-cyan-400 block mb-0.5">1. Lexical Analysis (Scanner):</strong>
                Reads input characters, ignores whitespace and comments, and emits atomic tokens{' '}
                <code className="text-cyan-300 font-mono text-[11px]">&lt;TokenType, Lexeme, Line, Col&gt;</code>.
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-indigo-400 block mb-0.5">2. Syntax Analysis (Parser):</strong>
                Validates the token sequence against a Context-Free Grammar (CFG) via Recursive
                Descent parsing with operator precedence, generating an Abstract Syntax Tree (AST).
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-purple-400 block mb-0.5">3. Semantic Analysis:</strong>
                Validates scopes, updates the Symbol Table with byte offsets, enforces type
                consistency, and halts on static constant division by zero.
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">4. Intermediate Code Generation (ICG):</strong>
                Converts the AST into linear Three-Address Code (TAC), Quadruples `(op, arg1, arg2, result)`,
                Triples, and Postfix notation.
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">5. Code Optimization:</strong>
                Applies machine-independent optimizations: Constant Folding, Algebraic
                Simplification, Common Subexpression Elimination (CSE), and Dead Temporary Copy Propagation.
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-rose-400 block mb-0.5">6. Target Code Generation:</strong>
                Emits executable 32-bit RISC assembly instructions with register allocation
                descriptors across registers `R0` to `R5` and spilling.
              </div>
            </div>
          </div>

          {/* Section 2: CFG */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Arithmetic Context-Free Grammar (CFG)</span>
            </h4>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto">
{`Program       -> Statement*
Statement     -> [Type] Identifier '=' Expression ';' | Expression ';'
Type          -> 'int' | 'float'
Expression    -> Term ( ('+' | '-') Term )*
Term          -> Power ( ('*' | '/' | '%') Power )*
Power         -> Factor ( '^' Power )?          // Right-associative exponentiation
Factor        -> ('+' | '-') Factor | Primary    // Unary operators
Primary       -> IDENTIFIER | NUMBER | '(' Expression ')'`}
            </pre>
          </div>

          {/* Section 3: Vercel Deployment Guide */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span>Deploying this Frontend to Vercel</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <p className="text-slate-300">
                This frontend is built using standard <strong>Vite + React + Tailwind CSS</strong>{' '}
                and can be deployed to Vercel in 60 seconds:
              </p>
              <div className="space-y-1 font-mono text-[11px] text-pink-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                <div># Method 1: Via Vercel CLI</div>
                <div>npm i -g vercel</div>
                <div>cd frontend</div>
                <div>vercel</div>
                <div className="mt-2 text-slate-400"># Method 2: Via GitHub</div>
                <div className="text-slate-300">Push to GitHub repo and import to vercel.com!</div>
              </div>
            </div>
          </div>

          {/* Section 4: Quick Viva Q&A */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Key Viva / Oral Exam Questions</span>
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-white block mb-0.5">Q: What is a Quadruple vs a Triple?</strong>
                A Quadruple has 4 fields: `(op, arg1, arg2, result)`. A Triple has 3 fields:
                `(op, arg1, arg2)`, referencing earlier instructions by index `(0)`.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <strong className="text-white block mb-0.5">Q: Why is exponentiation right-associative?</strong>
                In mathematics, $2^{3^2} = 2^{(3^2)} = 2^9 = 512$, not $(2^3)^2 = 64$.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  )
}
