import { ASTNode, ASTNodeType, SDDRule, SemanticDiagnostic, SymbolEntry } from './types'

export class SemanticAnalyzer {
  private symbolTable = new Map<string, SymbolEntry>()
  private diagnostics: SemanticDiagnostic[] = []
  private analysisLog: string[] = []
  private sddRules: SDDRule[] = []
  private currentOffset = 0
  private sddCounter = 1

  public clear(): void {
    this.symbolTable.clear()
    this.diagnostics = []
    this.analysisLog = []
    this.sddRules = []
    this.currentOffset = 0
    this.sddCounter = 1
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

  public getSDDRules(): SDDRule[] {
    return this.sddRules
  }

  public hasFatalErrors(): boolean {
    return this.diagnostics.some((d) => d.level === 'ERROR')
  }

  public analyze(root: ASTNode | null): boolean {
    this.clear()
    this.analysisLog.push('Starting Semantic Analysis & SDT Attribute Evaluation...')

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
            scope: 'Global',
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

        // Module 3: SDD Semantic Rule
        this.sddRules.push({
          id: this.sddCounter++,
          production: `S -> id = E ;`,
          semanticAction: `lookup(id.name).val = E.val; S.type = void`,
          synthesizedAttribute: `S.val = ${varName} (${varType})`,
        })
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

        // Module 3: SDD S-attributed Rule
        this.sddRules.push({
          id: this.sddCounter++,
          production: `E -> E1 ${node.op} T`,
          semanticAction: `E.val = E1.val ${node.op} T.val; E.type = checkType(E1.type, T.type)`,
          synthesizedAttribute: `E.type = ${node.inferredType}`,
        })
        break
      }

      case ASTNodeType.UNARY_OP:
        this.analyzeNode(node.right || null)
        node.inferredType = node.right?.inferredType || 'int'
        this.analysisLog.push(`Verified Unary Op '${node.op}' on type ${node.inferredType}`)

        this.sddRules.push({
          id: this.sddCounter++,
          production: `F -> ${node.op} F1`,
          semanticAction: `F.val = -F1.val; F.type = F1.type`,
          synthesizedAttribute: `F.type = ${node.inferredType}`,
        })
        break

      case ASTNodeType.VARIABLE: {
        const vName = node.name || ''
        const existing = this.symbolTable.get(vName)
        if (!existing) {
          const entry: SymbolEntry = {
            name: vName,
            dataType: 'int',
            value: 0,
            isInitialized: true,
            memoryOffset: this.currentOffset,
            lineDeclared: 1,
            scope: 'Global',
          }
          this.currentOffset += 4
          this.symbolTable.set(vName, entry)
          node.inferredType = 'int'
          this.analysisLog.push(`Registered operand variable '${vName}' as int in Symbol Table (Byte ${entry.memoryOffset}).`)
        } else {
          node.inferredType = existing.dataType
          this.analysisLog.push(`Looked up variable '${vName}' in Symbol Table. Type: ${existing.dataType}`)
        }

        this.sddRules.push({
          id: this.sddCounter++,
          production: `F -> id`,
          semanticAction: `F.val = lookup(id.entry); F.type = id.type`,
          synthesizedAttribute: `F.val = ${vName}`,
        })
        break
      }

      case ASTNodeType.NUM_LITERAL:
        this.sddRules.push({
          id: this.sddCounter++,
          production: `F -> num`,
          semanticAction: `F.val = num.lexval; F.type = ${node.inferredType || 'int'}`,
          synthesizedAttribute: `F.val = ${node.rawValue}`,
        })
        break
    }
  }
}
