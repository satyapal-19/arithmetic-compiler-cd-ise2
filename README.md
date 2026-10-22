# Arithmetic Compiler Design - College Lab ISE 2

A complete, educational, and fully transparent **Arithmetic Compiler** implemented in modern **C++ (C++11/C++14)** for Compiler Design (CD) Coursework / In-Semester Evaluation 2 (ISE 2).

This project implements **all 6 canonical phases of compiler design** and prints a comprehensive, step-by-step breakdown of each phase's internal operations, data structures, and console visualizations.

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Web Frontend & Split-Screen IDE](#web-frontend--split-screen-ide)
3. [The 6 Classic Compiler Stages](#the-6-classic-compiler-stages)
   - [Stage 1: Lexical Analysis (Scanner)](#stage-1-lexical-analysis-scanner)
   - [Stage 2: Syntax Analysis (Parser & AST)](#stage-2-syntax-analysis-parser--ast)
   - [Stage 3: Semantic Analysis & Type Checking](#stage-3-semantic-analysis--type-checking)
   - [Stage 4: Intermediate Code Generation (ICG)](#stage-4-intermediate-code-generation-icg)
   - [Stage 5: Code Optimization](#stage-5-code-optimization)
   - [Stage 6: Target Code Generation (Assembly)](#stage-6-target-code-generation-assembly)
4. [Supporting Components](#supporting-components)
   - [Symbol Table Management](#symbol-table-management)
   - [Error Handling & Diagnostics](#error-handling--diagnostics)
5. [Grammar Specification (Context-Free Grammar)](#grammar-specification-context-free-grammar)
6. [End-to-End Walkthrough Example](#end-to-end-walkthrough-example)
7. [Web Frontend Local Run & Vercel Deployment](#web-frontend-local-run--vercel-deployment)
8. [C++ CLI Compilation & How to Run](#c-cli-compilation--how-to-run)
9. [Viva / Oral Examination Questions & Answers](#viva--oral-examination-questions--answers)

---

## Overview & Architecture

A compiler translates high-level human-readable code into low-level machine instructions through a pipeline of phases:

```
Source Code
    │
    ▼
[ 1. Lexical Analyzer ]      ──────> Emits Tokens & Populates Initial Symbol Table
    │
    ▼
[ 2. Syntax Analyzer ]       ──────> Builds Abstract Syntax Tree (AST) via CFG Rules
    │
    ▼
[ 3. Semantic Analyzer ]     ──────> Type Checking, Div-by-Zero & Scope Verification
    │
    ▼
[ 4. Intermediate Code Gen ] ──────> Produces Three-Address Code (TAC), Quadruples & Postfix
    │
    ▼
[ 5. Code Optimizer ]        ──────> Constant Folding, Algebraic ID, CSE, Dead Code
    │
    ▼
[ 6. Target Code Generator ] ──────> Emits 32-bit RISC Assembly with Register Allocation
    │
    ▼
Target Assembly Code
```

---

## Web Frontend & Split-Screen IDE

The project includes an interactive web studio with a modern **Split-Screen Layout**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   Arithmetic Compiler Studio - Navbar                            │
├─────────────────────────────────────────┬────────────────────────────────────────┤
│ LEFT PANE: Code Area & Input Area       │ RIGHT PANE: Multi-Stage Output Area    │
│                                         │                                        │
│ 1. Preset Selector (5 test cases)       │ Stage Tabs:                            │
│ 2. Code Editor Area                     │ [Overview] [Tokens] [AST] [Semantics]  │
│    - Monospace font, line numbers       │ [ICG / TAC] [Optimizer] [Assembly]     │
│    - Quick insert token toolbar         │                                        │
│    - Compile button (Ctrl + Enter)      │ Dynamic Views:                         │
│                                         │ - Interactive Colored Node AST Tree    │
│ 3. Variable Input Area                  │ - Filterable Tokens Table              │
│    - Dynamic inputs for detected vars   │ - Byte-Addressed Symbol Table          │
│    - Live Evaluation Button             │ - Before vs After Optimization Diff    │
│    - Computed Output Variables Cards    │ - 32-bit RISC Assembly & Registers     │
│                                         │ - Raw C++ Console Terminal View        │
└─────────────────────────────────────────┴────────────────────────────────────────┘
```

---

## The 6 Classic Compiler Stages

### Stage 1: Lexical Analysis (Scanner)
- **Role**: Reads the raw source characters, removes whitespace and comments (`//`), and groups characters into meaningful atomic units called **Tokens**.
- **Token Format**: `<TokenType, Lexeme, Line, Column>`
- **Recognized Tokens**:
  - `KEYWORD`: `int`, `float`
  - `IDENTIFIER`: Variables such as `result`, `x`, `rate`
  - `INT_LITERAL` & `FLOAT_LITERAL`: Constants such as `10`, `3.14`
  - `OPERATOR`: `+`, `-`, `*`, `/`, `%`, `^` (exponent), `=` (assignment)
  - `DELIMITER`: `(`, `)`, `;`
- **Output in Console**: Complete Token Stream table with index, type, lexeme, line, and column.

---

### Stage 2: Syntax Analysis (Parser & AST)
- **Role**: Checks whether the token sequence conforms to the syntactic rules defined by the Context-Free Grammar (CFG).
- **Implementation**: Recursive Descent Parser with operator precedence and associativity handling.
- **Precedence Hierarchy** (Lowest to Highest):
  1. Assignment (`=`) - Right-associative
  2. Addition (`+`) and Subtraction (`-`) - Left-associative
  3. Multiplication (`*`), Division (`/`), Modulo (`%`) - Left-associative
  4. Exponentiation (`^`) - Right-associative
  5. Unary operators (`+`, `-`) - Right-associative
  6. Primary: Identifiers, Numbers, Parenthesized expressions `(...)`
- **Output in Console**: Step-by-step grammar production rules applied and a formatted ASCII tree visualizer of the **Abstract Syntax Tree (AST)**.

---

### Stage 3: Semantic Analysis & Type Checking
- **Role**: Ensures that the program makes logical and mathematical sense according to language semantics.
- **Checks Performed**:
  1. **Undeclared Variables**: Identifies identifiers used without prior definition, reports diagnostics, and auto-allocates them.
  2. **Type Checking & Type Promotion**: Invariant checking for `int` and `float` expressions (e.g. `int + float -> float`).
  3. **Division by Zero Protection**: Compile-time detection of division or modulo by constant zero (e.g., `x / 0`), raising fatal semantic errors to abort codegen.
  4. **L-Value Validation**: Confirms the target of an assignment is an assignable variable identifier.
- **Output in Console**: Semantic check trace log and diagnostic error/warning report.

---

### Stage 4: Intermediate Code Generation (ICG)
- **Role**: Converts the validated AST into a machine-independent intermediate representation (IR) suitable for optimization.
- **Representations Produced**:
  1. **Three-Address Code (TAC)**: Linear instructions with at most three addresses (e.g. `t1 = a + b`).
  2. **Quadruples Table**: Record structure containing `(operator, argument 1, argument 2, result)`.
  3. **Postfix Notation (Reverse Polish Notation)**: Parentheses-free evaluation order.
- **Output in Console**: Formatted TAC table with educational justifications, full Quadruples table, and Postfix notation.

---

### Stage 5: Code Optimization
- **Role**: Transforms the intermediate code to make it more compact and execute faster, without changing program output.
- **Optimization Passes Implemented**:
  1. **Constant Folding**: Pre-evaluates constant operations at compile-time (e.g., `t = 12 / 4` $\rightarrow$ `t = 3`).
  2. **Algebraic Simplification & Strength Reduction**:
     - $x + 0 \rightarrow x$, $0 + x \rightarrow x$
     - $x - 0 \rightarrow x$
     - $x \times 1 \rightarrow x$, $1 \times x \rightarrow x$
     - $x \times 0 \rightarrow 0$, $0 \times x \rightarrow 0$
     - $x / 1 \rightarrow x$
  3. **Common Subexpression Elimination (CSE)**: Identifies identical subexpressions already computed (including commutative operations) and reuses previous temporary registers.
  4. **Copy & Constant Propagation**: Replaces redundant temporaries with their known source values.
  5. **Dead Code Elimination**: Removes unused compiler temporaries from the instruction stream.
- **Output in Console**:
  - Detailed breakdown of each optimization pass.
  - Side-by-side **Before vs After** comparison table.
  - Instruction Count Reduction percentage calculation.

---

### Stage 6: Target Code Generation (Assembly)
- **Role**: Translates optimized Three-Address Code into assembly code for a virtual 32-bit RISC / Register-based machine.
- **Architecture**:
  - **Registers**: `R0`, `R1`, `R2`, `R3`, `R4`, `R5`
  - **Instruction Set**: `LOAD`, `STORE`, `ADD`, `SUB`, `MUL`, `DIV`, `MOD`, `POW`, `HALT`
  - **Register Allocation**: Uses register descriptors and memory spilling when needed.
- **Output in Console**:
  - Full assembly listing split into `.DATA` segment and `.CODE` segment.
  - Clear architectural comments for every assembly line.
  - **Register Descriptor Table** showing live register occupancy.

---

## Supporting Components

### Symbol Table Management
Tracks variables throughout all phases:
- Variable Name / Identifier
- Data Type (`int`, `float`)
- Memory Byte Offset (0, 4, 8, 12, ...)
- Value & Initialization Flag
- Line of Declaration

### Error Handling & Diagnostics
- **Lexical Errors**: Catches illegal characters (e.g. `@`, `$`, `~`).
- **Syntax Errors**: Catches missing parentheses, unbalanced operators, missing semicolons.
- **Semantic Errors**: Catches division by zero, invalid assignments.

---

## Grammar Specification (Context-Free Grammar)

```ebnf
Program       ::= Statement*
Statement     ::= [Type] Identifier '=' Expression ';' | Expression ';'
Type          ::= 'int' | 'float'
Expression    ::= Term ( ('+' | '-') Term )*
Term          ::= Power ( ('*' | '/' | '%') Power )*
Power         ::= Factor ( '^' Power )?
Factor        ::= ('+' | '-') Factor | Primary
Primary       ::= IDENTIFIER | NUMBER | '(' Expression ')'
```

---

## End-to-End Walkthrough Example

Input:
```cpp
ans = (x + y) * (x + y) + 12 / 4 + z * 1;
```

1. **Lexical Analysis**: Emits 19 tokens (`ans`, `=`, `(`, `x`, `+`, `y`, `)`, `*`, `(`, `x`, `+`, `y`, `)`, `+`, `12`, `/`, `4`, `+`, `z`, `*`, `1`, `;`).
2. **Syntax Analysis**: Builds AST with root `[Assignment] Target: 'ans'`, nested binary operators respecting precedence.
3. **Semantic Analysis**: Registers `ans`, `x`, `y`, `z` in Symbol Table; verifies types and verifies no divisor is zero.
4. **Intermediate Code Generation**:
   ```
   t1 = x + y
   t2 = x + y
   t3 = t1 * t2
   t4 = 12 / 4
   t5 = t3 + t4
   t6 = z * 1
   t7 = t5 + t6
   ans = t7
   ```
5. **Optimization**:
   - Constant folding: `t4 = 12 / 4` $\rightarrow$ `t4 = 3`
   - Algebraic simplification: `t6 = z * 1` $\rightarrow$ `t6 = z`
   - CSE: Replaces `t2 = x + y` with `t1`
   - Copy propagation: Eliminates `t2`, `t4`, `t6`
   - Optimized TAC:
     ```
     t1 = x + y
     t3 = t1 * t1
     t5 = t3 + 3
     t7 = t5 + z
     ans = t7
     ```
   - **Instruction reduction**: $8 \rightarrow 5$ instructions (37.5% reduction)!
6. **Target Code Generation**:
   ```assembly
   .DATA
   ans: .WORD 0
   x:   .WORD 0
   y:   .WORD 0
   z:   .WORD 0

   .CODE
   LOAD  R0, x
   ADD   R0, y
   STORE t1, R0
   LOAD  R0, t1
   MUL   R0, t1
   STORE t3, R0
   LOAD  R0, t3
   ADD   R0, 3
   STORE t5, R0
   LOAD  R0, t5
   ADD   R0, z
   STORE t7, R0
   LOAD  R1, t7
   STORE ans, R1
   HALT
   ```

---

---

## Web Frontend Local Run & Vercel Deployment

The frontend runs 100% in the browser with zero server latency or cold starts. It is pre-configured with `vercel.json` for one-click deployment.

### 1. Running the Web Frontend Locally

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (only needed once)
npm install

# Start local development server with instant HMR
npm run dev
```
Open `http://localhost:5173` in your browser.

Alternatively, from the root folder:
```bash
npm run dev
```

---

### 2. Deploying to Vercel (2 Simple Methods)

#### Method A: Via GitHub (Recommended)
1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: arithmetic compiler studio with split-screen frontend"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel automatically detects `vercel.json` and the Vite framework:
   - **Framework Preset**: `Vite`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
5. Click **"Deploy"**! Your app will be live globally in under 60 seconds with a free `.vercel.app` domain.

#### Method B: Via Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy directly from the project directory
vercel
```
Follow the interactive CLI prompts (accept defaults). When prompted for production deployment:
```bash
vercel --prod
```

---

### 3. Deploying to Netlify or GitHub Pages

- **Netlify**: Set Build Command to `npm run build:frontend` and Publish Directory to `frontend/dist`.
- **Static Hosting**: Simply run `npm run build` from root, and upload the generated `frontend/dist` directory to any static host.

---

## C++ CLI Compilation & How to Run (ISE 2 Lab)

For traditional college lab evaluations and oral exams:

### Requirements
- Any modern C++ compiler (`g++`, `clang++`, or MSVC) supporting C++11 or C++14.
- OS: Windows, Linux, or macOS.

### Option A: Using Windows Batch Script (1-Click)
Double-click `build_and_run.bat` or run:
```cmd
build_and_run.bat
```

### Option B: Using PowerShell Script
```powershell
.\run.ps1
```

### Option C: Manual Command Line Compilation
```bash
# Compile
g++ -std=c++14 arithmetic_compiler.cpp -o arithmetic_compiler.exe

# Run interactively
./arithmetic_compiler.exe

# Run automated test cases
Get-Content test_inputs.txt | ./arithmetic_compiler.exe
```

---

## Viva / Oral Examination Questions & Answers

### Q1: What are the main phases of a compiler?
**Answer**:
1. Lexical Analysis (Scanner)
2. Syntax Analysis (Parser)
3. Semantic Analysis (Type & Semantic Checker)
4. Intermediate Code Generation (ICG)
5. Code Optimization
6. Target Code Generation

### Q2: What is the difference between a Lexeme, a Token, and a Pattern?
**Answer**:
- **Pattern**: The formal rule describing a set of strings (e.g. `[a-zA-Z_][a-zA-Z0-9_]*` for identifiers).
- **Lexeme**: The actual concrete substring in the source code matching a pattern (e.g. `result`).
- **Token**: The abstract symbol/tuple emitted by the lexer consisting of a token type and optional attribute value (e.g. `<IDENTIFIER, "result">`).

### Q3: What parser technique is used in this compiler?
**Answer**:
A **Recursive Descent Parser**, which is a top-down parsing technique that implements each non-terminal of the Context-Free Grammar as a dedicated C++ function (`parseExpression()`, `parseTerm()`, `parsePower()`, `parseFactor()`, `parsePrimary()`).

### Q4: How is operator precedence handled in recursive descent parsing?
**Answer**:
By arranging grammar productions hierarchically. Lower precedence operators (like `+` and `-`) appear higher up in the call tree (`parseExpression`), while higher precedence operators (like `*`, `/`) appear deeper in the tree (`parseTerm`), followed by exponentiation and primary literals.

### Q5: What is Three-Address Code (TAC)?
**Answer**:
Three-Address Code is an intermediate representation where each instruction has at most one operator and at most three address references (two source operands and one destination operand), taking the general form `x = y op z`.

### Q6: What are Quadruples and Triples?
**Answer**:
- **Quadruple**: A record with 4 fields: `(op, arg1, arg2, result)`.
- **Triple**: A record with 3 fields: `(op, arg1, arg2)`, where intermediate results are referred to by the index/position of the generating instruction rather than explicit named temporaries.

### Q7: What optimizations are performed in this compiler?
**Answer**:
1. **Constant Folding**: Pre-evaluating constant expressions at compile time.
2. **Algebraic Simplification / Strength Reduction**: Simplifying operations using mathematical identities ($x+0=x$, $x\times 1=x$).
3. **Common Subexpression Elimination (CSE)**: Detecting previously computed subexpressions and reusing the stored result.
4. **Copy Propagation & Dead Code Elimination**: Removing redundant temporary variables.

### Q8: What is the purpose of the Symbol Table?
**Answer**:
The Symbol Table is a centralized data structure used across all phases of the compiler to store information about source program identifiers, such as their type, memory offset/allocation, initialization status, and scope.

### Q9: How are registers allocated during Target Code Generation?
**Answer**:
The compiler maintains **Register Descriptors** (`registerDescriptor[i]`) tracking which variable is currently resident in which physical/virtual register (`R0` through `R5`). If all registers are full, a register is spilled back into memory via a `STORE` instruction.
