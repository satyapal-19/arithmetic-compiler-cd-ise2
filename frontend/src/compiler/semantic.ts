import { ASTNode, ASTNodeType, SemanticDiagnostic, SymbolEntry } from './types'

export class SemanticAnalyzer {
  private symbolTable = new Map<string, SymbolEntry>()
  private diagnostics: SemanticDiagnostic[] = []
  private analysisLog: string[] = []
  private currentOffset = 0

  public clear(): void {
    this.symbolTable.clear()
    this.diagnostics = []
    this.analysisLog = []
    this.currentOffset = 0
  }

  public getDiagnostics(): SemanticDiagnostic[] {
    return this.diagnostics
  }

  public getLog(): string[] {
    return this.analysisLog
  }

  public getSymbolTable(): SymbolEntry[] {
    return Array.from(this.symbolTable.values())
  }

  public hasFatalErrors(): boolean {
    return this.diagnostics.some((d) => d.level === 'ERROR')
  }

  public analyze(root: ASTNode | null): boolean {
    this.clear()
    this.analysisLog.push('Starting Semantic Analysis Pass...')

    if (!root) return false
    this.analyzeNode(root)

    this.analysisLog.push(`Semantic Analysis completed with ${this.diagnostics.length} diagnostic(s).`)
    return !this.hasFatalErrors()
  }

  private analyzeNode(node: ASTNode | null): void {
    if (!node) return

    switch (node.type) {
      case ASTNodeType.PROGRAM:
        if (node.children) {
          for (const stmt of node.children) {
            this.analyzeNode(stmt)
          }
        }
        break

      case ASTNodeType.ASSIGNMENT_STMT: {
        const varName = node.name || 'temp'
        this.analysisLog.push(`Analyzing Assignment to variable '${varName}'`)

        this.analyzeNode(node.right || null)
        const rhsType = node.right?.inferredType || 'int'
        let varType = node.inferredType

        if (!varType || varType === 'pending' || varType === 'inferred') {
          varType = rhsType
        }

        if (!this.symbolTable.has(varName)) {
          const entry: SymbolEntry = {
            name: varName,
            dataType: varType,
            value: 0,
            isInitialized: true,
            memoryOffset: this.currentOffset,
            lineDeclared: 1,
          }
          this.currentOffset += 4
          this.symbolTable.set(varName, entry)
          this.analysisLog.push(`Added variable '${varName}' of type [${varType}] to Symbol Table at Byte ${entry.memoryOffset}.`)
        } else {
          const existing = this.symbolTable.get(varName)!
          existing.isInitialized = true
          existing.dataType = varType
          this.analysisLog.push(`Updated variable '${varName}' as initialized in Symbol Table.`)
        }
        node.inferredType = varType
        break
      }

      case ASTNodeType.EXPR_STMT:
        this.analyzeNode(node.left || null)
        break

      case ASTNodeType.BINARY_OP: {
        this.analyzeNode(node.left || null)
        this.analyzeNode(node.right || null)

        const lType = node.left?.inferredType || 'int'
        const rType = node.right?.inferredType || 'int'

        if (lType === 'float' || rType === 'float') {
          node.inferredType = 'float'
        } else {
          node.inferredType = 'int'
        }

        // Division by zero check
        if (node.op === '/' || node.op === '%') {
          if (node.right && node.right.type === ASTNodeType.NUM_LITERAL) {
            if (node.right.numValue === 0) {
              this.diagnostics.push({
                level: 'ERROR',
                message: `Semantic Error: Division or Modulo by constant zero detected on operator '${node.op}'!`,
              })
              this.analysisLog.push(`CRITICAL: Division by zero caught on operator '${node.op}'`)
            }
          }
        }

        this.analysisLog.push(
          `Verified Binary Op '${node.op}': (${lType} ${node.op} ${rType}) -> Result type: ${node.inferredType}`
        )
        break
      }

      case ASTNodeType.UNARY_OP:
        this.analyzeNode(node.right || null)
        node.inferredType = node.right?.inferredType || 'int'
        this.analysisLog.push(`Verified Unary Op '${node.op}' on type ${node.inferredType}`)
        break

      case ASTNodeType.VARIABLE: {
        const vName = node.name || ''
        const existing = this.symbolTable.get(vName)
        if (!existing) {
          this.diagnostics.push({
            level: 'WARNING',
            message: `Variable '${vName}' used without explicit prior declaration. Auto-allocating in Symbol Table.`,
          })
          const entry: SymbolEntry = {
            name: vName,
            dataType: 'int',
            value: 0,
            isInitialized: false,
            memoryOffset: this.currentOffset,
            lineDeclared: 1,
          }
          this.currentOffset += 4
          this.symbolTable.set(vName, entry)
          node.inferredType = 'int'
          this.analysisLog.push(`Auto-registered undeclared variable '${vName}' as int at Byte ${entry.memoryOffset}.`)
        } else {
          node.inferredType = existing.dataType
          if (!existing.isInitialized) {
            this.diagnostics.push({
              level: 'WARNING',
              message: `Variable '${vName}' may be uninitialized.`,
            })
          }
          this.analysisLog.push(`Looked up variable '${vName}' in Symbol Table. Type: ${existing.dataType}`)
        }
        break
      }

      case ASTNodeType.NUM_LITERAL:
        // already inferred
        break
    }
  }
}
