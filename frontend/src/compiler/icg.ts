import { ASTNode, ASTNodeType, Quadruple, TACInstruction, Triple } from './types'

export class IntermediateCodeGenerator {
  private tempCounter = 1
  private tacInstructions: TACInstruction[] = []
  private quadruples: Quadruple[] = []
  private triples: Triple[] = []
  private postfixTokens: string[] = []
  private icgLog: string[] = []

  private newTemp(): string {
    return `t${this.tempCounter++}`
  }

  public reset(): void {
    this.tempCounter = 1
    this.tacInstructions = []
    this.quadruples = []
    this.triples = []
    this.postfixTokens = []
    this.icgLog = []
  }

  public getTAC(): TACInstruction[] {
    return this.tacInstructions
  }

  public getQuadruples(): Quadruple[] {
    return this.quadruples
  }

  public getTriples(): Triple[] {
    return this.triples
  }

  public getPostfix(): string[] {
    return this.postfixTokens
  }

  public getLog(): string[] {
    return this.icgLog
  }

  public generate(root: ASTNode | null): void {
    this.reset()
    this.icgLog.push('Traversing AST in Post-Order to emit Three-Address Code (TAC)...')
    this.generateNode(root)
    this.icgLog.push(`Intermediate Code Generation finished. Emitted ${this.tacInstructions.length} TAC instruction(s).`)
  }

  private generateNode(node: ASTNode | null): string {
    if (!node) return ''

    switch (node.type) {
      case ASTNodeType.PROGRAM:
        if (node.children) {
          for (const stmt of node.children) {
            this.generateNode(stmt)
          }
        }
        return ''

      case ASTNodeType.ASSIGNMENT_STMT: {
        const rhsVal = this.generateNode(node.right || null)
        const varName = node.name || 'temp'
        const idx = this.tacInstructions.length + 1

        const instr: TACInstruction = {
          index: idx,
          op: '=',
          arg1: rhsVal,
          arg2: '',
          result: varName,
          comment: `Store computed value of expression into variable '${varName}'`,
        }
        this.tacInstructions.push(instr)

        this.quadruples.push({
          index: this.quadruples.length,
          op: '=',
          arg1: rhsVal,
          arg2: '-',
          result: varName,
        })

        this.triples.push({
          index: this.triples.length,
          op: '=',
          arg1: varName,
          arg2: rhsVal,
        })

        this.icgLog.push(`Emitted assignment: ${varName} = ${rhsVal}`)
        return varName
      }

      case ASTNodeType.EXPR_STMT:
        return this.generateNode(node.left || null)

      case ASTNodeType.BINARY_OP: {
        const leftVal = this.generateNode(node.left || null)
        const rightVal = this.generateNode(node.right || null)
        const t = this.newTemp()
        const op = node.op || '+'
        const idx = this.tacInstructions.length + 1

        const instr: TACInstruction = {
          index: idx,
          op,
          arg1: leftVal,
          arg2: rightVal,
          result: t,
          comment: `Calculate ${leftVal} ${op} ${rightVal} -> ${t}`,
        }
        this.tacInstructions.push(instr)

        this.quadruples.push({
          index: this.quadruples.length,
          op,
          arg1: leftVal,
          arg2: rightVal,
          result: t,
        })

        this.triples.push({
          index: this.triples.length,
          op,
          arg1: leftVal,
          arg2: rightVal,
        })

        this.postfixTokens.push(op)
        this.icgLog.push(`Emitted TAC: ${t} = ${leftVal} ${op} ${rightVal}`)
        return t
      }

      case ASTNodeType.UNARY_OP: {
        const rightVal = this.generateNode(node.right || null)
        const t = this.newTemp()
        const op = node.op || 'NEG'
        const idx = this.tacInstructions.length + 1

        const instr: TACInstruction = {
          index: idx,
          op,
          arg1: rightVal,
          arg2: '',
          result: t,
          comment: `Apply unary ${op} to ${rightVal} -> ${t}`,
        }
        this.tacInstructions.push(instr)

        this.quadruples.push({
          index: this.quadruples.length,
          op,
          arg1: rightVal,
          arg2: '-',
          result: t,
        })

        this.triples.push({
          index: this.triples.length,
          op,
          arg1: rightVal,
          arg2: '-',
        })

        this.postfixTokens.push(op)
        this.icgLog.push(`Emitted Unary TAC: ${t} = ${op} ${rightVal}`)
        return t
      }

      case ASTNodeType.NUM_LITERAL: {
        const val = node.rawValue || `${node.numValue}`
        this.postfixTokens.push(val)
        return val
      }

      case ASTNodeType.VARIABLE: {
        const name = node.name || ''
        this.postfixTokens.push(name)
        return name
      }
    }

    return ''
  }
}
