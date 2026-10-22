import React, { useState } from 'react'
import {
  FileText,
  Network,
  ShieldCheck,
  Binary,
  Zap,
  Cpu,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react'
import { CompilerResult } from '../compiler/types'
import { ASTVisualizer } from './ASTVisualizer'

interface OutputViewerProps {
  result: CompilerResult | null
  activeTab: number
  onTabChange: (index: number) => void
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  result,
  activeTab,
  onTabChange,
}) => {
  const [tokenSearch, setTokenSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const tabs = [
    { id: 0, name: 'Overview', icon: Layers },
    { id: 1, name: '1. Tokens', icon: FileText },
    { id: 2, name: '2. Syntax (AST)', icon: Network },
    { id: 3, name: '3. Semantics & Symbols', icon: ShieldCheck },
    { id: 4, name: '4. ICG (TAC)', icon: Binary },
    { id: 5, name: '5. Optimization', icon: Zap },
    { id: 6, name: '6. Target Assembly', icon: Cpu },
    { id: 7, name: 'Terminal Output', icon: Terminal },
  ]

  if (!result) {
    return (
      <div className="h-full rounded-xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Cpu className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Compiler Ready</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Click <strong>"Compile Expression"</strong> or press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            Ctrl + Enter
          </kbd>{' '}
          to run all 6 compiler design stages.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col h-full overflow-hidden">
      {/* Top Tab Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950/70 p-1.5 text-xs">
        {tabs.map((t) => {
          const Icon = t.icon
          const isSelected = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.name}</span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Error or Warnings Banner */}
        {result.diagnostics.length > 0 && (
          <div className="mb-4 flex flex-col gap-1.5">
            {result.diagnostics.map((d, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${
                  d.level === 'ERROR'
                    ? 'bg-rose-950/40 border-rose-600/40 text-rose-300'
                    : 'bg-amber-950/40 border-amber-600/40 text-amber-300'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{d.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 0: OVERVIEW */}
        {activeTab === 0 && (
          <div className="flex flex-col gap-4">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">Stage 1: Tokens</span>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  {result.tokens.length - 1}
                </div>
                <span className="text-[10px] text-slate-500">Atomic lexemes</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">Stage 2: Syntax</span>
                <div className="text-xl font-bold text-indigo-400 mt-1">AST Built</div>
                <span className="text-[10px] text-slate-500">Recursive descent</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">Stage 3: Symbols</span>
                <div className="text-xl font-bold text-purple-400 mt-1">
                  {result.symbolTable.length}
                </div>
                <span className="text-[10px] text-slate-500">Byte-addressed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">Stage 4: TAC</span>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {result.rawTAC.length}
                </div>
                <span className="text-[10px] text-slate-500">Quadruples & triples</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">Stage 5: Optimized</span>
                <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <span>{result.optimizedTAC.length}</span>
                  {result.reductionPercentage > 0 && (
                    <span className="text-xs text-emerald-400 font-normal">
                      (-{result.reductionPercentage}%)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">Folding & CSE</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-500 font-medium">Stage 6: Assembly</span>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {result.assembly.filter((a) => !a.instruction.startsWith('.')).length}
                </div>
                <span className="text-[10px] text-slate-500">32-bit RISC VM</span>
              </div>
            </div>

            {/* Pipeline Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span>Stage 1: Token Stream Sample</span>
                  </h4>
                  <button
                    onClick={() => onTabChange(1)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.tokens.slice(0, 10).map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300"
                    >
                      {t.lexeme}
                    </span>
                  ))}
                  {result.tokens.length > 10 && (
                    <span className="text-xs text-slate-500 self-center">
                      +{result.tokens.length - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Binary className="h-4 w-4 text-amber-400" />
                    <span>Stage 4: Three-Address Code Preview</span>
                  </h4>
                  <button
                    onClick={() => onTabChange(4)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 space-y-1">
                  {result.rawTAC.slice(0, 3).map((tac) => (
                    <div key={tac.index} className="truncate">
                      {tac.index}.{' '}
                      <span className="text-amber-400">{tac.result}</span> ={' '}
                      {tac.arg1} {tac.op !== '=' ? tac.op : ''} {tac.arg2}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span>Stage 5: Optimization Efficiency</span>
                  </h4>
                  <button
                    onClick={() => onTabChange(5)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="h-5 w-5" />
                    <span>{result.reductionPercentage}%</span>
                  </div>
                  <div className="text-xs text-slate-400 leading-tight">
                    {result.optimizations.length} optimization pass(es) applied, reducing code from{' '}
                    {result.rawTAC.length} to {result.optimizedTAC.length} instructions.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-rose-400" />
                    <span>Stage 6: Virtual Target Assembly</span>
                  </h4>
                  <button
                    onClick={() => onTabChange(6)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 space-y-1">
                  {result.assembly
                    .filter((a) => a.instruction && !a.instruction.startsWith('.'))
                    .slice(0, 3)
                    .map((a, i) => (
                      <div key={i} className="truncate">
                        <span className="text-rose-400">{a.instruction.split(' ')[0]}</span>{' '}
                        {a.instruction.substring(a.instruction.indexOf(' '))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: LEXICAL ANALYSIS */}
        {activeTab === 1 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Filter tokens by lexeme or type..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-64 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">
                Total {result.tokens.length} tokens recognized
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Token Type</th>
                    <th className="py-2.5 px-3">Lexeme</th>
                    <th className="py-2.5 px-3">Line</th>
                    <th className="py-2.5 px-3">Column</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-mono">
                  {result.tokens
                    .filter(
                      (t) =>
                        t.lexeme.toLowerCase().includes(tokenSearch.toLowerCase()) ||
                        t.typeName.toLowerCase().includes(tokenSearch.toLowerCase())
                    )
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 px-3 text-slate-500">{t.id}</td>
                        <td className="py-2 px-3 text-cyan-300">{t.typeName}</td>
                        <td className="py-2 px-3 text-white font-bold">'{t.lexeme}'</td>
                        <td className="py-2 px-3 text-slate-400">{t.line}</td>
                        <td className="py-2 px-3 text-slate-400">{t.column}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Lexical Log */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                <span>Scanner Transition Trace:</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-400">
                {result.lexLog.map((log, i) => (
                  <div key={i}>[SCAN] {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYNTAX ANALYSIS & AST */}
        {activeTab === 2 && (
          <ASTVisualizer
            root={result.astRoot}
            asciiTree={result.asciiTree}
            derivationLog={result.derivationLog}
          />
        )}

        {/* TAB 3: SEMANTIC ANALYSIS & SYMBOL TABLE */}
        {activeTab === 3 && (
          <div className="flex flex-col gap-4">
            {/* Symbol Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  <span>Symbol Table Management</span>
                </h4>
                <span className="text-xs text-slate-500">
                  {result.symbolTable.length} identifier(s)
                </span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Identifier</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Memory Offset</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Initialized?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-mono">
                  {result.symbolTable.map((s) => (
                    <tr key={s.name} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 text-purple-300 font-bold">{s.name}</td>
                      <td className="py-2 px-3 text-slate-300">{s.dataType}</td>
                      <td className="py-2 px-3 text-amber-400 font-bold">
                        Byte {s.memoryOffset}
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {s.isInitialized ? s.value : 'N/A (undef)'}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                            s.isInitialized
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {s.isInitialized ? 'YES' : 'NO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Semantic Log */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-purple-400" />
                <span>Semantic Checks Trace:</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-400">
                {result.semanticLog.map((log, i) => (
                  <div key={i}>[CHECK] {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERMEDIATE CODE GENERATION (ICG) */}
        {activeTab === 4 && (
          <div className="flex flex-col gap-4">
            {/* Postfix / RPN */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Postfix / Reverse Polish Notation (RPN):
                </span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {result.postfix.join(' ')}
                </span>
              </div>
              <button
                onClick={() => copyText(result.postfix.join(' '), 'rpn')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                {copied === 'rpn' ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>Copy RPN</span>
              </button>
            </div>

            {/* Three-Address Code (TAC) */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Binary className="h-4 w-4 text-amber-400" />
                  <span>Three-Address Code (TAC) Instructions</span>
                </h4>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Instruction</th>
                    <th className="py-2.5 px-3">Architectural Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-mono">
                  {result.rawTAC.map((tac) => (
                    <tr key={tac.index} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 text-slate-500">{tac.index}</td>
                      <td className="py-2 px-3 text-amber-300 font-bold">
                        {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''} {tac.arg2}
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                        {tac.comment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quadruples Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white">
                  Quadruples Table: (operator, arg1, arg2, result)
                </h4>
              </div>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Idx</th>
                    <th className="py-2 px-3">Operator</th>
                    <th className="py-2 px-3">Argument 1</th>
                    <th className="py-2 px-3">Argument 2</th>
                    <th className="py-2 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {result.quadruples.map((q) => (
                    <tr key={q.index} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 text-slate-500">{q.index}</td>
                      <td className="py-2 px-3 text-amber-400 font-bold">{q.op}</td>
                      <td className="py-2 px-3 text-slate-300">{q.arg1}</td>
                      <td className="py-2 px-3 text-slate-300">{q.arg2}</td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">{q.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CODE OPTIMIZATION */}
        {activeTab === 5 && (
          <div className="flex flex-col gap-4">
            {/* Efficiency Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Optimization Results
                </span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {result.reductionPercentage}% Code Reduction
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Reduced from {result.rawTAC.length} to {result.optimizedTAC.length}{' '}
                  instructions through machine-independent transformations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  {result.optimizations.length} Pass(es) Triggered
                </span>
              </div>
            </div>

            {/* Optimization Passes Table */}
            {result.optimizations.length > 0 && (
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white">Applied Optimization Passes</h4>
                </div>
                <div className="divide-y divide-slate-800 bg-slate-950/40 text-xs">
                  {result.optimizations.map((opt) => (
                    <div key={opt.id} className="p-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400">{opt.passName}</span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {opt.beforeCode} <ArrowRight className="inline h-3 w-3 mx-1 text-slate-500" />{' '}
                          <strong className="text-white">{opt.afterCode}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{opt.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400">
                  Before Optimization ({result.rawTAC.length} instrs)
                </div>
                <div className="p-3 font-mono text-xs text-slate-300 space-y-1.5 bg-slate-950/50">
                  {result.rawTAC.map((tac) => (
                    <div key={tac.index} className="truncate">
                      {tac.index}. {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''}{' '}
                      {tac.arg2}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-900/50 overflow-hidden">
                <div className="px-3 py-2 bg-emerald-950/60 border-b border-emerald-900/60 text-xs font-bold text-emerald-400">
                  After Optimization ({result.optimizedTAC.length} instrs)
                </div>
                <div className="p-3 font-mono text-xs text-emerald-300 space-y-1.5 bg-emerald-950/20">
                  {result.optimizedTAC.map((tac) => (
                    <div key={tac.index} className="truncate">
                      {tac.index}. {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''}{' '}
                      {tac.arg2}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TARGET CODE GENERATION */}
        {activeTab === 6 && (
          <div className="flex flex-col gap-4">
            {/* Register Descriptors */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-rose-400" />
                  <span>Virtual Register Bank (R0 - R5) Descriptors:</span>
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-800 bg-slate-950/40 text-center font-mono text-xs">
                {result.registers.map((r) => (
                  <div key={r.reg} className="p-2.5">
                    <span className="text-rose-400 font-bold block">{r.reg}</span>
                    <span
                      className={`text-[11px] mt-0.5 block truncate ${
                        r.value.includes('Empty') ? 'text-slate-500' : 'text-white font-semibold'
                      }`}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assembly Listing */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white">
                  Generated 32-bit RISC Assembly Code
                </h4>
                <button
                  onClick={() =>
                    copyText(
                      result.assembly.map((a) => `${a.instruction}\t; ${a.comment}`).join('\n'),
                      'asm'
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  {copied === 'asm' ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>Copy Assembly</span>
                </button>
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3 w-12">Line</th>
                    <th className="py-2 px-3">Instruction</th>
                    <th className="py-2 px-3">Architectural Action / Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {result.assembly.map((a, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition ${
                        a.instruction.startsWith('.') ? 'bg-slate-900/60 font-bold' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-600">{a.line}</td>
                      <td className="py-2 px-3 font-bold text-rose-300">{a.instruction}</td>
                      <td className="py-2 px-3 text-slate-400 font-sans text-[11px]">
                        {a.comment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: TERMINAL / CONSOLE OUTPUT */}
        {activeTab === 7 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Exact C++ console execution log (copy into lab reports):
              </span>
              <button
                onClick={() => copyText(result.consoleOutput, 'terminal')}
                className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                {copied === 'terminal' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>Copy Entire Log</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre select-all">
              {result.consoleOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
