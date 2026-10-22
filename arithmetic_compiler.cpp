/**
 * ============================================================================
 *                      ARITHMETIC COMPILER DESIGN - ISE 2
 * ============================================================================
 * Course       : Compiler Design (CD)
 * Evaluation   : ISE 2 (In-Semester Evaluation 2)
 * Language     : C++ (C++11 / C++14 compatible)
 * Description  : A complete, fully-featured, educational Arithmetic Compiler
 *                implementing ALL 6 classic stages of compiler design:
 * 
 *    Stage 1: Lexical Analysis (Scanner / Tokenizer)
 *    Stage 2: Syntax Analysis (Recursive Descent Parser & AST Construction)
 *    Stage 3: Semantic Analysis (Type Checking, Scope & Division-by-Zero Check)
 *    Stage 4: Intermediate Code Generation (Three-Address Code, Quadruples, Triples, Postfix)
 *    Stage 5: Code Optimization (Constant Folding, Algebraic Simplification, CSE, Dead Code)
 *    Stage 6: Target Code Generation (Virtual CPU Assembly with Register Allocation)
 * 
 * Supporting Components:
 *    - Symbol Table Management (Identifiers, Types, Memory Offsets, Values)
 *    - Error Detection & Diagnostics (Lexical, Syntax, Semantic errors)
 *    - Visual Tree & Table Generators for Console Output
 * ============================================================================
 */

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <unordered_map>
#include <sstream>
#include <cctype>
#include <iomanip>
#include <cmath>
#include <memory>
#include <algorithm>

using namespace std;

// ============================================================================
//                       SECTION 1: TOKEN DEFINITIONS & DATA TYPES
// ============================================================================

enum class TokenType {
    KEYWORD_INT,       // "int"
    KEYWORD_FLOAT,     // "float"
    IDENTIFIER,        // e.g., "result", "a", "x1"
    INT_LITERAL,       // e.g., "10", "42"
    FLOAT_LITERAL,     // e.g., "3.14", "0.5"
    OP_PLUS,           // '+'
    OP_MINUS,          // '-'
    OP_MUL,            // '*'
    OP_DIV,            // '/'
    OP_MOD,            // '%'
    OP_POW,            // '^'
    OP_ASSIGN,         // '='
    LPAREN,            // '('
    RPAREN,            // ')'
    SEMICOLON,         // ';'
    COMMA,             // ','
    END_OF_FILE,       // EOF indicator
    UNKNOWN            // Invalid / unrecognized character
};

struct Token {
    TokenType type;
    string lexeme;
    int line;
    int column;

    string getTypeName() const {
        switch (type) {
            case TokenType::KEYWORD_INT:   return "KEYWORD(int)";
            case TokenType::KEYWORD_FLOAT: return "KEYWORD(float)";
            case TokenType::IDENTIFIER:    return "IDENTIFIER";
            case TokenType::INT_LITERAL:   return "INT_LITERAL";
            case TokenType::FLOAT_LITERAL: return "FLOAT_LITERAL";
            case TokenType::OP_PLUS:       return "OP_PLUS (+)";
            case TokenType::OP_MINUS:      return "OP_MINUS (-)";
            case TokenType::OP_MUL:        return "OP_MUL (*)";
            case TokenType::OP_DIV:        return "OP_DIV (/)";
            case TokenType::OP_MOD:        return "OP_MOD (%)";
            case TokenType::OP_POW:        return "OP_POW (^)";
            case TokenType::OP_ASSIGN:     return "OP_ASSIGN (=)";
            case TokenType::LPAREN:        return "LPAREN ('(')";
            case TokenType::RPAREN:        return "RPAREN (')')";
            case TokenType::SEMICOLON:     return "SEMICOLON (';')";
            case TokenType::COMMA:         return "COMMA (',')";
            case TokenType::END_OF_FILE:   return "END_OF_FILE";
            default:                       return "UNKNOWN";
        }
    }
};

// ============================================================================
//                  SECTION 2: SYMBOL TABLE MANAGEMENT
// ============================================================================

struct Symbol {
    string name;
    string dataType;      // "int", "float", "unknown"
    double value;
    bool isInitialized;
    int memoryOffset;     // Memory offset in bytes (e.g., 0, 4, 8)
    int lineDeclared;
};

class SymbolTable {
private:
    map<string, Symbol> table;
    int currentMemoryOffset = 0;

public:
    void clear() {
        table.clear();
        currentMemoryOffset = 0;
    }

    bool insert(const string& name, const string& type, int line, double initialVal = 0.0, bool init = false) {
        if (table.find(name) != table.end()) {
            return false; // Already declared
        }
        Symbol s;
        s.name = name;
        s.dataType = type;
        s.value = initialVal;
        s.isInitialized = init;
        s.memoryOffset = currentMemoryOffset;
        s.lineDeclared = line;

        // Allocation: 4 bytes for int/float
        currentMemoryOffset += 4;
        table[name] = s;
        return true;
    }

    bool updateValue(const string& name, double val) {
        if (table.find(name) != table.end()) {
            table[name].value = val;
            table[name].isInitialized = true;
            return true;
        }
        return false;
    }

    Symbol* lookup(const string& name) {
        if (table.find(name) != table.end()) {
            return &table[name];
        }
        return nullptr;
    }

    bool exists(const string& name) const {
        return table.find(name) != table.end();
    }

    const map<string, Symbol>& getAllSymbols() const {
        return table;
    }

    void printTable() const {
        cout << "\n+----------------------------------------------------------------------------+\n";
        cout << "|                             SYMBOL TABLE                                   |\n";
        cout << "+---------------+-----------+--------------+---------------+-----------------+\n";
        cout << "| Identifier    | Type      | Memory Offset| Value         | Initialized?    |\n";
        cout << "+---------------+-----------+--------------+---------------+-----------------+\n";

        if (table.empty()) {
            cout << "|                         (Symbol Table is Empty)                            |\n";
        } else {
            for (const auto& pair : table) {
                const Symbol& s = pair.second;
                cout << "| " << left << setw(14) << s.name
                     << "| " << setw(10) << s.dataType
                     << "| " << setw(12) << ("Byte " + to_string(s.memoryOffset))
                     << "| " << setw(14) << (s.isInitialized ? to_string(s.value) : "N/A (undef)")
                     << "| " << setw(16) << (s.isInitialized ? "YES" : "NO")
                     << "|\n";
            }
        }
        cout << "+---------------+-----------+--------------+---------------+-----------------+\n";
    }
};

// ============================================================================
//            STAGE 1: LEXICAL ANALYSIS (SCANNER / TOKENIZER)
// ============================================================================

class LexicalAnalyzer {
private:
    string source;
    size_t cursor = 0;
    int currentLine = 1;
    int currentColumn = 1;
    vector<string> scanLog;

    char peek() const {
        if (cursor < source.length()) return source[cursor];
        return '\0';
    }

    char peekNext() const {
        if (cursor + 1 < source.length()) return source[cursor + 1];
        return '\0';
    }

    char advance() {
        if (cursor >= source.length()) return '\0';
        char c = source[cursor++];
        if (c == '\n') {
            currentLine++;
            currentColumn = 1;
        } else {
            currentColumn++;
        }
        return c;
    }

    void skipWhitespaceAndComments() {
        while (cursor < source.length()) {
            char c = peek();
            if (isspace(c)) {
                advance();
            } else if (c == '/' && peekNext() == '/') {
                // Single line comment: skip until newline
                while (peek() != '\n' && peek() != '\0') {
                    advance();
                }
            } else {
                break;
            }
        }
    }

public:
    explicit LexicalAnalyzer(string src) : source(std::move(src)) {}

