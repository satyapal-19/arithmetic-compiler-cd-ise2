import { useState, useEffect, useCallback } from 'react'
import { Navbar } from './components/Navbar'
import { CodeEditor, PRESETS, Preset } from './components/CodeEditor'
import { VariableInputArea } from './components/VariableInputArea'
import { OutputViewer } from './components/OutputViewer'
import { DocsModal } from './components/DocsModal'
import { ArithmeticCompiler } from './compiler'
import { CompilerResult } from './compiler/types'
import { ExpressionEvaluator, SimulationStep } from './compiler/evaluator'

export function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('optimization')
  const [code, setCode] = useState<string>(PRESETS[1].code)
  const [result, setResult] = useState<CompilerResult | null>(null)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [isCompiling, setIsCompiling] = useState<boolean>(false)
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false)

  // Variables for dynamic evaluation in Input Area
  const [variables, setVariables] = useState<Record<string, number>>(PRESETS[1].defaultVars)
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([])
  const [finalValues, setFinalValues] = useState<Record<string, number>>({})

  const handleCompile = useCallback(() => {
    setIsCompiling(true)
    setTimeout(() => {
      const compResult = ArithmeticCompiler.compile(code)
      setResult(compResult)

      // Detect identifiers needed as inputs (excluding destination variables)
      const allIds = new Set<string>()
      const destIds = new Set<string>()

      for (const tok of compResult.tokens) {
        if (tok.type.includes('IDENTIFIER')) {
          allIds.add(tok.lexeme)
        }
      }

      for (const tac of compResult.rawTAC) {
        if (tac.op === '=') {
          destIds.add(tac.result)
        }
      }

      const newVars: Record<string, number> = { ...variables }
      allIds.forEach((id) => {
        if (!destIds.has(id)) {
          if (!(id in newVars)) {
            newVars[id] = 5
          }
        }
      })

      setVariables(newVars)

      // Evaluate variables dynamically
      if (compResult.success && compResult.optimizedTAC.length > 0) {
        const sim = ExpressionEvaluator.simulate(compResult.optimizedTAC, newVars)
        setSimulationSteps(sim.steps)
        setFinalValues(sim.finalValues)
      } else {
        setSimulationSteps([])
        setFinalValues({})
      }

      setIsCompiling(false)
    }, 100)
  }, [code, variables])

  // Initial compilation on mount
  useEffect(() => {
    handleCompile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id)
    setCode(preset.code)
    setVariables(preset.defaultVars)
    setTimeout(() => {
      const compResult = ArithmeticCompiler.compile(preset.code)
      setResult(compResult)
      if (compResult.success && compResult.optimizedTAC.length > 0) {
        const sim = ExpressionEvaluator.simulate(compResult.optimizedTAC, preset.defaultVars)
        setSimulationSteps(sim.steps)
        setFinalValues(sim.finalValues)
      }
    }, 40)
  }

  const handleVariableChange = (name: string, value: number) => {
    const updated = { ...variables, [name]: value }
    setVariables(updated)
    if (result && result.success && result.optimizedTAC.length > 0) {
      const sim = ExpressionEvaluator.simulate(result.optimizedTAC, updated)
      setSimulationSteps(sim.steps)
      setFinalValues(sim.finalValues)
    }
  }

  const handleRunSimulation = () => {
    if (result && result.success && result.optimizedTAC.length > 0) {
      const sim = ExpressionEvaluator.simulate(result.optimizedTAC, variables)
      setSimulationSteps(sim.steps)
      setFinalValues(sim.finalValues)
    }
  }

  const handleClear = () => {
    setCode('')
    setResult(null)
    setVariables({})
    setFinalValues({})
    setSimulationSteps([])
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onCompile={handleCompile}
        onClear={handleClear}
        onOpenDoc={() => setIsDocsOpen(true)}
        isCompiling={isCompiling}
        success={!!result && result.success}
      />

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 flex flex-col">
        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 items-stretch">
          {/* LEFT SCREEN: Code Editor Area + Variable Input Area */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <CodeEditor
              code={code}
              onChange={setCode}
              onCompile={handleCompile}
              selectedPreset={selectedPresetId}
              onSelectPreset={handleSelectPreset}
            />

            <VariableInputArea
              variables={variables}
              onVariableChange={handleVariableChange}
              onRunSimulation={handleRunSimulation}
              simulationSteps={simulationSteps}
              finalValues={finalValues}
              hasCompiled={!!result && result.success}
            />
          </div>

          {/* RIGHT SCREEN: Output Area with Clean Dual-Color Tabs */}
          <div className="lg:col-span-7 flex flex-col min-h-[460px]">
            <OutputViewer
              result={result}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-2.5 px-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Arithmetic Compiler Studio</span>
          <span>Dual-Color Minimalist IDE • CD ISE 2</span>
        </div>
      </footer>

      {/* Documentation Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  )
}

export default App
