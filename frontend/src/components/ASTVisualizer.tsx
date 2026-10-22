import React, { useState } from 'react'
import { ASTNode, ASTNodeType } from '../compiler/types'
import { Network, Terminal, BookOpen } from 'lucide-react'

interface ASTVisualizerProps {
  root: ASTNode | null
  asciiTree: string
  derivationLog: string[]
}

const NodeView: React.FC<{ node: ASTNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const getNodeColor = (type: ASTNodeType) => {
    switch (type) {
      case ASTNodeType.PROGRAM:
        return 'bg-slate-800 text-slate-200 border-slate-700'
      case ASTNodeType.ASSIGNMENT_STMT:
        return 'bg-pink-950/60 text-pink-300 border-pink-700/50'
      case ASTNodeType.BINARY_OP:
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50'
      case ASTNodeType.UNARY_OP:
        return 'bg-violet-950/60 text-violet-300 border-violet-700/50'
      case ASTNodeType.NUM_LITERAL:
        return 'bg-amber-950/60 text-amber-300 border-amber-700/50'
      case ASTNodeType.VARIABLE:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  const renderLabel = () => {
    switch (node.type) {
      case ASTNodeType.PROGRAM:
        return <span className="font-semibold">Program Root</span>
      case ASTNodeType.ASSIGNMENT_STMT:
        return (
          <span>
            Assignment: <strong className="text-white">{node.name}</strong> =
          </span>
        )
      case ASTNodeType.EXPR_STMT:
        return <span>Expression Statement</span>
      case ASTNodeType.BINARY_OP:
        return (
          <span>
            Binary Op <strong className="text-white text-base">'{node.op}'</strong>
          </span>
        )
      case ASTNodeType.UNARY_OP:
        return (
          <span>
            Unary Op <strong className="text-white">'{node.op}'</strong>
          </span>
        )
      case ASTNodeType.NUM_LITERAL:
        return (
          <span>
            Num: <strong className="text-white font-mono">{node.rawValue}</strong>
          </span>
        )
      case ASTNodeType.VARIABLE:
        return (
          <span>
            Var: <strong className="text-white font-mono">{node.name}</strong>
          </span>
        )
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
        className={`px-3 py-1.5 rounded-lg border text-xs shadow-md font-sans text-center transition hover:scale-105 ${getNodeColor(
          node.type
        )} ${isRoot ? 'ring-2 ring-indigo-500/50' : ''}`}
      >
        <div className="flex items-center gap-1.5 justify-center">
          {renderLabel()}
          {node.inferredType && node.inferredType !== 'pending' && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/40 text-slate-300">
              {node.inferredType}
            </span>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical connecting line */}
          <div className="w-px h-3 bg-slate-700"></div>

          {/* Branch container */}
          <div className="flex justify-center items-start gap-4 pt-1 relative">
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'visual'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Interactive Node Tree</span>
          </button>
          <button
            onClick={() => setViewMode('ascii')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'ascii'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>ASCII Console Tree</span>
          </button>
          <button
            onClick={() => setViewMode('derivation')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'derivation'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>CFG Derivations</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'visual' ? (
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-x-auto min-h-[300px] flex items-center justify-center">
          {root ? (
            <NodeView node={root} isRoot={true} />
          ) : (
            <div className="text-slate-500 text-xs">No AST available</div>
          )}
        </div>
      ) : viewMode === 'ascii' ? (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
          {asciiTree || '(Tree is empty)'}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <div className="text-xs font-semibold text-slate-300 mb-2">
            Context-Free Grammar (CFG) Rules Applied in Top-Down Recursive Descent:
          </div>
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            {derivationLog.map((rule, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-slate-900 border border-slate-800/80 text-slate-300 flex items-start gap-2"
              >
                <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
