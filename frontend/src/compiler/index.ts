import { LexicalAnalyzer } from './lexer'
import { Parser } from './parser'
import { SemanticAnalyzer } from './semantic'
import { IntermediateCodeGenerator } from './icg'
import { CodeOptimizer } from './optimizer'
import { TargetCodeGenerator } from './codegen'
import { CompilerResult } from './types'

export class ArithmeticCompiler {
  public static compile(sourceCode: string): CompilerResult {
    let consoleOutput = ''
    const appendLine = (line = '') => {
      consoleOutput += line + '\n'
    }

    appendLine('==============================================================================')
    appendLine('                  STARTING ARITHMETIC COMPILER PIPELINE')
    appendLine('==============================================================================')
    appendLine(`Source Code Input:\n  "${sourceCode}"`)

    // STAGE 1: LEXICAL ANALYSIS
    appendLine('\n>>> [PHASE 1/6] Running Lexical Analysis (Scanner)...')
    const lexer = new LexicalAnalyzer(sourceCode)
    const { tokens, log: lexLog } = lexer.tokenize()
    appendLine(` DONE. (${tokens.length} tokens generated)`)

    // Check for lexical errors
    const unknownToken = tokens.find((t) => t.type.includes('UNKNOWN'))
    if (unknownToken) {
      const errMsg = `LEXICAL ERROR: Illegal character '${unknownToken.lexeme}' at line ${unknownToken.line}, col ${unknownToken.column}`
      appendLine(`\n[!] ${errMsg}`)
      return {
        success: false,
        sourceCode,
        tokens,
        lexLog,
        astRoot: null,
        asciiTree: '',
        derivationLog: [],
        symbolTable: [],
        diagnostics: [{ level: 'ERROR', message: errMsg }],
        semanticLog: [],
        rawTAC: [],
        quadruples: [],
        triples: [],
        postfix: [],
        optimizedTAC: [],
        optimizations: [],
        reductionPercentage: 0,
        assembly: [],
        registers: [],
        consoleOutput,
        evaluatedValues: {},
        errorMessage: errMsg,
      }
    }

    // STAGE 2: SYNTAX ANALYSIS
    appendLine('\n>>> [PHASE 2/6] Running Syntax Analysis (Recursive Descent Parser)...')
    const parser = new Parser(tokens)
    const astRoot = parser.parseProgram()

    if (parser.hasError()) {
      const errMsg = parser.getError()
      appendLine(` FAILED!\n\n[!] ${errMsg}`)
      return {
        success: false,
        sourceCode,
        tokens,
        lexLog,
        astRoot: null,
        asciiTree: '',
        derivationLog: parser.getDerivationLog(),
        symbolTable: [],
        diagnostics: [{ level: 'ERROR', message: errMsg }],
        semanticLog: [],
        rawTAC: [],
        quadruples: [],
        triples: [],
        postfix: [],
        optimizedTAC: [],
        optimizations: [],
        reductionPercentage: 0,
        assembly: [],
        registers: [],
        consoleOutput,
        evaluatedValues: {},
        errorMessage: errMsg,
      }
    }

    const asciiTree = Parser.generateASCIITree(astRoot)
    appendLine(' DONE. (Abstract Syntax Tree built successfully)')

    // STAGE 3: SEMANTIC ANALYSIS
    appendLine('\n>>> [PHASE 3/6] Running Semantic Analysis & Type Checking...')
    const semanticAnalyzer = new SemanticAnalyzer()
    const semanticOk = semanticAnalyzer.analyze(astRoot)
    const diagnostics = semanticAnalyzer.getDiagnostics()
    const symbolTable = semanticAnalyzer.getSymbolTable()
    const semanticLog = semanticAnalyzer.getLog()

    if (!semanticOk) {
      const firstError = diagnostics.find((d) => d.level === 'ERROR')?.message || 'Fatal Semantic Error detected.'
      appendLine(`\n[!] COMPILATION ABORTED: ${firstError}`)
      return {
        success: false,
        sourceCode,
        tokens,
        lexLog,
        astRoot,
        asciiTree,
        derivationLog: parser.getDerivationLog(),
        symbolTable,
        diagnostics,
        semanticLog,
        rawTAC: [],
        quadruples: [],
        triples: [],
        postfix: [],
        optimizedTAC: [],
        optimizations: [],
        reductionPercentage: 0,
        assembly: [],
        registers: [],
        consoleOutput,
        evaluatedValues: {},
        errorMessage: firstError,
      }
    }

    // STAGE 4: INTERMEDIATE CODE GENERATION
    appendLine('\n>>> [PHASE 4/6] Running Intermediate Code Generation (ICG)...')
    const icg = new IntermediateCodeGenerator()
    icg.generate(astRoot)
    const rawTAC = icg.getTAC()
    const quadruples = icg.getQuadruples()
    const triples = icg.getTriples()
    const postfix = icg.getPostfix()
    appendLine(` DONE. (${rawTAC.length} TAC instructions emitted)`)

    // STAGE 5: CODE OPTIMIZATION
    appendLine('\n>>> [PHASE 5/6] Running Code Optimization Passes...')
    const optimizer = new CodeOptimizer()
    const { optimized: optimizedTAC, records: optimizations, reduction } = optimizer.optimize(rawTAC)
    appendLine(` DONE. (${rawTAC.length} -> ${optimizedTAC.length} instructions, ${reduction}% reduction)`)

    // STAGE 6: TARGET CODE GENERATION
    appendLine('\n>>> [PHASE 6/6] Running Target Code Generation (Virtual CPU Assembly)...')
    const codegen = new TargetCodeGenerator()
    const { assembly, registers } = codegen.generate(optimizedTAC, symbolTable)
    appendLine(' DONE.')

    appendLine('\n==============================================================================')
    appendLine('               COMPILATION FINISHED SUCCESSFULLY! (0 ERRORS)')
    appendLine('==============================================================================')

    return {
      success: true,
      sourceCode,
      tokens,
      lexLog,
      astRoot,
      asciiTree,
      derivationLog: parser.getDerivationLog(),
      symbolTable,
      diagnostics,
      semanticLog,
      rawTAC,
      quadruples,
      triples,
      postfix,
      optimizedTAC,
      optimizations,
      reductionPercentage: reduction,
      assembly,
      registers,
      consoleOutput,
      evaluatedValues: {},
    }
  }
}
