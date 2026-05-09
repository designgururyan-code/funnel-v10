import { createContext, useContext } from 'react';

/**
 * CanvasContext — provides mode + imperative callbacks to custom node /
 * edge components.
 *
 * Why a context instead of stuffing these into node.data:
 *   xyflow uses object identity to detect node changes. Putting unstable
 *   callbacks (recreated each render) into node.data made every render
 *   look like a node change to xyflow's diff, which retriggered
 *   measurement. During that re-measurement window, handle bounds are
 *   transiently empty and edge routing fails — surfacing as
 *   "Couldn't create edge for source handle id: 'null'" warnings and a
 *   short period where edges don't render.
 *
 * Keeping node.data limited to actual node-specific fields means xyflow
 * can fast-path the diff and edges stay stable.
 */
export const CanvasContext = createContext({
  mode: 'build',
  onRemoveNode: () => {},
  onChangeSource: () => {},
  onRemoveEdge: () => {},
  onInsertEdge: () => {},
  sourceTargets: {},
  outgoingCounts: {},
});

export const useCanvas = () => useContext(CanvasContext);
