import { OptimizationRecord, TACInstruction } from './types'

export class CodeOptimizer {
  private optimizationLog: OptimizationRecord[] = []

  private isNumber(str: string): { isNum: boolean; val: number } {
    if (!str || str.trim() === '') return { isNum: false, val: 0 }
    const num = Number(str)
    if (!isNaN(num) && isFinite(num)) {
      return { isNum: true, val: num }
    }
    return { isNum: false, val: 0 }
  }

  private formatNumber(val: number): string {
    if (Number.isInteger(val)) {
      return `${val}`
    }
    return `${parseFloat(val.toFixed(2))}`
  }

  private isTemporary(s: string): boolean {
    if (s.length < 2 || s[0] !== 't') return false
    for (let i = 1; i < s.length; i++) {
      if (s[i] < '0' || s[i] > '9') return false
    }
    return true
  }

  public getLog(): OptimizationRecord[] {
    return this.optimizationLog
  }

  public optimize(original: TACInstruction[]): {
    optimized: TACInstruction[]
    records: OptimizationRecord[]
    reduction: number
  } {
    this.optimizationLog = []
    let current = [...original]

    // Pass 1: Constant Folding
    current = this.constantFoldingPass(current)

    // Pass 2: Algebraic Simplification
    current = this.algebraicIdentityPass(current)

    // Pass 3: Common Subexpression Elimination (CSE)
    current = this.commonSubexpressionEliminationPass(current)

    // Pass 4: Copy & Constant Propagation + Dead Temporary Elimination
    current = this.copyPropagationAndDeadCodePass(current)

    // Re-index instructions
    current = current.map((instr, idx) => ({
      ...instr,
      index: idx + 1,
    }))

    const reduction =
      original.length > 0
        ? parseFloat((((original.length - current.length) / original.length) * 100).toFixed(1))
        : 0

    return {
      optimized: current,
      records: this.optimizationLog,
      reduction,
    }
  }

  private constantFoldingPass(instructions: TACInstruction[]): TACInstruction[] {
    const result: TACInstruction[] = []

    for (const instr of instructions) {
      const n1 = this.isNumber(instr.arg1)
      const n2 = this.isNumber(instr.arg2)

      if (instr.op !== '=' && instr.op !== 'NEG' && instr.op !== 'POS' && n1.isNum && n2.isNum) {
        let computed = 0
        let valid = true

        if (instr.op === '+') computed = n1.val + n2.val
        else if (instr.op === '-') computed = n1.val - n2.val
        else if (instr.op === '*') computed = n1.val * n2.val
        else if (instr.op === '/') {
          if (n2.val !== 0) computed = n1.val / n2.val
          else valid = false
        } else if (instr.op === '%') {
          if (n2.val !== 0) computed = n1.val % n2.val
          else valid = false
        } else if (instr.op === '^') computed = Math.pow(n1.val, n2.val)
        else valid = false

        if (valid) {
          const formatted = this.formatNumber(computed)
          const folded: TACInstruction = {
            index: instr.index,
            op: '=',
            arg1: formatted,
            arg2: '',
            result: instr.result,
            comment: `Constant folded: ${instr.arg1} ${instr.op} ${instr.arg2} = ${formatted}`,
          }

          const before = `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`
          const after = `${folded.result} = ${formatted}`
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Constant Folding',
            beforeCode: before,
            afterCode: after,
            reason: 'Evaluated constant arithmetic operation during compilation.',
          })

          result.push(folded)
          continue
        }
      }

