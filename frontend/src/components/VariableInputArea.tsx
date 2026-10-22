import React from 'react'
import { Sliders, Play, Calculator, CheckCircle2 } from 'lucide-react'
import { SimulationStep } from '../compiler/evaluator'

interface VariableInputAreaProps {
  variables: Record<string, number>
  onVariableChange: (name: string, value: number) => void
  onRunSimulation: () => void
  simulationSteps: SimulationStep[]
  finalValues: Record<string, number>
  hasCompiled: boolean
}

export const VariableInputArea: React.FC<VariableInputAreaProps> = ({
  variables,
  onVariableChange,
  onRunSimulation,
  simulationSteps,
  finalValues,
  hasCompiled,
}) => {
  const varKeys = Object.keys(variables)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Sliders className="h-4 w-4 text-violet-400" />
          <span>Input Area: Variable Values & Dynamic Evaluation</span>
        </div>
        <button
          onClick={onRunSimulation}
          disabled={!hasCompiled}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-violet-600/80 hover:bg-violet-600 active:scale-95 text-white text-xs font-semibold transition disabled:opacity-40"
          title="Compute expression with current input variable values"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>Evaluate Values</span>
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* Variable Inputs */}
        {varKeys.length === 0 ? (
          <div className="py-3 px-3 text-center text-xs text-slate-500 rounded-lg border border-dashed border-slate-800">
            No external input variables needed (expression uses internal constants or self-assigned variables).
          </div>
        ) : (
          <div>
            <div className="text-[11px] text-slate-400 font-medium mb-2 flex items-center justify-between">
              <span>Enter Values for Operands:</span>
              <span className="text-slate-500">{varKeys.length} variable(s) found</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {varKeys.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
                >
                  <label className="text-xs font-mono font-semibold text-indigo-300">
                    {name} =
                  </label>
                  <input
                    type="number"
                    value={variables[name]}
                    onChange={(e) => onVariableChange(name, parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-right text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Output Cards */}
        {Object.keys(finalValues).length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calculator className="h-3 w-3 text-emerald-400" />
              <span>Computed Output Memory Values:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(finalValues)
                .filter(([key]) => !key.startsWith('t') || Object.keys(finalValues).length <= 4)
                .map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs"
                  >
                    <span className="font-mono text-slate-300 font-medium">{name}:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{val}</span>
                  </div>
                ))}
            </div>

            {/* Simulation step pill */}
            {simulationSteps.length > 0 && (
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Simulated {simulationSteps.length} TAC evaluation step(s) cleanly.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