    vector<Token> tokenize() {
        vector<Token> tokens;
        scanLog.clear();
        cursor = 0;
        currentLine = 1;
        currentColumn = 1;

        while (cursor < source.length()) {
            skipWhitespaceAndComments();
            if (cursor >= source.length()) break;

            int startCol = currentColumn;
            int startLine = currentLine;
            char c = peek();

            // 1. Identifiers and Keywords
            if (isalpha(c) || c == '_') {
                string lexeme;
                while (isalnum(peek()) || peek() == '_') {
                    lexeme += advance();
                }

                TokenType type;
                if (lexeme == "int") {
                    type = TokenType::KEYWORD_INT;
                    scanLog.push_back("Identified Keyword: 'int' at line " + to_string(startLine));
                } else if (lexeme == "float") {
                    type = TokenType::KEYWORD_FLOAT;
                    scanLog.push_back("Identified Keyword: 'float' at line " + to_string(startLine));
                } else {
                    type = TokenType::IDENTIFIER;
                    scanLog.push_back("Identified Identifier: '" + lexeme + "' at line " + to_string(startLine));
                }
                tokens.push_back({type, lexeme, startLine, startCol});
            }
            // 2. Numbers (Integers & Floating Points)
            else if (isdigit(c)) {
                string lexeme;
                bool isFloat = false;
                while (isdigit(peek())) {
                    lexeme += advance();
                }
                if (peek() == '.' && isdigit(peekNext())) {
                    isFloat = true;
                    lexeme += advance(); // consume '.'
                    while (isdigit(peek())) {
                        lexeme += advance();
                    }
                }
                TokenType type = isFloat ? TokenType::FLOAT_LITERAL : TokenType::INT_LITERAL;
                scanLog.push_back("Identified " + string(isFloat ? "Float" : "Integer") +
                                  " Literal: '" + lexeme + "'");
                tokens.push_back({type, lexeme, startLine, startCol});
            }
            // 3. Operators and Delimiters
            else {
                char op = advance();
                TokenType type;
                string lexeme(1, op);

                switch (op) {
                    case '+': type = TokenType::OP_PLUS;   scanLog.push_back("Found operator '+' (Addition)"); break;
                    case '-': type = TokenType::OP_MINUS;  scanLog.push_back("Found operator '-' (Subtraction)"); break;
                    case '*': type = TokenType::OP_MUL;    scanLog.push_back("Found operator '*' (Multiplication)"); break;
                    case '/': type = TokenType::OP_DIV;    scanLog.push_back("Found operator '/' (Division)"); break;
                    case '%': type = TokenType::OP_MOD;    scanLog.push_back("Found operator '%' (Modulo)"); break;
                    case '^': type = TokenType::OP_POW;    scanLog.push_back("Found operator '^' (Exponentiation)"); break;
                    case '=': type = TokenType::OP_ASSIGN; scanLog.push_back("Found operator '=' (Assignment)"); break;
                    case '(': type = TokenType::LPAREN;    scanLog.push_back("Found delimiter '(' (Left Paren)"); break;
                    case ')': type = TokenType::RPAREN;    scanLog.push_back("Found delimiter ')' (Right Paren)"); break;
                    case ';': type = TokenType::SEMICOLON; scanLog.push_back("Found delimiter ';' (Semicolon)"); break;
                    case ',': type = TokenType::COMMA;     scanLog.push_back("Found delimiter ',' (Comma)"); break;
                    default:
                        type = TokenType::UNKNOWN;
                        scanLog.push_back("ERROR: Unknown character '" + lexeme + "' at line " + to_string(startLine));
                        break;
                }
                tokens.push_back({type, lexeme, startLine, startCol});
            }
        }

        tokens.push_back({TokenType::END_OF_FILE, "$", currentLine, currentColumn});
        return tokens;
    }

    const vector<string>& getScanLog() const { return scanLog; }

    static void printTokenTable(const vector<Token>& tokens) {
        cout << "\n+----------------------------------------------------------------------------+\n";
        cout << "|                 STAGE 1: LEXICAL ANALYSIS - TOKEN STREAM                   |\n";
        cout << "+-----+-----------------------+--------------------+------------+------------+\n";
        cout << "| Idx | Token Type            | Lexeme             | Line       | Column     |\n";
        cout << "+-----+-----------------------+--------------------+------------+------------+\n";
        for (size_t i = 0; i < tokens.size(); i++) {
            cout << "| " << left << setw(4) << (i + 1)
                 << "| " << setw(22) << tokens[i].getTypeName()
                 << "| " << setw(19) << ("'" + tokens[i].lexeme + "'")
                 << "| " << setw(11) << tokens[i].line
                 << "| " << setw(11) << tokens[i].column
                 << "|\n";
        }
        cout << "+-----+-----------------------+--------------------+------------+------------+\n";
    }
};

// ============================================================================
//            STAGE 2: SYNTAX ANALYSIS (PARSER & AST GENERATION)
// ============================================================================

enum class ASTNodeType {
    PROGRAM,
    ASSIGNMENT_STMT,
    EXPR_STMT,
    BINARY_OP,
    UNARY_OP,
    NUM_LITERAL,
    VARIABLE
};

struct ASTNode {
    ASTNodeType type;
    string op;             // For operators: "+", "-", "*", "/", "%", "^", "="
    string name;           // For identifiers
    double numValue = 0.0; // For numeric literals
    string rawValue;       // String representation of literal
    string inferredType;   // Annotated during Semantic Analysis ("int", "float", etc.)
    
    ASTNode* left = nullptr;
    ASTNode* right = nullptr;
    vector<ASTNode*> children; // For PROGRAM or statement sequences

    ASTNode(ASTNodeType t) : type(t) {}
    ~ASTNode() {
        delete left;
        delete right;
        for (auto child : children) {
            delete child;
        }
    }
};

/**
 * Context-Free Grammar (CFG) for Arithmetic Expressions:
 * 
 *   Program       -> Statement*
 *   Statement     -> [Type] Identifier '=' Expression ';' | Expression ';'
 *   Type          -> 'int' | 'float'
 *   Expression    -> Term ( ('+' | '-') Term )*
 *   Term          -> Power ( ('*' | '/' | '%') Power )*
 *   Power         -> Factor ( '^' Power )?              (Right-associative)
 *   Factor        -> ('+' | '-') Factor | Primary       (Unary operators)
 *   Primary       -> IDENTIFIER | NUMBER | '(' Expression ')'
 */
class Parser {
private:
    vector<Token> tokens;
    size_t current = 0;
    vector<string> derivationLog;
    bool hasSyntaxError = false;
    string errorMessage;

    Token peek() const {
        if (current < tokens.size()) return tokens[current];
        return tokens.back();
    }

    Token previous() const {
        if (current > 0) return tokens[current - 1];
        return tokens[0];
    }

    bool isAtEnd() const {
        return peek().type == TokenType::END_OF_FILE;
    }

    Token advance() {
        if (!isAtEnd()) current++;
        return previous();
    }

    bool check(TokenType type) const {
        if (isAtEnd()) return false;
        return peek().type == type;
    }

    bool match(TokenType type) {
        if (check(type)) {
            advance();
            return true;
        }
        return false;
    }

    Token consume(TokenType type, const string& msg) {
        if (check(type)) return advance();
        hasSyntaxError = true;
        errorMessage = "Syntax Error at line " + to_string(peek().line) +
                       ", col " + to_string(peek().column) + ": " + msg +
                       " (Found '" + peek().lexeme + "')";
        return peek();
    }

public:
    explicit Parser(vector<Token> tkns) : tokens(std::move(tkns)) {}

    bool hasError() const { return hasSyntaxError; }
    string getError() const { return errorMessage; }
    const vector<string>& getDerivationLog() const { return derivationLog; }

