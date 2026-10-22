/**
 * Compiler Design Types & Data Structures
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
  pattern: string; // Token specification & regex pattern
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
  scope: string; // Storage organization & scope
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

// Phase 3: Syntax Directed Translation (SDT / SDD)
export interface SDDRule {
  id: number;
  production: string;
  semanticAction: string;
  synthesizedAttribute: string;
}

// Phase 4: Intermediate Code Generation
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

export interface SSAInstruction {
  index: number;
  code: string;
  original: string;
}

// Phase 5: Code Optimization
export interface BasicBlock {
  id: number;
  leaderIndex: number;
  instructions: TACInstruction[];
}

export interface OptimizationRecord {
  id: string;
  passName: string;
  beforeCode: string;
  afterCode: string;
  reason: string;
}

// Phase 6: Code Generation & Runtime Storage
export interface AssemblyInstruction {
  line: number;
  instruction: string;
  comment: string;
}

export interface RegisterState {
  reg: string;
  value: string;
}

export interface AddressDescriptor {
  variable: string;
  locations: string; // e.g. "Register R0, Memory 0x04"
}

export interface GetRegTrace {
  step: number;
  instruction: string;
  allocatedRegister: string;
  decisionReason: string;
}

export interface PeepholeRecord {
  before: string;
  after: string;
  rule: string;
}

export interface CompilerResult {
  success: boolean;
  sourceCode: string;
  
  // Phase 1: Lexical Analysis
  tokens: Token[];
  lexLog: string[];
  
  // Phase 2: Syntax Analysis
  astRoot: ASTNode | null;
  asciiTree: string;
  derivationLog: string[];
  
  // Phase 3: Semantic Analysis & Runtime
  sddRules: SDDRule[];
  symbolTable: SymbolEntry[];
  diagnostics: SemanticDiagnostic[];
  semanticLog: string[];
  
  // Phase 4: Intermediate Code Generation
  rawTAC: TACInstruction[];
  quadruples: Quadruple[];
  triples: Triple[];
  ssaForm: SSAInstruction[];
  postfix: string[];
  
  // Phase 5: Code Optimization
  basicBlocks: BasicBlock[];
  optimizedTAC: TACInstruction[];
  optimizations: OptimizationRecord[];
  reductionPercentage: number;
  
  // Phase 6: Target Code Generation
  assembly: AssemblyInstruction[];
  registers: RegisterState[];
  addressDescriptors: AddressDescriptor[];
  getRegTraces: GetRegTrace[];
  peepholePasses: PeepholeRecord[];
  
  consoleOutput: string;
  evaluatedValues: Record<string, number>;
  errorMessage?: string;
}
