import React from 'react';
import { Handle } from '@xyflow/react';

const hexToRGB = (hex) => {
  const h = (hex || '#006CB5').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

/**
 * BrandedHandle — wraps xyflow's <Handle> with the visual treatment we used for
 * the old hand-coded ConnectorDot: filled brand-blue (or violet for logic) dot
 * with a white double-halo and a hover scale-up. xyflow's default grey dot is
 * suppressed via inline styles (its own stylesheet sets background/border).
 *
 * Props:
 *   type           — 'source' | 'target'
 *   position       — Position.Left | Right | Top | Bottom
 *   id             — handle id (e.g. 'yes', 'no', 'a', 'b'; omit for default)
 *   color          — fill color (default '#006CB5')
 *   alwaysVisible  — when true, the dot is opaque always (logic nodes use this).
 *                    when false, it's invisible until the parent .group/node hovers.
 *   offsetY        — vertical pixel offset from middle (used to fan out yes/no
 *                    handles on logic nodes by ±22px).
 *   hidden         — when true, render nothing (read-only modes).
 */
export default function BrandedHandle({
  type,
  position,
  id,
  color = '#006CB5',
  alwaysVisible = false,
  offsetY = 0,
  hidden = false,
}) {
  if (hidden) return null;
  const ringRGB = hexToRGB(color);
  const style = {
    width: 12,
    height: 12,
    background: color,
    border: 'none',
    boxShadow: `0 0 0 2px rgba(255,255,255,0.95), 0 0 0 3px rgba(${ringRGB},0.22), 0 1px 3px rgba(0,0,0,0.12)`,
    transition: 'opacity 150ms ease, transform 150ms ease',
    cursor: 'crosshair',
    zIndex: 20,
  };
  // xyflow handles its own positioning per `position` prop; we only adjust the
  // vertical offset so logic nodes can fan out yes/no handles. Translate via
  // marginTop so xyflow's coordinate computations still see the handle at the
  // node edge midpoint (matters for edge anchoring).
  if (offsetY) style.marginTop = offsetY;
  // alwaysVisible defaults to opacity 1; otherwise we let the parent
  // .group/node's hover state expose it. xyflow renders Handle as a div with
  // class react-flow__handle — we add a stable className we can target.
  const className = alwaysVisible
    ? 'branded-handle branded-handle--visible'
    : 'branded-handle';
  return (
    <Handle
      id={id}
      type={type}
      position={position}
      style={style}
      className={className}
      isConnectable={true}
    />
  );
}