    ASTNode* parseProgram() {
        derivationLog.clear();
        derivationLog.push_back("Rule 1: Program -> Statement*");

        ASTNode* prog = new ASTNode(ASTNodeType::PROGRAM);
        while (!isAtEnd() && !hasSyntaxError) {
            ASTNode* stmt = parseStatement();
            if (stmt != nullptr) {
                prog->children.push_back(stmt);
            }
            if (hasSyntaxError) break;
        }
        return prog;
    }

private:
    ASTNode* parseStatement() {
        // Optional type declaration: int x = ... or float y = ...
        string declaredType = "";
        if (match(TokenType::KEYWORD_INT)) {
            declaredType = "int";
            derivationLog.push_back("Rule 2a: Statement -> 'int' Identifier '=' Expression ';'");
        } else if (match(TokenType::KEYWORD_FLOAT)) {
            declaredType = "float";
            derivationLog.push_back("Rule 2b: Statement -> 'float' Identifier '=' Expression ';'");
        }

        // Check for Assignment: ID = Expr ;
        if (check(TokenType::IDENTIFIER)) {
            // Lookahead 1 token to see if '=' follows
            if (current + 1 < tokens.size() && tokens[current + 1].type == TokenType::OP_ASSIGN) {
                Token idToken = advance(); // consume identifier
                advance();                 // consume '='
                derivationLog.push_back("Rule 2c: Assignment -> Identifier ('" + idToken.lexeme + "') '=' Expression ';'");

                ASTNode* expr = parseExpression();
                consume(TokenType::SEMICOLON, "Expected ';' after assignment statement.");

                ASTNode* assignNode = new ASTNode(ASTNodeType::ASSIGNMENT_STMT);
                assignNode->op = "=";
                assignNode->name = idToken.lexeme;
                assignNode->inferredType = declaredType.empty() ? "pending" : declaredType;
                assignNode->right = expr;
                return assignNode;
            }
        }

        // Otherwise, it's an Expression statement: Expr ;
        derivationLog.push_back("Rule 2d: Statement -> Expression ';'");
        ASTNode* expr = parseExpression();
        if (check(TokenType::SEMICOLON)) {
            advance();
        }
        ASTNode* stmt = new ASTNode(ASTNodeType::EXPR_STMT);
        stmt->left = expr;
        return stmt;
    }

    // Expression -> Term ( ('+' | '-') Term )*
    ASTNode* parseExpression() {
        derivationLog.push_back("Rule 3: Expression -> Term ( ('+' | '-') Term )*");
        ASTNode* expr = parseTerm();

        while (match(TokenType::OP_PLUS) || match(TokenType::OP_MINUS)) {
            string op = previous().lexeme;
            derivationLog.push_back("Applied Binary Additive Operator: '" + op + "'");
            ASTNode* right = parseTerm();

            ASTNode* binaryNode = new ASTNode(ASTNodeType::BINARY_OP);
            binaryNode->op = op;
            binaryNode->left = expr;
            binaryNode->right = right;
            expr = binaryNode;
        }
        return expr;
    }

    // Term -> Power ( ('*' | '/' | '%') Power )*
    ASTNode* parseTerm() {
        derivationLog.push_back("Rule 4: Term -> Power ( ('*' | '/' | '%') Power )*");
        ASTNode* node = parsePower();

        while (match(TokenType::OP_MUL) || match(TokenType::OP_DIV) || match(TokenType::OP_MOD)) {
            string op = previous().lexeme;
            derivationLog.push_back("Applied Binary Multiplicative Operator: '" + op + "'");
            ASTNode* right = parsePower();

            ASTNode* binaryNode = new ASTNode(ASTNodeType::BINARY_OP);
            binaryNode->op = op;
            binaryNode->left = node;
            binaryNode->right = right;
            node = binaryNode;
        }
        return node;
    }

    // Power -> Factor ( '^' Power )?  (Right-associative exponentiation)
    ASTNode* parsePower() {
        derivationLog.push_back("Rule 5: Power -> Factor ('^' Power)?");
        ASTNode* node = parseFactor();

        if (match(TokenType::OP_POW)) {
            string op = previous().lexeme;
            derivationLog.push_back("Applied Exponentiation Operator: '^'");
            ASTNode* right = parsePower(); // Recursive call enforces right-associativity

            ASTNode* powNode = new ASTNode(ASTNodeType::BINARY_OP);
            powNode->op = op;
            powNode->left = node;
            powNode->right = right;
            return powNode;
        }
        return node;
    }

    // Factor -> ('+' | '-') Factor | Primary (Unary + or -)
    ASTNode* parseFactor() {
        if (match(TokenType::OP_MINUS) || match(TokenType::OP_PLUS)) {
            string op = previous().lexeme;
            derivationLog.push_back("Rule 6: Factor -> Unary ('" + op + "') Factor");
            ASTNode* operand = parseFactor();

            ASTNode* unaryNode = new ASTNode(ASTNodeType::UNARY_OP);
            unaryNode->op = (op == "-" ? "NEG" : "POS");
            unaryNode->right = operand;
            return unaryNode;
        }
        return parsePrimary();
    }

    // Primary -> IDENTIFIER | INT_LITERAL | FLOAT_LITERAL | '(' Expression ')'
    ASTNode* parsePrimary() {
        if (match(TokenType::INT_LITERAL)) {
            derivationLog.push_back("Rule 7a: Primary -> INT_LITERAL (" + previous().lexeme + ")");
            ASTNode* node = new ASTNode(ASTNodeType::NUM_LITERAL);
            node->rawValue = previous().lexeme;
            node->numValue = stod(previous().lexeme);
            node->inferredType = "int";
            return node;
        }

        if (match(TokenType::FLOAT_LITERAL)) {
            derivationLog.push_back("Rule 7b: Primary -> FLOAT_LITERAL (" + previous().lexeme + ")");
            ASTNode* node = new ASTNode(ASTNodeType::NUM_LITERAL);
            node->rawValue = previous().lexeme;
            node->numValue = stod(previous().lexeme);
            node->inferredType = "float";
            return node;
        }

        if (match(TokenType::IDENTIFIER)) {
            derivationLog.push_back("Rule 7c: Primary -> IDENTIFIER (" + previous().lexeme + ")");
            ASTNode* node = new ASTNode(ASTNodeType::VARIABLE);
            node->name = previous().lexeme;
            return node;
        }

        if (match(TokenType::LPAREN)) {
            derivationLog.push_back("Rule 7d: Primary -> '(' Expression ')'");
            ASTNode* expr = parseExpression();
            consume(TokenType::RPAREN, "Expected ')' after parenthesized expression.");
            return expr;
        }

        hasSyntaxError = true;
        errorMessage = "Syntax Error at line " + to_string(peek().line) +
                       ", col " + to_string(peek().column) + ": Unexpected token '" +
                       peek().lexeme + "'";
        return nullptr;
    }

public:
    // Visualizer for Abstract Syntax Tree
    static void printAST(const ASTNode* node, const string& prefix = "", bool isTail = true) {
        if (!node) return;

        cout << prefix;
        cout << (isTail ? "+-- " : "|-- ");

        switch (node->type) {
            case ASTNodeType::PROGRAM:
                cout << "[Program Root]\n";
                for (size_t i = 0; i < node->children.size(); i++) {
                    printAST(node->children[i], prefix + (isTail ? "    " : "|   "), i == node->children.size() - 1);
                }
                return;

            case ASTNodeType::ASSIGNMENT_STMT:
                cout << "[Assignment] Target: '" << node->name << "'\n";
                if (node->right) {
                    printAST(node->right, prefix + (isTail ? "    " : "|   "), true);
                }
                return;

            case ASTNodeType::EXPR_STMT:
                cout << "[Expression Statement]\n";
                if (node->left) {
                    printAST(node->left, prefix + (isTail ? "    " : "|   "), true);
                }
                return;

            case ASTNodeType::BINARY_OP:
                cout << "[Binary Operator] '" << node->op << "'\n";
                break;

            case ASTNodeType::UNARY_OP:
                cout << "[Unary Operator] '" << node->op << "'\n";
                break;

            case ASTNodeType::NUM_LITERAL:
                cout << "[Literal] Value: " << node->rawValue << "\n";
                return;

            case ASTNodeType::VARIABLE:
                cout << "[Variable] Name: '" << node->name << "'\n";
                return;
        }

        // Print children of binary/unary ops
        vector<ASTNode*> kids;
        if (node->left) kids.push_back(node->left);
        if (node->right) kids.push_back(node->right);

        for (size_t i = 0; i < kids.size(); i++) {
            printAST(kids[i], prefix + (isTail ? "    " : "|   "), i == kids.size() - 1);
        }
    }
};

