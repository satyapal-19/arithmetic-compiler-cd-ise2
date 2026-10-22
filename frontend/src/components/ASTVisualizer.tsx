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
            {node.name} <span className="text-zinc-400 font-bold">=</span>
          </span>
        )
      case ASTNodeType.EXPR_STMT:
        return <span>Expr</span>
      case ASTNodeType.BINARY_OP:
        return <span className="font-mono font-bold text-sm">'{node.op}'</span>
      case ASTNodeType.UNARY_OP:
        return <span className="font-mono font-bold text-sm">'{node.op}'</span>
      case ASTNodeType.NUM_LITERAL:
        return <span className="font-mono font-bold">{node.rawValue}</span>
      case ASTNodeType.VARIABLE:
        return <span className="font-mono font-bold">{node.name}</span>
      default:
        return <span>{node.type}</span>
    }
  }

  const children: ASTNode[] = []
  if (node.children) children.push(...node.children)
  if (node.left) children.push(node.left)
  if (node.right) children.push(node.right)

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <div
        className={`px-3 py-1.5 rounded text-xs font-mono transition border shadow-sm z-10 ${
          isRoot
            ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold ring-2 ring-zinc-400/50'
            : 'bg-zinc-900 text-zinc-100 border-zinc-700 hover:border-zinc-400'
        }`}
      >
        {renderLabel()}
      </div>

      {/* Children & Branch Connectors with Visible Arrows */}
      {children.length === 1 ? (
        <div className="flex flex-col items-center">
          {/* Single child vertical stem with arrow */}
          <div className="w-0.5 h-4 bg-zinc-400"></div>
          <span className="text-[9px] text-zinc-300 -mt-1 mb-0.5 select-none leading-none">▼</span>
          <NodeView node={children[0]} />
        </div>
      ) : children.length > 1 ? (
        <div className="flex flex-col items-center w-full">
          {/* Parent center drop stem */}
          <div className="w-0.5 h-3.5 bg-zinc-400"></div>

          {/* Children container with connecting horizontal bar */}
          <div className="flex justify-center items-start w-full">
            {children.map((child, idx) => {
              const isFirst = idx === 0
              const isLast = idx === children.length - 1

              return (
                <div
                  key={child.id || idx}
                  className="relative flex flex-col items-center px-2 sm:px-4"
                >
                  {/* Horizontal branch bar spanning from center to center */}
                  {isFirst && (
                    <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-zinc-400"></div>
                  )}
                  {isLast && (
                    <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-zinc-400"></div>
                  )}
                  {!isFirst && !isLast && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-400"></div>
                  )}

                  {/* Vertical drop stem to this child */}
                  <div className="w-0.5 h-3.5 bg-zinc-400"></div>
                  {/* Arrowhead pointing directly to child node */}
                  <span className="text-[9px] text-zinc-300 -mt-1 mb-0.5 select-none leading-none">
                    ▼
                  </span>

                  {/* Child Node */}
                  <NodeView node={child} />
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
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
    <div className="flex flex-col gap-3 font-mono text-xs">
      {/* Sub-toolbar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setViewMode('visual')}
          className={`px-2.5 py-1 rounded text-xs transition border ${
            viewMode === 'visual'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          Parse Tree (Visual & Arrows)
        </button>
        <button
          onClick={() => setViewMode('ascii')}
          className={`px-2.5 py-1 rounded text-xs transition border ${
            viewMode === 'ascii'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          ASCII Tree (Console)
        </button>
        <button
          onClick={() => setViewMode('derivation')}
          className={`px-2.5 py-1 rounded text-xs transition border ${
            viewMode === 'derivation'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          CFG Derivation Rules ({derivationLog.length})
        </button>
      </div>

      {/* Content */}
      {viewMode === 'visual' ? (
        <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto min-h-[320px] flex items-center justify-center">
          {root ? (
            <NodeView node={root} isRoot={true} />
          ) : (
            <div className="text-zinc-500 text-xs">No Parse Tree available</div>
          )}
        </div>
      ) : viewMode === 'ascii' ? (
        <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 overflow-x-auto whitespace-pre leading-relaxed">
          {asciiTree || '(Tree is empty)'}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
          <div className="text-xs text-zinc-300 font-bold">
            Module 2: Top-Down Recursive Descent Derivation Steps:
          </div>
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
