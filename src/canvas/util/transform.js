/**
 * Format adapters between our internal node/edge shape and xyflow's.
 *
 * Our format (in DEMO_STATES + sidebar drag-and-drop):
 *   node: { id, type: 'page'|'source'|'logic', x, y, data: {...} }
 *   edge: { from, to, volume?, branch?, label? }
 *
 * xyflow format:
 *   node: { id, type, position: { x, y }, data: {...} }
 *   edge: { id, source, target, type: 'pathStats', sourceHandle?, targetHandle?, data: {...} }
 */

/**
 * Determine which source handle a logic-node edge should leave from.
 * Logic nodes have two source handles ('yes'/'no' for condition, 'a'/'b' for abtest).
 * The branch field on the edge maps directly to the handle id.
 */
const handleForBranch = (branch) => {
  if (branch === 'yes' || branch === 'no' || branch === 'a' || branch === 'b') return branch;
  return null;
};

export function nodesToFlow(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    data: { ...(n.data || {}) },
  }));
}

export function edgesToFlow(edges) {
  if (!Array.isArray(edges)) return [];
  return edges.map((e, i) => {
    const handle = handleForBranch(e.branch);
    const flow = {
      id: e.id || `e-${e.from}-${e.to}-${i}`,
      source: e.from,
      target: e.to,
      type: 'pathStats',
      data: {
        volume: e.volume ?? 0,
        branch: e.branch || null,
        label: e.label || null,
      },
    };
    if (handle) flow.sourceHandle = handle;
    return flow;
  });
}

export function flowToNode(flowNode) {
  if (!flowNode) return null;
  return {
    id: flowNode.id,
    type: flowNode.type,
    x: flowNode.position?.x ?? 0,
    y: flowNode.position?.y ?? 0,
    data: { ...(flowNode.data || {}) },
  };
}

export function flowToEdge(flowEdge) {
  if (!flowEdge) return null;
  const d = flowEdge.data || {};
  const out = {
    from: flowEdge.source,
    to: flowEdge.target,
  };
  if (d.volume != null) out.volume = d.volume;
  if (d.branch) out.branch = d.branch;
  if (d.label) out.label = d.label;
  return out;
}