      result.push(instr)
    }

    return result
  }

  private algebraicIdentityPass(instructions: TACInstruction[]): TACInstruction[] {
    const result: TACInstruction[] = []

    for (const instr of instructions) {
      const n1 = this.isNumber(instr.arg1)
      const n2 = this.isNumber(instr.arg2)
      const before = `${instr.result} = ${instr.arg1} ${instr.op} ${instr.arg2}`

      // x + 0 = x or 0 + x = x
      if (instr.op === '+') {
        if (n2.isNum && n2.val === 0) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: instr.arg1,
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (x + 0 = x)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = ${instr.arg1}`,
            reason: 'x + 0 = x',
          })
          continue
        }
        if (n1.isNum && n1.val === 0) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: instr.arg2,
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (0 + x = x)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = ${instr.arg2}`,
            reason: '0 + x = x',
          })
          continue
        }
      }

      // x - 0 = x
      if (instr.op === '-') {
        if (n2.isNum && n2.val === 0) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: instr.arg1,
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (x - 0 = x)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = ${instr.arg1}`,
            reason: 'x - 0 = x',
          })
          continue
        }
      }

      // x * 1 = x or 1 * x = x
      if (instr.op === '*') {
        if (n2.isNum && n2.val === 1) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: instr.arg1,
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (x * 1 = x)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = ${instr.arg1}`,
            reason: 'x * 1 = x',
          })
          continue
        }
        if (n1.isNum && n1.val === 1) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: instr.arg2,
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (1 * x = x)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = ${instr.arg2}`,
            reason: '1 * x = x',
          })
          continue
        }
        // x * 0 = 0 or 0 * x = 0
        if ((n2.isNum && n2.val === 0) || (n1.isNum && n1.val === 0)) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: '0',
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (x * 0 = 0)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = 0`,
            reason: 'x * 0 = 0',
          })
          continue
        }
      }

      // x / 1 = x
      if (instr.op === '/') {
        if (n2.isNum && n2.val === 1) {
          result.push({
            index: instr.index,
            op: '=',
            arg1: instr.arg1,
            arg2: '',
            result: instr.result,
            comment: 'Algebraic simplification (x / 1 = x)',
          })
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Algebraic Simplification',
            beforeCode: before,
            afterCode: `${instr.result} = ${instr.arg1}`,
            reason: 'x / 1 = x',
          })
          continue
        }
      }

      result.push(instr)
    }

    return result
  }

  private commonSubexpressionEliminationPass(instructions: TACInstruction[]): TACInstruction[] {
    const result: TACInstruction[] = []
    const exprToResult = new Map<string, string>()

    for (const instr of instructions) {
      if (instr.op !== '=' && instr.op !== 'NEG' && instr.op !== 'POS') {
        const key = `${instr.arg1} ${instr.op} ${instr.arg2}`
        const revKey =
          instr.op === '+' || instr.op === '*' ? `${instr.arg2} ${instr.op} ${instr.arg1}` : ''

        if (exprToResult.has(key)) {
          const prevResult = exprToResult.get(key)!
          const before = `${instr.result} = ${key}`
          const after = `${instr.result} = ${prevResult}`
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Common Subexpression Elimination (CSE)',
            beforeCode: before,
            afterCode: after,
            reason: `Reused previously computed result of '${key}' stored in ${prevResult}`,
          })
          result.push({
            index: instr.index,
            op: '=',
            arg1: prevResult,
            arg2: '',
            result: instr.result,
            comment: `Reusing ${prevResult} from CSE`,
          })
          continue
        } else if (revKey && exprToResult.has(revKey)) {
          const prevResult = exprToResult.get(revKey)!
          const before = `${instr.result} = ${key}`
          const after = `${instr.result} = ${prevResult}`
          this.optimizationLog.push({
            id: `opt_${this.optimizationLog.length + 1}`,
            passName: 'Common Subexpression Elimination (CSE)',
            beforeCode: before,
            afterCode: after,
            reason: `Reused commutative expression result of '${revKey}' stored in ${prevResult}`,
          })
          result.push({
            index: instr.index,
            op: '=',
            arg1: prevResult,
            arg2: '',
            result: instr.result,
            comment: `Reusing ${prevResult} from CSE`,
          })
          continue
        } else {
          exprToResult.set(key, instr.result)
        }
      }
      result.push(instr)
    }

    return result
  }

  private copyPropagationAndDeadCodePass(instructions: TACInstruction[]): TACInstruction[] {
    const copyMap = new Map<string, string>()
    const propagated: TACInstruction[] = []

    for (const instr of instructions) {
      let a1 = instr.arg1
      let a2 = instr.arg2

      if (copyMap.has(a1)) a1 = copyMap.get(a1)!
      if (copyMap.has(a2)) a2 = copyMap.get(a2)!

      const updated: TACInstruction = {
        ...instr,
        arg1: a1,
        arg2: a2,
      }

      // Only eliminate redundant temporary copies: ti = tj or ti = literal
      if (updated.op === '=' && this.isTemporary(updated.result)) {
        copyMap.set(updated.result, updated.arg1)
        this.optimizationLog.push({
          id: `opt_${this.optimizationLog.length + 1}`,
          passName: 'Copy Propagation',
          beforeCode: `${updated.result} = ${updated.arg1}`,
          afterCode: `Propagated ${updated.result} -> ${updated.arg1}`,
          reason: 'Replaced references to temporary with source value.',
        })
        continue
      }

      propagated.push(updated)
    }

    return propagated
  }
}
