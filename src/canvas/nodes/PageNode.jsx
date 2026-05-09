import React from 'react';
import { Position } from '@xyflow/react';
import {
  PAGE_TYPE,
  PAGE_ICON_LOOKUP,
  NODE_W,
  Wireframe,
  Tip,
  X,
  Spark,
} from '../../App.jsx';
import BrandedHandle from './BrandedHandle.jsx';
import { useCanvas } from '../util/canvas-context.js';

/**
 * PageNode — xyflow custom node. Visual ported from the original PageNode in
 * App.jsx, with positioning + drag/select handled by xyflow. Connector dots
 * are replaced with BrandedHandle (one source on the right, one target on the
 * left). The `data` passed in is the raw demo-state node.data plus the
 * functions Canvas threads through under data._mode, data._onRemove, etc.
 */
export default function PageNode({ id, data, selected }) {
  const { mode, onRemoveNode } = useCanvas();
  const readonly = mode !== 'build';
  const baseT = PAGE_TYPE[data.pageType] || PAGE_TYPE.custom;
  const isCustom = data.pageType === 'custom';
  const customIcon = (isCustom && data.icon && PAGE_ICON_LOOKUP[data.icon]) || null;
  const t = {
    color: (isCustom && data.color) ? data.color : baseT.color,
    Icon: customIcon || baseT.Icon,
    label: baseT.label,
  };
  const TIcon = t.Icon;
  const { title, path, status, visitors, rate, screenshot } = data;
  const showMetrics = mode === 'analyse';

  return (
    <div className="group/node relative" style={{ width: NODE_W.page }}>
      {/* target handle — left middle, hidden visually but accepts connections.
         Explicit id="in" matches transform.js + onConnect's targetHandle. */}
      <BrandedHandle
        type="target"
        id="in"
        position={Position.Left}
        color={t.color}
        alwaysVisible={false}
        hidden={readonly}
      />

      {/* floating remove chip — same chip pattern as logic card */}
      {!readonly && (
        <div
          className="absolute -top-8 right-0 z-30 flex items-center gap-0.5
                     opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none"
        >
          <div className="pointer-events-auto inline-flex items-center bg-white rounded-md shadow-card border border-line">
            <Tip label="Remove page" side="top">
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

      {/* Online-now badge — Analyse mode */}
      {mode === 'analyse' && (
        <div className="absolute -top-6 left-2 z-20 inline-flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-good live-dot shrink-0" />
          <span className="text-[10.5px] font-semibold tabular-nums text-good-deep">
            {data.onlineNow ?? 0}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-ink-soft">Online</span>
        </div>
      )}

      {/* Optimise sparkle */}
      {mode === 'optimise' && !data.dismissed && (
        <div className="absolute -top-2 -right-2 z-30 pointer-events-auto">
          <Tip label="A/B test the headline (+14% lift)" side="top">
            <button
              data-no-drag
              className="nodrag w-6 h-6 inline-flex items-center justify-center rounded-full bg-violet text-white shadow-card ai-ripple hover:bg-violet-deep transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent('open-suggestion', {
                    detail: { nodeId: id, title: data.title },
                  }),
                );
              }}
            >
              <Spark size={11} className="ai-breathe-icon" />
            </button>
          </Tip>
        </div>
      )}

      {/* card body */}
      <div
        className={`relative rounded-lg overflow-hidden bg-white transition-[box-shadow,transform] duration-150
                    ${selected ? '' : 'shadow-xs group-hover/node:shadow-card group-hover/node:-translate-y-0.5'}`}
        style={{
          borderTopWidth: 2,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: t.color,
          borderRightColor: selected ? t.color : '#E5E7EB',
          borderBottomColor: selected ? t.color : '#E5E7EB',
          borderLeftColor: selected ? t.color : '#E5E7EB',
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
            background: `linear-gradient(to bottom, ${t.color}10 0%, ${t.color}06 30%, transparent 65%)`,
          }}
        />

        {/* HEADER */}
        <div className="relative px-3 pt-3 pb-2 flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: t.color + '1a', color: t.color }}
          >
            <TIcon size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-[13px] font-semibold text-ink truncate leading-tight">
                {title}
              </div>
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  status === 'live' ? 'bg-good live-dot' : 'bg-warn'
                }`}
              />
            </div>
            <div className="text-[11px] text-ink-soft mt-0.5 truncate">
              {t.label}
              {path && <> · {path}</>}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="relative px-3 pb-2">
          {screenshot ? (
            <div
              className="rounded border border-line-soft overflow-hidden bg-surface-cool"
              style={{ aspectRatio: '240 / 96' }}
            >
              <img src={screenshot} alt="" className="w-full h-full object-cover object-top" />
            </div>
          ) : (
            <Wireframe type={data.pageType} />
          )}
        </div>

        {/* BOTTOM METRIC ROW (Analyse mode) */}
        {showMetrics && (() => {
          const conv =
            rate != null
              ? rate
              : visitors
              ? Math.max(2, Math.min(28, (visitors % 13) + 4))
              : null;
          const drop = visitors ? Math.max(8, Math.min(90, 100 - (conv || 0) - 12)) : null;
          const dwell = ['0:24', '1:08', '0:52', '2:14', '0:41'][(visitors || 0) % 5];
          return (
            <div className="relative px-3 pb-2.5 pt-2 border-t border-line-soft mt-0.5 grid grid-cols-4 gap-1.5 text-[10.5px]">
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Visits</span>
                <span className="font-semibold tabular-nums text-ink leading-tight">
                  {visitors?.toLocaleString() || '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Conv</span>
                <span
                  className={`font-semibold tabular-nums leading-tight ${
                    conv >= 5 ? 'text-good-deep' : 'text-ink'
                  }`}
                >
                  {conv != null ? conv.toFixed(0) + '%' : '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Drop</span>
                <span className="font-semibold tabular-nums leading-tight text-ink">
                  {drop != null ? drop.toFixed(0) + '%' : '—'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Time</span>
                <span className="font-semibold tabular-nums leading-tight text-ink">
                  {dwell}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* source handle — right middle, brand colour for the page type. */}
      <BrandedHandle
        type="source"
        id="out"
        position={Position.Right}
        color={t.color}
        alwaysVisible={false}
        hidden={readonly}
      />
    </div>
  );
}
