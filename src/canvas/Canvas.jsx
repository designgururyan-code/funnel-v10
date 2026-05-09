import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
} from '@xyflow/react';

import {
  DEMO_STATES,
  NODE_W,
  NODE_H,
  getNodeH,
  LOGIC_KIND,
  PAGE_TYPE,
  EmptyCanvas,
  ViewSwitcher,
  ZoomControls,
  ExportFunnelButton,
} from '../App.jsx';

import { nodesToFlow, edgesToFlow, flowToNode, flowToEdge } from './util/transform.js';
import PageNode from './nodes/PageNode.jsx';
import SourceNode from './nodes/SourceNode.jsx';
import LogicNode from './nodes/LogicNode.jsx';
import PathStatsEdge from './edges/PathStatsEdge.jsx';

const nodeTypes = { page: PageNode, source: SourceNode, logic: LogicNode };
const edgeTypes = { pathStats: PathStatsEdge };

const defaultEdgeOptions = { type: 'pathStats', animated: false };

/**
 * Inner canvas — must live inside <ReactFlowProvider>. Owns nodes/edges in
 * xyflow format, exposes the imperative API the old Canvas had so the
 * Inspector + Sidebar continue to work unchanged.
 */
function CanvasInner({
  mode,
  demoState,
  onDemoStateChange,
  onJumpToTemplates,
  onJumpToPages,
  onSelectionChange,
  canvasApiRef,
  onNodesChange: onNodesChangeProp,
}) {
  const initial = DEMO_STATES[demoState] || DEMO_STATES.empty;

  const [nodes, setNodes, onNodesChangeXY] = useNodesState(nodesToFlow(initial.nodes));
  const [edges, setEdges, onEdgesChangeXY] = useEdgesState(edgesToFlow(initial.edges));
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  const rf = useReactFlow();
  const wrapperRef = useRef(null);

  /* mode-aware node sizing — old code has separate heights for build vs analyse.
     We can't change xyflow's internal node measurements after layout, but the
     visual height comes from the node's own CSS (its rendered height). xyflow
     measures it on render. So no manual sizing pass is needed. */

  // ───────────────────────── Demo-state load ─────────────────────────
  // When demoState string changes, replace nodes + edges from the preset and
  // fit the view. First mount stays at 100% zoom centered on the bbox; later
  // switches use fitView so the user can compare framings.
  const firstMountRef = useRef(true);
  useEffect(() => {
    const s = DEMO_STATES[demoState] || DEMO_STATES.empty;
    setNodes(nodesToFlow(s.nodes));
    setEdges(edgesToFlow(s.edges));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    const t = setTimeout(() => {
      if (!s.nodes.length) return;
      if (firstMountRef.current) {
        firstMountRef.current = false;
        rf.setViewport({ x: 0, y: 0, zoom: 1 });
        // center on bbox at 100%
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        s.nodes.forEach((n) => {
          const w = NODE_W[n.type], h = getNodeH(n, mode);
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x + w);
          maxY = Math.max(maxY, n.y + h);
        });
        const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
        const el = wrapperRef.current;
        if (el) {
          rf.setViewport({
            x: el.clientWidth / 2 - cx,
            y: el.clientHeight / 2 - cy,
            zoom: 1,
          });
        }
      } else {
        rf.fitView({ padding: 0.18, duration: 320 });
      }
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoState]);

  // ───────────────────────── Inject mode + callbacks into node data ─────────────────────────
  // Node components read mode and call back via data._onRemove / data._onChangeSource.
  // We thread them in through node.data so xyflow's prop pipeline carries them.
  const removeNodeById = useCallback((nodeId) => {
    setNodes((ns) => ns.filter((n) => n.id !== nodeId));
    setEdges((es) => es.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const changeSource = useCallback((nodeId, newSrcId) => {
    setNodes((ns) =>
      ns.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, src: newSrcId } } : n,
      ),
    );
  }, [setNodes]);

  // Build a map of source-id → derived target info for SourceNode "To X · Y%".
  const sourceTargets = useMemo(() => {
    const map = {};
    edges.forEach((e) => {
      const fromNode = nodes.find((n) => n.id === e.source);
      if (fromNode?.type !== 'source') return;
      const toNode = nodes.find((n) => n.id === e.target);
      if (!toNode) return;
      const num = fromNode.data.visitorsNum || 1;
      const vol = e.data?.volume || 0;
      const branch = {
        title: toNode.data.title,
        rate: Math.round((vol / num) * 100),
        volume: vol,
      };
      if (!map[e.source]) {
        map[e.source] = { title: toNode.data.title, rate: branch.rate, count: 1, branches: [branch] };
      } else {
        map[e.source].count += 1;
        map[e.source].branches.push(branch);
      }
    });
    return map;
  }, [nodes, edges]);

  // Outgoing-count per logic node (drives the "0 of 2 branches" meter).
  const outgoingCounts = useMemo(() => {
    const map = {};
    edges.forEach((e) => {
      map[e.source] = (map[e.source] || 0) + 1;
    });
    return map;
  }, [edges]);

  // Decorate node.data with the live callbacks/mode/derived bits the
  // node components need. Stable references keep xyflow's diff happy.
  const decoratedNodes = useMemo(() => {
    return nodes.map((n) => {
      const decoration = {
        _mode: mode,
        _onRemove: removeNodeById,
      };
      if (n.type === 'source') {
        decoration._target = sourceTargets[n.id];
        decoration._onChangeSource = changeSource;
      } else if (n.type === 'logic') {
        decoration._outgoingCount = outgoingCounts[n.id] || 0;
      }
      return { ...n, data: { ...n.data, ...decoration } };
    });
  }, [nodes, mode, sourceTargets, outgoingCounts, removeNodeById, changeSource]);

  // Thread mode into edge.data so PathStatsEdge can switch its rendering
  // (mid-edge stat pill is Analyse-only).
  const decoratedEdges = useMemo(
    () => edges.map((e) => ({ ...e, data: { ...(e.data || {}), _mode: mode } })),
    [edges, mode],
  );

  // ───────────────────────── Selection ─────────────────────────
  // xyflow lets us track selection through onSelectionChange. We push back to
  // App via the same envelope shape it had before:
  //   - a node (our format), or
  //   - { __kind: 'edge', edge, edgeIdx, fromNode, toNode }
  useEffect(() => {
    if (!onSelectionChange) return;
    if (selectedEdgeId) {
      const idx = edges.findIndex((e) => e.id === selectedEdgeId);
      if (idx !== -1) {
        const e = edges[idx];
        const fromN = nodes.find((n) => n.id === e.source);
        const toN = nodes.find((n) => n.id === e.target);
        onSelectionChange({
          __kind: 'edge',
          edge: flowToEdge(e),
          edgeIdx: idx,
          fromNode: fromN ? flowToNode(fromN) : null,
          toNode: toN ? flowToNode(toN) : null,
        });
        return;
      }
    }
    if (selectedNodeId) {
      const n = nodes.find((x) => x.id === selectedNodeId);
      onSelectionChange(n ? flowToNode(n) : null);
      return;
    }
    onSelectionChange(null);
  }, [selectedNodeId, selectedEdgeId, nodes, edges, onSelectionChange]);

  const handleSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }) => {
    if (selEdges && selEdges.length > 0) {
      setSelectedNodeId(null);
      setSelectedEdgeId(selEdges[0].id);
    } else if (selNodes && selNodes.length > 0) {
      setSelectedEdgeId(null);
      setSelectedNodeId(selNodes[0].id);
    } else {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, []);

  // ───────────────────────── Push our-format nodes to App ─────────────────────────
  // App.jsx + Sidebar derive "what's in the funnel" from this. They expect
  // OUR format (n.x, n.y flat) so we transform on the way out.
  useEffect(() => {
    if (typeof onNodesChangeProp === 'function') {
      onNodesChangeProp(nodes.map((n) => flowToNode(n)));
    }
  }, [nodes, onNodesChangeProp]);

  // ───────────────────────── Imperative API ─────────────────────────
  useEffect(() => {
    if (!canvasApiRef) return;
    canvasApiRef.current = {
      updateNodeData: (nodeId, patch) =>
        setNodes((ns) =>
          ns.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n,
          ),
        ),
      removeNode: (nodeId) => {
        removeNodeById(nodeId);
      },
      duplicateNode: (nodeId) => {
        setNodes((ns) => {
          const orig = ns.find((n) => n.id === nodeId);
          if (!orig) return ns;
          const newId = orig.type + '-' + Date.now();
          const copy = {
            ...orig,
            id: newId,
            position: { x: orig.position.x + 40, y: orig.position.y + 40 },
            data: { ...orig.data, title: (orig.data.title || '') + ' copy' },
          };
          setSelectedNodeId(newId);
          return [...ns, copy];
        });
      },
      deselect: () => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setNodes((ns) => ns.map((n) => (n.selected ? { ...n, selected: false } : n)));
        setEdges((es) => es.map((e) => (e.selected ? { ...e, selected: false } : e)));
      },
      removeEdge: (idx) =>
        setEdges((es) => es.filter((_, i) => i !== idx)),
      addEdgeBranch: (idx, branch) =>
        setEdges((es) =>
          es.map((e, i) =>
            i === idx
              ? {
                  ...e,
                  data: { ...(e.data || {}), branch },
                  sourceHandle: branch || e.sourceHandle,
                }
              : e,
          ),
        ),
      updateEdge: (idx, patch) =>
        setEdges((es) =>
          es.map((e, i) =>
            i === idx
              ? { ...e, data: { ...(e.data || {}), ...patch } }
              : e,
          ),
        ),
      addNode: ({ type, data, x, y }) => {
        const newId = (type || 'page') + '-' + Date.now();
        const def =
          type === 'source'
            ? { src: 'fb', visitorsNum: 0 }
            : type === 'logic'
            ? { kind: 'condition', title: 'Untitled condition' }
            : { title: 'New page', path: '/new', kind: 'landing' };
        const vp = rf.getViewport();
        const el = wrapperRef.current;
        const cx = x != null ? x : el ? (-vp.x + el.clientWidth / 2) / vp.zoom - (NODE_W[type || 'page'] || 240) / 2 : 0;
        const cy = y != null ? y : el ? (-vp.y + el.clientHeight / 2) / vp.zoom - 80 : 0;
        const node = {
          id: newId,
          type: type || 'page',
          position: { x: cx, y: cy },
          data: { ...def, ...(data || {}) },
        };
        setNodes((ns) => [...ns, node]);
        setSelectedNodeId(newId);
      },
      removeNodeByTitle: (title) => {
        setNodes((ns) => {
          const match = ns.find((n) => n.data && n.data.title === title);
          if (!match) return ns;
          setEdges((es) =>
            es.filter((e) => e.source !== match.id && e.target !== match.id),
          );
          setSelectedNodeId((s) => (s === match.id ? null : s));
          return ns.filter((n) => n.id !== match.id);
        });
      },
      getNodes: () => nodes.map((n) => flowToNode(n)),
      getOutgoingEdges: (nodeId) =>
        edges
          .map((e, i) => ({ ...flowToEdge(e), edgeIdx: i }))
          .filter((e) => e.from === nodeId),
      getIncomingEdges: (nodeId) =>
        edges
          .map((e, i) => ({ ...flowToEdge(e), edgeIdx: i }))
          .filter((e) => e.to === nodeId),
      panToNodeByTitle: (title) => {
        const match = nodes.find((n) => n.data && n.data.title === title);
        if (!match) return;
        const w = NODE_W[match.type] || 240;
        const h = getNodeH({ type: match.type, data: match.data }, mode);
        const cx = match.position.x + w / 2;
        const cy = match.position.y + h / 2;
        rf.setCenter(cx, cy, { zoom: rf.getZoom(), duration: 320 });
        setSelectedNodeId(match.id);
      },
    };
  }, [canvasApiRef, nodes, edges, mode, rf, setNodes, setEdges, removeNodeById]);

  // ───────────────────────── Connections ─────────────────────────
  // When user drags from a handle to another node's target handle, xyflow
  // calls onConnect with { source, target, sourceHandle, targetHandle }.
  const onConnect = useCallback(
    (params) => {
      // For logic-node sources, override sourceHandle if the user happened to
      // drag from the same handle twice — we want first connection = primary,
      // second = secondary.
      const fromNode = nodes.find((n) => n.id === params.source);
      let sourceHandle = params.sourceHandle;
      let branch = null;
      if (fromNode?.type === 'logic') {
        const k = LOGIC_KIND[fromNode.data?.kind] || LOGIC_KIND.condition;
        const outgoingFrom = edges.filter((e) => e.source === params.source);
        if (outgoingFrom.length >= 2) return; // no third branch allowed
        if (outgoingFrom.length === 0) {
          sourceHandle = k.primaryBranch;
          branch = k.primaryBranch;
        } else {
          // already have one — assign the missing branch to the new edge
          const usedBranches = new Set(
            outgoingFrom.map((e) => e.sourceHandle).filter(Boolean),
          );
          const candidate = !usedBranches.has(k.primaryBranch)
            ? k.primaryBranch
            : k.secondaryBranch;
          sourceHandle = candidate;
          branch = candidate;
        }
      }
      // Default volume — half of source's visitorsNum if it's a source node.
      const defaultVolume =
        fromNode?.type === 'source'
          ? Math.round((fromNode.data.visitorsNum || 1000) * 0.5)
          : 100;
      setEdges((es) => {
        // dedupe — refuse a second edge between the same pair
        if (es.find((e) => e.source === params.source && e.target === params.target))
          return es;
        const newEdge = {
          id: `e-${params.source}-${params.target}-${Date.now()}`,
          source: params.source,
          target: params.target,
          type: 'pathStats',
          sourceHandle: sourceHandle || undefined,
          data: { volume: defaultVolume, branch, label: null },
        };
        return [...es, newEdge];
      });
    },
    [nodes, edges, setEdges],
  );

  // ───────────────────────── Drag-and-drop from sidebar ─────────────────────────
  const [dragOver, setDragOver] = useState(false);
  const onDragOver = (e) => {
    if (!e.dataTransfer.types.includes('application/x-funnel-node')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!dragOver) setDragOver(true);
  };
  const onDragLeave = (e) => {
    if (e.currentTarget === e.target) setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData('application/x-funnel-node');
    if (!raw) return;
    let payload;
    try { payload = JSON.parse(raw); } catch { return; }
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const id = payload.kind + '-' + Date.now();
    let newNode;
    if (payload.kind === 'page') {
      newNode = {
        id,
        type: 'page',
        position: {
          x: Math.round((pos.x - NODE_W.page / 2) / 10) * 10,
          y: Math.round((pos.y - 80) / 10) * 10,
        },
        data: {
          pageType: payload.pageType || 'custom',
          title: payload.title || 'New page',
          path: payload.path || '/new-page',
          status: payload.status || 'draft',
          visitors: 0, conversions: 0, rate: null,
        },
      };
    } else if (payload.kind === 'source') {
      newNode = {
        id,
        type: 'source',
        position: {
          x: Math.round((pos.x - NODE_W.source / 2) / 10) * 10,
          y: Math.round((pos.y - 60) / 10) * 10,
        },
        data: {
          src: payload.src || 'fb',
          visitorsNum: payload.visitorsNum || 1000,
          visitorsLabel: payload.visitorsLabel || '1.0k',
        },
      };
    } else {
      return;
    }
    setNodes((ns) => [...ns, newNode]);
    setSelectedNodeId(id);
  };

  // Sidebar "+" Add buttons → addNode via custom event (legacy hook).
  useEffect(() => {
    const onAdd = (e) => {
      const page = e?.detail?.page;
      if (!page) return;
      setNodes((ns) => {
        const id = 'p' + Date.now();
        let x = 200, y = 220;
        if (ns.length) {
          const rightmost = ns.reduce((a, b) => (b.position.x > a.position.x ? b : a));
          x = rightmost.position.x + (NODE_W[rightmost.type] || 260) + 60;
          y = rightmost.position.y;
        }
        return [
          ...ns,
          {
            id,
            type: 'page',
            position: { x, y },
            data: {
              pageType: page.type || 'custom',
              title: page.title,
              path: page.path,
              status: page.status || 'draft',
            },
          },
        ];
      });
    };
    window.addEventListener('sidebar-add-page', onAdd);
    return () => window.removeEventListener('sidebar-add-page', onAdd);
  }, [setNodes]);

  // ───────────────────────── Topbar zoom/fit/layout (Session C will fill these) ─────────────────────────
  const onFit = () => rf.fitView({ padding: 0.18, duration: 320 });
  const onZoomIn = () => rf.zoomIn();
  const onZoomOut = () => rf.zoomOut();
  const onSetZoom = (next) => rf.zoomTo(next);
  const onAutoLayout = () => {
    // Placeholder for Session C — for now, just fit-to-view as a fallback.
    rf.fitView({ padding: 0.18, duration: 320 });
  };
  const [zoomDisplay, setZoomDisplay] = useState(1);
  useEffect(() => {
    // Sync zoomDisplay with viewport.
    const handler = () => setZoomDisplay(rf.getZoom());
    const interval = setInterval(handler, 100);
    return () => clearInterval(interval);
  }, [rf]);

  const isEmpty = demoState === 'empty' && !nodes.length;

  return (
    <main
      ref={wrapperRef}
      className="flex-1 relative overflow-hidden"
      style={{
        backgroundColor: '#FAFCFF',
        touchAction: 'none',
        overscrollBehavior: 'contain',
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* dot grid — same look as old canvas, drawn under xyflow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)',
          backgroundSize: `${18 * zoomDisplay}px ${18 * zoomDisplay}px`,
        }}
      />

      {/* drop-zone overlay */}
      {dragOver && (
        <div
          className="absolute inset-3 z-30 rounded-lg pointer-events-none flex items-center justify-center"
          style={{ border: '2px dashed #006CB5', background: 'rgba(0, 108, 181, 0.04)' }}
        >
          <div className="px-3 py-1.5 rounded-md bg-brand text-white text-[12px] font-semibold shadow-modal">
            Drop here to add to canvas
          </div>
        </div>
      )}

      <ViewSwitcher active={demoState} onChange={onDemoStateChange} />
      {isEmpty && (
        <EmptyCanvas onJumpToTemplates={onJumpToTemplates} onJumpToPages={onJumpToPages} />
      )}

      {!isEmpty && (
        <ReactFlow
          nodes={decoratedNodes}
          edges={decoratedEdges}
          onNodesChange={onNodesChangeXY}
          onEdgesChange={onEdgesChangeXY}
          onConnect={onConnect}
          onSelectionChange={handleSelectionChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          snapToGrid
          snapGrid={[10, 10]}
          minZoom={0.4}
          maxZoom={2}
          fitView={false}
          nodesDraggable={mode === 'build' || mode === 'analyse'}
          nodesConnectable={mode === 'build'}
          edgesFocusable={mode === 'build'}
          deleteKeyCode={['Backspace', 'Delete']}
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        />
      )}

      <ExportFunnelButton />
      {!isEmpty && (
        <ZoomControls
          zoom={zoomDisplay}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
          onAutoLayout={onAutoLayout}
          onSetZoom={onSetZoom}
        />
      )}
    </main>
  );
}

export default function Canvas(props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