// ============================================================================
//            STAGE 3: SEMANTIC ANALYSIS (TYPE CHECK & SCOPE VALIDATION)
// ============================================================================

struct SemanticWarningOrError {
    string level; // "ERROR" or "WARNING"
    string message;
};

class SemanticAnalyzer {
private:
    SymbolTable& symbolTable;
    vector<SemanticWarningOrError> diagnostics;
    vector<string> analysisLog;

public:
    explicit SemanticAnalyzer(SymbolTable& symTable) : symbolTable(symTable) {}

    const vector<SemanticWarningOrError>& getDiagnostics() const { return diagnostics; }
    const vector<string>& getAnalysisLog() const { return analysisLog; }

    bool analyze(ASTNode* root) {
        diagnostics.clear();
        analysisLog.clear();
        analysisLog.push_back("Starting Semantic Analysis Pass...");

        if (!root) return false;
        analyzeNode(root);

        analysisLog.push_back("Semantic Analysis completed with " +
                              to_string(diagnostics.size()) + " diagnostic(s).");
        return !hasFatalErrors();
    }

    bool hasFatalErrors() const {
        for (const auto& d : diagnostics) {
            if (d.level == "ERROR") return true;
        }
        return false;
    }

private:
    void analyzeNode(ASTNode* node) {
        if (!node) return;

        switch (node->type) {
            case ASTNodeType::PROGRAM: {
                for (auto stmt : node->children) {
                    analyzeNode(stmt);
                }
                break;
            }

            case ASTNodeType::ASSIGNMENT_STMT: {
                analysisLog.push_back("Analyzing Assignment to variable '" + node->name + "'");
                
                // 1. Check if RHS evaluates cleanly
                analyzeNode(node->right);

                string rhsType = node->right ? node->right->inferredType : "int";
                string varType = node->inferredType;

                if (varType == "pending" || varType == "inferred" || varType.empty()) {
                    varType = rhsType.empty() ? "int" : rhsType;
                }

                // 2. Insert or update in Symbol Table
                if (!symbolTable.exists(node->name)) {
                    symbolTable.insert(node->name, varType, 1, 0.0, true);
                    analysisLog.push_back("Added variable '" + node->name + "' of type [" +
                                          varType + "] to Symbol Table.");
                } else {
                    Symbol* s = symbolTable.lookup(node->name);
                    s->isInitialized = true;
                    analysisLog.push_back("Updated variable '" + node->name + "' as initialized.");
                }
                node->inferredType = varType;
                break;
            }

            case ASTNodeType::EXPR_STMT: {
                analyzeNode(node->left);
                break;
            }

            case ASTNodeType::BINARY_OP: {
                analyzeNode(node->left);
                analyzeNode(node->right);

                string lType = node->left ? node->left->inferredType : "int";
                string rType = node->right ? node->right->inferredType : "int";

                // Type promotion rule: float op int -> float, int op int -> int
                if (lType == "float" || rType == "float") {
                    node->inferredType = "float";
                } else {
                    node->inferredType = "int";
                }

                // Check for Division by Zero
                if (node->op == "/" || node->op == "%") {
                    if (node->right && node->right->type == ASTNodeType::NUM_LITERAL) {
                        if (node->right->numValue == 0.0) {
                            diagnostics.push_back({"ERROR", "Semantic Error: Division or Modulo by constant zero detected!"});
                            analysisLog.push_back("CRITICAL: Division by zero caught on operator '" + node->op + "'");
                        }
                    }
                }

                analysisLog.push_back("Verified Binary Op '" + node->op + "': (" + lType + " " +
                                      node->op + " " + rType + ") -> Result type: " + node->inferredType);
                break;
            }

            case ASTNodeType::UNARY_OP: {
                analyzeNode(node->right);
                node->inferredType = node->right ? node->right->inferredType : "int";
                analysisLog.push_back("Verified Unary Op '" + node->op + "' on type " + node->inferredType);
                break;
            }

            case ASTNodeType::VARIABLE: {
                Symbol* s = symbolTable.lookup(node->name);
                if (!s) {
                    // Variable used without explicit declaration
                    diagnostics.push_back({"WARNING", "Variable '" + node->name + "' used without explicit prior declaration. Auto-allocating in Symbol Table."});
                    symbolTable.insert(node->name, "int", 1, 0.0, false);
                    node->inferredType = "int";
                    analysisLog.push_back("Auto-registered undeclared variable '" + node->name + "' as int.");
                } else {
                    node->inferredType = s->dataType;
                    if (!s->isInitialized) {
                        diagnostics.push_back({"WARNING", "Variable '" + node->name + "' may be uninitialized."});
                    }
                    analysisLog.push_back("Looked up variable '" + node->name + "' in Symbol Table. Type: " + s->dataType);
                }
                break;
            }

            case ASTNodeType::NUM_LITERAL: {
                // Already inferred in parser (int or float)
                break;
            }
        }
    }

public:
    void printReport() const {
        cout << "\n+----------------------------------------------------------------------------+\n";
        cout << "|                 STAGE 3: SEMANTIC ANALYSIS & VALIDATION                    |\n";
        cout << "+----------------------------------------------------------------------------+\n";
        for (const auto& log : analysisLog) {
            cout << "  [CHECK] " << log << "\n";
        }
        if (!diagnostics.empty()) {
            cout << "\n  --- Diagnostics & Warnings ---\n";
            for (const auto& d : diagnostics) {
                cout << "  [" << d.level << "] " << d.message << "\n";
            }
        } else {
            cout << "\n  [SUCCESS] All Semantic Checks Passed (Type consistency & zero-checks OK)\n";
        }
        cout << "+----------------------------------------------------------------------------+\n";
    }
};

// ============================================================================
//            STAGE 4: INTERMEDIATE CODE GENERATION (ICG)
// ============================================================================

struct TACInstruction {
    string op;       // e.g., "+", "-", "*", "/", "%", "^", "NEG", "="
    string arg1;     // First operand
    string arg2;     // Second operand (empty for unary)
    string result;   // Destination (e.g., "t1", "result")
    string comment;  // Educational comment explaining what this TAC step is doing
};

struct Quadruple {
    int index;
    string op;
    string arg1;
    string arg2;
    string result;
};

struct Triple {
    int index;
    string op;
    string arg1;
    string arg2;
};

class IntermediateCodeGenerator {
private:
    int tempCounter = 1;
    vector<TACInstruction> tacInstructions;
    vector<string> postfixTokens;
    vector<string> icgLog;

    string newTemp() {
        return "t" + to_string(tempCounter++);
    }

public:
    void reset() {
        tempCounter = 1;
        tacInstructions.clear();
        postfixTokens.clear();
        icgLog.clear();
    }

    const vector<TACInstruction>& getInstructions() const { return tacInstructions; }
    const vector<string>& getPostfix() const { return postfixTokens; }
    const vector<string>& getLog() const { return icgLog; }

