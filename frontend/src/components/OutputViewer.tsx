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

  // Compiler Stages Pipeline
  const tabs = [
    { id: 0, name: 'Overview' },
    { id: 1, name: 'Lexical Analysis' },
    { id: 2, name: 'Syntax Analysis' },
    { id: 3, name: 'Semantic & Runtime' },
    { id: 4, name: 'Intermediate Code' },
    { id: 5, name: 'Optimization' },
    { id: 6, name: 'Code Generation' },
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
              className={`px-2.5 py-1.5 rounded font-mono text-xs transition whitespace-nowrap border ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
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
            <div className="p-3 rounded border border-zinc-800 bg-zinc-900/30">
              <span className="text-zinc-400 font-bold block mb-1">
                Compiler Pipeline Architecture:
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Complete multi-pass arithmetic compiler engine featuring lexical analysis with regular expressions,
                top-down recursive descent parsing with operator precedence CFG, syntax-directed attribute definitions,
                three-address code & SSA generation, basic block machine-independent optimizations, and target RISC code generation
                with getReg() allocation.
              </p>
            </div>

            {/* Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Lexical Phase</span>
                <span className="text-base font-bold text-zinc-100">{result.tokens.length - 1} Tokens</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Syntax Phase</span>
                <span className="text-base font-bold text-zinc-100">LL Parse Tree</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Semantic Phase</span>
                <span className="text-base font-bold text-zinc-100">{result.sddRules.length} SDD Rules</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">IR Phase</span>
                <span className="text-base font-bold text-zinc-100">{result.rawTAC.length} TAC & SSA</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Optimizer</span>
                <span className="text-base font-bold text-zinc-100">-{result.reductionPercentage}% Opt</span>
              </div>
              <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/40">
                <span className="text-[10px] text-zinc-500 block">Target Code</span>
                <span className="text-base font-bold text-zinc-100">
                  {result.assembly.filter((a) => !a.instruction.startsWith('.')).length} RISC Asm
                </span>
              </div>
            </div>

            {/* Architecture Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded border border-zinc-800 bg-zinc-900/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-200">Frontend: Lexical & Parsing</span>
                  <button onClick={() => onTabChange(2)} className="text-[11px] text-zinc-400 hover:text-white">
                    Parse Tree →
                  </button>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• Scanner tokenizes stream using regex patterns.</div>
                  <div>• Recursive Descent Parser enforces precedence.</div>
                  <div>• Builds unambiguous Abstract Syntax Tree.</div>
                </div>
              </div>

              <div className="p-3 rounded border border-zinc-800 bg-zinc-900/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-200">Semantic & Runtime Layout</span>
                  <button onClick={() => onTabChange(3)} className="text-[11px] text-zinc-400 hover:text-white">
                    SDD & Symbols →
                  </button>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• S-attributed Syntax-Directed Definitions.</div>
                  <div>• Synthesizes type attributes up the tree.</div>
                  <div>• Manages Symbol Table byte offset layout.</div>
                </div>
              </div>

              <div className="p-3 rounded border border-zinc-800 bg-zinc-900/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-200">IR & Machine-Independent Optimization</span>
                  <button onClick={() => onTabChange(4)} className="text-[11px] text-zinc-400 hover:text-white">
                    TAC & Opt →
                  </button>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• Generates Quadruples, Triples & SSA forms.</div>
                  <div>• Identifies Basic Block leaders.</div>
                  <div>• Applies Constant Folding, Algebraic ID & CSE.</div>
                </div>
              </div>

              <div className="p-3 rounded border border-zinc-800 bg-zinc-900/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-200">Backend: Code Generation</span>
                  <button onClick={() => onTabChange(6)} className="text-[11px] text-zinc-400 hover:text-white">
                    Assembly →
                  </button>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <div>• getReg() register allocation algorithm.</div>
                  <div>• Tracks Register & Address Descriptors.</div>
                  <div>• Emits 32-bit Virtual RISC machine code.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: LEXICAL ANALYSIS */}
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
                Total: {result.tokens.length} tokens recognized
              </span>
            </div>

            <div className="rounded border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Token Type</th>
                    <th className="py-2 px-3">Lexeme</th>
                    <th className="py-2 px-3">Regex Specification (LEX)</th>
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
                        <td className="py-1.5 px-3 text-zinc-400">{t.pattern}</td>
                        <td className="py-1.5 px-3 text-zinc-500">
                          {t.line}:{t.column}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Scanner Log */}
            <div className="rounded border border-zinc-800 bg-zinc-900/30 p-2.5">
              <span className="text-zinc-400 font-bold block mb-1">Scanner Recognition Trace:</span>
              <div className="max-h-32 overflow-y-auto space-y-0.5 text-[11px] text-zinc-500">
                {result.lexLog.map((log, i) => (
                  <div key={i}>[LEX] {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYNTAX ANALYSIS & PARSER */}
        {activeTab === 2 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Operator Precedence Table */}
            <div className="rounded border border-zinc-800 p-2.5 bg-zinc-900/30">
              <span className="text-zinc-300 font-bold block mb-1">
                Operator Precedence & Associativity:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400">
                <div>1. Parentheses: <span className="text-white">( )</span> (Highest)</div>
                <div>2. Exponentiation: <span className="text-white">^</span> (Right-assoc)</div>
                <div>3. Multiplicative: <span className="text-white">* / %</span> (Left-assoc)</div>
                <div>4. Additive: <span className="text-white">+ -</span> (Left-assoc)</div>
              </div>
            </div>

            {/* Parse Tree Visualizer with Visible Connector Arrows */}
            <ASTVisualizer
              root={result.astRoot}
              asciiTree={result.asciiTree}
              derivationLog={result.derivationLog}
            />
          </div>
        )}

        {/* TAB 3: SDT & RUNTIME STORAGE */}
        {activeTab === 3 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Syntax Directed Definition (SDD) Table */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Syntax-Directed Definitions (S-Attributed Semantic Rules):
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1.5 px-3">#</th>
                    <th className="py-1.5 px-3">CFG Production</th>
                    <th className="py-1.5 px-3">Semantic Action (SDD Rule)</th>
                    <th className="py-1.5 px-3">Synthesized Attribute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-300">
                  {result.sddRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-zinc-500">{rule.id}</td>
                      <td className="py-1.5 px-3 text-white font-bold">{rule.production}</td>
                      <td className="py-1.5 px-3 text-zinc-400">{rule.semanticAction}</td>
                      <td className="py-1.5 px-3 text-white font-medium">{rule.synthesizedAttribute}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Symbol Table & Storage Organization */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Runtime Storage Organization & Symbol Table:
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1.5 px-3">Identifier</th>
                    <th className="py-1.5 px-3">Type</th>
                    <th className="py-1.5 px-3">Scope</th>
                    <th className="py-1.5 px-3">Runtime Memory Byte Offset</th>
                    <th className="py-1.5 px-3">Initial Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-200">
                  {result.symbolTable.map((s) => (
                    <tr key={s.name} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-white font-bold">{s.name}</td>
                      <td className="py-1.5 px-3 text-zinc-400">{s.dataType}</td>
                      <td className="py-1.5 px-3 text-zinc-400">{s.scope}</td>
                      <td className="py-1.5 px-3 text-white font-medium">Byte {s.memoryOffset}</td>
                      <td className="py-1.5 px-3">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INTERMEDIATE CODE GENERATION */}
        {activeTab === 4 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Postfix */}
            <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] block">Postfix (RPN):</span>
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
                Three-Address Code (TAC) Instructions:
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Instruction</th>
                    <th className="py-2 px-3">Meaning / Action</th>
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

            {/* Static Single Assignment (SSA) Form */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Static Single Assignment (SSA) Form:
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1.5 px-3">#</th>
                    <th className="py-1.5 px-3">SSA Instruction (Versioned)</th>
                    <th className="py-1.5 px-3">Original TAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-300">
                  {result.ssaForm.map((ssa) => (
                    <tr key={ssa.index} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-zinc-500">{ssa.index}</td>
                      <td className="py-1.5 px-3 text-white font-bold">{ssa.code}</td>
                      <td className="py-1.5 px-3 text-zinc-400">{ssa.original}</td>
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

        {/* TAB 5: CODE OPTIMIZATION & BASIC BLOCKS */}
        {activeTab === 5 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="p-3 rounded border border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] block">Optimization Metrics:</span>
                <span className="text-white text-sm font-bold">
                  {result.reductionPercentage}% Reduction ({result.rawTAC.length} → {result.optimizedTAC.length} instructions)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-700">
                {result.optimizations.length} pass(es)
              </span>
            </div>

            {/* Basic Blocks & Leader Partition */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                Basic Block Partitioning (Leader Identification):
              </div>
              <div className="p-3 bg-zinc-950 space-y-2">
                {result.basicBlocks.map((block) => (
                  <div key={block.id} className="p-2 rounded border border-zinc-800 bg-zinc-900/40">
                    <div className="flex items-center justify-between text-zinc-400 font-bold mb-1">
                      <span>Basic Block B{block.id}</span>
                      <span className="text-[10px] text-zinc-500">Leader: TAC #{block.leaderIndex}</span>
                    </div>
                    <div className="space-y-0.5 text-zinc-300 pl-2 border-l border-zinc-700">
                      {block.instructions.map((ins) => (
                        <div key={ins.index}>
                          {ins.index}. {ins.result} = {ins.arg1} {ins.op !== '=' ? ins.op : ''} {ins.arg2}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applied Passes */}
            {result.optimizations.length > 0 && (
              <div className="rounded border border-zinc-800 overflow-hidden">
                <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                  Machine-Independent Transformations Applied:
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

            {/* Side-by-Side Before vs After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="rounded border border-zinc-800 overflow-hidden">
                <div className="px-3 py-1.5 bg-zinc-900 text-zinc-400 font-semibold text-[11px]">
                  Before Optimization ({result.rawTAC.length})
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
                  After Optimization ({result.optimizedTAC.length})
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

        {/* TAB 6: CODE GENERATION & DESCRIPTORS */}
        {activeTab === 6 && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* getReg() Algorithm Trace */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">
                getReg() Function Execution Trace:
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1.5 px-3">Step</th>
                    <th className="py-1.5 px-3">Instruction</th>
                    <th className="py-1.5 px-3">getReg() Decision</th>
                    <th className="py-1.5 px-3">Allocated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-300">
                  {result.getRegTraces.map((trace) => (
                    <tr key={trace.step} className="hover:bg-zinc-900/50">
                      <td className="py-1.5 px-3 text-zinc-500">{trace.step}</td>
                      <td className="py-1.5 px-3 text-white font-bold">{trace.instruction}</td>
                      <td className="py-1.5 px-3 text-zinc-400">{trace.decisionReason}</td>
                      <td className="py-1.5 px-3 text-white font-bold">{trace.allocatedRegister}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Register Descriptors */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold text-[11px]">
                Register Descriptors (R0 - R5):
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

            {/* Address Descriptors */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold text-[11px]">
                Address Descriptors:
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-1 px-3">Variable</th>
                    <th className="py-1 px-3">Current Location(s)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 bg-zinc-950 text-zinc-300">
                  {result.addressDescriptors.map((ad) => (
                    <tr key={ad.variable}>
                      <td className="py-1 px-3 text-white font-bold">{ad.variable}</td>
                      <td className="py-1 px-3 text-zinc-400">{ad.locations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Peephole Optimization */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold text-[11px]">
                Peephole Optimization Pass:
              </div>
              <div className="divide-y divide-zinc-800 bg-zinc-950 p-2 space-y-1">
                {result.peepholePasses.map((p, idx) => (
                  <div key={idx} className="text-[11px] text-zinc-400 py-1">
                    <div className="text-white font-medium">• {p.rule}</div>
                    <div className="text-zinc-500 font-mono pl-3">{p.before.replace('\n', ' → ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final RISC Assembly Code */}
            <div className="rounded border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-300 font-semibold">Generated 32-bit RISC Assembly</span>
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
                    <th className="py-1.5 px-3">Comment / Micro-action</th>
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
