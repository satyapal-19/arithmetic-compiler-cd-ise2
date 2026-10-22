import { AssemblyInstruction, RegisterState, SymbolEntry, TACInstruction } from './types'

export class TargetCodeGenerator {
  private static readonly NUM_REGISTERS = 6
  private registerDescriptor: string[] = new Array(TargetCodeGenerator.NUM_REGISTERS).fill('')
  private generatedAssembly: AssemblyInstruction[] = []
  private codegenLog: string[] = []

  private allocateRegister(varName: string): number {
    // 1. If var is already in a register, reuse it
    for (let i = 0; i < TargetCodeGenerator.NUM_REGISTERS; i++) {
      if (this.registerDescriptor[i] === varName) {
        return i
      }
    }
    // 2. Find empty register
    for (let i = 0; i < TargetCodeGenerator.NUM_REGISTERS; i++) {
      if (!this.registerDescriptor[i]) {
        this.registerDescriptor[i] = varName
        return i
      }
    }
    // 3. FIFO spill R0
    const reg = 0
    if (this.registerDescriptor[reg]) {
      this.generatedAssembly.push({
        line: this.generatedAssembly.length + 1,
        instruction: `STORE ${this.registerDescriptor[reg]}, R${reg}`,
        comment: `Spill R${reg} to memory for ${this.registerDescriptor[reg]}`,
      })
    }
    this.registerDescriptor[reg] = varName
    return reg
  }

  public generate(
    optimizedTac: TACInstruction[],
    symbolTable: SymbolEntry[]
  ): {
    assembly: AssemblyInstruction[]
    registers: RegisterState[]
    log: string[]
  } {
    this.generatedAssembly = []
    this.codegenLog = []
    this.registerDescriptor.fill('')

    this.codegenLog.push('Initializing Target Architecture (Virtual 32-bit RISC / Accumulator CPU)...')
    this.codegenLog.push('Register Set: [R0, R1, R2, R3, R4, R5]')

    // .DATA segment
    this.generatedAssembly.push({
      line: this.generatedAssembly.length + 1,
      instruction: '.DATA',
      comment: 'Start of Data Segment',
    })

    for (const sym of symbolTable) {
      this.generatedAssembly.push({
        line: this.generatedAssembly.length + 1,
        instruction: `${sym.name}: .WORD ${Math.floor(sym.value)}`,
        comment: `Variable '${sym.name}' initialized at offset Byte ${sym.memoryOffset}`,
      })
    }

    this.generatedAssembly.push({
      line: this.generatedAssembly.length + 1,
      instruction: '',
      comment: '',
    })

    // .CODE segment
    this.generatedAssembly.push({
      line: this.generatedAssembly.length + 1,
      instruction: '.CODE',
      comment: 'Start of Code Segment',
    })

    for (const instr of optimizedTac) {
      if (instr.op === '=') {
        const rDest = this.allocateRegister(instr.result)
        this.generatedAssembly.push({
          line: this.generatedAssembly.length + 1,
          instruction: `LOAD  R${rDest}, ${instr.arg1}`,
          comment: `Load value of ${instr.arg1} into R${rDest}`,
        })
        this.generatedAssembly.push({
          line: this.generatedAssembly.length + 1,
          instruction: `STORE ${instr.result}, R${rDest}`,
          comment: `Write R${rDest} to memory address of ${instr.result}`,
        })
        this.registerDescriptor[rDest] = instr.result
      } else {
        const r1 = this.allocateRegister(instr.arg1)
        this.generatedAssembly.push({
          line: this.generatedAssembly.length + 1,
          instruction: `LOAD  R${r1}, ${instr.arg1}`,
          comment: `Load operand 1 (${instr.arg1}) into R${r1}`,
        })

        let asmOp = 'OP   '
        if (instr.op === '+') asmOp = 'ADD  '
        else if (instr.op === '-') asmOp = 'SUB  '
        else if (instr.op === '*') asmOp = 'MUL  '
        else if (instr.op === '/') asmOp = 'DIV  '
        else if (instr.op === '%') asmOp = 'MOD  '
        else if (instr.op === '^') asmOp = 'POW  '

        this.generatedAssembly.push({
          line: this.generatedAssembly.length + 1,
          instruction: `${asmOp} R${r1}, ${instr.arg2}`,
          comment: `Compute R${r1} = R${r1} ${instr.op} ${instr.arg2}`,
        })

        this.generatedAssembly.push({
          line: this.generatedAssembly.length + 1,
          instruction: `STORE ${instr.result}, R${r1}`,
          comment: `Store computation result from R${r1} into ${instr.result}`,
        })
        this.registerDescriptor[r1] = instr.result
      }
    }

    this.generatedAssembly.push({
      line: this.generatedAssembly.length + 1,
      instruction: 'HALT',
      comment: 'Terminate Execution',
    })

    const registers: RegisterState[] = this.registerDescriptor.map((val, idx) => ({
      reg: `R${idx}`,
      value: val || '(Empty / Free)',
    }))

    return {
      assembly: this.generatedAssembly,
      registers,
      log: this.codegenLog,
    }
  }
}
