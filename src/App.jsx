import { ReactFlow, ReactFlowProvider, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/**
 * Funnel Builder v10 — scaffold
 * Confirms Vite + React + Tailwind v4 + xyflow are wired correctly.
 * Next pass: port Topbar/ContextBar/Sidebar from funnel-v9.html.
 */
export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-surface-cool overflow-hidden">
      {/* Placeholder topbar — will be replaced by ported <Topbar /> next */}
      <header className="h-12 shrink-0 flex items-center px-4 border-b border-line bg-surface">
        <span className="text-sm font-semibold text-ink">Funnel Builder</span>
        <span className="ml-2 text-xs text-ink-soft">v10 · xyflow scaffold</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-good live-dot" />
          dev preview
        </span>
      </header>

      {/* Empty xyflow canvas — provider in place so hooks work */}
      <main className="flex-1 min-h-0">
        <ReactFlowProvider>
          <ReactFlow
            nodes={[]}
            edges={[]}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} color="#E5E7EB" />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </main>
    </div>
  )
}
