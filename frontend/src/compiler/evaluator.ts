import { TACInstruction } from './types'

export interface SimulationStep {
  stepNumber: number
  instruction: string
  action: string
  state: Record<string, number>
}

export class ExpressionEvaluator {
  public static simulate(
    instructions: TACInstruction[],
    initialVariables: Record<string, number>
  ): {
    steps: SimulationStep[]
    finalValues: Record<string, number>
  } {
    const memory: Record<string, number> = { ...initialVariables }
    const steps: SimulationStep[] = []

    const resolve = (operand: string): number => {
      const num = Number(operand)
      if (!isNaN(num)) return num
      if (operand in memory) return memory[operand]
      return 0
    }

    for (let i = 0; i < instructions.length; i++) {
      const instr = instructions[i]
      const dest = instr.result
      let computed = 0
      let action = ''

      if (instr.op === '=') {
        computed = resolve(instr.arg1)
        action = `Assigned ${computed} to ${dest}`
      } else if (instr.op === 'NEG') {
        computed = -resolve(instr.arg1)
        action = `Negated ${instr.arg1} = ${computed}`
      } else if (instr.op === 'POS') {
        computed = resolve(instr.arg1)
        action = `Positive ${instr.arg1} = ${computed}`
      } else {
        const v1 = resolve(instr.arg1)
        const v2 = resolve(instr.arg2)

        switch (instr.op) {
          case '+':
            computed = v1 + v2
            break
          case '-':
            computed = v1 - v2
            break
          case '*':
            computed = v1 * v2
            break
          case '/':
            computed = v2 !== 0 ? v1 / v2 : 0
            break
          case '%':
            computed = v2 !== 0 ? v1 % v2 : 0
            break
          case '^':
            computed = Math.pow(v1, v2)
            break
          default:
            computed = 0
        }
        action = `Computed ${v1} ${instr.op} ${v2} = ${computed}`
      }

      memory[dest] = computed

      steps.push({
        stepNumber: i + 1,
        instruction:
          instr.op === '='
            ? `${dest} = ${instr.arg1}`
            : `${dest} = ${instr.arg1} ${instr.op} ${instr.arg2}`,
        action,
        state: { ...memory },
      })
    }

    return { steps, finalValues: memory }
  }
}
