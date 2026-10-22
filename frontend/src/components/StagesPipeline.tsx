import React from 'react'
import {
  FileText,
  Network,
  ShieldCheck,
  Binary,
  Zap,
  Cpu,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
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
    {
      id: 1,
      title: '1. Lexical',
      subtitle: `${result?.tokens ? result.tokens.length - 1 : 0} Tokens`,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      activeColor: 'border-cyan-500 text-cyan-400',
    },
    {
      id: 2,
      title: '2. Syntax',
      subtitle: 'AST Constructed',
      icon: Network,
      color: 'from-indigo-500 to-blue-500',
      activeColor: 'border-indigo-500 text-indigo-400',
    },
    {
      id: 3,
      title: '3. Semantic',
      subtitle: `${result?.symbolTable?.length || 0} Symbols`,
      icon: ShieldCheck,
      color: 'from-violet-500 to-purple-500',
      activeColor: 'border-purple-500 text-purple-400',
    },
    {
      id: 4,
      title: '4. ICG',
      subtitle: `${result?.rawTAC?.length || 0} TAC`,
      icon: Binary,
      color: 'from-amber-500 to-orange-500',
      activeColor: 'border-amber-500 text-amber-400',
    },
    {
      id: 5,
      title: '5. Optimizer',
      subtitle: result?.reductionPercentage
        ? `-${result.reductionPercentage}%`
        : 'Passes Applied',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      activeColor: 'border-emerald-500 text-emerald-400',
    },
    {
      id: 6,
      title: '6. Codegen',
      subtitle: `${result?.assembly?.length || 0} Asm Lines`,
      icon: Cpu,
      color: 'from-pink-500 to-rose-500',
      activeColor: 'border-rose-500 text-rose-400',
    },
  ]

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center gap-1.5 min-w-[620px]">
        {stages.map((st, i) => {
          const Icon = st.icon
          const isSelected = activeTab === st.id
          const isDone = !!result && result.success

          return (
            <React.Fragment key={st.id}>
              <button
                onClick={() => onSelectTab(st.id)}
                className={`flex-1 p-2 rounded-xl border text-left transition relative overflow-hidden group ${
                  isSelected
                    ? `bg-slate-800/90 ${st.activeColor} shadow-md`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`h-6 w-6 rounded-lg bg-gradient-to-tr ${st.color} flex items-center justify-center text-white shadow-sm`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {isDone ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  ) : result && !result.success ? (
                    <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                  ) : null}
                </div>
                <div className="text-xs font-semibold truncate text-white">{st.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{st.subtitle}</div>
              </button>

              {i < stages.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-slate-700 shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
