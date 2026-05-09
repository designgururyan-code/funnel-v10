import React, { useRef, useState } from 'react';
import { Position } from '@xyflow/react';
import {
  SOURCES,
  SOURCE_BY_ID,
  NODE_W,
  useCountUp,
  formatVolume,
  heatTextColor,
  Tip,
  Popover,
  MenuItem,
  X,
  Edit,
  ChevronRight,
} from '../../App.jsx';
import BrandedHandle from './BrandedHandle.jsx';

/**
 * SourceNode — xyflow custom node. Visual ported from App.jsx's original
 * SourceNode. Sources are entry points: source handle on right, no target
 * handle (sources can't receive). data._target / data._mode are threaded
 * through by Canvas.jsx.
 */
export default function SourceNode({ id, data, selected }) {
  const mode = data._mode || 'build';
  const readonly = mode !== 'build';
  const target = data._target;
  const src = SOURCE_BY_ID[data.src] || SOURCES[0];
  const Ic = src.Icon;
  const count = target?.count || 0;
  const targetTitle = count === 1 ? target.title : '—';
  const targetRate = count === 1 ? target.rate : 0;

  const visAnim = useCountUp(data.visitorsNum || 0);
  const rateAnim = useCountUp(targetRate);

  const chipAnchor = useRef(null);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="group/node relative" style={{ width: NODE_W.source }}>
      {/* floating action chips — Edit + X */}
      {!readonly && (
        <div
          ref={chipAnchor}
          className="absolute -top-8 right-0 z-30 flex items-center gap-0.5
                     opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none"
        >
          <div className="pointer-events-auto inline-flex items-center bg-white rounded-md shadow-card border border-line">
            <Tip label="Change platform" side="top">
              <button
                data-no-drag
                className="nodrag w-6 h-6 inline-flex items-center justify-center rounded-l-md text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen((o) => !o);
                }}
              >
                <Edit size={11} />
              </button>
            </Tip>
            <span className="w-px h-4 bg-line-soft" />
            <Tip label="Remove source" side="top">
              <button
                data-no-drag
                className="nodrag w-6 h-6 inline-flex items-center justify-center rounded-r-md text-ink-muted hover:text-bad-deep hover:bg-bad-soft transition-colors"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  data._onRemove && data._onRemove(id);
                }}
              >
                <X size={11} />
              </button>
            </Tip>
          </div>
        </div>
      )}

      {/* edit-source popover */}
      <Popover
        anchorRef={chipAnchor}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        width={200}
        align="end"
      >
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
          Change platform
        </div>
        {SOURCES.map((s) => {
          const SIc = s.Icon;
          return (
            <MenuItem
              key={s.id}
              icon={
                <span
                  className="w-3.5 h-3.5 inline-flex items-center justify-center rounded"
                  style={{ background: s.color + '1a', color: s.color }}
                >
                  <SIc size={9} />
                </span>
              }
              label={s.name}
              active={s.id === src.id}
              onClick={() => {
                data._onChangeSource && data._onChangeSource(id, s.id);
                setEditOpen(false);
              }}
            />
          );
        })}
      </Popover>

      {/* card */}
      <div
        className={`relative rounded-lg overflow-hidden bg-white transition-[box-shadow,transform] duration-150
                    ${selected ? '' : 'shadow-xs group-hover/node:shadow-card group-hover/node:-translate-y-0.5'}`}
        style={{
          borderTopWidth: 2,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: src.color,
          borderRightColor: selected ? src.color : '#E5E7EB',
          borderBottomColor: selected ? src.color : '#E5E7EB',
          borderLeftColor: selected ? src.color : '#E5E7EB',
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
            background: `linear-gradient(to bottom, ${src.color}14 0%, ${src.color}08 30%, transparent 65%)`,
          }}
        />

        <div className="relative px-3.5 pt-3 pb-2.5 flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: src.color + '1a', color: src.color }}
          >
            <Ic size={15} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate leading-tight">
              {src.name}
            </div>
            <div className="text-[10.5px] text-ink-soft mt-px">Traffic source</div>
          </div>
        </div>

        <div className="relative px-3.5 pt-1 pb-3.5">
          {mode === 'analyse' && (
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                Visitors
              </span>
              <span className="text-[14px] font-semibold text-ink tabular-nums leading-none">
                {formatVolume(visAnim)}
              </span>
            </div>
          )}

          {count <= 1 ? (
            <>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[11px] font-medium text-ink-muted leading-none">
                  To{' '}
                  <span
                    className={
                      count === 1 ? 'text-ink-muted font-medium' : 'text-ink-soft'
                    }
                  >
                    {targetTitle}
                  </span>
                </span>
                <span
                  className="text-[11.5px] font-semibold tabular-nums leading-none"
                  style={{ color: heatTextColor(count === 1 ? targetRate : null) }}
                >
                  {count === 1 ? `${Math.round(rateAnim)}%` : '—'}
                </span>
              </div>
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ background: '#F1F5F9' }}
              >
                {count === 1 && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(to right, #DC2626 0%, #F97316 22%, #EAB308 45%, #84CC16 70%, #10B981 100%)',
                      clipPath: `inset(0 ${Math.max(0, 100 - rateAnim)}% 0 0)`,
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <ChevronRight size={11} className="text-brand" />
              <span className="text-[11.5px] font-semibold text-ink leading-none">
                {count} <span className="font-medium text-ink-muted">destinations</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* source handle — only output, no target. Brand-blue (or the source's color). */}
      <BrandedHandle
        type="source"
        position={Position.Right}
        color={src.color}
        alwaysVisible={false}
        hidden={readonly}
      />
    </div>
  );
}