    void generate(ASTNode* root) {
        reset();
        icgLog.push_back("Traversing AST in Post-Order to emit Three-Address Code (TAC)...");
        generateNode(root);
        icgLog.push_back("Intermediate Code Generation finished. Emitted " +
                         to_string(tacInstructions.size()) + " TAC instruction(s).");
    }

private:
    string generateNode(ASTNode* node) {
        if (!node) return "";

        switch (node->type) {
            case ASTNodeType::PROGRAM: {
                for (auto stmt : node->children) {
                    generateNode(stmt);
                }
                return "";
            }

            case ASTNodeType::ASSIGNMENT_STMT: {
                string rhsVal = generateNode(node->right);
                TACInstruction instr;
                instr.op = "=";
                instr.arg1 = rhsVal;
                instr.arg2 = "";
                instr.result = node->name;
                instr.comment = "Store computed value of expression into variable '" + node->name + "'";
                tacInstructions.push_back(instr);
                icgLog.push_back("Emitted assignment: " + node->name + " = " + rhsVal);
                return node->name;
            }

            case ASTNodeType::EXPR_STMT: {
                return generateNode(node->left);
            }

            case ASTNodeType::BINARY_OP: {
                string leftVal = generateNode(node->left);
                string rightVal = generateNode(node->right);
                string t = newTemp();

                TACInstruction instr;
                instr.op = node->op;
                instr.arg1 = leftVal;
                instr.arg2 = rightVal;
                instr.result = t;
                instr.comment = "Calculate " + leftVal + " " + node->op + " " + rightVal + " -> " + t;
                tacInstructions.push_back(instr);

                // Add to postfix: arg1 arg2 op
                postfixTokens.push_back(node->op);
                icgLog.push_back("Emitted TAC: " + t + " = " + leftVal + " " + node->op + " " + rightVal);
                return t;
            }

            case ASTNodeType::UNARY_OP: {
                string rightVal = generateNode(node->right);
                string t = newTemp();

                TACInstruction instr;
                instr.op = node->op;
                instr.arg1 = rightVal;
                instr.arg2 = "";
                instr.result = t;
                instr.comment = "Apply unary " + node->op + " to " + rightVal + " -> " + t;
                tacInstructions.push_back(instr);

                postfixTokens.push_back(node->op);
                icgLog.push_back("Emitted Unary TAC: " + t + " = " + node->op + " " + rightVal);
                return t;
            }

            case ASTNodeType::NUM_LITERAL: {
                postfixTokens.push_back(node->rawValue);
                return node->rawValue;
            }

            case ASTNodeType::VARIABLE: {
                postfixTokens.push_back(node->name);
                return node->name;
            }
        }
        return "";
    }

public:
    void printIntermediateCode() const {
        // 1. Three-Address Code (TAC)
        cout << "\n+----------------------------------------------------------------------------+\n";
        cout << "|                 STAGE 4: INTERMEDIATE CODE GENERATION (ICG)                |\n";
        cout << "+----------------------------------------------------------------------------+\n";
        cout << "| 1. THREE-ADDRESS CODE (TAC) LISTING:                                       |\n";
        cout << "+-----+---------------------------+------------------------------------------+\n";
        cout << "| No. | Instruction               | Explanation / Meaning                    |\n";
        cout << "+-----+---------------------------+------------------------------------------+\n";
        for (size_t i = 0; i < tacInstructions.size(); i++) {
            const auto& ins = tacInstructions[i];
            string code;
            if (ins.op == "=") {
                code = ins.result + " = " + ins.arg1;
            } else if (ins.op == "NEG" || ins.op == "POS") {
                code = ins.result + " = " + ins.op + " " + ins.arg1;
            } else {
                code = ins.result + " = " + ins.arg1 + " " + ins.op + " " + ins.arg2;
            }
            cout << "| " << left << setw(4) << (i + 1)
                 << "| " << setw(26) << code
                 << "| " << setw(41) << ins.comment
                 << "|\n";
        }
        cout << "+-----+---------------------------+------------------------------------------+\n";

        // 2. Quadruples Table
        cout << "\n| 2. QUADRUPLES TABLE: (op, arg1, arg2, result)                              |\n";
        cout << "+-----+------------+-----------------+-----------------+---------------------+\n";
        cout << "| Idx | Operator   | Argument 1      | Argument 2      | Result              |\n";
        cout << "+-----+------------+-----------------+-----------------+---------------------+\n";
        for (size_t i = 0; i < tacInstructions.size(); i++) {
            const auto& ins = tacInstructions[i];
            cout << "| " << left << setw(4) << i
                 << "| " << setw(11) << ins.op
                 << "| " << setw(16) << ins.arg1
                 << "| " << setw(16) << (ins.arg2.empty() ? "-" : ins.arg2)
                 << "| " << setw(20) << ins.result
                 << "|\n";
        }
        cout << "+-----+------------+-----------------+-----------------+---------------------+\n";

        // 3. Postfix / RPN Notation
        cout << "\n| 3. POSTFIX / REVERSE POLISH NOTATION (RPN):                                |\n";
        cout << "| ";
        for (const auto& token : postfixTokens) {
            cout << token << " ";
        }
        cout << "\n+----------------------------------------------------------------------------+\n";
    }
};

// ============================================================================
//            STAGE 5: CODE OPTIMIZATION (INDEPENDENT PASSES)
// ============================================================================

struct OptimizationRecord {
    string passName;
    string beforeCode;
    string afterCode;
    string reason;
};

class CodeOptimizer {
private:
    vector<OptimizationRecord> optimizationLog;

    bool isNumber(const string& s, double& outVal) {
        if (s.empty()) return false;
        try {
            size_t idx;
            outVal = stod(s, &idx);
            return idx == s.length();
        } catch (...) {
            return false;
        }
    }

    string formatNumber(double val) {
        if (floor(val) == val) {
            return to_string((long long)val);
        }
        stringstream ss;
        ss << fixed << setprecision(2) << val;
        return ss.str();
    }

public:
    const vector<OptimizationRecord>& getOptimizationLog() const { return optimizationLog; }

    vector<TACInstruction> optimize(const vector<TACInstruction>& original) {
        optimizationLog.clear();
        vector<TACInstruction> current = original;

        // Pass 1: Constant Folding
        current = constantFoldingPass(current);

        // Pass 2: Algebraic Identities / Strength Reduction
        current = algebraicIdentityPass(current);

        // Pass 3: Common Subexpression Elimination (CSE)
        current = commonSubexpressionEliminationPass(current);

        // Pass 4: Copy & Constant Propagation + Dead Code Elimination
        current = copyPropagationAndDeadCodePass(current);

        return current;
    }

private:
    // Pass 1: Constant Folding (Evaluate expressions with constants at compile time)
    vector<TACInstruction> constantFoldingPass(const vector<TACInstruction>& instructions) {
        vector<TACInstruction> result;
        for (const auto& instr : instructions) {
            double v1, v2;
            bool arg1IsNum = isNumber(instr.arg1, v1);
            bool arg2IsNum = isNumber(instr.arg2, v2);

            if (instr.op != "=" && instr.op != "NEG" && instr.op != "POS" && arg1IsNum && arg2IsNum) {
                double computed = 0.0;
                bool valid = true;

                if (instr.op == "+") computed = v1 + v2;
                else if (instr.op == "-") computed = v1 - v2;
                else if (instr.op == "*") computed = v1 * v2;
                else if (instr.op == "/") {
                    if (v2 != 0.0) computed = v1 / v2;
                    else valid = false;
                }
                else if (instr.op == "%") {
                    if (v2 != 0.0) computed = fmod(v1, v2);
                    else valid = false;
                }
                else if (instr.op == "^") computed = pow(v1, v2);
                else valid = false;

                if (valid) {
                    TACInstruction folded;
                    folded.op = "=";
                    folded.arg1 = formatNumber(computed);
                    folded.arg2 = "";
                    folded.result = instr.result;
                    folded.comment = "Constant folded: " + instr.arg1 + " " + instr.op + " " + instr.arg2 + " = " + folded.arg1;

                    string before = instr.result + " = " + instr.arg1 + " " + instr.op + " " + instr.arg2;
                    string after = folded.result + " = " + folded.arg1;
                    optimizationLog.push_back({"Constant Folding", before, after,
                                              "Evaluated constant arithmetic operation during compilation."});
                    result.push_back(folded);
                    continue;
                }
            }
            result.push_back(instr);
        }
        return result;
    }

