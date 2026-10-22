import React from 'react'
import { CompilerResult } from '../compiler/types'

interface StagesPipelineProps {
  result: CompilerResult | null
  activeTab: number
  onSelectTab: (index: number) => void
}

export const StagesPipeline: React.FC<StagesPipelineProps> = ({
  result,
  activeTab,
  onSelectTab,
}) => {
  const stages = [
    { id: 1, label: '1. Lexer', detail: `${result ? result.tokens.length - 1 : 0} tokens` },
    { id: 2, label: '2. Parser', detail: 'AST' },
    { id: 3, label: '3. Semantic', detail: `${result?.symbolTable?.length || 0} symbols` },
    { id: 4, label: '4. ICG', detail: `${result?.rawTAC?.length || 0} TAC` },
    {
      id: 5,
      label: '5. Optimizer',
      detail: result?.reductionPercentage ? `-${result.reductionPercentage}%` : 'passes',
    },
    {
      id: 6,
      label: '6. Codegen',
      detail: `${result?.assembly?.filter((a) => !a.instruction.startsWith('.')).length || 0} asm`,
    },
  ]

  return (
    <div className="w-full flex items-center justify-between overflow-x-auto gap-2 py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono">
      <div className="flex items-center gap-2 min-w-[560px] w-full justify-between">
        {stages.map((st, i) => {
          const isSelected = activeTab === st.id
          return (
            <React.Fragment key={st.id}>
              <button
                onClick={() => onSelectTab(st.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  ({st.detail})
                </span>
              </button>
              {i < stages.length - 1 && <span className="text-zinc-700 select-none">→</span>}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
