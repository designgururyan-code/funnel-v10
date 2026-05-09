import dagre from 'dagre';

/**
 * dagreLayout — Sugiyama-style left-to-right layered layout.
 *
 * Replaces the hand-rolled `autoLayout` in the old Canvas. Inputs are xyflow
 * nodes/edges; output is the same nodes with new `position` values.
 *
 * Each node's measured width/height is read from `node.width` and
 * `node.height` (xyflow populates these after first render). If unavailable,
 * we fall back to NODE_W/NODE_H sizes via the `sizeFor` callback.
 */
export function dagreLayout(nodes, edges, { sizeFor, hGap = 200, vGap = 90 } = {}) {
  if (!nodes.length) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    // nodesep is the vertical gap between siblings in the same rank;
    // ranksep is the horizontal gap between ranks. Generous defaults so
    // mid-edge stat pills, branch badges and text labels have breathing
    // room and adjacent cards aren't visually crammed together.
    nodesep: vGap,
    ranksep: hGap,
    edgesep: 32,
    marginx: 60,
    marginy: 60,
  });

  nodes.forEach((n) => {
    const measured = sizeFor ? sizeFor(n) : { width: n.width || 240, height: n.height || 160 };
    g.setNode(n.id, {
      width: measured.width || n.width || 240,
      height: measured.height || n.height || 160,
    });
  });
  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  // dagre returns center coordinates. xyflow's position is top-left, so we
  // subtract half the node size.
  return nodes.map((n) => {
    const dn = g.node(n.id);
    if (!dn) return n;
    const measured = sizeFor ? sizeFor(n) : { width: n.width || 240, height: n.height || 160 };
    const w = measured.width || n.width || 240;
    const h = measured.height || n.height || 160;
    // snap to 10px grid — matches drag snap
    const SNAP = 10;
    return {
      ...n,
      position: {
        x: Math.round((dn.x - w / 2) / SNAP) * SNAP,
        y: Math.round((dn.y - h / 2) / SNAP) * SNAP,
      },
    };
  });
}