    // Pass 2: Algebraic Identities (e.g. x + 0 -> x, x * 1 -> x, x * 0 -> 0)
    vector<TACInstruction> algebraicIdentityPass(const vector<TACInstruction>& instructions) {
        vector<TACInstruction> result;
        for (const auto& instr : instructions) {
            double v1, v2;
            bool arg1IsNum = isNumber(instr.arg1, v1);
            bool arg2IsNum = isNumber(instr.arg2, v2);

            string before = instr.result + " = " + instr.arg1 + " " + instr.op + " " + instr.arg2;

            // Identity: x + 0 = x or 0 + x = x
            if (instr.op == "+") {
                if (arg2IsNum && v2 == 0.0) {
                    result.push_back({"=", instr.arg1, "", instr.result, "Algebraic simplification (x + 0 = x)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = " + instr.arg1, "x + 0 = x"});
                    continue;
                }
                if (arg1IsNum && v1 == 0.0) {
                    result.push_back({"=", instr.arg2, "", instr.result, "Algebraic simplification (0 + x = x)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = " + instr.arg2, "0 + x = x"});
                    continue;
                }
            }
            // Identity: x - 0 = x
            if (instr.op == "-") {
                if (arg2IsNum && v2 == 0.0) {
                    result.push_back({"=", instr.arg1, "", instr.result, "Algebraic simplification (x - 0 = x)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = " + instr.arg1, "x - 0 = x"});
                    continue;
                }
            }
            // Identity: x * 1 = x or 1 * x = x
            if (instr.op == "*") {
                if (arg2IsNum && v2 == 1.0) {
                    result.push_back({"=", instr.arg1, "", instr.result, "Algebraic simplification (x * 1 = x)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = " + instr.arg1, "x * 1 = x"});
                    continue;
                }
                if (arg1IsNum && v1 == 1.0) {
                    result.push_back({"=", instr.arg2, "", instr.result, "Algebraic simplification (1 * x = x)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = " + instr.arg2, "1 * x = x"});
                    continue;
                }
                // Zero property: x * 0 = 0 or 0 * x = 0
                if ((arg2IsNum && v2 == 0.0) || (arg1IsNum && v1 == 0.0)) {
                    result.push_back({"=", "0", "", instr.result, "Algebraic simplification (x * 0 = 0)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = 0", "x * 0 = 0"});
                    continue;
                }
            }
            // Identity: x / 1 = x
            if (instr.op == "/") {
                if (arg2IsNum && v2 == 1.0) {
                    result.push_back({"=", instr.arg1, "", instr.result, "Algebraic simplification (x / 1 = x)"});
                    optimizationLog.push_back({"Algebraic Simplification", before, instr.result + " = " + instr.arg1, "x / 1 = x"});
                    continue;
                }
            }

            result.push_back(instr);
        }
        return result;
    }

    // Pass 3: Common Subexpression Elimination (CSE)
    vector<TACInstruction> commonSubexpressionEliminationPass(const vector<TACInstruction>& instructions) {
        vector<TACInstruction> result;
        // Map: expression "arg1 op arg2" -> previous temporary variable result
        map<string, string> exprToResult;

        for (const auto& instr : instructions) {
            if (instr.op != "=" && instr.op != "NEG" && instr.op != "POS") {
                string key = instr.arg1 + " " + instr.op + " " + instr.arg2;
                // For commutative ops like + and *, check reversed order too
                string revKey = (instr.op == "+" || instr.op == "*") ?
                                (instr.arg2 + " " + instr.op + " " + instr.arg1) : "";

                if (exprToResult.find(key) != exprToResult.end()) {
                    string prevResult = exprToResult[key];
                    string before = instr.result + " = " + key;
                    string after = instr.result + " = " + prevResult;
                    optimizationLog.push_back({"Common Subexpression Elimination (CSE)", before, after,
                                              "Reused previously computed result of '" + key + "' stored in " + prevResult});
                    result.push_back({"=", prevResult, "", instr.result, "Reusing " + prevResult + " from CSE"});
                    continue;
                } else if (!revKey.empty() && exprToResult.find(revKey) != exprToResult.end()) {
                    string prevResult = exprToResult[revKey];
                    string before = instr.result + " = " + key;
                    string after = instr.result + " = " + prevResult;
                    optimizationLog.push_back({"Common Subexpression Elimination (CSE)", before, after,
                                              "Reused commutative expression result of '" + revKey + "' stored in " + prevResult});
                    result.push_back({"=", prevResult, "", instr.result, "Reusing " + prevResult + " from CSE"});
                    continue;
                } else {
                    exprToResult[key] = instr.result;
                }
            }
            result.push_back(instr);
        }
        return result;
    }

    bool isTemporary(const string& s) const {
        if (s.length() < 2 || s[0] != 't') return false;
        for (size_t i = 1; i < s.length(); i++) {
            if (!isdigit(s[i])) return false;
        }
        return true;
    }

    // Pass 4: Copy Propagation & Dead Temporary Elimination
    vector<TACInstruction> copyPropagationAndDeadCodePass(const vector<TACInstruction>& instructions) {
        // Substitute copy assignments ti = tj
        map<string, string> copyMap;
        vector<TACInstruction> propagated;

        for (auto instr : instructions) {
            // Apply current copy substitutions to operands
            if (copyMap.find(instr.arg1) != copyMap.end()) {
                instr.arg1 = copyMap[instr.arg1];
            }
            if (copyMap.find(instr.arg2) != copyMap.end()) {
                instr.arg2 = copyMap[instr.arg2];
            }

            // Only eliminate temporary assignments (e.g., t1 = t2 or t1 = 5), never user variables!
            if (instr.op == "=" && isTemporary(instr.result)) {
                copyMap[instr.result] = instr.arg1;
                optimizationLog.push_back({"Copy Propagation", instr.result + " = " + instr.arg1,
                                          "Propagated " + instr.result + " -> " + instr.arg1,
                                          "Replaced references to temporary with source value."});
                // Do not emit dead copy instruction
                continue;
            }
            propagated.push_back(instr);
        }

        return propagated;
    }

public:
    void printOptimizationReport(const vector<TACInstruction>& before,
                                const vector<TACInstruction>& after) const {
        cout << "\n+----------------------------------------------------------------------------+\n";
        cout << "|                     STAGE 5: CODE OPTIMIZATION                             |\n";
        cout << "+----------------------------------------------------------------------------+\n";
        cout << "| 1. OPTIMIZATION PASSES APPLIED:                                            |\n";
        cout << "+------------------------------------+---------------------------------------+\n";
        cout << "| Pass Name                          | Transformation Details                |\n";
        cout << "+------------------------------------+---------------------------------------+\n";

        if (optimizationLog.empty()) {
            cout << "| (No optimizations were applicable to this expression)                      |\n";
        } else {
            for (const auto& log : optimizationLog) {
                cout << "| " << left << setw(35) << log.passName
                     << "| " << setw(38) << (log.beforeCode + " -> " + log.afterCode)
                     << "|\n";
                cout << "|   Reason: " << setw(72) << log.reason << "|\n";
                cout << "+------------------------------------+---------------------------------------+\n";
            }
        }

        cout << "\n| 2. BEFORE vs AFTER COMPARISON:                                             |\n";
        cout << "+------------------------------------+---------------------------------------+\n";
        cout << "| Before Optimization (" << left << setw(2) << before.size() << " instrs)      | After Optimization (" << setw(2) << after.size() << " instrs)       |\n";
        cout << "+------------------------------------+---------------------------------------+\n";

        size_t maxLen = max(before.size(), after.size());
        for (size_t i = 0; i < maxLen; i++) {
            string bStr = "", aStr = "";
            if (i < before.size()) {
                const auto& b = before[i];
                bStr = (b.op == "=") ? (b.result + " = " + b.arg1) : (b.result + " = " + b.arg1 + " " + b.op + " " + b.arg2);
            }
            if (i < after.size()) {
                const auto& a = after[i];
                aStr = (a.op == "=") ? (a.result + " = " + a.arg1) : (a.result + " = " + a.arg1 + " " + a.op + " " + a.arg2);
            }

            cout << "| " << left << setw(35) << (bStr.empty() ? "" : (to_string(i + 1) + ". " + bStr))
                 << "| " << setw(38) << (aStr.empty() ? "" : (to_string(i + 1) + ". " + aStr))
                 << "|\n";
        }
        cout << "+------------------------------------+---------------------------------------+\n";

        double reduction = 0.0;
        if (!before.empty()) {
            reduction = (1.0 - (double)after.size() / (double)before.size()) * 100.0;
        }
        stringstream redStream;
        redStream << "Instruction Count Reduction: " << fixed << setprecision(1) << reduction
                  << "% (" << before.size() << " -> " << after.size() << " instructions)";
        cout << "| " << left << setw(74) << redStream.str() << " |\n";
        cout << "+----------------------------------------------------------------------------+\n";
    }
};

