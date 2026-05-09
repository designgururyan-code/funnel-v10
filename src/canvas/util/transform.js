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
 *
 * For non-branch edges (page → page, source → page, page → logic), the source
 * uses its single 'out' handle. Every target uses 'in'. We set both explicitly
 * because xyflow looks up handles by string id and missing/undefined handle
 * lookups can race with re-measurement, transiently failing edge routing.
 */
const handleForBranch = (branch) => {
  if (branch === 'yes' || branch === 'no' || branch === 'a' || branch === 'b') return branch;
  return null;
};
const sourceHandleFor = (nodeType, branch) => {
  if (nodeType === 'logic') return handleForBranch(branch) || 'yes';
  return 'out';
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

/**
 * Build xyflow edges from our format. Caller passes the matching `nodes`
 * (our format, with `type`) so we can resolve sourceHandle correctly for
 * logic-node origins (yes/no/a/b) vs page/source origins (out).
 */
export function edgesToFlow(edges, nodes) {
  if (!Array.isArray(edges)) return [];
  const nodeTypes = {};
  if (Array.isArray(nodes)) for (const n of nodes) nodeTypes[n.id] = n.type;
  return edges.map((e, i) => ({
    id: e.id || `e-${e.from}-${e.to}-${i}`,
    source: e.from,
    target: e.to,
    type: 'pathStats',
    sourceHandle: sourceHandleFor(nodeTypes[e.from], e.branch),
    targetHandle: 'in',
    data: {
      volume: e.volume ?? 0,
      branch: e.branch || null,
      label: e.label || null,
    },
  }));
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
