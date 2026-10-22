import React from 'react'
import { Play } from 'lucide-react'
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
  finalValues,
  hasCompiled,
}) => {
  const varKeys = Object.keys(variables)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950 text-xs">
        <span className="font-mono text-zinc-400 text-[11px]">variables & execution input</span>
        <button
          onClick={onRunSimulation}
          disabled={!hasCompiled}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition disabled:opacity-40"
        >
          <Play className="h-3 w-3 fill-current" />
          <span>Evaluate</span>
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3 bg-zinc-950">
        {/* Variable Inputs */}
        {varKeys.length === 0 ? (
          <div className="py-2.5 text-center text-xs text-zinc-500 font-mono">
            No runtime variables needed (constants or self-contained).
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {varKeys.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between px-2.5 py-1.5 rounded bg-zinc-900/80 border border-zinc-800 text-xs"
              >
                <label className="font-mono text-zinc-400 font-medium">{name} =</label>
                <input
                  type="number"
                  value={variables[name]}
                  onChange={(e) => onVariableChange(name, parseFloat(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-right font-mono text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Computed Result */}
        {Object.keys(finalValues).length > 0 && (
          <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">Output:</span>
            {Object.entries(finalValues)
              .filter(([key]) => !key.startsWith('t') || Object.keys(finalValues).length <= 3)
              .map(([name, val]) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono"
                >
                  <span className="text-zinc-400">{name}:</span>
                  <span className="text-white font-bold">{val}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