// ============================================================================
//            STAGE 6: TARGET CODE GENERATION (ASSEMBLY WITH REGISTERS)
// ============================================================================

struct AssemblyInstruction {
    string instruction;
    string comment;
};

class TargetCodeGenerator {
private:
    // Simple Register Allocator (R0, R1, R2, R3, R4, R5)
    static const int NUM_REGISTERS = 6;
    string registerDescriptor[NUM_REGISTERS]; // Holds the variable name currently in Ri
    vector<AssemblyInstruction> generatedAssembly;
    vector<string> codegenLog;

    int allocateRegister(const string& var) {
        // 1. If var is already in a register, reuse it
        for (int i = 0; i < NUM_REGISTERS; i++) {
            if (registerDescriptor[i] == var) {
                return i;
            }
        }
        // 2. Find an empty register
        for (int i = 0; i < NUM_REGISTERS; i++) {
            if (registerDescriptor[i].empty()) {
                registerDescriptor[i] = var;
                return i;
            }
        }
        // 3. Simple FIFO/Spill: Spill R0
        int reg = 0;
        if (!registerDescriptor[reg].empty()) {
            generatedAssembly.push_back({"STORE " + registerDescriptor[reg] + ", R" + to_string(reg),
                                         "Spill R" + to_string(reg) + " to memory for " + registerDescriptor[reg]});
        }
        registerDescriptor[reg] = var;
        return reg;
    }

public:
    void generateCode(const vector<TACInstruction>& optimizedTac, const SymbolTable& symTable) {
        generatedAssembly.clear();
        codegenLog.clear();
        for (int i = 0; i < NUM_REGISTERS; i++) registerDescriptor[i] = "";

        codegenLog.push_back("Initializing Target Architecture (Virtual 32-bit RISC / Accumulator CPU)...");
        codegenLog.push_back("Register Set: [R0, R1, R2, R3, R4, R5]");

        // Data segment header
        generatedAssembly.push_back({".DATA", "Start of Data Segment"});
        for (const auto& pair : symTable.getAllSymbols()) {
            const Symbol& s = pair.second;
            generatedAssembly.push_back({s.name + ": .WORD " + to_string((int)s.value),
                                         "Variable '" + s.name + "' initialized at offset Byte " + to_string(s.memoryOffset)});
        }

        generatedAssembly.push_back({"", ""});
        generatedAssembly.push_back({".CODE", "Start of Code Segment"});

        // Instruction translation from TAC to Assembly
        for (const auto& instr : optimizedTac) {
            if (instr.op == "=") {
                // Assignment: result = arg1
                int rDest = allocateRegister(instr.result);
                generatedAssembly.push_back({"LOAD  R" + to_string(rDest) + ", " + instr.arg1,
                                             "Load value of " + instr.arg1 + " into R" + to_string(rDest)});
                generatedAssembly.push_back({"STORE " + instr.result + ", R" + to_string(rDest),
                                             "Write R" + to_string(rDest) + " to memory address of " + instr.result});
                registerDescriptor[rDest] = instr.result;
            } else {
                // Binary operation: result = arg1 op arg2
                int r1 = allocateRegister(instr.arg1);
                generatedAssembly.push_back({"LOAD  R" + to_string(r1) + ", " + instr.arg1,
                                             "Load operand 1 (" + instr.arg1 + ") into R" + to_string(r1)});

                string asmOp;
                if (instr.op == "+") asmOp = "ADD  ";
                else if (instr.op == "-") asmOp = "SUB  ";
                else if (instr.op == "*") asmOp = "MUL  ";
                else if (instr.op == "/") asmOp = "DIV  ";
                else if (instr.op == "%") asmOp = "MOD  ";
                else if (instr.op == "^") asmOp = "POW  ";
                else asmOp = "OP   ";

                generatedAssembly.push_back({asmOp + " R" + to_string(r1) + ", " + instr.arg2,
                                             "Compute R" + to_string(r1) + " = R" + to_string(r1) + " " + instr.op + " " + instr.arg2});

                // Store into destination
                generatedAssembly.push_back({"STORE " + instr.result + ", R" + to_string(r1),
                                             "Store computation result from R" + to_string(r1) + " into " + instr.result});
                registerDescriptor[r1] = instr.result;
            }
        }

        // Program termination
        generatedAssembly.push_back({"HALT", "Terminate Execution"});
    }

    void printTargetCode() const {
        cout << "\n+----------------------------------------------------------------------------+\n";
        cout << "|                 STAGE 6: TARGET CODE GENERATION (ASSEMBLY)                 |\n";
        cout << "+----------------------------------------------------------------------------+\n";
        cout << "| Target Architecture: 32-bit RISC / Virtual Register Machine (R0-R5)        |\n";
        cout << "+-----+---------------------------+------------------------------------------+\n";
        cout << "| Line| Assembly Instruction      | Architectural Comment / Action           |\n";
        cout << "+-----+---------------------------+------------------------------------------+\n";

        int lineNo = 1;
        for (const auto& asmLine : generatedAssembly) {
            if (asmLine.instruction.empty()) {
                cout << "|     |                           |                                          |\n";
                continue;
            }
            cout << "| " << left << setw(4) << lineNo++
                 << "| " << setw(26) << asmLine.instruction
                 << "| " << setw(41) << asmLine.comment
                 << "|\n";
        }
        cout << "+-----+---------------------------+------------------------------------------+\n";

        // Register Descriptor Table
        cout << "\n| REGISTER DESCRIPTOR (Active Allocation):                                   |\n";
        cout << "+----------+-----------------------------------------------------------------+\n";
        cout << "| Register | Currently Stored Value / Variable                               |\n";
        cout << "+----------+-----------------------------------------------------------------+\n";
        for (int i = 0; i < NUM_REGISTERS; i++) {
            string val = registerDescriptor[i].empty() ? "(Empty / Free)" : registerDescriptor[i];
            cout << "| R" << i << "       | " << left << setw(64) << val << "|\n";
        }
        cout << "+----------+-----------------------------------------------------------------+\n";
    }
};

// ============================================================================
//            COMPILER DRIVER & PIPELINE CONTROLLER
// ============================================================================

