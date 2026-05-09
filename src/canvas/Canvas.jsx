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

import { createPortal } from 'react-dom';

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
  MenuItem,
  MenuDivider,
  FileIcon,
  Cart,
  TrendUp,
  Workflow,
  Bars,
} from '../App.jsx';

import { nodesToFlow, edgesToFlow, flowToNode, flowToEdge } from './util/transform.js';
import { dagreLayout } from './util/layout.js';
import { CanvasContext } from './util/canvas-context.js';
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
  const [edges, setEdges, onEdgesChangeXY] = useEdgesState(edgesToFlow(initial.edges, initial.nodes));
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
    setEdges(edgesToFlow(s.edges, s.nodes));
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

  const removeEdgeById = useCallback((edgeId) => {
    setEdges((es) => es.filter((e) => e.id !== edgeId));
    setSelectedEdgeId(null);
  }, [setEdges]);

  // Edge-insertion picker — opens at the edge midpoint and lets the user
  // choose Page / Checkout / Upsell / Condition / A-B test. Same UX as the
  // old Canvas.
  const [insertPicker, setInsertPicker] = useState(null);
  const onEdgeInsert = useCallback((edgeId, flowX, flowY) => {
    // flowX/flowY are already in flow coordinates (PathStatsEdge passes labelX/labelY).
    // Convert to screen coordinates for popover positioning.
    const vp = rf.getViewport();
    const screenX = flowX * vp.zoom + vp.x;
    const screenY = flowY * vp.zoom + vp.y;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setInsertPicker({
      edgeId,
      screenX: rect.left + screenX,
      screenY: rect.top + screenY,
      worldX: flowX,
      worldY: flowY,
    });
  }, [rf]);

  const insertPageNode = useCallback((pageType, defaults) => {
    if (!insertPicker) return;
    const { worldX, worldY } = insertPicker;
    const id = pageType + '-' + Date.now();
    const w = NODE_W.page;
    const newNode = {
      id,
      type: 'page',
      position: {
        x: Math.round((worldX - w / 2) / 10) * 10,
        y: Math.round((worldY - 80) / 10) * 10,
      },
      data: {
        pageType,
        title: defaults.title,
        path: defaults.path,
        status: 'draft',
        visitors: 0,
        conversions: 0,
        rate: null,
      },
    };
    setNodes((ns) => [...ns, newNode]);
    setSelectedNodeId(id);
    setInsertPicker(null);
  }, [insertPicker, setNodes]);

  const insertLogicNode = useCallback((kind) => {
    if (!insertPicker) return;
    const { worldX, worldY } = insertPicker;

    const id = 'logic-' + Date.now();
    const w = NODE_W.logic, hLogic = NODE_H.logic;
    const newNode = {
      id,
      type: 'logic',
      position: { x: worldX - w / 2, y: worldY - hLogic / 2 },
      data: {
        kind,
        title: kind === 'condition' ? 'Untitled condition' : 'Untitled A/B test',
      },
    };

    // Drop the card at the cursor with NO automatic connections — neither
    // the input edge nor the Y/N (or A/B) outputs. The user wires every
    // edge themselves so each branch is intentional and can be moved or
    // disconnected without fighting an auto-created line. The originating
    // edge is left intact; if the user wants to splice the new card into
    // it, they delete the old edge and drag the new one through the card.
    setNodes((ns) => [...ns, newNode]);
    setSelectedNodeId(id);
    setInsertPicker(null);
  }, [insertPicker, setNodes]);

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

  // Mode + callbacks flow through CanvasContext rather than living inside
  // node.data / edge.data — see canvas-context.js for the rationale.
  const canvasCtx = useMemo(
    () => ({
      mode,
      onRemoveNode: removeNodeById,
      onChangeSource: changeSource,
      onRemoveEdge: removeEdgeById,
      onInsertEdge: onEdgeInsert,
      sourceTargets,
      outgoingCounts,
    }),
    [mode, removeNodeById, changeSource, removeEdgeById, onEdgeInsert, sourceTargets, outgoingCounts],
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
          es.map((e, i) => {
            if (i !== idx) return e;
            // Only re-route to a branch handle if the source is a logic node
            // (which has 'yes'/'no'/'a'/'b' handles). For page/source
            // origins, setting sourceHandle to a non-existent id makes xyflow
            // drop the edge entirely. data.branch is still set so the Y/N/A/B
            // badge renders near the destination — the branch becomes a
            // visual marker, which matches the original Canvas's behaviour.
            const fromNode = nodes.find((n) => n.id === e.source);
            const next = { ...e, data: { ...(e.data || {}), branch } };
            if (fromNode?.type === 'logic') {
              next.sourceHandle = branch;
            }
            return next;
          }),
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

  // ───────────────────────── Drop-target highlighting ─────────────────────────
  // While the user drags from a source handle, xyflow fires onConnectStart.
  // We track a "connecting" flag + the candidate target node id so we can
  // pulse a brand-coloured ring on it. Sources can't receive connections —
  // isValidConnection enforces that and the ring won't draw on a source.
  const [connectFromId, setConnectFromId] = useState(null);
  const onConnectStart = useCallback((_, { nodeId }) => {
    setConnectFromId(nodeId);
  }, []);
  const isValidConnection = useCallback((c) => {
    // Sources are entry points, can't receive. Self-loops don't make sense
    // in a funnel. Anything else is fair game — including a second connection
    // between the same pair when a logic node re-routes its secondary branch.
    if (c.source === c.target) return false;
    const targetNode = nodes.find((n) => n.id === c.target);
    if (targetNode?.type === 'source') return false;
    return true;
  }, [nodes]);

  // ───────────────────────── Connections ─────────────────────────
  // When user drags from a handle to another node's target handle, xyflow
  // calls onConnect with { source, target, sourceHandle, targetHandle }.
  const onConnect = useCallback(
    (params) => {
      const fromNode = nodes.find((n) => n.id === params.source);
      let sourceHandle = params.sourceHandle || 'out';
      let branch = null;
      if (fromNode?.type === 'logic') {
        // Honour the handle the user actually grabbed — branch is fully
        // identified by sourceHandle on logic nodes ('yes'/'no'/'a'/'b').
        const k = LOGIC_KIND[fromNode.data?.kind] || LOGIC_KIND.condition;
        const valid = [k.primaryBranch, k.secondaryBranch];
        if (!valid.includes(sourceHandle)) sourceHandle = k.primaryBranch;
        branch = sourceHandle;
      }
      // Default volume — half of source's visitorsNum if it's a source node.
      const defaultVolume =
        fromNode?.type === 'source'
          ? Math.round((fromNode.data.visitorsNum || 1000) * 0.5)
          : 100;
      setEdges((es) => {
        // For logic-node sources, replace any existing edge from the same
        // handle (yes/no/a/b → re-route). For page/source origins, allow
        // multiple outgoing edges to different targets but dedupe on exact
        // (source, target) pair so we don't stack identical lines.
        let next = es;
        if (fromNode?.type === 'logic') {
          next = es.filter(
            (e) => !(e.source === params.source && e.sourceHandle === sourceHandle),
          );
        } else if (
          es.some((e) => e.source === params.source && e.target === params.target)
        ) {
          return es;
        }
        const newEdge = {
          id: `e-${params.source}-${params.target}-${Date.now()}`,
          source: params.source,
          target: params.target,
          type: 'pathStats',
          sourceHandle,
          targetHandle: 'in',
          data: { volume: defaultVolume, branch, label: null },
        };
        return [...next, newEdge];
      });
    },
    [nodes, setEdges],
  );

  // onConnectEnd fallback — even if the cursor wasn't within the snap radius
  // of a target handle, if the user released the drag while hovering over a
  // node, treat that as "connect to this node". DOM walk-up to find the
  // node, then run the same logic onConnect uses. Declared after onConnect
  // so its dependency array doesn't hit the temporal dead zone.
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      setConnectFromId(null);
      if (connectionState?.toNode) return; // xyflow already created the edge
      const fromNodeId = connectionState?.fromNode?.id;
      const fromHandleId = connectionState?.fromHandle?.id || 'out';
      if (!fromNodeId) return;
      const target = (event?.target instanceof Element ? event.target : null)?.closest?.(
        '.react-flow__node',
      );
      if (!target) return;
      const toNodeId = target.dataset?.id;
      if (!toNodeId || toNodeId === fromNodeId) return;
      const targetNode = nodes.find((n) => n.id === toNodeId);
      if (!targetNode || targetNode.type === 'source') return;
      onConnect({
        source: fromNodeId,
        target: toNodeId,
        sourceHandle: fromHandleId,
        targetHandle: 'in',
      });
    },
    [nodes, onConnect],
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
    if (!nodes.length) return;
    const sizeFor = (n) => ({
      width: NODE_W[n.type] || n.width || 240,
      height: getNodeH({ type: n.type, data: n.data }, mode),
    });
    const laidOut = dagreLayout(nodes, edges, { sizeFor, hGap: 200, vGap: 90 });
    setNodes(laidOut);
    // fit-to-view after the layout settles so the user sees the result framed
    setTimeout(() => rf.fitView({ padding: 0.18, duration: 320 }), 50);
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
        <CanvasContext.Provider value={canvasCtx}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeXY}
            onEdgesChange={onEdgesChangeXY}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            isValidConnection={isValidConnection}
            onSelectionChange={handleSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            snapToGrid
            snapGrid={[10, 10]}
            minZoom={0.4}
            maxZoom={2}
            connectionRadius={200}
            fitView={false}
            nodesDraggable={mode === 'build' || mode === 'analyse'}
            nodesConnectable={mode === 'build'}
            edgesFocusable={mode === 'build'}
            deleteKeyCode={['Backspace', 'Delete']}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
            className={connectFromId ? 'is-connecting' : ''}
          />
        </CanvasContext.Provider>
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

      {/* insert-step picker — opens at edge midpoint when user clicks the +
         hover chip on an edge. Same UX as the old Canvas. */}
      {insertPicker &&
        createPortal(
          <div
            className="fixed inset-0 z-[9990]"
            onClick={() => setInsertPicker(null)}
          >
            <div
              className="absolute bg-white rounded-lg shadow-menu border border-line p-1"
              style={{
                left: insertPicker.screenX,
                top: insertPicker.screenY,
                transform: 'translate(-50%, 8px)',
                minWidth: 180,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                Insert step here
              </div>
              <MenuItem
                icon={<FileIcon size={13} />}
                label="Page"
                onClick={() =>
                  insertPageNode('custom', { title: 'New page', path: '/new-page' })
                }
              />
              <MenuItem
                icon={<Cart size={13} />}
                label="Checkout"
                onClick={() =>
                  insertPageNode('checkout', { title: 'Checkout', path: '/checkout' })
                }
              />
              <MenuItem
                icon={<TrendUp size={13} />}
                label="Upsell"
                onClick={() =>
                  insertPageNode('upsell', { title: 'Upsell offer', path: '/upsell' })
                }
              />
              <MenuDivider />
              <MenuItem
                icon={<Workflow size={13} />}
                label="Condition"
                onClick={() => insertLogicNode('condition')}
              />
              <MenuItem
                icon={<Bars size={13} />}
                label="A/B test"
                onClick={() => insertLogicNode('abtest')}
              />
            </div>
          </div>,
          document.body,
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
