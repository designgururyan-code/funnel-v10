import React, { useState } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from '@xyflow/react';
import {
  formatVolume,
  SOURCES,
  UsersIcon,
  TrendingUp,
  Activity,
  Eye,
  X,
} from '../../App.jsx';
import { useCanvas } from '../util/canvas-context.js';

const Plus = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const Xicon = ({ size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * PathStatsEdge — xyflow custom edge.
 *
 *   visible:   smoothstep path (uniform 2px stroke; brand-blue baseline,
 *              violet for branched edges)
 *   stat pill: foreignObject in EdgeLabelRenderer at the path midpoint —
 *              shows %  + unique count + 👤 icon (Analyse mode only)
 *   popover:   2×2 stats grid (Unique / Conversion / Drop-off / Time-to-next)
 *              opens when the pill is clicked
 *   badge:     Y / N / A / B coloured circle near destination on branched edges
 *   label:     small white pill with text label ("showed up", "didn't show")
 *              centered above the stat pill
 *   hover:     stroke colour deepens on hover; arrow tip + chip rendered in
 *              Session C polish
 */
function getEdgeStroke(branch, hovered, selected) {
  // A/B test branches mirror the A/B card's amber accent. Condition (Y/N)
  // branches stay violet to match their card. Default edges are brand-blue.
  if (branch === 'a' || branch === 'b') return hovered || selected ? '#B45309' : '#F59E0B';
  if (branch) return hovered || selected ? '#6D28D9' : '#7C3AED';
  return hovered || selected ? '#005A9A' : '#006CB5';
}

const branchMeta = (branch) => {
  if (branch === 'yes') return { letter: 'Y', color: '#10B981' };
  if (branch === 'no') return { letter: 'N', color: '#94A3B8' };
  if (branch === 'a') return { letter: 'A', color: '#7C3AED' };
  if (branch === 'b') return { letter: 'B', color: '#F59E0B' };
  return null;
};

export default function PathStatsEdge({
  id,
  source,
  target,
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
  const [hovered, setHovered] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const rf = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 10,
  });

  const { mode, onRemoveEdge, onInsertEdge } = useCanvas();
  const branch = data?.branch || null;
  const stroke = getEdgeStroke(branch, hovered, selected);
  const vol = data?.volume || 0;
  const labelStr = (data?.label || '').trim();
  const hasLabel = labelStr.length > 1;
  const buildHover = mode === 'build' && hovered;
  const onInsert = onInsertEdge;
  const onRemove = onRemoveEdge;

  // arrow tip orientation — tangent of the smoothstep approaching the target
  // (smoothstep ends are orthogonal to the target side, so we can derive it
  // from sourcePosition/targetPosition; for Right→Left the arrow points east).
  const arrowAngle =
    targetPosition === 'left'
      ? 0
      : targetPosition === 'right'
      ? Math.PI
      : targetPosition === 'top'
      ? Math.PI / 2
      : -Math.PI / 2;

  // Compute conversion rate using the source node's visitor count
  // (sources expose visitorsNum, pages expose visitors).
  const sourceNode = rf.getNode(source);
  const fromVisitors = sourceNode?.data?.visitorsNum ?? sourceNode?.data?.visitors ?? null;
  const rate = fromVisitors ? Math.round((vol / fromVisitors) * 100) : null;
  const showStats = mode === 'analyse' && vol > 0;

  // Branch badge sits on the actual smoothstep path near the destination.
  // Smoothstep enters the target horizontally from the left for our L→R flow,
  // so positioning at (targetX - 26, targetY) puts the badge on the final
  // horizontal segment, just before the arrow tip. The previous 85%
  // interpolation followed a straight line between source/target which
  // floated the badge off the L-shaped path.
  const bx = targetX - 26;
  const by = targetY;
  const meta = branchMeta(branch);

  // Path-stats popover content (rendered when statsOpen)
  const targetNode = rf.getNode(target);
  const fromTitle =
    sourceNode?.data?.title ||
    (sourceNode?.type === 'source'
      ? SOURCES.find((s) => s.id === sourceNode?.data?.src)?.name || 'Source'
      : 'From');
  const toTitle = targetNode?.data?.title || 'To';
  const conv = vol
    ? Math.round((vol / Math.max(1, fromVisitors || 100)) * 100)
    : 0;
  const drop = Math.max(0, 100 - conv);

  return (
    <>
      {/* invisible wider hit target for hover + click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={28}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        className="react-flow__edge-interaction"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {/* visible line */}
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

      {/* arrow tip at destination — drawn as inline SVG via foreignObject so it
         stays above any node it might overlap. */}
      <g
        transform={`translate(${targetX}, ${targetY}) rotate(${(arrowAngle * 180) / Math.PI})`}
        style={{ pointerEvents: 'none' }}
      >
        <polygon points="-7,-4 0,0 -7,4" fill={stroke} style={{ transition: 'fill 140ms ease' }} />
      </g>

      {/* branch badge near destination */}
      {meta && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${bx}px, ${by}px)`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <span
              className="inline-flex items-center justify-center text-white text-[9px] font-bold rounded-full"
              style={{
                width: 16,
                height: 16,
                background: meta.color,
                border: '1px solid white',
                boxShadow: '0 1px 2px rgba(15,23,42,0.18)',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                lineHeight: 1,
              }}
            >
              {meta.letter}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* small text label ("showed up") above the stat pill */}
      {hasLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - (showStats ? 30 : 0)}px)`,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          >
            <span
              className="inline-flex items-center bg-white border border-line text-[10.5px] font-medium text-ink-muted rounded-full px-2 py-0.5"
              style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', whiteSpace: 'nowrap' }}
            >
              {labelStr}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* mid-edge stat pill (Analyse mode only) */}
      {showStats && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 6,
            }}
          >
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                setStatsOpen((o) => !o);
              }}
              title="View path stats"
              style={{
                width: 112,
                height: rate != null ? 44 : 30,
                background: statsOpen ? '#F8FAFC' : 'white',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                boxShadow: statsOpen
                  ? '0 4px 10px rgba(15,23,42,0.10)'
                  : '0 1px 3px rgba(15,23,42,0.08)',
                padding: '6px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition:
                  'background 140ms ease, box-shadow 140ms ease, transform 140ms ease',
              }}
              onMouseEnter={(e) => {
                if (statsOpen) return;
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(15,23,42,0.10)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (statsOpen) return;
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {rate != null && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {rate}%
                </span>
              )}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  marginTop: rate != null ? 4 : 0,
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 11,
                    height: 11,
                    color: '#006CB5',
                  }}
                >
                  <UsersIcon size={10} />
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#006CB5',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  {formatVolume(vol)}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 500,
                    color: '#94A3B8',
                    letterSpacing: '0.04em',
                  }}
                >
                  UNIQUE
                </span>
              </span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* hover insert/remove chip — Build mode only */}
      {buildHover && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 7,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div
              className="inline-flex items-center bg-white rounded-md border border-line"
              style={{
                boxShadow: '0 1px 3px rgba(15,23,42,0.10)',
                height: 24,
              }}
            >
              <button
                title="Insert step"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onInsert && onInsert(id, labelX, labelY);
                }}
                className="w-6 h-6 inline-flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors rounded-l-md"
              >
                <Plus size={11} />
              </button>
              <span className="w-px h-4 bg-line-soft" />
              <button
                title="Remove connection"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onRemove && onRemove(id);
                }}
                className="w-6 h-6 inline-flex items-center justify-center text-ink-muted hover:text-bad-deep hover:bg-bad-soft transition-colors rounded-r-md"
              >
                <Xicon size={11} />
              </button>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* path-stats popover */}
      {statsOpen && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, 0%) translate(${labelX}px, ${labelY + 32}px)`,
              pointerEvents: 'all',
              zIndex: 9999,
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div
              className="ctx-menu w-[260px] bg-white rounded-lg shadow-menu overflow-hidden border border-line"
              style={{ position: 'relative' }}
            >
              <div className="px-3 py-2.5 bg-good-soft border-b border-good/30 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-good text-white inline-flex items-center justify-center shrink-0">
                  <TrendingUp size={10} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-good-deep font-semibold">
                    Path stats
                  </div>
                  <div className="text-[12px] font-semibold leading-tight truncate text-ink mt-0.5">
                    {fromTitle} <span className="text-ink-soft">→</span> {toTitle}
                  </div>
                </div>
                <button
                  onClick={() => setStatsOpen(false)}
                  className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-white/60 transition-colors text-good-deep"
                >
                  <X size={11} />
                </button>
              </div>
              <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0"
                    style={{ background: '#E6F0F9', color: '#006CB5' }}
                  >
                    <UsersIcon size={13} />
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[14px] font-bold tabular-nums leading-none"
                      style={{ color: '#006CB5' }}
                    >
                      {vol.toLocaleString()}
                    </div>
                    <div className="text-[9.5px] uppercase tracking-wider text-ink-soft mt-1 leading-none">
                      Unique
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0"
                    style={{ background: '#ECFDF5', color: '#10B981' }}
                  >
                    <TrendingUp size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold tabular-nums leading-none text-good-deep">
                      {conv}%
                    </div>
                    <div className="text-[9.5px] uppercase tracking-wider text-ink-soft mt-1 leading-none">
                      Conversion
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0"
                    style={{ background: '#FEE2E2', color: '#DC2626' }}
                  >
                    <Activity size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold tabular-nums leading-none text-bad-deep">
                      {drop}%
                    </div>
                    <div className="text-[9.5px] uppercase tracking-wider text-ink-soft mt-1 leading-none">
                      Drop-off
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0"
                    style={{ background: '#F3EEFF', color: '#7C3AED' }}
                  >
                    <Eye size={13} />
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[14px] font-bold tabular-nums leading-none"
                      style={{ color: '#7C3AED' }}
                    >
                      0:42
                    </div>
                    <div className="text-[9.5px] uppercase tracking-wider text-ink-soft mt-1 leading-none">
                      Time-to-next
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-surface-sub border-t border-line-soft text-[10px] text-ink-soft leading-snug">
                From last 7 days. Drop-off = visitors who didn't reach the next step.
              </div>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