class ArithmeticCompiler {
private:
    SymbolTable symbolTable;

public:
    void compile(const string& sourceCode, bool verbose = true) {
        cout << "\n==============================================================================\n";
        cout << "                  STARTING ARITHMETIC COMPILER PIPELINE\n";
        cout << "==============================================================================\n";
        cout << "Source Code Input:\n  \"" << sourceCode << "\"\n";

        // Reset Symbol Table for this compilation unit
        symbolTable.clear();

        // ---------------------------------------------------------
        // MODULE 1: LEXICAL ANALYSIS
        // ---------------------------------------------------------
        cout << "\n>>> [MODULE 1/6] Running Lexical Analysis (Scanner & Token Recognition)...";
        LexicalAnalyzer lexer(sourceCode);
        vector<Token> tokens = lexer.tokenize();
        cout << " DONE. (" << tokens.size() << " tokens generated)\n";
        
        if (verbose) {
            LexicalAnalyzer::printTokenTable(tokens);
        }

        // Check for lexical errors
        for (const auto& t : tokens) {
            if (t.type == TokenType::UNKNOWN) {
                cout << "\n[!] LEXICAL ERROR: Illegal character '" << t.lexeme
                     << "' at line " << t.line << ", col " << t.column << "\n";
                return;
            }
        }

        // ---------------------------------------------------------
        // MODULE 2: SYNTAX ANALYSIS
        // ---------------------------------------------------------
        cout << "\n>>> [MODULE 2/6] Running Syntax Analysis (Recursive Descent Parser & CFG)...";
        Parser parser(tokens);
        unique_ptr<ASTNode> astRoot(parser.parseProgram());

        if (parser.hasError()) {
            cout << " FAILED!\n";
            cout << "\n[!] " << parser.getError() << "\n";
            return;
        }
        cout << " DONE. (Abstract Syntax Tree built successfully)\n";

        if (verbose) {
            cout << "\n+----------------------------------------------------------------------------+\n";
            cout << "|          MODULE 2: SYNTAX ANALYSIS - ABSTRACT SYNTAX TREE (AST)            |\n";
            cout << "+----------------------------------------------------------------------------+\n";
            Parser::printAST(astRoot.get());
            cout << "+----------------------------------------------------------------------------+\n";
        }

        // ---------------------------------------------------------
        // MODULE 3: SYNTAX DIRECTED TRANSLATION & RUNTIME
        // ---------------------------------------------------------
        cout << "\n>>> [MODULE 3/6] Running SDD Semantic Rules & Runtime Storage Allocation...";
        SemanticAnalyzer semanticAnalyzer(symbolTable);
        bool semanticSuccess = semanticAnalyzer.analyze(astRoot.get());

        if (verbose) {
            semanticAnalyzer.printReport();
            symbolTable.printTable();
        }

        if (!semanticSuccess) {
            cout << "\n[!] COMPILATION ABORTED: Fatal Semantic Errors detected.\n";
            return;
        }

        // ---------------------------------------------------------
        // MODULE 4: INTERMEDIATE CODE GENERATION
        // ---------------------------------------------------------
        cout << "\n>>> [MODULE 4/6] Running Intermediate Code Generation (TAC & Quadruples)...";
        IntermediateCodeGenerator icg;
        icg.generate(astRoot.get());
        vector<TACInstruction> rawTac = icg.getInstructions();
        cout << " DONE. (" << rawTac.size() << " TAC instructions emitted)\n";

        if (verbose) {
            icg.printIntermediateCode();
        }

        // ---------------------------------------------------------
        // MODULE 5: CODE OPTIMIZATION
        // ---------------------------------------------------------
        cout << "\n>>> [MODULE 5/6] Running Code Optimization (Basic Blocks, Folding, CSE)...";
        CodeOptimizer optimizer;
        vector<TACInstruction> optimizedTac = optimizer.optimize(rawTac);
        cout << " DONE. (" << rawTac.size() << " -> " << optimizedTac.size() << " instructions)\n";

        if (verbose) {
            optimizer.printOptimizationReport(rawTac, optimizedTac);
        }

        // ---------------------------------------------------------
        // MODULE 6: TARGET CODE GENERATION
        // ---------------------------------------------------------
        cout << "\n>>> [MODULE 6/6] Running Target Code Generation (getReg, Descriptors, RISC Assembly)...";
        TargetCodeGenerator codegen;
        codegen.generateCode(optimizedTac, symbolTable);
        cout << " DONE.\n";

        if (verbose) {
            codegen.printTargetCode();
        }

        cout << "\n==============================================================================\n";
        cout << "               COMPILATION FINISHED SUCCESSFULLY! (0 ERRORS)\n";
        cout << "==============================================================================\n";
    }
};

// ============================================================================
//                       MAIN INTERACTIVE CONSOLE MENU
// ============================================================================

void printBanner() {
    cout << "==============================================================================\n";
    cout << "              ARITHMETIC COMPILER DESIGN - ISE 2 DEMONSTRATION                \n";
    cout << "==============================================================================\n";
    cout << "  Demonstrating all 6 canonical phases of a modern optimizing compiler:       \n";
    cout << "   [1] Lexical Analysis     -> Tokens & Lexemes Table                         \n";
    cout << "   [2] Syntax Analysis      -> Recursive Descent Parsing & AST Visualizer     \n";
    cout << "   [3] Semantic Analysis    -> Scope, Type Checking & Div-by-Zero Protection \n";
    cout << "   [4] Intermediate Code    -> Three-Address Code, Quadruples & Postfix       \n";
    cout << "   [5] Code Optimization    -> Constant Folding, Algebraic ID, CSE & Dead Code\n";
    cout << "   [6] Target Code Gen      -> Assembly Generation with Register Allocation  \n";
    cout << "==============================================================================\n";
}

int main() {
    printBanner();
    ArithmeticCompiler compiler;

    while (true) {
        cout << "\nSelect an option to test the Arithmetic Compiler:\n";
        cout << "  1. Example 1: Full Arithmetic Expression (Precedence & Parentheses)\n";
        cout << "     Input: \"result = (a + b) * (c - 4) / 2 + 10;\"\n";
        cout << "  2. Example 2: Optimization Showcase (Constant Folding + CSE + Algebraic)\n";
        cout << "     Input: \"ans = (x + y) * (x + y) + 12 / 4 + z * 1;\"\n";
        cout << "  3. Example 3: Semantic Error Detection (Division by Zero)\n";
        cout << "     Input: \"val = (p + q) / 0;\"\n";
        cout << "  4. Example 4: Multi-Statement Program with Dependencies\n";
        cout << "     Input: \"a = 15; b = 5; c = a + b * 2; d = (a + b * 2) - 10;\"\n";
        cout << "  5. Enter Your Own Custom Arithmetic Expression / Statement\n";
        cout << "  6. Exit\n";
        cout << "\nEnter choice (1-6): ";

        string input;
        if (!getline(cin, input)) break;
        if (input.empty()) continue;

        int choice = 0;
        try {
            choice = stoi(input);
        } catch (...) {
            cout << "[!] Invalid selection. Please enter a number between 1 and 6.\n";
            continue;
        }

        if (choice == 1) {
            compiler.compile("result = (a + b) * (c - 4) / 2 + 10;");
        } else if (choice == 2) {
            compiler.compile("ans = (x + y) * (x + y) + 12 / 4 + z * 1;");
        } else if (choice == 3) {
            compiler.compile("val = (p + q) / 0;");
        } else if (choice == 4) {
            compiler.compile("a = 15; b = 5; c = a + b * 2; d = (a + b * 2) - 10;");
        } else if (choice == 5) {
            cout << "\nEnter your arithmetic code (e.g., 'res = (a + 5) * b / 2;'):\n> ";
            string customCode;
            getline(cin, customCode);
            if (!customCode.empty()) {
                compiler.compile(customCode);
            }
        } else if (choice == 6) {
            cout << "\nExiting Arithmetic Compiler. All tests completed!\n";
            break;
        } else {
            cout << "[!] Invalid choice. Please choose 1 - 6.\n";
        }
    }

    return 0;
}
