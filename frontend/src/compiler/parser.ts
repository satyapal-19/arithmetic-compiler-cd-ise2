import { ASTNode, ASTNodeType, Token, TokenType } from './types'

let nodeIdCounter = 1

export class Parser {
  private tokens: Token[]
  private current = 0
  private derivationLog: string[] = []
  private hasSyntaxError = false
  private errorMessage = ''

  constructor(tokens: Token[]) {
    this.tokens = tokens
    nodeIdCounter = 1
  }

  private peek(): Token {
    if (this.current < this.tokens.length) return this.tokens[this.current]
    return this.tokens[this.tokens.length - 1]
  }

  private previous(): Token {
    if (this.current > 0) return this.tokens[this.current - 1]
    return this.tokens[0]
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.END_OF_FILE
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private consume(type: TokenType, msg: string): Token {
    if (this.check(type)) return this.advance()
    this.hasSyntaxError = true
    this.errorMessage = `Syntax Error at line ${this.peek().line}, col ${this.peek().column}: ${msg} (Found '${this.peek().lexeme}')`
    return this.peek()
  }

  public getError(): string {
    return this.errorMessage
  }

  public hasError(): boolean {
    return this.hasSyntaxError
  }

  public getDerivationLog(): string[] {
    return this.derivationLog
  }

  public parseProgram(): ASTNode {
    this.derivationLog = []
    this.derivationLog.push('Rule 1: Program -> Statement*')

    const prog: ASTNode = {
      id: `node_${nodeIdCounter++}`,
      type: ASTNodeType.PROGRAM,
      children: [],
    }

    while (!this.isAtEnd() && !this.hasSyntaxError) {
      const stmt = this.parseStatement()
      if (stmt) {
        prog.children!.push(stmt)
      }
      if (this.hasSyntaxError) break
    }

    return prog
  }

  private parseStatement(): ASTNode | null {
    let declaredType = ''
    if (this.match(TokenType.KEYWORD_INT)) {
      declaredType = 'int'
      this.derivationLog.push("Rule 2a: Statement -> 'int' Identifier '=' Expression ';'")
    } else if (this.match(TokenType.KEYWORD_FLOAT)) {
      declaredType = 'float'
      this.derivationLog.push("Rule 2b: Statement -> 'float' Identifier '=' Expression ';'")
    }

    // Check for Assignment: ID = Expr ;
    if (this.check(TokenType.IDENTIFIER)) {
      if (this.current + 1 < this.tokens.length && this.tokens[this.current + 1].type === TokenType.OP_ASSIGN) {
        const idToken = this.advance() // consume ID
        this.advance() // consume '='
        this.derivationLog.push(`Rule 2c: Assignment -> Identifier ('${idToken.lexeme}') '=' Expression ';'`)

        const expr = this.parseExpression()
        this.consume(TokenType.SEMICOLON, "Expected ';' after assignment statement.")

        return {
          id: `node_${nodeIdCounter++}`,
          type: ASTNodeType.ASSIGNMENT_STMT,
          op: '=',
          name: idToken.lexeme,
          inferredType: declaredType || 'pending',
          right: expr,
        }
      }
    }

    // Otherwise, Expression statement: Expr ;
    this.derivationLog.push("Rule 2d: Statement -> Expression ';'")
    const expr = this.parseExpression()
    if (this.check(TokenType.SEMICOLON)) {
      this.advance()
    }
    return {
      id: `node_${nodeIdCounter++}`,
      type: ASTNodeType.EXPR_STMT,
      left: expr,
    }
  }

  // Expression -> Term ( ('+' | '-') Term )*
  private parseExpression(): ASTNode {
    this.derivationLog.push("Rule 3: Expression -> Term ( ('+' | '-') Term )*")
    let expr = this.parseTerm()

    while (this.match(TokenType.OP_PLUS, TokenType.OP_MINUS)) {
      const op = this.previous().lexeme
      this.derivationLog.push(`Applied Binary Additive Operator: '${op}'`)
      const right = this.parseTerm()

      expr = {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.BINARY_OP,
        op,
        left: expr,
        right,
      }
    }
    return expr
  }

  // Term -> Power ( ('*' | '/' | '%') Power )*
  private parseTerm(): ASTNode {
    this.derivationLog.push("Rule 4: Term -> Power ( ('*' | '/' | '%') Power )*")
    let node = this.parsePower()

    while (this.match(TokenType.OP_MUL, TokenType.OP_DIV, TokenType.OP_MOD)) {
      const op = this.previous().lexeme
      this.derivationLog.push(`Applied Binary Multiplicative Operator: '${op}'`)
      const right = this.parsePower()

      node = {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.BINARY_OP,
        op,
        left: node,
        right,
      }
    }
    return node
  }

  // Power -> Factor ( '^' Power )?  (Right-associative)
  private parsePower(): ASTNode {
    this.derivationLog.push("Rule 5: Power -> Factor ('^' Power)?")
    const node = this.parseFactor()

    if (this.match(TokenType.OP_POW)) {
      const op = this.previous().lexeme
      this.derivationLog.push("Applied Exponentiation Operator: '^'")
      const right = this.parsePower() // recursive for right-associativity

      return {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.BINARY_OP,
        op,
        left: node,
        right,
      }
    }
    return node
  }

  // Factor -> ('+' | '-') Factor | Primary
  private parseFactor(): ASTNode {
    if (this.match(TokenType.OP_MINUS, TokenType.OP_PLUS)) {
      const op = this.previous().lexeme
      this.derivationLog.push(`Rule 6: Factor -> Unary ('${op}') Factor`)
      const operand = this.parseFactor()

      return {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.UNARY_OP,
        op: op === '-' ? 'NEG' : 'POS',
        right: operand,
      }
    }
    return this.parsePrimary()
  }

  // Primary -> IDENTIFIER | INT_LITERAL | FLOAT_LITERAL | '(' Expression ')'
  private parsePrimary(): ASTNode {
    if (this.match(TokenType.INT_LITERAL)) {
      const lex = this.previous().lexeme
      this.derivationLog.push(`Rule 7a: Primary -> INT_LITERAL (${lex})`)
      return {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.NUM_LITERAL,
        rawValue: lex,
        numValue: parseFloat(lex),
        inferredType: 'int',
      }
    }

    if (this.match(TokenType.FLOAT_LITERAL)) {
      const lex = this.previous().lexeme
      this.derivationLog.push(`Rule 7b: Primary -> FLOAT_LITERAL (${lex})`)
      return {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.NUM_LITERAL,
        rawValue: lex,
        numValue: parseFloat(lex),
        inferredType: 'float',
      }
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const lex = this.previous().lexeme
      this.derivationLog.push(`Rule 7c: Primary -> IDENTIFIER (${lex})`)
      return {
        id: `node_${nodeIdCounter++}`,
        type: ASTNodeType.VARIABLE,
        name: lex,
      }
    }

    if (this.match(TokenType.LPAREN)) {
      this.derivationLog.push("Rule 7d: Primary -> '(' Expression ')'")
      const expr = this.parseExpression()
      this.consume(TokenType.RPAREN, "Expected ')' after parenthesized expression.")
      return expr
    }

    this.hasSyntaxError = true
    this.errorMessage = `Syntax Error at line ${this.peek().line}, col ${this.peek().column}: Unexpected token '${this.peek().lexeme}'`
    return {
      id: `err_${nodeIdCounter++}`,
      type: ASTNodeType.VARIABLE,
      name: 'ERROR',
    }
  }

  public static generateASCIITree(node: ASTNode | null, prefix = '', isTail = true): string {
    if (!node) return ''

    let result = prefix + (isTail ? '+-- ' : '|-- ')

    switch (node.type) {
      case ASTNodeType.PROGRAM:
        result += '[Program Root]\n'
        if (node.children) {
          for (let i = 0; i < node.children.length; i++) {
            result += Parser.generateASCIITree(
              node.children[i],
              prefix + (isTail ? '    ' : '|   '),
              i === node.children.length - 1
            )
          }
        }
        return result

      case ASTNodeType.ASSIGNMENT_STMT:
        result += `[Assignment] Target: '${node.name}'\n`
        if (node.right) {
          result += Parser.generateASCIITree(node.right, prefix + (isTail ? '    ' : '|   '), true)
        }
        return result

      case ASTNodeType.EXPR_STMT:
        result += '[Expression Statement]\n'
        if (node.left) {
          result += Parser.generateASCIITree(node.left, prefix + (isTail ? '    ' : '|   '), true)
        }
        return result

      case ASTNodeType.BINARY_OP:
        result += `[Binary Operator] '${node.op}'\n`
        break

      case ASTNodeType.UNARY_OP:
        result += `[Unary Operator] '${node.op}'\n`
        break

      case ASTNodeType.NUM_LITERAL:
        result += `[Literal] Value: ${node.rawValue}\n`
        return result

      case ASTNodeType.VARIABLE:
        result += `[Variable] Name: '${node.name}'\n`
        return result
    }

    const kids: ASTNode[] = []
    if (node.left) kids.push(node.left)
    if (node.right) kids.push(node.right)

    for (let i = 0; i < kids.length; i++) {
      result += Parser.generateASCIITree(kids[i], prefix + (isTail ? '    ' : '|   '), i === kids.length - 1)
    }

    return result
  }
}
