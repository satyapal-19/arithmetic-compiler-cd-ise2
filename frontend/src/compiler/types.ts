/**
 * Compiler Design Types & Data Structures (ISE 2)
 */

export enum TokenType {
  KEYWORD_INT = 'KEYWORD(int)',
  KEYWORD_FLOAT = 'KEYWORD(float)',
  IDENTIFIER = 'IDENTIFIER',
  INT_LITERAL = 'INT_LITERAL',
  FLOAT_LITERAL = 'FLOAT_LITERAL',
  OP_PLUS = 'OP_PLUS (+)',
  OP_MINUS = 'OP_MINUS (-)',
  OP_MUL = 'OP_MUL (*)',
  OP_DIV = 'OP_DIV (/)',
  OP_MOD = 'OP_MOD (%)',
  OP_POW = 'OP_POW (^)',
  OP_ASSIGN = 'OP_ASSIGN (=)',
  LPAREN = 'LPAREN (\'(\')',
  RPAREN = 'RPAREN (\')\')',
  SEMICOLON = 'SEMICOLON (\';\')',
  COMMA = 'COMMA (\',\')',
  END_OF_FILE = 'END_OF_FILE',
  UNKNOWN = 'UNKNOWN'
}

export interface Token {
  id: number;
  type: TokenType;
  typeName: string;
  lexeme: string;
  line: number;
  column: number;
}

export interface SymbolEntry {
  name: string;
  dataType: string;
  value: number;
  isInitialized: boolean;
  memoryOffset: number; // in bytes (0, 4, 8...)
  lineDeclared: number;
}

export enum ASTNodeType {
  PROGRAM = 'PROGRAM',
  ASSIGNMENT_STMT = 'ASSIGNMENT_STMT',
  EXPR_STMT = 'EXPR_STMT',
  BINARY_OP = 'BINARY_OP',
  UNARY_OP = 'UNARY_OP',
  NUM_LITERAL = 'NUM_LITERAL',
  VARIABLE = 'VARIABLE'
}

export interface ASTNode {
  id: string;
  type: ASTNodeType;
  op?: string;
  name?: string;
  numValue?: number;
  rawValue?: string;
  inferredType?: string;
  left?: ASTNode;
  right?: ASTNode;
  children?: ASTNode[];
}

export interface SemanticDiagnostic {
  level: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

export interface TACInstruction {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
  comment: string;
}

export interface Quadruple {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
  result: string;
}

export interface Triple {
  index: number;
  op: string;
  arg1: string;
  arg2: string;
}

export interface OptimizationRecord {
  id: string;
  passName: string;
  beforeCode: string;
  afterCode: string;
  reason: string;
}

export interface AssemblyInstruction {
  line: number;
  instruction: string;
  comment: string;
}

export interface RegisterState {
  reg: string;
  value: string;
}

export interface CompilerResult {
  success: boolean;
  sourceCode: string;
  tokens: Token[];
  lexLog: string[];
  astRoot: ASTNode | null;
  asciiTree: string;
  derivationLog: string[];
  symbolTable: SymbolEntry[];
  diagnostics: SemanticDiagnostic[];
  semanticLog: string[];
  rawTAC: TACInstruction[];
  quadruples: Quadruple[];
  triples: Triple[];
  postfix: string[];
  optimizedTAC: TACInstruction[];
  optimizations: OptimizationRecord[];
  reductionPercentage: number;
  assembly: AssemblyInstruction[];
  registers: RegisterState[];
  consoleOutput: string;
  evaluatedValues: Record<string, number>;
  errorMessage?: string;
}
