import React from 'react';
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

/**
 * PathStatsEdge — placeholder for Session A. Renders a smoothstep path with
 * brand-blue stroke (or violet for branched edges). Mid-edge stat pill +
 * popover are added in Session B.
 */
function getEdgeStroke(branch, hovered, selected) {
  if (branch) return hovered || selected ? '#6D28D9' : '#7C3AED';
  return hovered || selected ? '#005A9A' : '#006CB5';
}

export default function PathStatsEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
  });
  const stroke = getEdgeStroke(data?.branch, false, selected);
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke,
        strokeWidth: 2,
        fill: 'none',
        transition: 'stroke 140ms ease',
        ...style,
      }}
    />
  );
}
