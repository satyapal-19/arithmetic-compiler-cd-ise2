import React, { useState } from 'react'
import { ASTNode, ASTNodeType } from '../compiler/types'

interface ASTVisualizerProps {
  root: ASTNode | null
  asciiTree: string
  derivationLog: string[]
}

const NodeView: React.FC<{ node: ASTNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const renderLabel = () => {
    switch (node.type) {
      case ASTNodeType.PROGRAM:
        return <span>Program</span>
      case ASTNodeType.ASSIGNMENT_STMT:
        return (
          <span>
            {node.name} <span className="text-zinc-400">=</span>
          </span>
        )
      case ASTNodeType.EXPR_STMT:
        return <span>Expr</span>
      case ASTNodeType.BINARY_OP:
        return <span className="font-mono font-bold text-sm">'{node.op}'</span>
      case ASTNodeType.UNARY_OP:
        return <span className="font-mono font-bold text-sm">'{node.op}'</span>
      case ASTNodeType.NUM_LITERAL:
        return <span className="font-mono">{node.rawValue}</span>
      case ASTNodeType.VARIABLE:
        return <span className="font-mono">{node.name}</span>
      default:
        return <span>{node.type}</span>
    }
  }

  const children: ASTNode[] = []
  if (node.children) children.push(...node.children)
  if (node.left) children.push(node.left)
  if (node.right) children.push(node.right)

  return (
    <div className="flex flex-col items-center my-1.5">
      <div
        className={`px-3 py-1 rounded text-xs font-mono transition border ${
          isRoot
            ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
            : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-zinc-700'
        }`}
      >
        {renderLabel()}
      </div>

      {children.length > 0 && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical connecting line */}
          <div className="w-px h-2.5 bg-zinc-800"></div>

          {/* Branch container */}
          <div className="flex justify-center items-start gap-3 pt-1">
            {children.map((child, idx) => (
              <div key={child.id || idx} className="flex flex-col items-center">
                <NodeView node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const ASTVisualizer: React.FC<ASTVisualizerProps> = ({
  root,
  asciiTree,
  derivationLog,
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'ascii' | 'derivation'>('visual')

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-toolbar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setViewMode('visual')}
          className={`px-2.5 py-1 rounded text-xs font-mono transition border ${
            viewMode === 'visual'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          Node Tree
        </button>
        <button
          onClick={() => setViewMode('ascii')}
          className={`px-2.5 py-1 rounded text-xs font-mono transition border ${
            viewMode === 'ascii'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          ASCII Tree
        </button>
        <button
          onClick={() => setViewMode('derivation')}
          className={`px-2.5 py-1 rounded text-xs font-mono transition border ${
            viewMode === 'derivation'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-medium'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          CFG Rules ({derivationLog.length})
        </button>
      </div>

      {/* Content */}
      {viewMode === 'visual' ? (
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto min-h-[260px] flex items-center justify-center">
          {root ? (
            <NodeView node={root} isRoot={true} />
          ) : (
            <div className="text-zinc-500 font-mono text-xs">No AST available</div>
          )}
        </div>
      ) : viewMode === 'ascii' ? (
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
          {asciiTree || '(Tree is empty)'}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="text-xs font-mono text-zinc-400 mb-2">Top-Down Parsing Derivations:</div>
          <div className="flex flex-col gap-1 font-mono text-xs">
            {derivationLog.map((rule, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 flex items-start gap-2"
              >
                <span className="text-zinc-500 shrink-0">{idx + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
