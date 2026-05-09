import React from 'react';
import { Position } from '@xyflow/react';
import {
  LOGIC_KIND,
  NODE_W,
  NODE_H,
  Tip,
  X,
  Bars,
  Workflow,
} from '../../App.jsx';
import BrandedHandle from './BrandedHandle.jsx';
import { useCanvas } from '../util/canvas-context.js';

/**
 * LogicNode — branching step (Condition or A/B test). Has TWO source handles
 * with different ids ('yes'/'no' or 'a'/'b'). They're stacked at the right
 * edge with ±22px vertical offset so they read as one violet dot when no
 * connections exist, but xyflow can route each branch to its own destination.
 *
 * Branch identity routing: when the user drags from this region, xyflow needs
 * to know which handle they grabbed. We expose them as separate handles —
 * the user is dragging from whichever handle is geometrically closest. After
 * connection, the edge's sourceHandle ('yes' / 'no' / etc.) is preserved.
 *
 * To match the original UX ("first drag = primary, second drag = secondary"),
 * Canvas.jsx watches outgoing-edge count and overrides the sourceHandle on
 * onConnect if it's not yet assigned.
 */
export default function LogicNode({ id, data, selected }) {
  const { mode, onRemoveNode, outgoingCounts } = useCanvas();
  const readonly = mode !== 'build';
  const kind = LOGIC_KIND[data.kind] || LOGIC_KIND.condition;
  const Ic = data.kind === 'abtest' ? Bars : Workflow;
  const accentColor = data.kind === 'abtest' ? '#F59E0B' : '#7C3AED';
  const VIOLET = accentColor;
  const branchesUsed = Math.min(outgoingCounts[id] || 0, 2);

  return (
    <div
      className="group/node relative"
      style={{ width: NODE_W.logic, height: NODE_H.logic }}
    >
      {/* target handle — left middle, violet */}
      <BrandedHandle
        type="target"
        id="in"
        position={Position.Left}
        color={VIOLET}
        alwaysVisible={!readonly}
        hidden={readonly}
      />

      {/* floating remove chip */}
      {!readonly && (
        <div
          className="absolute -top-8 right-0 z-30 flex items-center gap-0.5
                     opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none"
        >
          <div className="pointer-events-auto inline-flex items-center bg-white rounded-md shadow-card border border-line">
            <Tip label="Remove step" side="top">
              <button
                data-no-drag
                className="nodrag w-6 h-6 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-bad-deep hover:bg-bad-soft transition-colors"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveNode(id);
                }}
              >
                <X size={11} />
              </button>
            </Tip>
          </div>
        </div>
      )}

      {/* card body */}
      <div
        className={`relative rounded-lg overflow-hidden bg-white transition-[box-shadow,transform] duration-150
                    ${selected ? '' : 'shadow-xs group-hover/node:shadow-card group-hover/node:-translate-y-0.5'}`}
        style={{
          minHeight: NODE_H.logic,
          borderTopWidth: 2,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: VIOLET,
          borderRightColor: selected ? VIOLET : '#E5E7EB',
          borderBottomColor: selected ? VIOLET : '#E5E7EB',
          borderLeftColor: selected ? VIOLET : '#E5E7EB',
          borderStyle: 'solid',
          boxShadow: selected
            ? '0 4px 12px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.08)'
            : undefined,
          transform: selected ? 'scale(1.02)' : undefined,
          transformOrigin: 'center center',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity duration-200"
          style={{
            background: `linear-gradient(to bottom, ${VIOLET}10 0%, ${VIOLET}06 30%, transparent 65%)`,
          }}
        />

        <div className="relative px-3.5 pt-3 pb-2.5 flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: VIOLET + '1a', color: VIOLET }}
          >
            <Ic size={15} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate leading-tight">
              {data.title || kind.label}
            </div>
            <div className="text-[10.5px] text-ink-soft mt-px">{kind.subtitle}</div>
          </div>
        </div>

        <div className="relative px-3.5 pb-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: branchesUsed >= 1 ? VIOLET : '#E5E7EB' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: branchesUsed >= 2 ? VIOLET : '#E5E7EB' }}
            />
          </div>
          <span className="text-[10px] text-ink-soft">{branchesUsed} of 2 branches</span>
        </div>
      </div>

      {/* Two source handles — primary (yes/a) above, secondary (no/b) below. */}
      <BrandedHandle
        type="source"
        position={Position.Right}
        id={kind.primaryBranch}
        color={VIOLET}
        alwaysVisible={!readonly}
        offsetY={-11}
        hidden={readonly}
      />
      <BrandedHandle
        type="source"
        position={Position.Right}
        id={kind.secondaryBranch}
        color={VIOLET}
        alwaysVisible={!readonly}
        offsetY={11}
        hidden={readonly}
      />
    </div>
  );
}
