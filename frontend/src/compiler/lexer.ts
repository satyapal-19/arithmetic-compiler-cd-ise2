import { Token, TokenType } from './types'

export class LexicalAnalyzer {
  private source: string
  private cursor = 0
  private currentLine = 1
  private currentColumn = 1
  private scanLog: string[] = []

  constructor(source: string) {
    this.source = source
  }

  private peek(): string {
    if (this.cursor < this.source.length) return this.source[this.cursor]
    return '\0'
  }

  private peekNext(): string {
    if (this.cursor + 1 < this.source.length) return this.source[this.cursor + 1]
    return '\0'
  }

  private advance(): string {
    if (this.cursor >= this.source.length) return '\0'
    const c = this.source[this.cursor++]
    if (c === '\n') {
      this.currentLine++
      this.currentColumn = 1
    } else {
      this.currentColumn++
    }
    return c
  }

  private skipWhitespaceAndComments(): void {
    while (this.cursor < this.source.length) {
      const c = this.peek()
      if (/\s/.test(c)) {
        this.advance()
      } else if (c === '/' && this.peekNext() === '/') {
        // Skip comment line
        while (this.peek() !== '\n' && this.peek() !== '\0') {
          this.advance()
        }
      } else {
        break
      }
    }
  }

  public tokenize(): { tokens: Token[]; log: string[] } {
    const tokens: Token[] = []
    this.scanLog = []
    this.cursor = 0
    this.currentLine = 1
    this.currentColumn = 1
    let tokenId = 1

    while (this.cursor < this.source.length) {
      this.skipWhitespaceAndComments()
      if (this.cursor >= this.source.length) break

      const startCol = this.currentColumn
      const startLine = this.currentLine
      const c = this.peek()

      // 1. Identifiers and Keywords
      if (/[a-zA-Z_]/.test(c)) {
        let lexeme = ''
        while (/[a-zA-Z0-9_]/.test(this.peek())) {
          lexeme += this.advance()
        }

        let type = TokenType.IDENTIFIER
        if (lexeme === 'int') {
          type = TokenType.KEYWORD_INT
          this.scanLog.push(`Identified Keyword: 'int' at line ${startLine}`)
        } else if (lexeme === 'float') {
          type = TokenType.KEYWORD_FLOAT
          this.scanLog.push(`Identified Keyword: 'float' at line ${startLine}`)
        } else {
          this.scanLog.push(`Identified Identifier: '${lexeme}' at line ${startLine}`)
        }

        tokens.push({
          id: tokenId++,
          type,
          typeName: type,
          lexeme,
          pattern: type === TokenType.KEYWORD_INT ? 'int' : type === TokenType.KEYWORD_FLOAT ? 'float' : '[a-zA-Z_][a-zA-Z0-9_]*',
          line: startLine,
          column: startCol,
        })
      }
      // 2. Numbers (Integer & Float)
      else if (/[0-9]/.test(c)) {
        let lexeme = ''
        let isFloat = false
        while (/[0-9]/.test(this.peek())) {
          lexeme += this.advance()
        }
        if (this.peek() === '.' && /[0-9]/.test(this.peekNext())) {
          isFloat = true
          lexeme += this.advance() // consume '.'
          while (/[0-9]/.test(this.peek())) {
            lexeme += this.advance()
          }
        }
        const type = isFloat ? TokenType.FLOAT_LITERAL : TokenType.INT_LITERAL
        this.scanLog.push(`Identified ${isFloat ? 'Float' : 'Integer'} Literal: '${lexeme}'`)
        tokens.push({
          id: tokenId++,
          type,
          typeName: type,
          lexeme,
          pattern: isFloat ? '[0-9]+\\.[0-9]+' : '[0-9]+',
          line: startLine,
          column: startCol,
        })
      }
      // 3. Operators and Delimiters
      else {
        const op = this.advance()
        let type: TokenType
        const lexeme = op
        let pattern = '\\' + op

        switch (op) {
          case '+':
            type = TokenType.OP_PLUS
            pattern = '\\+'
            this.scanLog.push("Found operator '+' (Addition)")
            break
          case '-':
            type = TokenType.OP_MINUS
            pattern = '\\-'
            this.scanLog.push("Found operator '-' (Subtraction)")
            break
          case '*':
            type = TokenType.OP_MUL
            pattern = '\\*'
            this.scanLog.push("Found operator '*' (Multiplication)")
            break
          case '/':
            type = TokenType.OP_DIV
            pattern = '/'
            this.scanLog.push("Found operator '/' (Division)")
            break
          case '%':
            type = TokenType.OP_MOD
            pattern = '%'
            this.scanLog.push("Found operator '%' (Modulo)")
            break
          case '^':
            type = TokenType.OP_POW
            pattern = '\\^'
            this.scanLog.push("Found operator '^' (Exponentiation)")
            break
          case '=':
            type = TokenType.OP_ASSIGN
            pattern = '='
            this.scanLog.push("Found operator '=' (Assignment)")
            break
          case '(':
            type = TokenType.LPAREN
            pattern = '\\('
            this.scanLog.push("Found delimiter '(' (Left Paren)")
            break
          case ')':
            type = TokenType.RPAREN
            pattern = '\\)'
            this.scanLog.push("Found delimiter ')' (Right Paren)")
            break
          case ';':
            type = TokenType.SEMICOLON
            pattern = ';'
            this.scanLog.push("Found delimiter ';' (Semicolon)")
            break
          case ',':
            type = TokenType.COMMA
            pattern = ','
            this.scanLog.push("Found delimiter ',' (Comma)")
            break
          default:
            type = TokenType.UNKNOWN
            pattern = '.'
            this.scanLog.push(`ERROR: Unknown character '${lexeme}' at line ${startLine}`)
            break
        }

        tokens.push({
          id: tokenId++,
          type,
          typeName: type,
          lexeme,
          pattern,
          line: startLine,
          column: startCol,
        })
      }
    }

    tokens.push({
      id: tokenId++,
      type: TokenType.END_OF_FILE,
      typeName: 'END_OF_FILE',
      lexeme: '$',
      pattern: '\\$',
      line: this.currentLine,
      column: this.currentColumn,
    })

    return { tokens, log: this.scanLog }
  }
}
