import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
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
    setTimeout(() => setCopied(null), 1500)
  }

  const tabs = [
    { id: 0, name: 'Overview' },
    { id: 1, name: '1. Tokens' },
    { id: 2, name: '2. AST Tree' },
    { id: 3, name: '3. Symbols' },
    { id: 4, name: '4. Three-Address Code' },
    { id: 5, name: '5. Optimization' },
    { id: 6, name: '6. Assembly' },
    { id: 7, name: 'Console Log' },
  ]

  if (!result) {
    return (
      <div className="h-full rounded-lg border border-zinc-800 bg-zinc-900/30 p-8 flex flex-col items-center justify-center text-center">
        <div className="text-zinc-500 font-mono text-xs">
          Press "Run Compiler" or Ctrl + Enter to compile.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 flex flex-col h-full overflow-hidden">
      {/* Top Tab Bar - Dual Color Minimalist */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs">
        {tabs.map((t) => {
          const isSelected = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`px-3 py-1.5 rounded font-mono text-xs transition whitespace-nowrap border ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                  : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {t.name}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3.5 overflow-y-auto bg-zinc-950">
        {/* Only show fatal error if compilation failed */}
        {!result.success && result.errorMessage && (
          <div className="mb-3 p-3 rounded border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 font-mono flex items-center justify-between">
            <span>[Error] {result.errorMessage}</span>
          </div>
        )}

        {/* TAB 0: OVERVIEW */}
        {activeTab === 0 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Tokens</span>
                <span className="text-base font-bold text-zinc-100">{result.tokens.length - 1}</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">AST Status</span>
                <span className="text-base font-bold text-zinc-100">Valid</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Symbols</span>
                <span className="text-base font-bold text-zinc-100">{result.symbolTable.length}</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Raw TAC</span>
                <span className="text-base font-bold text-zinc-100">{result.rawTAC.length}</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Optimized TAC</span>
                <span className="text-base font-bold text-zinc-100">
                  {result.optimizedTAC.length} ({result.reductionPercentage}%)
                </span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Assembly Lines</span>
                <span className="text-base font-bold text-zinc-100">
                  {result.assembly.filter((a) => !a.instruction.startsWith('.')).length}
                </span>
              </div>
            </div>

            {/* Stage Quick Views */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded border border-zinc-800 bg-zinc-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-zinc-200">Three-Address Code:</span>
                  <button
                    onClick={() => onTabChange(4)}
                    className="text-[11px] text-zinc-400 hover:text-white"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-1 text-zinc-300">
                  {result.rawTAC.slice(0, 4).map((tac) => (
                    <div key={tac.index} className="truncate">
                      {tac.index}. {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''} {tac.arg2}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded border border-zinc-800 bg-zinc-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-zinc-200">Target Assembly (RISC):</span>
                  <button
                    onClick={() => onTabChange(6)}
                    className="text-[11px] text-zinc-400 hover:text-white"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-1 text-zinc-300">
                  {result.assembly
                    .filter((a) => a.instruction && !a.instruction.startsWith('.'))
                    .slice(0, 4)
                    .map((a, i) => (
                      <div key={i} className="truncate">
                        {a.instruction}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: TOKENS */}
        {activeTab === 1 && (
          <div className="flex flex-col gap-2.5 font-mono text-xs">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Search tokens..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-48 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[11px] text-zinc-500">
                {result.tokens.length} tokens
              </span>
            </div>

            <div className="rounded border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Token Type</th>
                    <th className="py-2 px-3">Lexeme</th>
                    <th className="py-2 px-3">Line:Col</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950">
                  {result.tokens
                    .filter(
                      (t) =>
                        t.lexeme.toLowerCase().includes(tokenSearch.toLowerCase()) ||
                        t.typeName.toLowerCase().includes(tokenSearch.toLowerCase())
                    )
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-900/50">
                        <td className="py-1.5 px-3 text-zinc-500">{t.id}</td>
                        <td className="py-1.5 px-3 text-zinc-400">{t.typeName}</td>
                        <td className="py-1.5 px-3 text-white font-bold">'{t.lexeme}'</td>
                        <td className="py-1.5 px-3 text-zinc-500">
                          {t.line}:{t.column}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AST */}
        {activeTab === 2 && (
          <ASTVisualizer
            root={result.astRoot}
            asciiTree={result.asciiTree}
            derivationLog={result.derivationLog}
          />
        )}

        {/* TAB 3: SYMBOLS */}
        {activeTab === 3 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Symbol Table ({result.symbolTable.length} identifiers)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Memory Offset</th>
                    <th className="py-2 px-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-200">
                  {result.symbolTable.map((s) => (
                    <tr key={s.name} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-white font-bold">{s.name}</td>
                      <td className="py-1.5 px-3 text-zinc-400">{s.dataType}</td>
                      <td className="py-1.5 px-3 text-zinc-400">Byte {s.memoryOffset}</td>
                      <td className="py-1.5 px-3">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TAC */}
        {activeTab === 4 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Postfix */}
            <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] block">RPN / Postfix:</span>
                <span className="text-white font-bold">{result.postfix.join(' ')}</span>
              </div>
              <button
                onClick={() => copyText(result.postfix.join(' '), 'rpn')}
                className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800"
              >
                {copied === 'rpn' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Three-Address Code Table */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Three-Address Code (TAC)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Instruction</th>
                    <th className="py-2 px-3">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-200">
                  {result.rawTAC.map((tac) => (
                    <tr key={tac.index} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-zinc-500">{tac.index}</td>
                      <td className="py-1.5 px-3 text-white font-bold">
                        {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''} {tac.arg2}
                      </td>
                      <td className="py-1.5 px-3 text-zinc-400 text-[11px]">{tac.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quadruples Table */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Quadruples (op, arg1, arg2, result)
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1.5 px-3">Idx</th>
                    <th className="py-1.5 px-3">op</th>
                    <th className="py-1.5 px-3">arg1</th>
                    <th className="py-1.5 px-3">arg2</th>
                    <th className="py-1.5 px-3">result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-300">
                  {result.quadruples.map((q) => (
                    <tr key={q.index} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-zinc-500">{q.index}</td>
                      <td className="py-1.5 px-3 text-white font-bold">{q.op}</td>
                      <td className="py-1.5 px-3">{q.arg1}</td>
                      <td className="py-1.5 px-3">{q.arg2}</td>
                      <td className="py-1.5 px-3 text-white">{q.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: OPTIMIZATION */}
        {activeTab === 5 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="p-3 rounded border border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] block">Optimization Result:</span>
                <span className="text-white text-sm font-bold">
                  {result.reductionPercentage}% Reduction ({result.rawTAC.length} → {result.optimizedTAC.length} instructions)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-700">
                {result.optimizations.length} pass(es)
              </span>
            </div>

            {/* Applied Passes */}
            {result.optimizations.length > 0 && (
              <div className="rounded border border-zinc-800 overflow-hidden">
                <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                  Applied Transformations
                </div>
                <div className="divide-y divide-zinc-800/80 bg-zinc-950">
                  {result.optimizations.map((opt) => (
                    <div key={opt.id} className="p-2.5 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{opt.passName}</span>
                        <span className="text-zinc-400">
                          {opt.beforeCode} → <strong className="text-white">{opt.afterCode}</strong>
                        </span>
                      </div>
                      <span className="text-zinc-500 text-[11px]">{opt.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-Side Before and After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="rounded border border-zinc-800 overflow-hidden">
                <div className="px-3 py-1.5 bg-zinc-900 text-zinc-400 font-semibold text-[11px]">
                  Before ({result.rawTAC.length})
                </div>
                <div className="p-2.5 space-y-1 bg-zinc-950 text-zinc-400">
                  {result.rawTAC.map((tac) => (
                    <div key={tac.index}>
                      {tac.index}. {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''} {tac.arg2}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border border-zinc-700 overflow-hidden">
                <div className="px-3 py-1.5 bg-zinc-900 text-white font-semibold text-[11px]">
                  After ({result.optimizedTAC.length})
                </div>
                <div className="p-2.5 space-y-1 bg-zinc-950 text-white font-medium">
                  {result.optimizedTAC.map((tac) => (
                    <div key={tac.index}>
                      {tac.index}. {tac.result} = {tac.arg1} {tac.op !== '=' ? tac.op : ''} {tac.arg2}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ASSEMBLY */}
        {activeTab === 6 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Register State */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold text-[11px]">
                Register Descriptors (R0 - R5)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-zinc-800 bg-zinc-950 text-center">
                {result.registers.map((r) => (
                  <div key={r.reg} className="p-2">
                    <span className="text-zinc-500 font-bold block">{r.reg}</span>
                    <span className="text-white block mt-0.5 truncate text-[11px]">
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assembly Code Listing */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300 font-semibold">32-bit RISC Assembly</span>
                <button
                  onClick={() =>
                    copyText(
                      result.assembly.map((a) => `${a.instruction}\t; ${a.comment}`).join('\n'),
                      'asm'
                    )
                  }
                  className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800"
                >
                  {copied === 'asm' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1.5 px-3 w-10">#</th>
                    <th className="py-1.5 px-3">Instruction</th>
                    <th className="py-1.5 px-3">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950">
                  {result.assembly.map((a, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/50">
                      <td className="py-1 px-3 text-zinc-600">{a.line}</td>
                      <td className="py-1 px-3 text-white font-bold">{a.instruction}</td>
                      <td className="py-1 px-3 text-zinc-500 text-[11px]">{a.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: TERMINAL */}
        {activeTab === 7 && (
          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-end">
              <button
                onClick={() => copyText(result.consoleOutput, 'terminal')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800"
              >
                {copied === 'terminal' ? 'Copied' : 'Copy Log'}
              </button>
            </div>
            <pre className="p-3.5 rounded border border-zinc-800 bg-zinc-950 text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre select-all text-xs">
              {result.consoleOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
