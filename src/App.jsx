/**
 * Funnel Builder — full app, ported verbatim from funnel-v9.html.
 *
 * This is the entire 3000-line component body extracted from the original
 * single-file HTML build, with three changes:
 *   1. React destructure → proper ESM imports
 *   2. ReactDOM.createPortal → createPortal (imported from react-dom)
 *   3. function App → export default function App
 *
 * Everything else is identical: same icons, same Topbar/ContextBar/Sidebar,
 * same Canvas with bezier routing, same Inspector, same demo data.
 *
 * NEXT (decomposition pass): split this into per-component files under
 * src/components/. Until then, this monolith works fine — Vite handles
 * 3000-line files without complaint and hot-reload is fast.
 */
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'

const I = (children) => ({ size = 14, sw = 1.75, className = '', style } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>{children}</svg>
);
const ChevronDown  = I(<polyline points="6 9 12 15 18 9"/>);
const ChevronLeft  = I(<polyline points="15 18 9 12 15 6"/>);
const ChevronRight = I(<polyline points="9 18 15 12 9 6"/>);
const PanelLeft    = I(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></>);
const PanelRight   = I(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></>);
const SearchIcon   = I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>);
const Plus         = I(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>);
const X            = I(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>);
const FileIcon     = I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>);
const Folder       = I(<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>);
const Globe        = I(<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>);
const Cart         = I(<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>);
const ZapIcon      = I(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>);
const Spark        = I(<path d="M12 3l1.9 5.8L20 11l-6.1 1.9L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/>);
const Sparkles     = I(<><path d="M12 3l1.9 5.8L20 11l-6.1 1.9L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z"/><path d="M19 3l.7 2.1L22 6l-2.3.7L19 9l-.7-2.3L16 6l2.3-.9z"/></>);
const Bell         = I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>);
const Refresh      = I(<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>);
const Cog          = I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>);
const Wrench       = I(<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>);
const Bars         = I(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>);
const Mail         = I(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>);
const UsersIcon    = I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);
const Target       = I(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>);
const Dollar       = I(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>);
const Eye          = I(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>);
const Form         = I(<><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/></>);
const Tag          = I(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></>);
const Check        = I(<polyline points="20 6 9 17 4 12"/>);
const Lock         = I(<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>);
const Video        = I(<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>);
const TrendUp      = I(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>);
const StarIcon     = I(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>);
const Edit         = I(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>);
const Copy         = I(<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>);
const ExternalLink = I(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>);
const Trash        = I(<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>);
const Undo         = I(<><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></>);
const Redo         = I(<><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></>);
const MoreH        = I(<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>);
const Calendar     = I(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>);
/* Workflow icon — for funnel — three connected nodes */
const Workflow     = I(<><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M9 6h6"/><path d="M12 9v6"/></>);
/* Funnel icon — for empty canvas. Trapezoid converging to a point */
const FunnelMark   = I(<><path d="M3 4h18l-7 9v6l-4-2v-4z"/></>);
/* Staged funnel — outer trapezoid + 3 internal stage divider lines + stem.
   Used as the headline mark in the empty canvas state. */
const FunnelStaged = ({ size = 72, className = '', style } = {}) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" stroke="currentColor"
       strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
       className={className} style={style}>
    {/* outer funnel shape: wide top, converges to stem */}
    <path d="M8 14 L64 14 L44 38 L44 56 L28 62 L28 38 Z" fill="currentColor" fillOpacity="0.08"/>
    {/* internal stage dividers — 3 horizontal lines indicating funnel stages */}
    <line x1="13" y1="22" x2="59" y2="22" strokeOpacity="0.45"/>
    <line x1="18" y1="30" x2="54" y2="30" strokeOpacity="0.45"/>
    <line x1="23" y1="38" x2="49" y2="38" strokeOpacity="0.45"/>
  </svg>
);
const Maximize     = I(<><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>);
const Minus        = I(<line x1="5" y1="12" x2="19" y2="12"/>);
const ZoomIn       = I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>);
const ZoomOut      = I(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></>);
const TrendingUp   = I(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>);
const DollarSign   = I(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>);
const Image        = I(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>);
const HomeIcon     = I(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>);
const PlayIcon     = I(<polygon points="5 3 19 12 5 21 5 3"/>);
const GiftIcon     = I(<><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>);
const Activity     = I(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>);
const Download     = I(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>);
const FacebookIcon = ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>;
const YoutubeIcon  = ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"/></svg>;
const InstaIcon    = I(<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></>);

const PAGE_TYPE = {
  landing:    { Icon: StarIcon, color: '#006CB5', label:'Landing'   },
  form:       { Icon: Form,     color: '#006CB5', label:'Lead form' },
  sales:      { Icon: Tag,      color: '#7C3AED', label:'Sales'     },
  checkout:   { Icon: Cart,     color: '#7C3AED', label:'Checkout'  },
  thanks:     { Icon: Check,    color: '#10B981', label:'Thank you' },
  membership: { Icon: Lock,     color: '#7C3AED', label:'Members'   },
  webinar:    { Icon: Video,    color: '#006CB5', label:'Webinar'   },
  upsell:     { Icon: TrendUp,  color: '#10B981', label:'Upsell'    },
  custom:     { Icon: FileIcon, color: '#94A3B8', label:'Custom'    },
};

const PROJECTS = [
  { id:'p1', name:'Network Marketer'  },
  { id:'p2', name:'Cairns Stingers'    },
  { id:'p3', name:'FreshBox'           },
  { id:'p4', name:'Estage King'        },
];
const FUNNELS = [
  { id:'f1', name:'Lead Magnet — May Promo',  status:'draft' },
  { id:'f2', name:'Webinar Replay Sequence',  status:'live'  },
  { id:'f3', name:'Black Friday VIP Offer',   status:'live'  },
  { id:'f4', name:'High-ticket Application',  status:'paused'},
];

/* TEMPLATE STEP MAPS — used in modal preview diagram */
const TEMPLATE_STEPS = {
  t1: ['landing','form','thanks'],
  t2: ['landing','form','webinar','sales','thanks'],
  t3: ['sales','upsell','thanks','custom'],
  t4: ['landing','form','sales','checkout','thanks','upsell'],
  t5: ['landing','form','sales','thanks'],
  t6: ['landing','webinar','sales','checkout','membership','upsell','thanks'],
  t7: ['landing','checkout','thanks','upsell','membership'],
  t8: ['landing','form','membership','sales','thanks'],
};

function Tip({ children, label, side='top' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x:0, y:0, transform:'' });
  const timer = useRef(null);
  const show = () => {
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const map = {
        top:    { x: cx, y: r.top - 6,    transform:'translate(-50%, -100%)' },
        bottom: { x: cx, y: r.bottom + 6, transform:'translate(-50%, 0)' },
        left:   { x: r.left - 6,  y: cy,  transform:'translate(-100%, -50%)' },
        right:  { x: r.right + 6, y: cy,  transform:'translate(0, -50%)' },
      };
      setPos(map[side]); setVisible(true);
    }, 250);
  };
  const hide = () => { clearTimeout(timer.current); setVisible(false); };
  return (
    <>
      <span ref={ref} onMouseEnter={show} onMouseLeave={hide} className="inline-flex">{children}</span>
      {visible && createPortal(
        <span className="tip-portal fixed z-[9999] whitespace-nowrap text-[11px] font-medium text-white bg-ink px-2 py-1 rounded-md shadow-tip pointer-events-none"
              style={{ left: pos.x, top: pos.y, transform: pos.transform }}>{label}</span>,
        document.body
      )}
    </>
  );
}

function Popover({ anchorRef, open, onClose, children, align='start', side='bottom', offset=6, width }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x:0, y:0 });
  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !ref.current) return;
    const a = anchorRef.current.getBoundingClientRect();
    const w = ref.current.getBoundingClientRect().width;
    const h = ref.current.getBoundingClientRect().height;
    let x, y;
    if (side === 'bottom') {
      y = a.bottom + offset;
      x = align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + (a.width - w)/2;
    } else {
      y = a.top - offset - h;
      x = align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + (a.width - w)/2;
    }
    if (x + w > window.innerWidth - 8) x = window.innerWidth - w - 8;
    if (x < 8) x = 8;
    setPos({ x, y });
  }, [open, anchorRef, align, side, offset]);
  useEffect(() => {
    if (!open) return;
    let active = false;
    const handler = (e) => {
      if (!active) return;
      if (ref.current && !ref.current.contains(e.target) && !anchorRef.current?.contains(e.target)) onClose();
    };
    /* close-popovers — broadcast channel from the canvas onMouseDown so an empty-canvas
       click definitively dismisses any open popover, even if a layered SVG hit-test
       and the document handler don't agree on whether the click was "outside". */
    const closeAll = () => onClose();
    /* mousedown CAPTURE phase — fires before any child stopPropagation can swallow it */
    const t = setTimeout(() => {
      active = true;
      document.addEventListener('mousedown', handler, true);
      document.addEventListener('close-popovers', closeAll);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler, true);
      document.removeEventListener('close-popovers', closeAll);
    };
  }, [open, onClose, anchorRef]);
  if (!open) return null;
  return createPortal(
    <div ref={ref} className="ctx-menu fixed z-[9998] bg-white rounded-lg shadow-menu p-1" style={{ top: pos.y, left: pos.x, width }}>
      {children}
    </div>,
    document.body
  );
}

function MenuItem({ icon, label, onClick, active=false, danger=false, shortcut, trailing }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[4px] text-left text-[12.5px] hover:bg-surface-sub transition-colors ${danger ? 'text-bad-deep hover:bg-bad-soft/60' : 'text-ink'}`}>
      {icon !== undefined && <span className={`w-4 inline-flex justify-center text-ink-muted`}>{icon}</span>}
      <span className="flex-1">{label}</span>
      {active && <Check size={12} className="text-brand"/>}
      {shortcut && <span className="text-[10.5px] text-ink-soft tracking-wider">{shortcut}</span>}
      {trailing}
    </button>
  );
}
function MenuDivider() { return <div className="h-px bg-line-soft my-1 mx-1"/>; }

/* ─── HELPERS — count-up animation, threshold colors, format utilities ─── */

/* useCountUp — animates from 0 (or previous value) to target on every change.
   Always animates from 0 on first mount so demo-state switches feel alive. */
function useCountUp(target, duration = 700) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const to = target ?? 0;
    if (from === to) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); /* ease-out cubic */
      const v = from + (to - from) * eased;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else { prev.current = to; setDisplay(to); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

/* threshold — generic conversion-rate color bucket. red <30, amber 30-60, green 60+.
   When rate is null/0 (disconnected), returns muted greys. */
const rateThreshold = (rate) => {
  if (rate == null || rate === 0) return { fill: '#CBD5E1', deep: '#94A3B8', soft: '#F1F5F9', text: 'text-ink-soft' };
  if (rate < 30) return { fill: '#DC2626', deep: '#B91C1C', soft: '#FEF2F2', text: 'text-bad-deep' };
  if (rate < 60) return { fill: '#F59E0B', deep: '#B45309', soft: '#FFFBEB', text: 'text-warn-deep' };
  return                 { fill: '#10B981', deep: '#047857', soft: '#ECFDF5', text: 'text-good-deep' };
};

/* heatTextColor — piecewise band color matching the gradient bar's color stops.
   Stays in sync with the gradient: red→deep-orange→amber→lime→green. */
const heatTextColor = (rate) => {
  if (rate == null || rate === 0) return '#94A3B8';   /* ink-soft */
  if (rate < 25) return '#B91C1C';   /* red deep */
  if (rate < 45) return '#C2410C';   /* orange deep */
  if (rate < 65) return '#A16207';   /* amber deep */
  if (rate < 85) return '#3F6212';   /* lime deep */
  return                  '#047857';  /* green deep */
};

/* formatVolume — 5160 → "5.2k", 846 → "846", 50000 → "50k".
   Used by both source visitor counts and mid-edge volume pills. */
const formatVolume = (n) => {
  if (!isFinite(n)) return '0';
  const r = Math.round(n);
  if (r >= 10000) return Math.round(r / 1000) + 'k';
  if (r >= 1000)  return (r / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return r.toLocaleString();
};

function Chip({ kind='neutral', children, sm=false, dot=false }) {
  const map = {
    neutral: 'bg-surface-muted text-ink-muted',
    live:    'bg-good-soft text-good-deep',
    draft:   'bg-warn-soft text-warn-deep',
    paused:  'bg-surface-muted text-ink-muted',
    in:      'bg-brand-soft text-brand',
    good:    'bg-good-soft text-good-deep',
  };
  const dotColor = { live:'bg-good live-dot', draft:'bg-warn', paused:'bg-ink-soft', neutral:'bg-current', in:'bg-current', good:'bg-current' }[kind] || 'bg-current';
  return (
    <span className={`inline-flex items-center gap-1 leading-none ${sm ? 'text-[9.5px]' : 'text-[10.5px]'} font-semibold px-1.5 py-1 rounded ${map[kind]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}/>}
      {children}
    </span>
  );
}

function TopbarWired({ project, onProjectChange, mode, onModeChange }) {
  const [projOpen, setProjOpen] = useState(false);
  const projAnchor = useRef(null);
  const modes = [{ id:'build',label:'Build',Icon:Wrench,tip:'Build — create and connect funnel steps' },{ id:'analyse',label:'Analyse',Icon:Bars,tip:'Analyse — see traffic, drop-off, and conversions' },{ id:'optimise',label:'Optimise',Icon:ZapIcon,tip:'Optimise — find tests and improvement ideas' }];
  return (
    <header className="h-12 px-3 bg-white border-b border-line flex items-center justify-between shrink-0 relative">
      <div className="flex items-center gap-2 min-w-0">
        <a href="#" className="shrink-0">
          <div className="w-7 h-7 rounded-full bg-genesis flex items-center justify-center text-white font-bold text-xs">E</div>
        </a>
        <button
          ref={projAnchor}
          onClick={() => setProjOpen(o => !o)}
          className="inline-flex items-center gap-1.5 h-[31px] px-2.5 bg-white border border-line rounded-lg text-[12.5px] font-medium text-ink hover:bg-surface-sub transition-colors">
          <Folder size={13} className="text-ink-soft"/>
          <span className="truncate max-w-[160px]">{project.name}</span>
          <ChevronDown size={10} sw={1.5} className="text-ink-soft"/>
        </button>
        <Popover anchorRef={projAnchor} open={projOpen} onClose={() => setProjOpen(false)} width={240}>
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Switch project</div>
          {PROJECTS.map(p => (
            <MenuItem key={p.id} icon={<Folder size={13}/>} label={p.name} active={p.id === project.id}
              onClick={() => { onProjectChange(p); setProjOpen(false); }}/>
          ))}
        </Popover>
        <span className="text-[10px] font-medium text-ink-soft bg-surface-muted px-1.5 py-0.5 rounded ml-1">V1.5</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 inline-flex items-center h-[34px] p-0.5 gap-0.5 bg-surface-muted border border-line rounded-md">
        {modes.map(({id,label,Icon,tip}) => {
          const active = mode === id;
          return (
            <Tip key={id} label={tip} side="bottom">
              <button onClick={() => onModeChange(id)}
                className={`inline-flex items-center gap-1.5 h-7 px-3 rounded text-[12px] font-medium transition-colors ${active ? 'bg-white text-genesis shadow-xs' : 'text-ink-muted hover:text-ink'}`}>
                <Icon size={14}/> {label}
              </button>
            </Tip>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Tip label="Undo  ⌘Z" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors"><Undo size={15}/></button></Tip>
        <Tip label="Redo  ⇧⌘Z" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled><Redo size={15}/></button></Tip>
        <span className="w-px h-5 bg-line mx-0.5"/>
        <Tip label="Notifications" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors"><Bell size={15}/></button></Tip>
        <Tip label="Refresh" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors"><Refresh size={15}/></button></Tip>
        <Tip label="Settings" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors"><Cog size={15}/></button></Tip>
        <span className="w-px h-5 bg-line mx-0.5"/>
        <button className="inline-flex items-center gap-1.5 h-[35px] px-3.5 bg-genesis hover:bg-genesis-hover text-white text-[12.5px] font-semibold rounded-lg shadow-publish transition-colors">
          <Globe size={15}/> Publish
        </button>
        <button className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border border-line hover:bg-surface-sub transition-colors">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white text-[10px] font-semibold flex items-center justify-center">RJ</span>
          <ChevronDown size={10} sw={1.5} className="text-ink-soft"/>
        </button>
      </div>
    </header>
  );
}

function ContextBar({ funnel, onFunnelChange, mode }) {
  const showToast = useToast();
  const [funOpen, setFunOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [funnelAction, setFunnelAction] = useState(null); // 'rename'|'duplicate'|'delete'|'settings'|null
  const funAnchor = useRef(null);
  const statusAnchor = useRef(null);
  const kebabAnchor = useRef(null);
  const dateAnchor = useRef(null);
  const setStatus = (s) => { onFunnelChange({ ...funnel, status: s }); setStatusOpen(false); };
  return (
    <div className="h-10 px-3 bg-surface-cool border-b border-line-soft flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Funnel switcher with workflow icon */}
        <button
          ref={funAnchor}
          onClick={() => setFunOpen(o => !o)}
          className="inline-flex items-center gap-1.5 h-7 px-2 -ml-1 rounded text-[13px] font-semibold text-ink hover:bg-white transition-colors min-w-0">
          <Workflow size={13} className="text-brand shrink-0"/>
          <span className="truncate max-w-[260px]">{funnel.name}</span>
          <ChevronDown size={11} sw={2} className="text-ink-soft shrink-0"/>
        </button>
        <Popover anchorRef={funAnchor} open={funOpen} onClose={() => setFunOpen(false)} width={280}>
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Funnels in this project</div>
          {FUNNELS.map(f => (
            <MenuItem key={f.id}
              icon={<span className={`w-2 h-2 rounded-full ${f.status==='live'?'bg-good':f.status==='draft'?'bg-warn':'bg-ink-soft'}`}/>}
              label={f.name}
              active={f.id === funnel.id}
              onClick={() => { onFunnelChange(f); setFunOpen(false); }}/>
          ))}
          <MenuDivider/>
          <MenuItem icon={<Plus size={13}/>} label="New funnel" onClick={() => { setFunOpen(false); window.dispatchEvent(new CustomEvent('open-new-funnel')); }}/>
        </Popover>

        {/* Status chip — flex items-center forces vertical centering relative to the funnel button */}
        <span className="inline-flex items-center">
          <button ref={statusAnchor} onClick={() => setStatusOpen(o => !o)} className="hover:opacity-80 transition-opacity inline-flex items-center">
            <Chip kind={funnel.status} dot>
              {funnel.status === 'live' ? 'Live' : funnel.status === 'draft' ? 'Draft' : 'Paused'}
            </Chip>
          </button>
        </span>
        <Popover anchorRef={statusAnchor} open={statusOpen} onClose={() => setStatusOpen(false)} width={160}>
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Set status</div>
          <MenuItem icon={<span className="w-2 h-2 rounded-full bg-warn"/>} label="Draft"  active={funnel.status==='draft'}  onClick={() => setStatus('draft')}/>
          <MenuItem icon={<span className="w-2 h-2 rounded-full bg-good"/>} label="Live"   active={funnel.status==='live'}   onClick={() => setStatus('live')}/>
          <MenuItem icon={<span className="w-2 h-2 rounded-full bg-ink-soft"/>} label="Paused" active={funnel.status==='paused'} onClick={() => setStatus('paused')}/>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        {mode === 'analyse' && (
          <>
            <button ref={dateAnchor} onClick={() => setDateOpen(o => !o)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-white border border-line rounded-md text-[12px] font-medium text-ink-muted hover:bg-surface-sub transition-colors">
              <Calendar size={12} className="text-ink-soft"/> Last 7 days <ChevronDown size={10} sw={1.5}/>
            </button>
            <Popover anchorRef={dateAnchor} open={dateOpen} onClose={() => setDateOpen(false)} width={180} align="end">
              <MenuItem label="Today" onClick={() => setDateOpen(false)}/>
              <MenuItem label="Last 7 days" active onClick={() => setDateOpen(false)}/>
              <MenuItem label="Last 30 days" onClick={() => setDateOpen(false)}/>
              <MenuItem label="Last 90 days" onClick={() => setDateOpen(false)}/>
              <MenuItem label="All time" onClick={() => setDateOpen(false)}/>
              <MenuDivider/>
              <MenuItem label="Custom range…" onClick={() => setDateOpen(false)}/>
            </Popover>
          </>
        )}
        <Tip label={`${funnel.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}.estage.com`} side="bottom">
          <button className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-white border border-line rounded-md text-[12px] font-medium text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
            <ExternalLink size={12}/> View live
          </button>
        </Tip>
        <Tip label="More actions" side="bottom">
          <button ref={kebabAnchor} onClick={() => setKebabOpen(o => !o)}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-soft hover:bg-white hover:text-ink transition-colors">
            <MoreH size={14}/>
          </button>
        </Tip>
        <Popover anchorRef={kebabAnchor} open={kebabOpen} onClose={() => setKebabOpen(false)} width={200} align="end">
          <MenuItem icon={<Edit         size={13}/>} label="Rename funnel"     onClick={() => { setKebabOpen(false); setFunnelAction('rename'); }}/>
          <MenuItem icon={<Copy         size={13}/>} label="Duplicate funnel"  onClick={() => { setKebabOpen(false); setFunnelAction('duplicate'); }}/>
          <MenuItem icon={<ExternalLink size={13}/>} label="Copy live URL"     onClick={() => { setKebabOpen(false); const u = `${funnel.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}.estage.com`; navigator.clipboard?.writeText(u); showToast('Copied to clipboard'); }}/>
          <MenuDivider/>
          <MenuItem icon={<Cog          size={13}/>} label="Funnel settings"   onClick={() => { setKebabOpen(false); setFunnelAction('settings'); }}/>
          <MenuDivider/>
          <MenuItem icon={<Trash        size={13}/>} label="Delete funnel"     danger onClick={() => { setKebabOpen(false); setFunnelAction('delete'); }}/>
        </Popover>
      </div>
      {funnelAction && <FunnelActionModal action={funnelAction} funnel={funnel} onClose={() => setFunnelAction(null)} onConfirm={(payload) => {
        if (funnelAction === 'rename'    && payload?.name) onFunnelChange({ ...funnel, name: payload.name });
        if (funnelAction === 'duplicate' && payload?.name) onFunnelChange({ ...funnel, id: 'f-' + Date.now(), name: payload.name });
        // 'delete' is destructive; for the demo we leave the funnel in place but log.
        if (funnelAction === 'delete') console.log('[ContextBar] delete funnel', funnel.id);
        setFunnelAction(null);
      }}/>}
    </div>
  );
}

/* FunnelActionModal — Rename / Duplicate / Delete / Settings (matches TemplateModal styling) */
function FunnelActionModal({ action, funnel, onClose, onConfirm }) {
  const [name, setName] = useState(action === 'duplicate' ? `Copy of ${funnel.name}` : funnel.name);
  const isDelete = action === 'delete';
  const isSettings = action === 'settings';
  const titleMap = {
    rename:    'Rename funnel',
    duplicate: 'Duplicate funnel',
    delete:    'Delete funnel',
    settings:  'Funnel settings',
  };
  const ctaMap = {
    rename:    'Save',
    duplicate: 'Duplicate',
    delete:    'Delete',
    settings:  'Done',
  };
  const handleConfirm = () => onConfirm(isDelete || isSettings ? {} : { name });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className={`modal-card max-w-[92vw] bg-white rounded-xl shadow-modal border border-line overflow-hidden ${isSettings ? 'w-[560px]' : 'w-[440px]'}`}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft">
          <div className="flex items-center gap-2">
            {isDelete && <span className="w-7 h-7 rounded-md bg-bad-soft text-bad-deep inline-flex items-center justify-center"><Trash size={14}/></span>}
            {action === 'rename'    && <span className="w-7 h-7 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center"><Edit size={14}/></span>}
            {action === 'duplicate' && <span className="w-7 h-7 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center"><Copy size={14}/></span>}
            {isSettings && <span className="w-7 h-7 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center"><Cog size={14}/></span>}
            <h3 className="text-[14px] font-semibold text-ink">{titleMap[action]}</h3>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors"><X size={14}/></button>
        </div>
        <div className="px-5 py-4">
          {action === 'rename' && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft block mb-1.5">Funnel name</label>
              <input value={name} autoFocus onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                className="w-full h-9 px-3 text-[13px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-colors"/>
            </div>
          )}
          {action === 'duplicate' && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft block mb-1.5">Duplicate as</label>
              <input value={name} autoFocus onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                className="w-full h-9 px-3 text-[13px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-colors"/>
              <p className="text-[11.5px] text-ink-soft mt-2">A copy will be created. All pages, sources, and analytics start fresh.</p>
            </div>
          )}
          {isDelete && (
            <div>
              <p className="text-[13px] text-ink leading-snug">Delete <span className="font-semibold">{funnel.name}</span>?</p>
              <p className="text-[11.5px] text-ink-soft mt-2 leading-snug">This will permanently remove the funnel, its pages, and all associated analytics. This action cannot be undone.</p>
            </div>
          )}
          {isSettings && <FunnelSettingsTabs funnel={funnel}/>}
        </div>
        <div className="px-5 py-3 bg-surface-sub border-t border-line-soft flex items-center justify-end gap-2">
          <button onClick={onClose}
            className="h-8 px-3 inline-flex items-center text-[12px] font-medium text-ink-muted bg-white border border-line rounded-md hover:bg-surface-muted hover:text-ink transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className={`h-8 px-3.5 inline-flex items-center text-[12px] font-semibold text-white rounded-md transition-colors ${
              isDelete ? 'bg-bad hover:bg-bad-deep' : 'bg-genesis hover:bg-genesis-hover'
            }`}>
            {ctaMap[action]}
          </button>
        </div>
      </div>
    </div>
  );
}

const FOLDERS = {
  root:        { id:'root',        name:'All',       items:['shared','home-pages','campaigns'] },
  shared:      { id:'shared',      name:'Shared',    parent:'root', items:['p1','p2','p3'] },
  'home-pages':{ id:'home-pages',  name:'Home',      parent:'root', items:['p4','p5','p6'] },
  campaigns:   { id:'campaigns',   name:'Campaigns', parent:'root', items:['p7','p8','p9'] },
};
const PAGES = {
  p1:{ id:'p1', title:'Welcome to the Vault',     path:'/welcome',         status:'live',  type:'landing'    },
  p2:{ id:'p2', title:'Founding Member Offer',    path:'/founding-member', status:'draft', type:'sales'      },
  p3:{ id:'p3', title:'Origin Story',             path:'/origin',          status:'live',  type:'landing'    },
  p4:{ id:'p4', title:'M1000 Live Reg',           path:'/m1000-reg',       status:'live',  type:'webinar'    },
  p5:{ id:'p5', title:'Ambassador Hub',           path:'/ambassador',      status:'draft', type:'membership' },
  p6:{ id:'p6', title:'Members Dashboard',        path:'/members',         status:'live',  type:'membership' },
  p7:{ id:'p7', title:'May Promo Sale',           path:'/may-promo',       status:'live',  type:'sales'      },
  p8:{ id:'p8', title:'Black Friday',             path:'/bf2025',          status:'draft', type:'sales'      },
  p9:{ id:'p9', title:'Webinar Replay',           path:'/webinar-replay',  status:'live',  type:'webinar'    },
};
const IN_FUNNEL = [
  { id:'f1', title:'Landing Page',     path:'/may-promo', status:'live',  type:'landing'  },
  { id:'f2', title:'Lead Magnet Form', path:'/download',  status:'live',  type:'form'     },
  { id:'f3', title:'Thank You',        path:'/thanks',    status:'draft', type:'thanks'   },
];
const PAGES_IN_FUNNEL_IDS = new Set(['p7']);
const SOURCES = [
  { id:'fb',  name:'Facebook',     Icon:FacebookIcon, color:'#1877F2', usage:'in-funnel', meta:'3.2k visitors' },
  { id:'yt',  name:'YouTube',      Icon:YoutubeIcon,  color:'#FF0000', usage:'available', meta:'1.1k visitors' },
  { id:'ig',  name:'Instagram',    Icon:InstaIcon,    color:'#E1306C', usage:'available', meta:'Available'     },
  { id:'ga',  name:'Google Ads',   Icon:Target,       color:'#4285F4', usage:'available', meta:'Available'     },
  { id:'cpa', name:'CPA',          Icon:Dollar,       color:'#10B981', usage:'available', meta:'Available'     },
  { id:'em',  name:'Email',        Icon:Mail,         color:'#475569', usage:'in-funnel', meta:'846 visitors'  },
  { id:'aff', name:'Affiliates',   Icon:UsersIcon,    color:'#7C3AED', usage:'available', meta:'Available'     },
  { id:'src', name:'Custom source',Icon:Plus,         color:'#94A3B8', usage:'available', meta:'Available'     },
];
const TEMPLATES = [
  { id:'t1', name:'Lead magnet',    desc:'Capture emails with a free download.',  steps:3 },
  { id:'t2', name:'Webinar',        desc:'Reg → confirmation → live → offer.',    steps:5 },
  { id:'t3', name:'Tripwire',       desc:'Low-cost offer → upsell → thank you.',  steps:4 },
  { id:'t4', name:'Sales funnel',   desc:'Lead → nurture → checkout → upsell.',   steps:6 },
  { id:'t5', name:'Application',    desc:'Qualify high-ticket leads.',            steps:4 },
  { id:'t6', name:'Course launch',  desc:'Pre-launch → cart → close.',            steps:7 },
  { id:'t7', name:'Free + shipping',desc:'Just-pay-shipping offer flow.',         steps:5 },
  { id:'t8', name:'Membership',     desc:'Lead → trial → conversion.',            steps:5 },
];

/* Source lookup — used by SourceNode to resolve src ref to brand icon/color */
const SOURCE_BY_ID = Object.fromEntries(SOURCES.map(s => [s.id, s]));

/* DEMO STATES — drive canvas. Same data shape as ReactFlow nodes/edges so
   production swap is trivial. Page node = 260×160, source node = 220×120.
   Edges connect right-handle of `from` to left-handle of `to`. */
const NODE_W = { page: 240, source: 220, logic: 200 };
const NODE_H = { page: 180, source: 120, logic: 80 };
/* Source + Page cards shrink in Build mode (no metric row). All edge anchors,
   drop-target outlines, hit-tests, and bbox math read this. */
const getNodeH = (node, mode) => {
  if (node.type === 'source') return mode === 'analyse' ? 120 : 92;
  if (node.type === 'page')   return mode === 'analyse' ? 180 : 160;
  return NODE_H[node.type];
};

const DEMO_STATES = {
  empty: { label: 'Empty', nodes: [], edges: [] },

  leadMagnet: {
    label: 'Lead Magnet',
    nodes: [
      { id:'s1', type:'source', x:60,   y:240, data:{ src:'fb', visitorsNum:5160, visitorsLabel:'5.2k' } },
      { id:'p1', type:'page',   x:380,  y:220, data:{ pageType:'landing', title:'May Promo Landing', path:'/may-promo',     status:'live',  visitors:3200, conversions:768, rate:24.0 } },
      { id:'p2', type:'page',   x:740,  y:220, data:{ pageType:'form',    title:'Lead Magnet Form',  path:'/download',      status:'live',  visitors:768,  conversions:412, rate:53.6 } },
      { id:'p3', type:'page',   x:1100, y:220, data:{ pageType:'thanks',  title:'Thank You',         path:'/thanks',        status:'live',  visitors:412,  conversions:412, rate:100  } },
    ],
    edges: [
      { from:'s1', to:'p1', volume:3200 },
      { from:'p1', to:'p2', volume:768  },
      { from:'p2', to:'p3', volume:412  },
    ],
  },

  webinar: {
    label: 'Webinar',
    nodes: [
      { id:'s1', type:'source', x:60,   y:240, data:{ src:'em', visitorsNum:1395, visitorsLabel:'1.4k' } },
      { id:'p1', type:'page',   x:380,  y:220, data:{ pageType:'landing', title:'Webinar Reg',       path:'/m1000-reg',     status:'live',  visitors:846,  conversions:512, rate:60.5 } },
      { id:'p2', type:'page',   x:740,  y:220, data:{ pageType:'webinar', title:'Live Event',        path:'/m1000-live',    status:'live',  visitors:512,  conversions:340, rate:66.4 } },
      { id:'p3', type:'page',   x:1100, y:80,  data:{ pageType:'sales',   title:'Founding Offer',    path:'/founding',      status:'live',  visitors:340,  conversions:84,  rate:24.7 } },
      { id:'p4', type:'page',   x:1460, y:220, data:{ pageType:'thanks',  title:'Thank You',         path:'/thanks',        status:'draft', visitors:256,  conversions:256, rate:100  } },
    ],
    edges: [
      { from:'s1', to:'p1', volume:846 },
      { from:'p1', to:'p2', volume:512 },
      { from:'p2', to:'p3', volume:340, label:'showed up' },
      { from:'p2', to:'p4', volume:172, label:"didn't show" },
      { from:'p3', to:'p4', volume:84  },
    ],
  },

  tripwire: {
    label: 'Tripwire',
    nodes: [
      { id:'p1', type:'page', x:80,   y:220, data:{ pageType:'sales',    title:'$7 Tripwire',       path:'/7-offer',     status:'live',  visitors:1280, conversions:286, rate:22.3 } },
      { id:'p2', type:'page', x:440,  y:220, data:{ pageType:'checkout', title:'Order Form',        path:'/checkout',    status:'live',  visitors:286,  conversions:204, rate:71.3 } },
      { id:'p3', type:'page', x:800,  y:220, data:{ pageType:'upsell',   title:'$47 Upsell',        path:'/upsell-1',    status:'live',  visitors:204,  conversions:62,  rate:30.4 } },
      { id:'p4', type:'page', x:1160, y:220, data:{ pageType:'thanks',   title:'Order Confirmed',   path:'/order-done',  status:'live',  visitors:204,  conversions:204, rate:100  } },
    ],
    edges: [
      { from:'p1', to:'p2', volume:286 },
      { from:'p2', to:'p3', volume:204 },
      { from:'p3', to:'p4', volume:204 },
    ],
  },

  sales: {
    label: 'Sales',
    nodes: [
      { id:'s1', type:'source', x:60,   y:120, data:{ src:'fb', visitorsNum:5160, visitorsLabel:'5.2k' } },
      { id:'s2', type:'source', x:60,   y:340, data:{ src:'em', visitorsNum:3000, visitorsLabel:'3.0k' } },
      { id:'p1', type:'page',   x:380,  y:220, data:{ pageType:'landing',    title:'Black Friday Hub', path:'/bf2025',      status:'live',  visitors:4600, conversions:1380, rate:30.0 } },
      { id:'p2', type:'page',   x:740,  y:220, data:{ pageType:'form',       title:'VIP List Opt-in',  path:'/vip',         status:'live',  visitors:1380, conversions:892,  rate:64.6 } },
      { id:'p3', type:'page',   x:1100, y:220, data:{ pageType:'sales',      title:'Founding Offer',   path:'/founding',    status:'live',  visitors:892,  conversions:124,  rate:13.9 } },
      { id:'p4', type:'page',   x:1460, y:220, data:{ pageType:'checkout',   title:'Checkout',         path:'/buy',         status:'live',  visitors:124,  conversions:96,   rate:77.4 } },
      { id:'p5', type:'page',   x:1820, y:120, data:{ pageType:'upsell',     title:'Vault Upsell',     path:'/vault',       status:'draft', visitors:96,   conversions:28,   rate:29.2 } },
      { id:'p6', type:'page',   x:1820, y:340, data:{ pageType:'thanks',     title:'Welcome Aboard',   path:'/welcome',     status:'live',  visitors:96,   conversions:96,   rate:100  } },
    ],
    edges: [
      { from:'s1', to:'p1', volume:3200 },
      { from:'s2', to:'p1', volume:1400 },
      { from:'p1', to:'p2', volume:1380 },
      { from:'p2', to:'p3', volume:892  },
      { from:'p3', to:'p4', volume:124  },
      { from:'p4', to:'p5', volume:96   },
      { from:'p4', to:'p6', volume:96   },
      { from:'p5', to:'p6', volume:28   },
    ],
  },
};

const DEMO_STATE_ORDER = ['empty','leadMagnet','webinar','tripwire','sales'];


/* FunnelSettingsTabs — tabbed settings panel (inside FunnelActionModal).
   General / Tracking / Integrations / Notifications / Privacy / Danger. */
function FunnelSettingsTabs({ funnel }) {
  const [tab, setTab] = useState('general');
  const tabs = [
    { id: 'general',       label: 'General'       },
    { id: 'tracking',      label: 'Tracking'      },
    { id: 'integrations',  label: 'Integrations'  },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy',       label: 'Privacy'       },
    { id: 'danger',        label: 'Danger'        },
  ];
  return (
    <div className="-mx-5 -my-4">
      {/* Tab strip */}
      <div className="flex items-stretch px-3 border-b border-line-soft overflow-x-auto scroll-thin">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap
                        ${tab === t.id ? 'text-ink' : 'text-ink-soft hover:text-ink-muted'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4 max-h-[440px] overflow-y-auto scroll-thin">
        {tab === 'general' && (
          <div className="space-y-3">
            <Field label="Funnel name">
              <input defaultValue={funnel.name}
                className="w-full h-8 px-2.5 text-[12.5px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand"/>
            </Field>
            <Field label="URL slug">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-ink-soft">/</span>
                <input defaultValue={funnel.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}
                  className="flex-1 h-8 px-2.5 text-[12.5px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand font-mono"/>
              </div>
            </Field>
            <Field label="Custom domain">
              <input defaultValue={`${funnel.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}.estage.com`}
                className="w-full h-8 px-2.5 text-[12px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand font-mono"/>
            </Field>
            <Field label="Description">
              <textarea defaultValue="" placeholder="Optional internal description for this funnel."
                className="w-full h-16 px-2.5 py-1.5 text-[12px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand resize-none"/>
            </Field>
          </div>
        )}

        {tab === 'tracking' && (
          <div className="space-y-3">
            <Field label="Analytics" gap="loose">
              <ConnectRow Icon={Activity}     name="Google Analytics"  status="connected"    color="#F59E0B"/>
              <ConnectRow Icon={Activity}     name="Meta Pixel"        status="connected"    color="#1877F2"/>
              <ConnectRow Icon={Activity}     name="TikTok Pixel"      status="not-connected" color="#000000"/>
              <ConnectRow Icon={Activity}     name="Custom JS / Tag Manager" status="not-connected" color="#475569"/>
            </Field>
            <Field label="Behavior" gap="loose">
              <Toggle label="Track conversions" defaultOn/>
              <Toggle label="Track scroll depth" defaultOn/>
              <Toggle label="Track form abandonment" />
              <Toggle label="Mask PII in events" defaultOn/>
            </Field>
          </div>
        )}

        {tab === 'integrations' && (
          <div className="space-y-3">
            <Field label="Traffic sources" gap="loose">
              <ConnectRow Icon={Globe}     name="Facebook Ads"  status="connected"    color="#1877F2"/>
              <ConnectRow Icon={Globe}     name="Google Ads"    status="connected"    color="#EA4335"/>
              <ConnectRow Icon={Globe}     name="YouTube"       status="not-connected" color="#FF0000"/>
              <ConnectRow Icon={Globe}     name="TikTok Ads"    status="not-connected" color="#000000"/>
              <ConnectRow Icon={Globe}     name="LinkedIn Ads"  status="not-connected" color="#0A66C2"/>
            </Field>
            <Field label="Email" gap="loose">
              <ConnectRow Icon={Mail}      name="Mailchimp"     status="not-connected" color="#FFE01B"/>
              <ConnectRow Icon={Mail}      name="Klaviyo"       status="not-connected" color="#0C2340"/>
              <ConnectRow Icon={Mail}      name="ConvertKit"    status="not-connected" color="#FB6970"/>
            </Field>
            <Field label="CRM / Automation" gap="loose">
              <ConnectRow Icon={Activity}  name="HubSpot"       status="not-connected" color="#FF7A59"/>
              <ConnectRow Icon={Activity}  name="Salesforce"    status="not-connected" color="#00A1E0"/>
              <ConnectRow Icon={Activity}  name="Zapier"        status="connected"     color="#FF4A00"/>
              <ConnectRow Icon={Activity}  name="Make (Integromat)" status="not-connected" color="#6D00CC"/>
            </Field>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-3">
            <Field label="Email alerts" gap="loose">
              <Toggle label="On every conversion" />
              <Toggle label="Daily summary" defaultOn/>
              <Toggle label="On error / downtime" defaultOn/>
            </Field>
            <Field label="Slack" gap="loose">
              <ConnectRow Icon={Activity} name="Slack workspace" status="not-connected" color="#4A154B"/>
              <Toggle label="Post conversions to channel" />
            </Field>
            <Field label="Recipient">
              <input defaultValue="ryan@estage.com"
                className="w-full h-8 px-2.5 text-[12px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand"/>
            </Field>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="space-y-3">
            <Field label="Visibility" gap="loose">
              <Toggle label="Indexable in search engines" />
              <Toggle label="Public preview link" defaultOn/>
              <Toggle label="Show in Estage marketplace" />
            </Field>
            <Field label="Compliance" gap="loose">
              <Toggle label="GDPR cookie banner" defaultOn/>
              <Toggle label="CCPA opt-out link" defaultOn/>
              <Toggle label="Strip IP addresses from analytics" />
            </Field>
            <Field label="Data retention">
              <select defaultValue="365"
                className="w-full h-8 pl-2 pr-7 text-[12px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
                <option value="forever">Forever</option>
              </select>
            </Field>
          </div>
        )}

        {tab === 'danger' && (
          <div className="space-y-3">
            <div className="border border-bad/30 bg-bad-soft/40 rounded-md p-3">
              <div className="text-[12.5px] font-semibold text-ink mb-1">Archive funnel</div>
              <div className="text-[11.5px] text-ink-soft mb-2 leading-snug">Hides the funnel and stops collecting data. You can restore it later.</div>
              <button className="h-7 px-2.5 text-[11.5px] font-semibold text-bad-deep bg-white border border-bad/30 rounded hover:bg-bad-soft transition-colors">Archive</button>
            </div>
            <div className="border border-bad/30 bg-bad-soft/40 rounded-md p-3">
              <div className="text-[12.5px] font-semibold text-ink mb-1">Reset analytics</div>
              <div className="text-[11.5px] text-ink-soft mb-2 leading-snug">Clears all visit, conversion, and revenue data for this funnel.</div>
              <button className="h-7 px-2.5 text-[11.5px] font-semibold text-bad-deep bg-white border border-bad/30 rounded hover:bg-bad-soft transition-colors">Reset analytics</button>
            </div>
            <div className="border border-bad bg-bad-soft rounded-md p-3">
              <div className="text-[12.5px] font-semibold text-bad-deep mb-1">Delete funnel</div>
              <div className="text-[11.5px] text-ink-muted mb-2 leading-snug">Permanently delete this funnel and all associated data. Cannot be undone.</div>
              <button className="h-7 px-2.5 text-[11.5px] font-semibold text-white bg-bad hover:bg-bad-deep rounded transition-colors">Delete funnel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ConnectRow — used inside FunnelSettingsTabs. Status: 'connected' | 'not-connected'. */
function ConnectRow({ Icon, name, status, color }) {
  const [s, setS] = useState(status);
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-1.5 bg-white border border-line-soft rounded-md">
      <span className="w-7 h-7 rounded-md inline-flex items-center justify-center shrink-0"
        style={{ background: color + '1a', color }}>
        <Icon size={14}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-ink truncate">{name}</div>
        <div className="text-[10.5px] text-ink-soft mt-px inline-flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${s === 'connected' ? 'bg-good live-dot' : 'bg-ink-soft'}`}/>
          {s === 'connected' ? 'Connected' : 'Not connected'}
        </div>
      </div>
      <button onClick={() => setS(s === 'connected' ? 'not-connected' : 'connected')}
        className={`h-7 px-2.5 text-[11px] font-semibold rounded transition-colors shrink-0 ${
          s === 'connected'
            ? 'text-bad-deep bg-white border border-line hover:bg-bad-soft hover:border-bad'
            : 'text-white bg-genesis hover:bg-genesis-hover'
        }`}>
        {s === 'connected' ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);
  const [adjusted, setAdjusted] = useState({ x, y, up: false });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let nx = x, ny = y, up = false;
    if (x + r.width > window.innerWidth - 8) nx = window.innerWidth - r.width - 8;
    if (y + r.height > window.innerHeight - 8) { ny = y - r.height; up = true; }
    setAdjusted({ x: nx, y: ny, up });
  }, [x, y]);
  useEffect(() => {
    let active = false;
    const handler = (e) => { if (!active) return; if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const t = setTimeout(() => { active = true; document.addEventListener('mousedown', handler); document.addEventListener('contextmenu', handler); }, 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); document.removeEventListener('contextmenu', handler); };
  }, [onClose]);
  return createPortal(
    <div ref={ref} className={`ctx-menu fixed z-[9998] min-w-[200px] bg-white rounded-lg shadow-menu p-1 ${adjusted.up ? 'up' : ''}`} style={{ top: adjusted.y, left: adjusted.x }}>
      {items.map((it, i) =>
        it.divider ? <MenuDivider key={i}/> :
        <MenuItem key={i} icon={it.icon} label={it.label} danger={it.danger} onClick={() => { it.action(); onClose(); }}/>
      )}
    </div>,
    document.body
  );
}

/* ─── TEMPLATE MODAL ─── */
function TemplateModal({ template, onClose, onConfirm }) {
  if (!template) return null;
  const stepTypes = TEMPLATE_STEPS[template.id] || ['custom'];
  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="modal-card w-[480px] max-w-full bg-white rounded-xl shadow-modal overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-[16px] font-semibold text-ink leading-tight">Replace funnel with template?</h3>
            <button onClick={onClose} className="w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-soft hover:bg-surface-sub hover:text-ink transition-colors -mr-1.5 -mt-1">
              <X size={14}/>
            </button>
          </div>
          <p className="text-[12.5px] text-ink-muted leading-relaxed">
            This will replace your current funnel structure with the <span className="font-semibold text-ink">{template.name}</span> template. Your existing pages stay in your project — only the canvas layout will change.
          </p>
        </div>

        {/* Mini funnel preview diagram */}
        <div className="mx-5 mb-5 px-4 py-5 bg-surface-cool rounded-lg border border-line-soft">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft mb-3 text-center">Funnel preview · {template.steps} steps</div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {stepTypes.map((tk, i) => {
              const t = PAGE_TYPE[tk] || PAGE_TYPE.custom;
              const TIcon = t.Icon;
              return (
                <Fragment key={i}>
                  <div className="flex flex-col items-center gap-1 w-[58px]">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: t.color + '1a', color: t.color }}>
                      <TIcon size={16}/>
                    </span>
                    <span className="text-[9.5px] font-medium text-ink-muted text-center leading-tight">{t.label}</span>
                  </div>
                  {i < stepTypes.length - 1 && (
                    <ChevronRight size={12} className="text-ink-soft mb-4 shrink-0"/>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-3 bg-surface-cool border-t border-line-soft flex items-center justify-end gap-2">
          <button onClick={onClose}
            className="h-8 px-3 rounded-md text-[12.5px] font-medium text-ink-muted hover:bg-white hover:text-ink transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(template); onClose(); }}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-genesis hover:bg-genesis-hover text-white text-[12.5px] font-semibold rounded-md shadow-publish transition-colors">
            Use this template
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Sidebar({ onAIClick, onBuildAIClick, collapsed, onToggleCollapsed, focusSection, onFocusSection, onTemplateClick, canvasApi, canvasNodes = [] }) {
  const [open, setOpen] = useState({ pages:true, inFunnel:false, sources:true, templates:false });
  const [folder, setFolder] = useState('root');
  const [search, setSearch] = useState('');
  const [activePage, setActivePage] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);
  const sectionRefs = { pages: useRef(null), inFunnel: useRef(null), sources: useRef(null), templates: useRef(null) };
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    if (focusSection && sectionRefs[focusSection]?.current) {
      setOpen({ pages:false, inFunnel:false, sources:false, templates:false, [focusSection]: true });
      setTimeout(() => sectionRefs[focusSection].current.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
      onFocusSection(null);
    }
  }, [focusSection]);

  const cur = FOLDERS[folder];
  const q = search.trim().toLowerCase();
  const matches = (s) => !q || (s || '').toLowerCase().includes(q);
  const folderItems = useMemo(() => {
    return cur.items
      .map(id => PAGES[id] ? { kind:'page', ...PAGES[id] } : { kind:'folder', ...FOLDERS[id] })
      .filter(it => matches(it.title || it.name));
  }, [folder, q]);
  // Derive "In this funnel" entirely from canvas nodes (page type only).
  // Click pans canvas to the node + selects it.
  const inFunnelLive = useMemo(
    () => canvasNodes.filter(n => n.type === 'page').map(n => ({
      id:      n.id,
      title:   n.data.title || 'Untitled page',
      path:    n.data.path,
      status:  n.data.status || 'draft',
      type:    n.data.pageType || 'custom',
    })),
    [canvasNodes]
  );
  const inFunnelMatches = useMemo(() => inFunnelLive.filter(p => matches(p.title)), [inFunnelLive, q]);
  // Set of source IDs currently on canvas — used to gate the "In funnel" pill.
  const sourceIdsOnCanvas = useMemo(
    () => new Set(canvasNodes.filter(n => n.type === 'source').map(n => n.data.src).filter(Boolean)),
    [canvasNodes]
  );
  const sourceMatches = useMemo(() => SOURCES.filter(s => matches(s.name)), [q]);
  const templateMatches = useMemo(() => TEMPLATES.filter(t => matches(t.name)), [q]);
  const isSearching = !!q;
  const totalMatches = (isSearching
    ? folderItems.length + inFunnelMatches.length + sourceMatches.length + templateMatches.length
    : null);

  const onPageContext = (e, page, section) => {
    e.preventDefault(); e.stopPropagation();
    // Two distinct menus based on which sidebar section the user right-clicked:
    //   'library'   → Estage page library; minimal (edit / open).
    //   'in-funnel' → page in this funnel; full set (edit / open / rename / dup / delete).
    let items;
    if (section === 'library') {
      items = [
        { label:'Edit in builder', icon:<Sparkles     size={14}/>, action: () => {} },
        { label:'Open in new tab', icon:<ExternalLink size={14}/>, action: () => window.open('#preview-'+page.id,'_blank') },
      ];
    } else {
      items = [
        { label:'Edit in builder',   icon:<Sparkles     size={14}/>, action: () => {} },
        { label:'Open in new tab',   icon:<ExternalLink size={14}/>, action: () => window.open('#preview-'+page.id,'_blank') },
        { label:'Rename in funnel',  icon:<Edit         size={14}/>, action: () => {} },
        { label:'Duplicate',         icon:<Copy         size={14}/>, action: () => {} },
        { divider:true },
        { label:'Delete from funnel', icon:<Trash       size={14}/>, action: () => {
          canvasApi?.current?.removeNodeByTitle(page.title);
        }, danger:true },
      ];
    }
    setCtxMenu({ x: e.clientX, y: e.clientY, items });
  };

  if (collapsed) {
    const railNav = [
      { id:'pages',     Icon:FileIcon, label:'Your pages'      },
      { id:'inFunnel',  Icon:Folder,   label:'In this funnel'  },
      { id:'sources',   Icon:Globe,    label:'Traffic sources' },
      { id:'templates', Icon:StarIcon, label:'Templates'       },
    ];
    return (
      <aside className="sidebar w-[56px] bg-white border-r border-line flex flex-col items-center py-3 shrink-0">
        <Tip label="Expand sidebar" side="right">
          <button onClick={onToggleCollapsed} className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors mb-2">
            <PanelRight size={16}/>
          </button>
        </Tip>
        <div className="w-7 h-px bg-line my-1"/>
        {railNav.map(n => (
          <Tip key={n.id} label={n.label} side="right">
            <button onClick={() => { onToggleCollapsed(); onFocusSection(n.id); }}
              className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors my-0.5">
              <n.Icon size={15}/>
            </button>
          </Tip>
        ))}
        <div className="flex-1"/>
        <Tip label="AI suggestions" side="right">
          <button onClick={onAIClick}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md bg-violet-soft text-violet hover:bg-violet hover:text-white transition-colors ai-ripple">
            <Spark size={15} className="ai-breathe-icon"/>
          </button>
        </Tip>
      </aside>
    );
  }

  return (
    <aside className="sidebar w-[320px] bg-white border-r border-line flex flex-col min-h-0 shrink-0">
      <div className="px-4 pt-3.5 pb-3 border-b border-line-soft shrink-0 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[14px] font-semibold text-ink leading-none">Funnel</h2>
          <span className="text-[11px] text-ink-soft tabular-nums">5 steps</span>
        </div>
        <Tip label="Collapse sidebar" side="bottom">
          <button onClick={onToggleCollapsed}
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-soft hover:bg-surface-sub hover:text-ink transition-colors">
            <PanelLeft size={14}/>
          </button>
        </Tip>
      </div>

      <div className="px-3 py-3 border-b border-line-soft shrink-0">
        <div className="relative">
          <SearchIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"/>
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search funnel…"
            className="w-full h-8 pl-8 pr-3 text-[12.5px] bg-surface-muted border border-transparent rounded-md focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft placeholder:text-ink-soft transition-colors"/>
        </div>
      </div>

      <div className="px-3 py-2.5 border-b border-line-soft shrink-0 flex items-center gap-2">
        <span className="text-[10.5px] font-semibold tracking-wider uppercase text-ink-soft">Quick add</span>
        <div className="flex-1"/>
        {/* Pages cluster */}
        <QuickIcon Icon={Globe}    color="#10B981" tint="#ECFDF5" tintHover="#D1FAE5" label="Add traffic source"
          onClick={() => canvasApi?.current?.addNode({ type:'source', data:{ src:'fb', visitorsNum:0 } })}/>
        <QuickIcon Icon={FileIcon} color="#006CB5" tint="#E6F0F9" tintHover="#CCE0F1" label="Add page"
          onClick={() => canvasApi?.current?.addNode({ type:'page',   data:{ title:'New page', path:'/new', kind:'landing' } })}/>
        <QuickIcon Icon={Cart}     color="#7C3AED" tint="#F3EEFF" tintHover="#E9DEFF" label="Add checkout"
          onClick={() => canvasApi?.current?.addNode({ type:'page',   data:{ title:'Checkout', path:'/checkout', kind:'checkout' } })}/>
        {/* Divider — separates page-creation from flow-logic */}
        <div className="w-px h-5 bg-line-soft mx-0.5"/>
        {/* Logic cluster */}
        <QuickIcon Icon={Bars}     color="#7C3AED" tint="#F3EEFF" tintHover="#E9DEFF" label="Add A/B test"
          onClick={() => canvasApi?.current?.addNode({ type:'logic', data:{ kind:'abtest', title:'A/B Test', split:50 } })}/>
        <QuickIcon Icon={Workflow} color="#7C3AED" tint="#F3EEFF" tintHover="#E9DEFF" label="Add condition"
          onClick={() => canvasApi?.current?.addNode({ type:'logic', data:{ kind:'condition', title:'Condition' } })}/>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {(!isSearching || folderItems.length > 0) && <div ref={sectionRefs.pages}>
          <Section title="Add Pages" count={isSearching ? folderItems.length : Object.keys(PAGES).length}
            open={isSearching ? true : open.pages} onToggle={() => toggle('pages')}>
            {folder !== 'root' && (
              <div className="flex items-center gap-1 px-4 pb-1 text-[11px]">
                <button onClick={() => setFolder(cur.parent || 'root')} className="inline-flex items-center gap-1 text-ink-muted hover:text-ink transition-colors">
                  <ChevronLeft size={11}/> {FOLDERS[cur.parent]?.name || 'All'}
                </button>
                <span className="text-line-strong">/</span>
                <span className="text-ink font-medium">{cur.name}</span>
              </div>
            )}
            {folderItems.map(it =>
              it.kind === 'folder'
                ? <FolderRow key={it.id} folder={it} onClick={() => setFolder(it.id)}/>
                : <PageRow key={it.id} page={it} draggable
                    isInFunnel={PAGES_IN_FUNNEL_IDS.has(it.id)}
                    active={activePage === it.id}
                    onClick={() => setActivePage(it.id)}
                    onContextMenu={(e) => onPageContext(e, it, 'library')}/>
            )}
          </Section>
        </div>}

        {(!isSearching || inFunnelMatches.length > 0) && <div ref={sectionRefs.inFunnel}>
          <Section title="Current Funnel" count={isSearching ? inFunnelMatches.length : inFunnelLive.length}
            open={isSearching ? true : open.inFunnel} onToggle={() => toggle('inFunnel')}>
            {(isSearching ? inFunnelMatches : inFunnelLive).length === 0 && !isSearching && (
              <div className="px-4 py-3 text-[11px] text-ink-soft leading-relaxed">
                No pages added yet. Drag a page from Add Pages above, use Quick&nbsp;add, or start with a template.
              </div>
            )}
            {(isSearching ? inFunnelMatches : inFunnelLive).map(p =>
              <PageRow key={p.id} page={p} inFunnel draggable={false}
                active={activePage === p.id}
                onClick={() => {
                  setActivePage(p.id);
                  canvasApi?.current?.panToNodeByTitle(p.title);
                }}
                onContextMenu={(e) => onPageContext(e, p, 'in-funnel')}/>
            )}
          </Section>
        </div>}

        {(!isSearching || sourceMatches.length > 0) && <div ref={sectionRefs.sources}>
          <Section title="Traffic" count={isSearching ? sourceMatches.length : SOURCES.length}
            open={isSearching ? true : open.sources} onToggle={() => toggle('sources')}>
            {(isSearching ? sourceMatches : SOURCES).map(s => <SourceRow key={s.id} source={s} inFunnel={sourceIdsOnCanvas.has(s.id)}/>)}
          </Section>
        </div>}

        {(!isSearching || templateMatches.length > 0) && <div ref={sectionRefs.templates}>
          <Section title="Funnel Templates" count={isSearching ? templateMatches.length : TEMPLATES.length}
            open={isSearching ? true : open.templates} onToggle={() => toggle('templates')} last>
            <div className="space-y-1.5 py-1">
              {(isSearching ? templateMatches : TEMPLATES).map(t => <TemplateCard key={t.id} tpl={t} onClick={() => onTemplateClick(t)}/>)}
            </div>
          </Section>
        </div>}

        {isSearching && totalMatches === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-surface-sub mx-auto mb-3 inline-flex items-center justify-center">
              <SearchIcon size={14} className="text-ink-soft"/>
            </div>
            <div className="text-[12px] font-semibold text-ink mb-1">No results</div>
            <div className="text-[11px] text-ink-soft">No funnel items match &ldquo;{search}&rdquo;.</div>
          </div>
        )}
      </div>

      <div className="border-t border-line-soft bg-surface-sub p-2.5 shrink-0 space-y-1.5">
        {/* Primary AI action — opens conversational sidebar mode */}
        <button onClick={onBuildAIClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-violet text-white hover:bg-violet-deep transition-colors shadow-xs">
          <span className="w-7 h-7 rounded-md bg-white/20 text-white flex items-center justify-center ai-ripple">
            <Spark size={14} className="ai-breathe-icon"/>
          </span>
          <div className="flex-1 text-left">
            <div className="text-[12.5px] font-semibold leading-none">Build with AI</div>
            <div className="text-[10.5px] text-white/80 mt-0.5">Describe your funnel, AI builds it</div>
          </div>
        </button>
        {/* Secondary — passive suggestions */}
        <button onClick={onAIClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-line hover:border-violet hover:bg-violet-soft transition-colors">
          <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center">
            <Spark size={14}/>
          </span>
          <div className="flex-1 text-left">
            <div className="text-[12.5px] font-semibold text-ink leading-none">AI suggestions</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5">3 smart tips for this funnel</div>
          </div>
          <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded-full bg-violet text-white text-[10px] font-bold tabular-nums">3</span>
        </button>
      </div>

      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={() => setCtxMenu(null)}/>}
    </aside>
  );
}

function Section({ title, count, open, onToggle, children, last }) {
  return (
    <div className={last ? '' : 'border-b border-line-soft'}>
      <button onClick={onToggle} className="w-full flex items-center gap-1.5 px-3 py-2.5 hover:bg-surface-sub transition-colors group">
        <ChevronDown size={11} sw={2} className={`text-ink-soft chev ${open ? '' : '-rotate-90'}`}/>
        <span className="flex-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft text-left">{title}</span>
        {count !== undefined && (
          <span className="text-[10.5px] font-medium text-ink-soft tabular-nums bg-surface-muted group-hover:bg-white px-1.5 py-0.5 rounded transition-colors">{count}</span>
        )}
      </button>
      <div className="accordion" data-open={open}>
        <div><div className="pb-2">{children}</div></div>
      </div>
    </div>
  );
}

function QuickIcon({ Icon, color, tint, tintHover, label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <Tip label={label} side="bottom">
      <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="w-7 h-7 inline-flex items-center justify-center rounded-md transition-colors"
        style={{ background: hover ? tintHover : tint, color }}>
        <Icon size={14}/>
      </button>
    </Tip>
  );
}

function FolderRow({ folder, onClick }) {
  return (
    <button onClick={onClick} className="group/row w-full flex items-center gap-2.5 px-4 py-2 hover:bg-surface-sub border-l-2 border-transparent text-left transition-colors">
      <span className="w-[22px] h-[22px] rounded-[5px] bg-brand-soft text-brand flex items-center justify-center flex-shrink-0">
        <Folder size={12}/>
      </span>
      <span className="flex-1 text-[12.5px] font-medium text-ink truncate">{folder.name}</span>
      <span className="text-[10.5px] text-ink-soft tabular-nums">{folder.items.length}</span>
      <ChevronRight size={11} className="text-ink-soft"/>
    </button>
  );
}

function PageRow({ page, inFunnel, draggable=true, active=false, isInFunnel=false, onClick, onContextMenu }) {
  const t = PAGE_TYPE[page.type] || PAGE_TYPE.custom;
  const TIcon = t.Icon;
  const cursorClass = draggable ? 'cursor-grab' : 'cursor-pointer';
  const onDragStart = (e) => {
    if (!draggable) return;
    /* JSON payload — Canvas reads this on drop to construct the new node */
    e.dataTransfer.setData('application/x-funnel-node', JSON.stringify({
      kind: 'page',
      pageType: page.type,
      title: page.title,
      path: page.path,
      status: page.status || 'draft',
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group/row relative flex items-start gap-2.5 px-4 py-2 ${cursorClass} select-none border-l-2 transition-colors
        ${active ? 'bg-brand-tint border-brand' : 'border-transparent hover:bg-surface-sub'}`}>
      <span
        className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center flex-shrink-0 mt-px"
        style={{background: t.color + '1a', color: t.color}}>
        <TIcon size={12}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className={`text-[12.5px] font-medium truncate leading-tight ${active ? 'text-brand' : 'text-ink'}`}>{page.title}</div>
          {isInFunnel && !inFunnel && (
            <Tip label="Already in this funnel" side="top">
              <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0"/>
            </Tip>
          )}
        </div>
        <div className={`text-[10.5px] mt-px truncate ${active ? 'text-brand/70' : 'text-ink-soft'}`}>{page.path}</div>
      </div>
      <div className="flex items-center gap-1 mt-px">
        <Tip label="Open page in new window" side="top">
          <button onClick={(e) => { e.stopPropagation(); window.open('#preview-' + page.id, '_blank'); }}
            className="row-action w-5 h-5 inline-flex items-center justify-center rounded hover:bg-white text-ink-soft hover:text-brand transition-colors">
            <Eye size={12}/>
          </button>
        </Tip>
        <Chip kind={page.status === 'live' ? 'live' : 'draft'} sm>{page.status === 'live' ? 'Live' : 'Draft'}</Chip>
        {inFunnel && (
          <Tip label="Remove from funnel" side="top">
            <button onClick={(e) => e.stopPropagation()}
              className="row-action w-5 h-5 inline-flex items-center justify-center rounded hover:bg-bad-soft text-ink-soft hover:text-bad-deep transition-colors">
              <X size={12}/>
            </button>
          </Tip>
        )}
      </div>
    </div>
  );
}

function SourceRow({ source, inFunnel: inFunnelProp = null }) {
  const Ic = source.Icon;
  const inFunnel = inFunnelProp !== null ? inFunnelProp : source.usage === 'in-funnel';
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/x-funnel-node', JSON.stringify({
      kind: 'source',
      src: source.id,
      visitorsNum: parseInt((source.meta || '').replace(/[^\d]/g, ''), 10) || 1000,
      visitorsLabel: source.meta && source.meta.includes('visitor') ? source.meta.replace(' visitors', '') : '1.0k',
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <div draggable
         onDragStart={onDragStart}
         className="group/row flex items-start gap-2.5 px-4 py-2 cursor-grab hover:bg-surface-sub transition-colors">
      <span className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center flex-shrink-0 mt-px"
            style={{background: source.color + '1a', color: source.color}}>
        <Ic size={13}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium text-ink leading-tight truncate">{source.name}</div>
        <div className="text-[10.5px] text-ink-soft mt-px tabular-nums truncate">{source.meta}</div>
      </div>
      {inFunnel && <span className="mt-px"><Chip kind="in" sm>In funnel</Chip></span>}
    </div>
  );
}

/* Template card — hover bg-brand-tint, no border change */
function TemplateCard({ tpl, onClick }) {
  return (
    <button onClick={onClick}
      className="block w-[calc(100%-1.5rem)] mx-3 text-left p-3 border border-line rounded-lg bg-white hover:bg-brand-tint transition-colors">
      <div className="flex items-baseline justify-between mb-0.5">
        <div className="text-[12.5px] font-semibold text-ink">{tpl.name}</div>
        <div className="text-[10.5px] text-ink-soft">{tpl.steps} steps</div>
      </div>
      <div className="text-[11px] text-ink-muted leading-snug mb-2">{tpl.desc}</div>
      <div className="flex items-center gap-1">
        {Array.from({length: tpl.steps}).map((_, i) => (
          <Fragment key={i}>
            <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-brand' : i === tpl.steps - 1 ? 'bg-good' : 'bg-line-strong'}`}></span>
            {i < tpl.steps - 1 && <span className="flex-1 h-px bg-line"></span>}
          </Fragment>
        ))}
      </div>
    </button>
  );
}

function AIPopover({ open, onClose }) {
  if (!open) return null;
  const items = [
    { id:1, badge:'+18% likely',     text:'Connect Facebook to Landing Page — your top traffic source has no entry into the funnel.', primary:'Connect' },
    { id:2, badge:'Save 30 min',     text:'Try Sales Funnel template — 3 of your existing pages match its structure.', primary:'Preview' },
    { id:3, badge:'+40% attribution',text:'Add a Thank You page after Lead Magnet Form — improves attribution drastically.', primary:'Add page' },
  ];
  return (
    <div className="fixed inset-0 z-[9990] flex items-end justify-start p-4 bg-ink/15" onClick={onClose}>
      <div className="ctx-menu w-[380px] bg-white rounded-lg shadow-menu ml-[316px] mb-[60px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line-soft">
          <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center"><Spark size={14}/></span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-ink leading-tight">AI suggestions</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5">3 smart tips for this funnel</div>
          </div>
          <button onClick={onClose} className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-surface-sub text-ink-soft transition-colors"><X size={13}/></button>
        </div>
        <div className="p-1.5 space-y-1 max-h-[400px] overflow-y-auto scroll-thin">
          {items.map(s => (
            <div key={s.id} className="p-2.5 rounded-[6px] hover:bg-surface-sub transition-colors">
              <div className="mb-1.5"><Chip kind="good" sm>{s.badge}</Chip></div>
              <div className="text-[12px] text-ink leading-snug mb-2">{s.text}</div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center h-7 px-3 rounded-md text-[11.5px] font-semibold bg-violet hover:bg-violet-deep text-white transition-colors">{s.primary}</button>
                <button className="text-[11.5px] font-medium text-ink-soft hover:text-ink transition-colors">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── EMPTY CANVAS — staged funnel mark + headline + sub + helper links ─── */
function EmptyCanvas({ onJumpToTemplates, onJumpToPages }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8 pointer-events-none">
      <div className="text-center max-w-[360px] pointer-events-auto">
        <div className="canvas-float inline-flex items-center justify-center mb-5 text-brand"
             style={{ filter: 'drop-shadow(0 4px 12px rgba(0,108,181,0.18))' }}>
          <FunnelStaged size={72}/>
        </div>
        <h2 className="text-[18px] font-semibold text-ink mb-1.5">Your funnel is blank</h2>
        <p className="text-[13px] text-ink-muted leading-relaxed mb-5">
          Drag a page or traffic source from the sidebar to start building your funnel.
        </p>
        <div className="flex items-center justify-center gap-3 text-[12.5px]">
          <button onClick={onJumpToTemplates} className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-medium transition-colors">
            <StarIcon size={12}/> Pick a template
          </button>
          <span className="text-line-strong">·</span>
          <button onClick={onJumpToPages} className="inline-flex items-center gap-1.5 text-brand hover:text-brand-hover font-medium transition-colors">
            <FileIcon size={12}/> Browse pages
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── WIREFRAME — small SVG mock of a webpage body, tinted per page type ─── */
function Wireframe({ type }) {
  /* Single neutral slate palette — bg + 3 opacity stops on slate-400.
     Page TYPE is conveyed by the colored top border + icon on the card; the
     wireframe is pure skeleton (loading-state aesthetic, not a colored thumbnail). */
  const BG       = '#F1F5F9';                    /* surface-muted, near-white */
  const PRIMARY  = 'rgba(100,116,139,0.55)';     /* slate-500, hero/CTA blocks */
  const SOLID    = 'rgba(100,116,139,0.85)';     /* slate-500 darker, button */
  const SECONDARY= 'rgba(100,116,139,0.30)';     /* text lines */
  const FAINT    = 'rgba(100,116,139,0.18)';     /* sub-blocks */
  const layouts = {
    landing: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="200" y="6" width="32" height="4"  rx="1" fill={FAINT}/>
        <rect x="20" y="22" width="200" height="14" rx="2" fill={PRIMARY}/>
        <rect x="20" y="44" width="180" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="51" width="160" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="58" width="170" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="74" width="60"  height="14" rx="3" fill={SOLID}/>
      </>
    ),
    form: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="20" y="22" width="120" height="10" rx="2" fill={PRIMARY}/>
        <rect x="20" y="42" width="200" height="9" rx="2"  fill={BG} stroke={SECONDARY} strokeWidth="0.6"/>
        <rect x="20" y="56" width="200" height="9" rx="2"  fill={BG} stroke={SECONDARY} strokeWidth="0.6"/>
        <rect x="20" y="74" width="200" height="14" rx="3" fill={SOLID}/>
      </>
    ),
    sales: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="20" y="22" width="200" height="12" rx="2" fill={PRIMARY}/>
        <rect x="20" y="44" width="58" height="22" rx="2"  fill={FAINT}/>
        <rect x="91" y="44" width="58" height="22" rx="2"  fill={FAINT}/>
        <rect x="162" y="44" width="58" height="22" rx="2" fill={FAINT}/>
        <rect x="20" y="74" width="80"  height="14" rx="3" fill={SOLID}/>
      </>
    ),
    checkout: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="20" y="22" width="130" height="9" rx="2"  fill={BG} stroke={SECONDARY} strokeWidth="0.6"/>
        <rect x="20" y="36" width="130" height="9" rx="2"  fill={BG} stroke={SECONDARY} strokeWidth="0.6"/>
        <rect x="20" y="50" width="130" height="9" rx="2"  fill={BG} stroke={SECONDARY} strokeWidth="0.6"/>
        <rect x="20" y="74" width="60"  height="14" rx="3" fill={SOLID}/>
        <rect x="160" y="22" width="62" height="60" rx="2" fill={FAINT} stroke={SECONDARY} strokeWidth="0.6"/>
        <rect x="167" y="30" width="40" height="4"  rx="1" fill={SECONDARY}/>
        <rect x="167" y="42" width="48" height="3"  rx="1" fill={FAINT}/>
        <rect x="167" y="50" width="44" height="3"  rx="1" fill={FAINT}/>
        <rect x="167" y="68" width="48" height="6"  rx="1" fill={PRIMARY}/>
      </>
    ),
    thanks: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <circle cx="120" cy="38" r="14" fill={PRIMARY}/>
        <path d="M114 38 L118 42 L126 34" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="60" y="60" width="120" height="6" rx="1" fill={SECONDARY}/>
        <rect x="80" y="72" width="80"  height="3" rx="1" fill={FAINT}/>
        <rect x="86" y="80" width="68"  height="3" rx="1" fill={FAINT}/>
      </>
    ),
    upsell: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="20" y="22" width="180" height="12" rx="2" fill={PRIMARY}/>
        <rect x="20" y="44" width="60"  height="20" rx="2" fill={SECONDARY}/>
        <rect x="86" y="48" width="80"  height="4"  rx="1" fill={FAINT}/>
        <rect x="86" y="56" width="100" height="4"  rx="1" fill={FAINT}/>
        <rect x="20" y="74" width="100" height="14" rx="3" fill={SOLID}/>
      </>
    ),
    webinar: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="20" y="22" width="200" height="48" rx="3" fill={PRIMARY}/>
        <polygon points="110,38 110,56 128,47" fill="white"/>
        <rect x="20" y="76" width="120" height="4" rx="1" fill={SECONDARY}/>
        <rect x="20" y="84" width="80"  height="3" rx="1" fill={FAINT}/>
      </>
    ),
    membership: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <circle cx="34" cy="36" r="10" fill={SECONDARY}/>
        <rect x="50" y="30" width="80" height="5" rx="1" fill={SECONDARY}/>
        <rect x="50" y="40" width="60" height="3" rx="1" fill={FAINT}/>
        <rect x="20" y="56" width="92" height="32" rx="2" fill={FAINT}/>
        <rect x="120" y="56" width="92" height="32" rx="2" fill={FAINT}/>
      </>
    ),
    custom: (
      <>
        <rect x="6" y="4"  width="60"  height="6"  rx="1" fill={SECONDARY}/>
        <rect x="20" y="22" width="200" height="6"  rx="1" fill={FAINT}/>
        <rect x="20" y="36" width="200" height="6"  rx="1" fill={FAINT}/>
        <rect x="20" y="50" width="200" height="6"  rx="1" fill={FAINT}/>
        <rect x="20" y="64" width="120" height="6"  rx="1" fill={FAINT}/>
      </>
    ),
  };
  return (
    <svg viewBox="0 0 240 96" className="block w-full rounded border border-line-soft"
         style={{ background: BG }} preserveAspectRatio="xMidYMid meet">
      {layouts[type] || layouts.custom}
    </svg>
  );
}

/* ─── PAGE NODE — 240×180 (analyse) / 240×160 (build). Mirrors source card
   structure exactly: 2px colored top border in PAGE_TYPE.color, 1px line border
   on other sides, selected = colored all around, single X chip on hover (matches
   logic card), ConnectorDot for outgoing connections, drag-from-card-body. ─── */
const PAGE_ICON_LOOKUP = {
  file:  FileIcon,
  home:  HomeIcon,
  cart:  Cart,
  check: Check,
  mail:  Mail,
  video: PlayIcon,
  star:  StarIcon,
  gift:  GiftIcon,
};

function PageNode({ node, selected, mode, onSelect, onDragStart, onConnectStart, onRemove }) {
  const readonly = mode === 'analyse';
  const baseT = PAGE_TYPE[node.data.pageType] || PAGE_TYPE.custom;
  const isCustom = node.data.pageType === 'custom';
  // Custom mode reads icon/color from data; otherwise uses type defaults.
  const customIcon = (isCustom && node.data.icon && PAGE_ICON_LOOKUP[node.data.icon]) || null;
  const t = {
    color: (isCustom && node.data.color) ? node.data.color : baseT.color,
    Icon:  customIcon || baseT.Icon,
    label: baseT.label,
  };
  const TIcon = t.Icon;
  const { title, path, status, visitors, rate, screenshot } = node.data;
  const showMetrics = mode === 'analyse';
  const cardH = getNodeH(node, mode);

  const handleCardMouseDown = (e) => {
    if (e.target.closest('button, [data-no-drag], [data-connector-dot]')) return;
    // Analyse mode: cards still draggable for layout tweaks, but no delete/connect
    e.stopPropagation();
    onDragStart(node.id, e);
  };

  return (
    <div
      className="absolute group/node select-none"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_W.page,
        transform: selected ? 'scale(1.02)' : '',
        transformOrigin: 'center center',
        transition: 'transform 150ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* floating remove chip — same chip pattern as logic card */}
      <div className="absolute -top-8 right-0 z-30 flex items-center gap-0.5
                      opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center bg-white rounded-md shadow-card border border-line">
          <Tip label="Remove page" side="top">
            <button data-no-drag
              onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
              className="w-6 h-6 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-bad-deep hover:bg-bad-soft transition-colors">
              <X size={11}/>
            </button>
          </Tip>
        </div>
      </div>

      {/* Optimise-mode suggestion sparkle — top-right of card.
         Click opens the OptimiseSuggestionModal at bottom-centre. */}
      {mode === 'optimise' && !node.data.dismissed && (
        <div className="absolute -top-2 -right-2 z-30 pointer-events-auto">
          <Tip label="A/B test the headline (+14% lift)" side="top">
            <button data-no-drag
              onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-suggestion', { detail: { nodeId: node.id, title: node.data.title } })); }}
              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-violet text-white shadow-card ai-ripple hover:bg-violet-deep transition-colors">
              <Spark size={11} className="ai-breathe-icon"/>
            </button>
          </Tip>
        </div>
      )}

      {/* card body — same border/shadow system as SourceNode */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        onMouseDown={handleCardMouseDown}
        className={`relative rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing
                    transition-[box-shadow,transform] duration-150
                    ${selected ? '' : 'shadow-xs group-hover/node:shadow-card group-hover/node:-translate-y-0.5'}`}
        style={{
          minHeight: cardH,
          borderTopWidth: 2,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: t.color,
          borderRightColor: selected ? t.color : '#E5E7EB',
          borderBottomColor: selected ? t.color : '#E5E7EB',
          borderLeftColor: selected ? t.color : '#E5E7EB',
          borderStyle: 'solid',
          boxShadow: selected ? '0 4px 12px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.08)' : undefined,
        }}
      >
        {/* subtle wash on hover, mirrors source-card pattern */}
        <span aria-hidden
              className="absolute inset-0 pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity duration-200"
              style={{ background: `linear-gradient(to bottom, ${t.color}10 0%, ${t.color}06 30%, transparent 65%)` }}/>

        {/* HEADER — icon + title (with status dot) + subtitle (type · path) */}
        <div className="relative px-3 pt-3 pb-2 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: t.color + '1a', color: t.color }}>
            <TIcon size={16}/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="text-[13px] font-semibold text-ink truncate leading-tight">{title}</div>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'live' ? 'bg-good live-dot' : 'bg-warn'}`}/>
            </div>
            <div className="text-[11px] text-ink-soft mt-0.5 truncate">
              {t.label}{path && <> · {path}</>}
            </div>
          </div>
        </div>

        {/* PREVIEW — screenshot or wireframe placeholder */}
        <div className="relative px-3 pb-2">
          {screenshot ? (
            <div className="rounded border border-line-soft overflow-hidden bg-surface-cool"
                 style={{ aspectRatio: '240 / 96' }}>
              <img src={screenshot} alt="" className="w-full h-full object-cover object-top"/>
            </div>
          ) : (
            <Wireframe type={node.data.pageType}/>
          )}
        </div>

        {/* BOTTOM METRIC ROW — analyse mode only.
           Visitors, conversion %, drop-off %, avg time. Each stat in a
           muted chip; conversion pulls bg-good-soft when above 5%. */}
        {showMetrics && (() => {
          const conv = rate != null ? rate : (visitors ? Math.max(2, Math.min(28, (visitors % 13) + 4)) : null);
          const drop = visitors ? Math.max(8, Math.min(90, 100 - (conv || 0) - 12)) : null;
          const dwell = ['0:24','1:08','0:52','2:14','0:41'][(visitors || 0) % 5];
          return (
            <div className="relative px-3 pb-2.5 pt-2 border-t border-line-soft mt-0.5 grid grid-cols-4 gap-1.5 text-[10.5px]">
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Visits</span>
                <span className="font-semibold tabular-nums text-ink leading-tight">{visitors?.toLocaleString() || '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Conv</span>
                <span className={`font-semibold tabular-nums leading-tight ${conv >= 5 ? 'text-good-deep' : 'text-ink'}`}>{conv != null ? conv.toFixed(0) + '%' : '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Drop</span>
                <span className="font-semibold tabular-nums leading-tight text-ink">{drop != null ? drop.toFixed(0) + '%' : '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-ink-soft tabular-nums">Time</span>
                <span className="font-semibold tabular-nums leading-tight text-ink">{dwell}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* output connector — pages can be drag-source for connections to other pages */}
      <ConnectorDot side="right" nodeId={node.id} onConnectStart={onConnectStart} hidden={readonly}/>
    </div>
  );
}

/* ─── CONNECTOR DOT — single floating handle for source nodes.
   Brand-blue filled, white double-halo, scales on hover, opacity on parent group hover.
   mousedown starts connection drag (event stopped so card-body drag doesn't trigger). ─── */
function ConnectorDot({ side, nodeId, onConnectStart, color, branch, alwaysVisible, hidden }) {
  if (hidden) return null;
  const positions = {
    top:    'left-1/2 top-0    -translate-x-1/2 -translate-y-1/2',
    right:  'right-0 top-1/2  -translate-y-1/2  translate-x-1/2',
    bottom: 'left-1/2 bottom-0 -translate-x-1/2  translate-y-1/2',
    left:   'left-0   top-1/2 -translate-y-1/2 -translate-x-1/2',
  };
  const fill = color || '#006CB5';
  /* derive a soft tinted ring from the dot's fill — matches the brand-blue baseline */
  const ringRGB = hexToRGB(fill);
  return (
    <span
      data-connector-dot
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onConnectStart(nodeId, side, e, branch); }}
      className={`absolute z-20 ${positions[side]} w-3 h-3 rounded-full
                  ${alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover/node:opacity-100'}
                  transition-[opacity,transform] duration-150 hover:scale-[1.4]
                  cursor-crosshair`}
      style={{
        background: fill,
        boxShadow: `0 0 0 2px rgba(255,255,255,0.95), 0 0 0 3px rgba(${ringRGB},0.22), 0 1px 3px rgba(0,0,0,0.12)`
      }}
    />
  );
}

/* tiny hex→rgb helper for ConnectorDot ring tinting */
function hexToRGB(hex) {
  const h = hex.replace('#','');
  const n = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

/* ─── SOURCE NODE — single floating output handle, threshold colors, count-up
   animation, action chips floating above on hover, draggable body. ─── */
function SourceNode({ node, selected, onSelect, onDragStart, onConnectStart, onChangeSource, onRemove, target, mode }) {
  const readonly = mode === 'analyse';
  const src = SOURCE_BY_ID[node.data.src] || SOURCES[0];
  const Ic = src.Icon;
  const count = target?.count || 0;
  const targetTitle = count === 1 ? target.title : '—';
  const targetRate = count === 1 ? target.rate : 0;
  const cardH = getNodeH(node, mode);

  const visAnim  = useCountUp(node.data.visitorsNum || 0);
  const rateAnim = useCountUp(targetRate);

  /* anchor popover to chip wrapper so it aligns flush right under the action chips */
  const chipAnchor = useRef(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleCardMouseDown = (e) => {
    if (e.target.closest('button, [data-no-drag], [data-connector-dot]')) return;
    // Analyse mode: cards still draggable for layout tweaks, but no delete/connect
    e.stopPropagation();
    onDragStart(node.id, e);
  };

  return (
    <div
      className="absolute group/node select-none"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_W.source,
        transform: selected ? 'scale(1.02)' : '',
        transformOrigin: 'center center',
        transition: 'transform 150ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* floating action chips — Edit + X — sit above card top-right, reveal on hover */}
      <div ref={chipAnchor}
           className="absolute -top-8 right-0 z-30 flex items-center gap-0.5
                      opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center bg-white rounded-md shadow-card border border-line">
          <Tip label="Change platform" side="top">
            <button data-no-drag
              onClick={(e) => { e.stopPropagation(); setEditOpen(o => !o); }}
              className="w-6 h-6 inline-flex items-center justify-center rounded-l-md text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors">
              <Edit size={11}/>
            </button>
          </Tip>
          <span className="w-px h-4 bg-line-soft"/>
          <Tip label="Remove source" side="top">
            <button data-no-drag
              onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
              className="w-6 h-6 inline-flex items-center justify-center rounded-r-md text-ink-muted hover:text-bad-deep hover:bg-bad-soft transition-colors">
              <X size={11}/>
            </button>
          </Tip>
        </div>
      </div>

      {/* edit-source popover — anchored to the chip wrapper so it lines up flush with the X */}
      <Popover anchorRef={chipAnchor} open={editOpen} onClose={() => setEditOpen(false)} width={200} align="end">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Change platform</div>
        {SOURCES.map(s => {
          const SIc = s.Icon;
          return (
            <MenuItem key={s.id}
              icon={<span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded" style={{ background: s.color + '1a', color: s.color }}><SIc size={9}/></span>}
              label={s.name}
              active={s.id === src.id}
              onClick={() => { onChangeSource(node.id, s.id); setEditOpen(false); }}/>
          );
        })}
      </Popover>

      {/* card */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        onMouseDown={handleCardMouseDown}
        className={`relative rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing
                    transition-[box-shadow,transform] duration-150
                    ${selected ? '' : 'shadow-xs group-hover/node:shadow-card group-hover/node:-translate-y-0.5'}`}
        style={{
          minHeight: cardH,
          /* Selected: 1px in src.color all around, top stays 2px (one continuous color, no double-edge effect).
             Unselected: 2px src.color top, 1px line border on the other 3 sides. */
          borderTopWidth: 2,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 1,
          borderTopColor: src.color,
          borderRightColor: selected ? src.color : '#E5E7EB',
          borderBottomColor: selected ? src.color : '#E5E7EB',
          borderLeftColor: selected ? src.color : '#E5E7EB',
          borderStyle: 'solid',
          /* Selected shadow is lighter than shadow-modal — this card carries colour energy already */
          boxShadow: selected ? '0 4px 12px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.08)' : undefined,
        }}
      >
        {/* hover gradient — subtle src.color tint at top fading to white by mid-card.
            Same color family as the icon chip, gives the card "energy at the top" without a flat fill. */}
        <span aria-hidden
              className="absolute inset-0 pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity duration-200"
              style={{ background: `linear-gradient(to bottom, ${src.color}14 0%, ${src.color}08 30%, transparent 65%)` }}/>

        {/* header — icon + name + traffic-source subtitle */}
        <div className="relative px-3.5 pt-3 pb-2.5 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: src.color + '1a', color: src.color }}>
            <Ic size={15}/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate leading-tight">{src.name}</div>
            <div className="text-[10.5px] text-ink-soft mt-px">Traffic source</div>
          </div>
        </div>

        {/* body — Analyse mode shows visitors row; Build mode is conversion-only.
            Conversion display switches by outgoing-edge count: 0 → "To —", 1 → "To X Y%" + bar, 2+ → "→ N destinations" text only. */}
        <div className="relative px-3.5 pt-1 pb-3.5">
          {mode === 'analyse' && (
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Visitors</span>
              <span className="text-[14px] font-semibold text-ink tabular-nums leading-none">{formatVolume(visAnim)}</span>
            </div>
          )}

          {count <= 1 ? (
            <>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[11px] font-medium text-ink-muted leading-none">
                  To <span className={count === 1 ? 'text-ink-muted font-medium' : 'text-ink-soft'}>{targetTitle}</span>
                </span>
                <span className="text-[11.5px] font-semibold tabular-nums leading-none"
                      style={{ color: heatTextColor(count === 1 ? targetRate : null) }}>
                  {count === 1 ? `${Math.round(rateAnim)}%` : '—'}
                </span>
              </div>
              {/* gradient heat-map bar — full red→orange→yellow→green spectrum, clipped to rate% */}
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                {count === 1 && (
                  <div className="absolute inset-0 rounded-full"
                       style={{
                         background: 'linear-gradient(to right, #DC2626 0%, #F97316 22%, #EAB308 45%, #84CC16 70%, #10B981 100%)',
                         clipPath: `inset(0 ${Math.max(0, 100 - rateAnim)}% 0 0)`,
                       }}/>
                )}
              </div>
            </>
          ) : (
            /* 2+ destinations — text-only, no bar. Per-edge stats live on the edges + Inspector. */
            <div className="flex items-center gap-1.5 mt-0.5">
              <ChevronRight size={11} className="text-brand"/>
              <span className="text-[11.5px] font-semibold text-ink leading-none">
                {count} <span className="font-medium text-ink-muted">destinations</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* single floating output handle — right edge only; sources only emit */}
      <ConnectorDot side="right" nodeId={node.id} onConnectStart={onConnectStart} hidden={readonly}/>
    </div>
  );
}

/* ─── LOGIC NODE — branching step inserted on edges (Condition or A/B test).
   200×80, white card, violet 2px top border. Single neutral-violet output dot at
   right-middle: first drag creates the primary branch (yes/A), second drag creates
   the secondary branch (no/B). Branch identity is then carried by the edge itself
   (rendered as a Y/N or A/B badge near the destination by EdgeOverlays). No input
   dot — the whole left edge is the drop zone, the dot would be visual noise. ─── */
const LOGIC_KIND = {
  condition: { label: 'Condition', subtitle: 'rule-based split', primaryBranch:'yes', secondaryBranch:'no' },
  abtest:    { label: 'A/B Test',  subtitle: 'random split',     primaryBranch:'a',   secondaryBranch:'b'  },
};
function LogicNode({ node, selected, onSelect, onDragStart, onConnectStart, onRemove, outgoingCount, mode }) {
  const readonly = mode === 'analyse';
  const kind = LOGIC_KIND[node.data.kind] || LOGIC_KIND.condition;
  const Ic = node.data.kind === 'abtest' ? Bars : Workflow;
  const VIOLET = '#7C3AED';
  /* meter showing how many of the 2 branches are wired */
  const branchesUsed = Math.min(outgoingCount || 0, 2);

  const handleCardMouseDown = (e) => {
    if (e.target.closest('button, [data-no-drag], [data-connector-dot]')) return;
    // Analyse mode: cards still draggable for layout tweaks, but no delete/connect
    e.stopPropagation();
    onDragStart(node.id, e);
  };

  return (
    <div
      className="absolute group/node select-none"
      style={{
        left: node.x,
        top: node.y,
        width: NODE_W.logic,
        transform: selected ? 'scale(1.02)' : '',
        transformOrigin: 'center center',
        transition: 'transform 150ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* floating remove chip — matches source card chip exactly (size, colors, divider) */}
      <div className="absolute -top-8 right-0 z-30 flex items-center gap-0.5
                      opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center bg-white rounded-md shadow-card border border-line">
          <Tip label="Remove step" side="top">
            <button data-no-drag
              onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
              className="w-6 h-6 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-bad-deep hover:bg-bad-soft transition-colors">
              <X size={11}/>
            </button>
          </Tip>
        </div>
      </div>

      {/* card body */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        onMouseDown={handleCardMouseDown}
        className={`relative rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing
                    transition-[box-shadow,transform] duration-150
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
          boxShadow: selected ? '0 4px 12px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.08)' : undefined,
        }}
      >
        {/* subtle violet wash on hover, mirrors source-card pattern */}
        <span aria-hidden
              className="absolute inset-0 pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity duration-200"
              style={{ background: `linear-gradient(to bottom, ${VIOLET}10 0%, ${VIOLET}06 30%, transparent 65%)` }}/>

        <div className="relative px-3.5 pt-3 pb-2.5 flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: VIOLET + '1a', color: VIOLET }}>
            <Ic size={15}/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate leading-tight">{node.data.title || kind.label}</div>
            <div className="text-[10.5px] text-ink-soft mt-px">{kind.subtitle}</div>
          </div>
        </div>

        {/* branch meter — bottom row, tiny status indicating how many branches are wired.
           Replaces the awkward inline YES/NO labels — branch identity now lives on the edges. */}
        <div className="relative px-3.5 pb-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: branchesUsed >= 1 ? VIOLET : '#E5E7EB' }}/>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: branchesUsed >= 2 ? VIOLET : '#E5E7EB' }}/>
          </div>
          <span className="text-[10px] text-ink-soft">{branchesUsed} of 2 branches</span>
        </div>
      </div>

      {/* single output dot — right middle. Two clicks-and-drags create the two branches.
         Branch identity is determined at connect-start time by the canvas (counting
         existing outgoing edges from this node), not encoded in the dot itself.
         Hover-only visibility — matches source/page card pattern for visual consistency. */}
      <ConnectorDot
        side="right"
        nodeId={node.id}
        onConnectStart={onConnectStart}
        color={VIOLET} hidden={readonly}/>
    </div>
  );
}

/* ─── EDGE GEOMETRY — compute bezier path with floating anchors + obstacle routing.
   Floating: each endpoint picks the side of its node that faces the other node.
   Source-right → target-left when they're side-by-side; source-bottom → target-top
   when target sits below; etc. Avoids awkward backwards bends. ─── */

/* getFloatingAnchor — given a node and a "look toward" point, returns the side
   anchor + outward-direction unit vector for that side. */
function getFloatingAnchor(node, towardX, towardY, mode) {
  const w = NODE_W[node.type];
  const h = getNodeH(node, mode);
  const cx = node.x + w / 2;
  const cy = node.y + h / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  /* pick dominant axis to determine which side faces toward */
  if (Math.abs(dx) >= Math.abs(dy)) {
    /* horizontal dominant */
    return dx >= 0
      ? { x: node.x + w, y: cy,         ox:  1, oy:  0 }   /* right */
      : { x: node.x,     y: cy,         ox: -1, oy:  0 };  /* left  */
  } else {
    /* vertical dominant */
    return dy >= 0
      ? { x: cx,         y: node.y + h, ox:  0, oy:  1 }   /* bottom */
      : { x: cx,         y: node.y,     ox:  0, oy: -1 };  /* top    */
  }
}

function computeEdgeGeometry(a, b, allNodes, mode, edge) {
  /* Cubic bezier routing — restored from earlier session.

     For each endpoint we pick a "floating anchor" — the side of the card facing
     the other node's center, so edges emerge from whichever side reduces overall
     curvature. Control points sit `dist` away from each anchor along its facing
     direction; the resulting cubic bezier curves smoothly from source → target.

     Branched edges (yes/no/a/b) shift the source-side cy1 up or down by 45px so
     two branches leaving the same logic-node connector visibly fan apart.

     Obstacle avoidance: sample the bezier at 12 points; if any sample falls
     inside a non-source/non-target card's bbox (with 12px padding), lift cy1/cy2
     above (or below) the obstacle stack. Re-detect after each lift; up to 3
     passes. Direction (above/below) is chosen on the first pass from endpoint
     geometry to prevent oscillation.

     Output: path string + sx/sy/ex/ey, control points cx1/cy1/cx2/cy2, midpoint
     mx/my (t=0.5), badge anchor bx/by (t=0.85), arrow tangent ang. */

  /* anchors */
  const bCx = b.x + NODE_W[b.type] / 2;
  const bCy = b.y + getNodeH(b, mode) / 2;
  const aA = getFloatingAnchor(a, bCx, bCy, mode);
  const aCx = a.x + NODE_W[a.type] / 2;
  const aCy = a.y + getNodeH(a, mode) / 2;
  const bA = getFloatingAnchor(b, aCx, aCy, mode);

  const sx = aA.x, sy = aA.y;
  const ex = bA.x, ey = bA.y;
  /* control point distance — straighter curves, min 80 to avoid over-arcing
     short edges; 0.5 of edge length for longer ones */
  const dist = Math.max(80, Math.hypot(ex - sx, ey - sy) * 0.5);
  let cx1 = sx + aA.ox * dist;
  let cy1 = sy + aA.oy * dist;
  let cx2 = ex + bA.ox * dist;
  let cy2 = ey + bA.oy * dist;

  /* Branch emergence — for branched edges leaving a horizontal anchor, push the
     source-side control point up (yes/a) or down (no/b) by 45px. Both branches
     stay violet; the visible fan-out comes entirely from this offset. */
  if (edge && edge.branch && Math.abs(aA.ox) > Math.abs(aA.oy)) {
    if (edge.branch === 'yes' || edge.branch === 'a') cy1 -= 45;
    if (edge.branch === 'no'  || edge.branch === 'b') cy1 += 45;
  }

  /* Iterative obstacle avoidance — sample bezier, find blockers, lift control
     points clear, repeat up to 3 times. */
  const PAD = 12;
  const CLEARANCE = 40;
  const findObstacles = () => allNodes.filter(n => {
    if (n.id === a.id || n.id === b.id) return false;
    const nw = NODE_W[n.type], nh = getNodeH(n, mode);
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const mt = 1 - t;
      const x = Math.pow(mt, 3) * sx + 3 * Math.pow(mt, 2) * t * cx1 + 3 * mt * Math.pow(t, 2) * cx2 + Math.pow(t, 3) * ex;
      const y = Math.pow(mt, 3) * sy + 3 * Math.pow(mt, 2) * t * cy1 + 3 * mt * Math.pow(t, 2) * cy2 + Math.pow(t, 3) * ey;
      if (x >= n.x - PAD && x <= n.x + nw + PAD && y >= n.y - PAD && y <= n.y + nh + PAD) return true;
    }
    return false;
  });

  let direction = null;
  for (let pass = 0; pass < 3; pass++) {
    const obstacles = findObstacles();
    if (!obstacles.length) break;
    if (direction === null) {
      const maxObstacleBottom = Math.max(...obstacles.map(o => o.y + getNodeH(o, mode)));
      direction = (sy > maxObstacleBottom && ey > maxObstacleBottom) ? 'below' : 'above';
    }
    if (direction === 'above') {
      const minObstacleY = Math.min(...obstacles.map(o => o.y));
      const apexY = minObstacleY - CLEARANCE * (pass + 1);
      cy1 = Math.min(cy1, apexY);
      cy2 = Math.min(cy2, apexY);
    } else {
      const maxObstacleBottom = Math.max(...obstacles.map(o => o.y + getNodeH(o, mode)));
      const apexY = maxObstacleBottom + CLEARANCE * (pass + 1);
      cy1 = Math.max(cy1, apexY);
      cy2 = Math.max(cy2, apexY);
    }
    if (pass === 0) {
      const obstacleLeft = Math.min(...obstacles.map(o => o.x));
      const obstacleRight = Math.max(...obstacles.map(o => o.x + NODE_W[o.type]));
      if (sx < obstacleLeft) cx1 = Math.max(cx1, obstacleLeft - 20);
      if (ex > obstacleRight) cx2 = Math.min(cx2, obstacleRight + 20);
    }
  }

  /* gap before destination — 12px clearance reads as "approaching" not "touching" */
  const gapPadding = 12;
  const ang = Math.atan2(ey - cy2, ex - cx2);
  const exShort = ex - Math.cos(ang) * gapPadding;
  const eyShort = ey - Math.sin(ang) * gapPadding;
  const path = `M ${sx},${sy} C ${cx1},${cy1} ${cx2},${cy2} ${exShort},${eyShort}`;

  /* midpoint for chip + stats — t=0.5 */
  const t = 0.5;
  const mx = Math.pow(1-t,3)*sx + 3*Math.pow(1-t,2)*t*cx1 + 3*(1-t)*Math.pow(t,2)*cx2 + Math.pow(t,3)*ex;
  const my = Math.pow(1-t,3)*sy + 3*Math.pow(1-t,2)*t*cy1 + 3*(1-t)*Math.pow(t,2)*cy2 + Math.pow(t,3)*ey;
  /* badge anchor — t=0.85, near destination so branch identity reads at entry */
  const bt = 0.85;
  const bx = Math.pow(1-bt,3)*sx + 3*Math.pow(1-bt,2)*bt*cx1 + 3*(1-bt)*Math.pow(bt,2)*cx2 + Math.pow(bt,3)*ex;
  const by = Math.pow(1-bt,3)*sy + 3*Math.pow(1-bt,2)*bt*cy1 + 3*(1-bt)*Math.pow(bt,2)*cy2 + Math.pow(bt,3)*ey;

  return { path, sx, sy, ex, ey, cx1, cy1, cx2, cy2, mx, my, bx, by, ang };
}


/* ─── EDGE CHIP — single white pill at edge midpoint with [+ insert] | [× remove].
   Matches source card chip exactly: 24×24 cells, 1px divider, Lucide X + Plus icons
   at size=11, ink-muted default, ink/bad-deep on hover. The icons render the same
   Lucide path geometry the source card chip uses (`<X size={11}/>` etc.) — wrapped
   in scale(11/24) + translate(-12,-12) so stroke width and proportions match
   pixel-for-pixel rather than approximating with hand-drawn lines. ─── */
function EdgeChip({ x, y, onInsert, onRemove, onHover, onStats, mode }) {
  const [hoverBtn, setHoverBtn] = useState(null); /* 'insert' | 'remove' | null */
  const W = 48, H = 24, R = 6;
  const onEnter = (e) => onHover && onHover(e);
  /* Lucide standard stroke attributes — sw=2 in 24×24 viewBox space, scales with parent */
  const lucideAttrs = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const insertColor = hoverBtn === 'insert' ? '#0F172A' : '#475569'; /* ink-muted → ink */
  const removeColor = hoverBtn === 'remove' ? '#B91C1C' : '#475569'; /* ink-muted → bad-deep */
  return (
    <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: 'all' }} onMouseEnter={onEnter}>
      {/* chip background — white, rounded, soft shadow + 1px line border */}
      <rect x={-W/2} y={-H/2} width={W} height={H} rx={R}
            fill="white" stroke="#E5E7EB" strokeWidth="1"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(15,23,42,0.10))' }}/>
      {/* divider — w-px h-4 matches source chip */}
      <line x1="0" y1={-8} x2="0" y2={8} stroke="#EFEFF1" strokeWidth="1"/>

      {/* insert (left half) — Lucide Plus at size=11 */}
      <g transform={`translate(${-W/4}, 0)`}
         style={{ cursor: 'pointer' }}
         onMouseEnter={() => setHoverBtn('insert')}
         onMouseLeave={() => setHoverBtn(b => b === 'insert' ? null : b)}
         onClick={(e) => { e.stopPropagation(); onInsert(e); }}>
        <rect x={-W/4} y={-H/2} width={W/2} height={H} fill="transparent"/>
        <g transform={`scale(${11/24}) translate(-12, -12)`} style={{ transition: 'stroke 140ms ease' }}>
          <line x1="12" y1="5" x2="12" y2="19" stroke={insertColor} {...lucideAttrs}/>
          <line x1="5" y1="12" x2="19" y2="12" stroke={insertColor} {...lucideAttrs}/>
        </g>
      </g>

      {/* remove (right half) — Lucide X at size=11 */}
      <g transform={`translate(${W/4}, 0)`}
         style={{ cursor: 'pointer' }}
         onMouseEnter={() => setHoverBtn('remove')}
         onMouseLeave={() => setHoverBtn(b => b === 'remove' ? null : b)}
         onClick={(e) => { e.stopPropagation(); onRemove(e); }}>
        <rect x={-W/4} y={-H/2} width={W/2} height={H} fill="transparent"/>
        <g transform={`scale(${11/24}) translate(-12, -12)`} style={{ transition: 'stroke 140ms ease' }}>
          <line x1="18" y1="6" x2="6" y2="18" stroke={removeColor} {...lucideAttrs}/>
          <line x1="6" y1="6" x2="18" y2="18" stroke={removeColor} {...lucideAttrs}/>
        </g>
      </g>
    </g>
  );
}

/* edge stroke color resolver — used by EdgePaths for the line and EdgeOverlays for the arrow */
function getEdgeStroke(edge, isHovered) {
  /* All branch edges (yes/no/a/b) render in violet — branch identity lives on the
     letter badge near the destination, not on stroke colour. This makes condition
     fan-outs read as one logical group ("two branches from this Condition") rather
     than two unrelated lines. Default (non-branch) edges stay brand-blue. */
  if (edge.branch) return isHovered ? '#6D28D9' : '#7C3AED';   /* violet → violet-deep on hover */
  return isHovered ? '#005A9A' : '#006CB5';                     /* brand → brand-hover */
}

/* ─── EDGE PATHS — bezier paths only. Renders BEHIND nodes so cards always
   sit on top of lines. Hit-target path captures hover. Arrows live in
   EdgeOverlays (rendered above nodes) so the tip is never occluded. ─── */
function EdgePaths({ nodes, edges, hovered, onHover, mode }) {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible"
         style={{ width: '100%', height: '100%', left: 0, top: 0 }}>
      {edges.map((e, i) => {
        const a = nodes.find(n => n.id === e.from);
        const b = nodes.find(n => n.id === e.to);
        if (!a || !b) return null;
        const geo = computeEdgeGeometry(a, b, nodes, mode, e);
        const isHovered = hovered === i;
        const stroke = getEdgeStroke(e, isHovered);
        return (
          <g key={i}>
            {/* hit target — wider so the × stays inside the hover region (~28px) */}
            <path d={geo.path} stroke="transparent" strokeWidth={28} fill="none"
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}/>
            {/* visible path — uniform 2px (no volume-weighting; visual consistency) */}
            <path d={geo.path} stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round"
                  style={{ transition: 'stroke 140ms ease' }}/>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── EDGE BRANCH BADGE — solid colored pill with white ring + white letter,
   anchored at t=0.85 along the edge (close to destination). The branch identity
   reads at a glance from the colour + letter; the white ring separates the badge
   from the violet line so it looks like a marker placed *on* the line. ─── */
function EdgeBranchBadge({ x, y, branch }) {
  const meta = (branch === 'yes') ? { letter: 'Y', color: '#10B981' }   /* good */
            :  (branch === 'no')  ? { letter: 'N', color: '#94A3B8' }   /* ink-soft */
            :  (branch === 'a')   ? { letter: 'A', color: '#7C3AED' }   /* violet */
            :  (branch === 'b')   ? { letter: 'B', color: '#F59E0B' }   /* warn */
            :                       null;
  if (!meta) return null;
  return (
    <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: 'none' }}>
      <circle r="8" fill={meta.color} stroke="white" strokeWidth="1"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(15,23,42,0.18))' }}/>
      <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="700" fill="white"
            style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{meta.letter}</text>
    </g>
  );
}

/* ─── EDGE OVERLAYS — midpoint UI (× remove, + insert, stats pill, label) AND
   the destination arrow + persistent branch badge. Renders ABOVE nodes so neither
   chip nor arrow tip is occluded when an edge endpoint sits behind a card. ─── */
function EdgeOverlays({ nodes, edges, zoom, hovered, onHover, onRemove, onInsert, mode }) {
  const [statsOpen, setStatsOpen] = useState(null); // edge index whose stats popover is open
  const showArrow = zoom > 0.5;
  return (
    <svg className="absolute inset-0 overflow-visible"
         style={{ width: '100%', height: '100%', left: 0, top: 0, pointerEvents: 'none' }}>
      {edges.map((e, i) => {
        const a = nodes.find(n => n.id === e.from);
        const b = nodes.find(n => n.id === e.to);
        if (!a || !b) return null;
        const geo = computeEdgeGeometry(a, b, nodes, mode, e);
        const isHovered = hovered === i;
        const stroke = getEdgeStroke(e, isHovered);
        const vol = e.volume || 0;
        const fromVisitors = a.type === 'source' ? (a.data.visitorsNum || 1) : null;
        const rate = fromVisitors ? Math.round((vol / fromVisitors) * 100) : null;
        const hasLabel = !!e.label;
        const showInteractive = isHovered;
        const showStats = !isHovered && mode === 'analyse' && vol > 0;

        return (
          <g key={i}>
            {/* destination arrow — moved up to overlay layer so the tip is always
                visible even when target sits behind another card in z-order. */}
            {showArrow && (
              <g transform={`translate(${geo.ex},${geo.ey}) rotate(${geo.ang * 180 / Math.PI})`}
                 style={{ pointerEvents: 'none' }}>
                <polygon points="-7,-4 0,0 -7,4"
                         fill={stroke} style={{ transition: 'fill 140ms ease' }}/>
              </g>
            )}

            {/* persistent branch badge — Y/N/A/B circle near destination */}
            {e.branch && <EdgeBranchBadge x={geo.bx} y={geo.by} branch={e.branch}/>}

            {/* edge text label (e.g. "showed up") */}
            {hasLabel && (
              <g transform={`translate(${geo.mx}, ${geo.my - 14})`} style={{ pointerEvents: 'none' }}>
                <rect x={-(e.label.length * 3.2 + 8)} y="-9" width={e.label.length * 6.4 + 16} height="18" rx="9"
                      fill="white" stroke="#E5E7EB" strokeWidth="1"/>
                <text textAnchor="middle" y="4" fontSize="10.5" fill="#475569" fontWeight="500"
                      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{e.label}</text>
              </g>
            )}
            {/* mid-pill stats — Analyse mode, edge has volume, not currently hovered */}
            {showStats && (() => {
              const text = rate != null ? `${formatVolume(vol)} · ${rate}%` : formatVolume(vol);
              const w = text.length * 6.5 + 16;
              return (
                <g transform={`translate(${geo.mx}, ${geo.my + (hasLabel ? 14 : 0)})`} style={{ pointerEvents: 'none' }}>
                  <rect x={-w/2} y="-12" width={w} height="24" rx="12"
                        fill="white" stroke="#E5E7EB" strokeWidth="1"
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(15,23,42,0.06))' }}/>
                  <text textAnchor="middle" y="4.5" fontSize="12" fontWeight="700" fill="#0F172A"
                        style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{text}</text>
                </g>
              );
            })()}
            {/* hover state — single white pill with [+ insert] | [× remove],
                plus an Analyse-only stats button + popover sibling */}
            {showInteractive && (<>
              <EdgeChip
                x={geo.mx} y={geo.my + (hasLabel ? 14 : 0)}
                onHover={() => onHover(i)}
                onInsert={() => onInsert(i, geo.mx, geo.my)}
                onRemove={() => onRemove(i)}/>

            {mode === 'analyse' && (() => {
              const isOpen = statsOpen === i;
              const e2 = edges[i];
              const fromNode = nodes.find(n => n.id === e2?.from);
              const toNode   = nodes.find(n => n.id === e2?.to);
              const fromTitle = fromNode?.data?.title || (fromNode?.type === 'source' ? (SOURCES.find(s => s.id === fromNode?.data?.src)?.name || 'Source') : 'From');
              const toTitle   = toNode?.data?.title   || 'To';
              // Pick chip colour from source-node's brand colour (or brand blue)
              const fromColor = fromNode?.type === 'source'
                ? (SOURCES.find(s => s.id === fromNode?.data?.src)?.color || '#006CB5')
                : (PAGE_TYPE[fromNode?.data?.pageType]?.color || '#006CB5');
              // Mock figures derived from edge volume
              const vol = e2?.volume || 0;
              const conv = vol ? Math.round((vol / Math.max(1, fromNode?.data?.visitorsNum || fromNode?.data?.visitors || 100)) * 100) : 0;
              const drop = Math.max(0, 100 - conv);
              return (
                <foreignObject x={geo.mx + 22} y={geo.my - 13} width={30} height={26} style={{ overflow: 'visible', pointerEvents: 'auto' }}>
                  <div style={{ width: 26, position: 'relative' }}>
                    <button onClick={(ev) => { ev.stopPropagation(); setStatsOpen(isOpen ? null : i); }}
                      title={`${fromTitle} → ${toTitle}`}
                      className="w-[26px] h-[26px] inline-flex items-center justify-center rounded-full text-white shadow-card hover:shadow-menu transition-shadow"
                      style={{ background: fromColor }}>
                      <TrendingUp size={13}/>
                    </button>
                    {isOpen && (
                      <div onClick={(ev) => ev.stopPropagation()}
                        className="absolute left-1/2 -translate-x-1/2 top-9 z-50 w-[280px] bg-white rounded-lg border border-line shadow-menu overflow-hidden ctx-menu"
                        style={{ pointerEvents: 'auto' }}>
                        {/* Coloured headline strip */}
                        <div className="px-3 py-2.5 text-white flex items-center gap-2 relative" style={{ background: fromColor }}>
                          <TrendingUp size={13}/>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10.5px] uppercase tracking-wider opacity-85">Path stats</div>
                            <div className="text-[12.5px] font-semibold leading-tight truncate">
                              {fromTitle} <span className="opacity-70">→</span> {toTitle}
                            </div>
                          </div>
                          <button onClick={() => setStatsOpen(null)}
                            className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-white/20 transition-colors">
                            <X size={11}/>
                          </button>
                        </div>
                        {/* Stats body — bigger numbers, two-column */}
                        <div className="p-3 grid grid-cols-2 gap-x-3 gap-y-2">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-ink-soft">Visitors</div>
                            <div className="text-[15px] font-semibold text-ink tabular-nums leading-tight mt-0.5">{vol.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-ink-soft">Conversion</div>
                            <div className="text-[15px] font-semibold text-good-deep tabular-nums leading-tight mt-0.5">{conv}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-ink-soft">Drop-off</div>
                            <div className="text-[15px] font-semibold text-ink tabular-nums leading-tight mt-0.5">{drop}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-ink-soft">Time-to-next</div>
                            <div className="text-[15px] font-semibold text-ink tabular-nums leading-tight mt-0.5">0:42</div>
                          </div>
                        </div>
                        <div className="px-3 py-2 bg-surface-sub border-t border-line-soft text-[10.5px] text-ink-soft leading-snug">
                          From last 7 days. Drop-off = visitors who entered this edge but didn't reach the next step.
                        </div>
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            })()}
            </>)}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── VIEW SWITCHER — floating top-right, 5 demo states + wrench prefix ─── */
function ViewSwitcher({ active, onChange }) {
  return (
    <div className="absolute top-4 right-4 z-30 inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft px-1">
        <Wrench size={11}/> Demo states
      </span>
      <div className="inline-flex items-center bg-white border border-line rounded-md p-0.5 shadow-card gap-0.5">
        {DEMO_STATE_ORDER.map(id => {
          const s = DEMO_STATES[id];
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onChange(id)}
              className={`h-6 px-2.5 rounded text-[11.5px] font-medium transition-colors
                ${isActive ? 'bg-brand-tint text-brand' : 'text-ink-muted hover:text-ink hover:bg-surface-sub'}`}>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── ZOOM CONTROLS — bottom-right, +/-/% reset/fit ─── */
function ZoomControls({ zoom, onZoomIn, onZoomOut, onFit, onSetZoom, onAutoLayout }) {
  /* Editable percentage. Click → enter edit mode, value pre-selected. Type a number,
     Enter or blur → apply (clamped 40–200, %). Escape → revert. Empty submit → 100. */
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const inputRef = useRef(null);
  const startEdit = () => {
    setVal(String(Math.round(zoom * 100)));
    setEditing(true);
    /* defer so the input mounts before we focus + select */
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
  };
  const commit = () => {
    const n = parseInt(val, 10);
    const next = isNaN(n) || val.trim() === '' ? 1 : Math.max(0.4, Math.min(2, n / 100));
    onSetZoom(next);
    setEditing(false);
  };
  const cancel = () => setEditing(false);
  return (
    <div className="absolute bottom-4 right-4 z-30 inline-flex items-stretch bg-white border border-line rounded-md shadow-card overflow-hidden">
      <Tip label="Zoom out" side="top">
        <button onClick={onZoomOut} className="w-8 h-8 inline-flex items-center justify-center text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
          <Minus size={14}/>
        </button>
      </Tip>
      <span className="w-px bg-line-soft"/>
      {editing ? (
        <div className="px-1 h-8 inline-flex items-center min-w-[44px]">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={val}
            onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commit(); }
              if (e.key === 'Escape') { e.preventDefault(); cancel(); }
            }}
            className="w-9 h-6 px-1 text-[11px] font-semibold text-ink tabular-nums text-center bg-surface-sub rounded border border-brand/40 outline-none focus:border-brand"/>
          <span className="text-[11px] font-semibold text-ink-muted ml-0.5">%</span>
        </div>
      ) : (
        <Tip label="Set zoom · click to type" side="top">
          <button onClick={startEdit}
            className="px-2.5 h-8 inline-flex items-center justify-center text-[11px] font-semibold text-ink-muted hover:bg-surface-sub hover:text-ink tabular-nums transition-colors min-w-[44px]">
            {Math.round(zoom * 100)}%
          </button>
        </Tip>
      )}
      <span className="w-px bg-line-soft"/>
      <Tip label="Zoom in" side="top">
        <button onClick={onZoomIn} className="w-8 h-8 inline-flex items-center justify-center text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
          <Plus size={14}/>
        </button>
      </Tip>
      <span className="w-px bg-line-soft"/>
      <Tip label="Auto layout" side="top">
        <button onClick={onAutoLayout} className="w-8 h-8 inline-flex items-center justify-center text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
          <Sparkles size={13}/>
        </button>
      </Tip>
      <span className="w-px bg-line-soft"/>
      <Tip label="Fit to canvas  Z" side="top">
        <button onClick={onFit} className="w-8 h-8 inline-flex items-center justify-center text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
          <Maximize size={13}/>
        </button>
      </Tip>
    </div>
  );
}

/* ─── CONNECTION GHOST — curvy bezier path drawn while user drags from a
   connector dot. Solid brand-blue stroke + arrow at cursor end. The control
   points are extended in the side's outward direction so the curve leaves
   the source node tangentially, matching the Genesis active-tab arrow feel. ─── */
function ConnectionGhost({ from, side, to, branch }) {
  /* Dashed bezier preview during drag-from-connector. Matches committed-edge
     bezier style; recolours by branch (violet for any branch, brand-blue for
     a non-branch source). */
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.max(60, Math.hypot(dx, dy) * 0.45);
  const sideOff = {
    top:    { x: 0,     y: -dist },
    right:  { x: dist,  y: 0     },
    bottom: { x: 0,     y: dist  },
    left:   { x: -dist, y: 0     },
  }[side] || { x: dist, y: 0 };
  const cx1 = from.x + sideOff.x;
  const cy1 = from.y + sideOff.y;
  /* approach the cursor from the opposite direction so the curve eases in */
  const cx2 = to.x - sideOff.x * 0.5;
  const cy2 = to.y - sideOff.y * 0.5;
  const path = `M ${from.x},${from.y} C ${cx1},${cy1} ${cx2},${cy2} ${to.x},${to.y}`;
  const ang = Math.atan2(to.y - cy2, to.x - cx2) * 180 / Math.PI;
  const color = branch ? '#7C3AED' : '#006CB5';
  return (
    <g>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
            strokeDasharray="6 4"/>
      <g transform={`translate(${to.x},${to.y}) rotate(${ang})`}>
        <polygon points="-7,-4.5 4,0 -7,4.5" fill={color}/>
      </g>
    </g>
  );
}


/* ─── CANVAS — main interactive surface ─── */
function Canvas({ mode, demoState, onDemoStateChange, onJumpToTemplates, onJumpToPages, onSelectionChange, canvasApiRef, onNodesChange }) {
  const initial = DEMO_STATES[demoState] || DEMO_STATES.empty;
  /* mutable state — drag, drop-to-connect, edge-disconnect all need to mutate this.
     Reset on demo-state change. */
  const [nodes, setNodes] = useState(initial.nodes);
  const [edges, setEdges] = useState(initial.edges);

  const containerRef = useRef(null);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const canvasViewportEl = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [drag, setDrag] = useState(null); /* canvas pan drag */
  const [nodeDrag, setNodeDrag] = useState(null); /* { nodeId, startX, startY, startNodeX, startNodeY } */
  const [connecting, setConnecting] = useState(null); /* { fromNodeId, side, fromPoint, currentPoint, dropTarget } */
  const [layoutAnimating, setLayoutAnimating] = useState(false); /* triggers CSS transition on node left/top during auto-layout */
  const [dragOver, setDragOver] = useState(false); /* sidebar-to-canvas drag-and-drop hover state */

  /* HTML5 drag-and-drop receivers — sidebar PageRow / SourceRow set dataTransfer
     during dragstart with `application/x-funnel-node`. Canvas accepts the drop and
     creates a node at the cursor's world coordinates.
     dragOver state drives the dashed drop-zone outline so the user has confidence
     the canvas is a valid drop target. */
  const onCanvasDragOver = (e) => {
    /* required to allow drop */
    if (!e.dataTransfer.types.includes('application/x-funnel-node')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!dragOver) setDragOver(true);
  };
  const onCanvasDragLeave = (e) => {
    /* dragleave fires constantly as the cursor passes over child elements; only
       reset state when leaving the canvas root itself. */
    if (e.currentTarget === e.target) setDragOver(false);
  };
  const onCanvasDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData('application/x-funnel-node');
    if (!raw) return;
    let payload;
    try { payload = JSON.parse(raw); } catch { return; }
    /* convert clientX/Y → world coords (account for canvas pan + zoom) */
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const wx = (px - pan.x) / zoom;
    const wy = (py - pan.y) / zoom;

    /* build the new node based on payload kind */
    const id = payload.kind + '-' + Date.now();
    let newNode;
    if (payload.kind === 'page') {
      const w = NODE_W.page, h = mode === 'analyse' ? 180 : 160;
      newNode = {
        id, type: 'page',
        x: Math.round((wx - w / 2) / 10) * 10,
        y: Math.round((wy - h / 2) / 10) * 10,
        data: {
          pageType: payload.pageType || 'custom',
          title: payload.title || 'New page',
          path: payload.path || '/new-page',
          status: payload.status || 'draft',
          visitors: 0, conversions: 0, rate: null,
        },
      };
    } else if (payload.kind === 'source') {
      const w = NODE_W.source, h = mode === 'analyse' ? 120 : 92;
      newNode = {
        id, type: 'source',
        x: Math.round((wx - w / 2) / 10) * 10,
        y: Math.round((wy - h / 2) / 10) * 10,
        data: {
          src: payload.src || 'fb',
          visitorsNum: payload.visitorsNum || 1000,
          visitorsLabel: payload.visitorsLabel || '1.0k',
        },
      };
    } else {
      return;
    }

    /* push the node. isEmpty checks nodes.length so empty canvas resolves correctly. */
    setNodes(ns => [...ns, newNode]);
    setSelected(id);
  };

  /* Push selection up to App whenever it changes — Inspector reads from there.
     Sends the full node object so Inspector doesn't need access to nodes[]. */
  useEffect(() => {
    if (!onSelectionChange) return;
    const node = selected ? nodes.find(n => n.id === selected) : null;
    onSelectionChange(node || null);
  }, [selected, nodes, onSelectionChange]);

  /* Imperative API exposed to App — App calls these when the user interacts with
     the Inspector (rename, change rule, duplicate, remove, etc.) so Canvas's
     internal state stays the source of truth for nodes/edges. */
  useEffect(() => {
    if (!canvasApiRef) return;
    canvasApiRef.current = {
      updateNodeData: (nodeId, patch) => setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n)),
      removeNode:     (nodeId) => {
        setNodes(ns => ns.filter(n => n.id !== nodeId));
        setEdges(es => es.filter(e => e.from !== nodeId && e.to !== nodeId));
        setSelected(null);
      },
      duplicateNode:  (nodeId) => {
        const orig = nodes.find(n => n.id === nodeId);
        if (!orig) return;
        const newId = orig.type + '-' + Date.now();
        const copy = { ...orig, id: newId, x: orig.x + 40, y: orig.y + 40, data: { ...orig.data, title: orig.data.title + ' copy' } };
        setNodes(ns => [...ns, copy]);
        setSelected(newId);
      },
      deselect:       () => setSelected(null),
      addNode:        ({ type, data, x, y }) => {
        const newId = (type || 'page') + '-' + Date.now();
        // Center of current visible canvas (compensate pan/zoom)
        const cx = x != null ? x : (-pan.x + 400) / zoom;
        const cy = y != null ? y : (-pan.y + 200) / zoom;
        const def = type === 'source'
          ? { src: 'fb', visitorsNum: 0 }
          : type === 'logic'
            ? { kind: 'condition', title: 'Untitled condition' }
            : { title: 'New page', path: '/new', kind: 'landing' };
        const node = { id: newId, type: type || 'page', x: cx, y: cy, data: { ...def, ...(data || {}) } };
        setNodes(ns => [...ns, node]);
        setSelected(newId);
      },
      removeNodeByTitle: (title) => {
        setNodes(ns => {
          const match = ns.find(n => n.data && n.data.title === title);
          if (!match) return ns;
          setEdges(es => es.filter(e => e.from !== match.id && e.to !== match.id));
          setSelected(s => s === match.id ? null : s);
          return ns.filter(n => n.id !== match.id);
        });
      },
      getNodes: () => nodes,
      panToNodeByTitle: (title) => {
        const match = nodes.find(n => n.data && n.data.title === title);
        if (!match) return;
        const w = NODE_W[match.type];
        const h = getNodeH(match, mode);
        const cx = match.x + w / 2;
        const cy = match.y + h / 2;
        const vw = canvasViewportEl.current?.clientWidth  || 800;
        const vh = canvasViewportEl.current?.clientHeight || 500;
        setPan({ x: vw / 2 - cx * zoom, y: vh / 2 - cy * zoom });
        setSelected(match.id);
      },
    };
  }, [canvasApiRef, nodes, pan, zoom, mode]);

  /* Notify parent of canvas-nodes changes so the Sidebar can derive
     "what's actually in the funnel right now". */
  useEffect(() => {
    if (typeof onNodesChange === 'function') onNodesChange(nodes);
  }, [nodes, onNodesChange]);

  /* derive source → target lookup for source-card "To Landing X%" rendering.
     Includes count of outgoing edges so the card can switch UI for 0 / 1 / 2+ cases. */
  const sourceTargets = useMemo(() => {
    const map = {};
    edges.forEach(e => {
      const fromNode = nodes.find(n => n.id === e.from);
      if (fromNode?.type !== 'source') return;
      const toNode = nodes.find(n => n.id === e.to);
      if (!toNode) return;
      const num = fromNode.data.visitorsNum || 1;
      const branch = { title: toNode.data.title, rate: Math.round(((e.volume || 0) / num) * 100), volume: e.volume || 0 };
      if (!map[e.from]) {
        map[e.from] = { title: toNode.data.title, rate: branch.rate, count: 1, branches: [branch] };
      } else {
        map[e.from].count += 1;
        map[e.from].branches.push(branch);
      }
    });
    return map;
  }, [nodes, edges]);

  /* node drag — start on mousedown of card body */
  const onNodeDragStart = (nodeId, e) => {
    const n = nodes.find(x => x.id === nodeId);
    if (!n) return;
    setNodeDrag({ nodeId, startX: e.clientX, startY: e.clientY, startNodeX: n.x, startNodeY: n.y });
    setSelected(nodeId);
  };

  /* track mouse for node drag — divide by zoom so screen pixels map to world units.
     Snap final x/y to a 10px grid so cards align visually when laid out manually.
     10px is tight enough to feel smooth (8 snaps per node-width) but coarse enough
     that adjacent cards visibly align edges/gridlines. */
  useEffect(() => {
    if (!nodeDrag) return;
    /* Track the latest dropped position locally so onUp can read it without
       waiting for React state to flush. setNodes is called via updater function
       (which sees fresh state), but `nodes` in our outer closure stays stale —
       so we can't compare against `nodes.find(...)` at drop time. */
    let latestX = nodeDrag.startNodeX;
    let latestY = nodeDrag.startNodeY;
    const SNAP = 10;
    const onMove = (e) => {
      const dx = (e.clientX - nodeDrag.startX) / zoom;
      const dy = (e.clientY - nodeDrag.startY) / zoom;
      const nx = Math.round((nodeDrag.startNodeX + dx) / SNAP) * SNAP;
      const ny = Math.round((nodeDrag.startNodeY + dy) / SNAP) * SNAP;
      latestX = nx; latestY = ny;
      setNodes(ns => ns.map(n => n.id === nodeDrag.nodeId
        ? { ...n, x: nx, y: ny }
        : n));
    };
    const onUp = () => {
      /* Overlap check — strict AABB intersection between the dropped position
         and any other card. If overlapping, animate back to the pre-drag origin.
         Uses latestX/Y (tracked locally during drag) instead of nodes.find()
         from the closure, which would be stale. */
      const dragged = nodes.find(n => n.id === nodeDrag.nodeId);
      if (dragged) {
        const dw = NODE_W[dragged.type], dh = getNodeH(dragged, mode);
        const overlaps = nodes.some(other => {
          if (other.id === dragged.id) return false;
          const ow = NODE_W[other.type], oh = getNodeH(other, mode);
          return latestX         < other.x + ow
              && latestX + dw    > other.x
              && latestY         < other.y + oh
              && latestY + dh    > other.y;
        });
        if (overlaps) {
          setLayoutAnimating(true);
          setNodes(ns => ns.map(n => n.id === nodeDrag.nodeId
            ? { ...n, x: nodeDrag.startNodeX, y: nodeDrag.startNodeY }
            : n));
          setTimeout(() => setLayoutAnimating(false), 340);
        }
      }
      setNodeDrag(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [nodeDrag, zoom]);

  /* edge disconnect */
  const removeEdge = (edgeIndex) => {
    setEdges(es => es.filter((_, i) => i !== edgeIndex));
    setHoveredEdge(null);
  };

  /* edge insert-step picker. worldX/worldY captured here so a chosen step can be
     placed at exactly the edge midpoint we clicked. screenX/Y position the popover. */
  const [insertPicker, setInsertPicker] = useState(null); /* { edgeIndex, screenX, screenY, worldX, worldY } */
  const insertOnEdge = (edgeIndex, worldX, worldY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setInsertPicker({
      edgeIndex,
      screenX: rect.left + worldX * zoom + pan.x,
      screenY: rect.top  + worldY * zoom + pan.y,
      worldX, worldY,
    });
  };

  /* insertLogicNode — picker chose Condition or A/B test. Creates a LogicNode at
     the edge midpoint and splits the original A→B edge into:
        A → Logic              (inherits original volume + label)
        Logic[primary] → B     (inherits volume; branch = 'yes' or 'a')
     The secondary branch (no/b) is left unwired — user drags it to a destination. */
  const insertLogicNode = (kind) => {
    if (!insertPicker) return;
    const { edgeIndex, worldX, worldY } = insertPicker;
    const orig = edges[edgeIndex];
    if (!orig) { setInsertPicker(null); return; }
    const id = 'logic-' + Date.now();
    const w = NODE_W.logic, h = NODE_H.logic;
    const newNode = {
      id, type: 'logic',
      x: worldX - w / 2,
      y: worldY - h / 2,
      data: {
        kind,
        title: kind === 'condition' ? 'Untitled condition' : 'Untitled A/B test',
      },
    };
    const primaryBranch = kind === 'condition' ? 'yes' : 'a';
    const inEdge  = { from: orig.from, to: id,       volume: orig.volume };
    if (orig.label) inEdge.label = orig.label;
    const outEdge = { from: id,        to: orig.to,  volume: orig.volume, branch: primaryBranch };
    setNodes(ns => [...ns, newNode]);
    setEdges(es => [
      ...es.slice(0, edgeIndex),
      inEdge,
      outEdge,
      ...es.slice(edgeIndex + 1),
    ]);
    setSelected(id);
    setInsertPicker(null);
    setHoveredEdge(null);
  };

  /* node remove — also drops any edges touching the node */
  const removeNode = (nodeId) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId));
    setEdges(es => es.filter(e => e.from !== nodeId && e.to !== nodeId));
    setSelected(null);
  };

  /* change source platform — swap node.data.src in place; edges stay intact */
  const changeSource = (nodeId, newSrcId) => {
    setNodes(ns => ns.map(n => n.id === nodeId
      ? { ...n, data: { ...n.data, src: newSrcId } }
      : n));
  };

  /* connection drag — start from connector dot. For logic nodes, branch identity is
     determined here by the count of existing outgoing edges (1st = primary, 2nd =
     secondary). The committed edge inherits this branch for stroke colour + badge. */
  const onConnectStart = (nodeId, side, _e, branch) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    /* For logic nodes: assign branch from outgoing-edge count. After 2 connections,
       silently no-op (don't enter connecting state) so a third drag does nothing. */
    if (node.type === 'logic') {
      const outCount = edges.filter(e => e.from === nodeId).length;
      if (outCount >= 2) return;
      const k = LOGIC_KIND[node.data.kind] || LOGIC_KIND.condition;
      branch = (outCount === 0) ? k.primaryBranch : k.secondaryBranch;
    }
    const w = NODE_W[node.type], h = getNodeH(node, mode);
    const points = {
      top:    { x: node.x + w / 2, y: node.y },
      right:  { x: node.x + w,     y: node.y + h / 2 },
      bottom: { x: node.x + w / 2, y: node.y + h },
      left:   { x: node.x,         y: node.y + h / 2 },
    };
    setConnecting({ fromNodeId: nodeId, side, branch, fromPoint: points[side], currentPoint: points[side], dropTarget: null });
  };

  /* track mouse during connection drag — also hit-tests for valid drop target */
  useEffect(() => {
    if (!connecting) return;
    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const wx = (e.clientX - rect.left - pan.x) / zoom;
      const wy = (e.clientY - rect.top  - pan.y) / zoom;
      /* hit-test against every node's bbox; skip self and source-targets (sources can't receive) */
      let target = null;
      for (const n of nodes) {
        if (n.id === connecting.fromNodeId) continue;
        if (n.type === 'source') continue; /* sources are entry points only — invalid drop */
        const w = NODE_W[n.type], h = getNodeH(n, mode);
        if (wx >= n.x && wx <= n.x + w && wy >= n.y && wy <= n.y + h) {
          target = n.id; break;
        }
      }
      setConnecting(c => c ? { ...c, currentPoint: { x: wx, y: wy }, dropTarget: target } : null);
    };
    const onUp = () => {
      if (connecting?.dropTarget) {
        /* create edge with sensible default volume — half of source's visitorsNum */
        setEdges(es => {
          /* avoid duplicate edge from→to */
          const dupe = es.findIndex(e => e.from === connecting.fromNodeId && e.to === connecting.dropTarget);
          if (dupe !== -1) return es;
          const fromNode = nodes.find(n => n.id === connecting.fromNodeId);
          const defaultVolume = fromNode?.type === 'source'
            ? Math.round((fromNode.data.visitorsNum || 1000) * 0.5)
            : 100;
          /* dragged from a logic-output dot? carry the branch through so the new edge
             gets the matching colour ('yes' green / 'no' grey / 'a' violet / 'b' amber). */
          const newEdge = { from: connecting.fromNodeId, to: connecting.dropTarget, volume: defaultVolume };
          if (connecting.branch) newEdge.branch = connecting.branch;
          return [...es, newEdge];
        });
      }
      setConnecting(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [connecting, pan, zoom, nodes]);

  /* fit-to-canvas — compute bbox of all nodes, scale + center within container.
     Accepts optional nodesOverride so demo-state switches can pass fresh data
     without waiting for setNodes to commit. */
  const fitToCanvas = (nodesOverride) => {
    const ns = nodesOverride || nodes;
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    if (!ns.length) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ns.forEach(n => {
      const w = NODE_W[n.type], h = getNodeH(n, mode);
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + w);
      maxY = Math.max(maxY, n.y + h);
    });
    const pad = 80;
    const bw = maxX - minX + pad * 2;
    const bh = maxY - minY + pad * 2;
    const z = Math.min(cw / bw, ch / bh, 1);
    const newZoom = Math.max(0.4, Math.min(2, z));
    /* center the bbox in the container */
    const px = (cw - (maxX - minX) * newZoom) / 2 - minX * newZoom;
    const py = (ch - (maxY - minY) * newZoom) / 2 - minY * newZoom;
    setZoom(newZoom);
    setPan({ x: px, y: py });
  };

  /* ─── AUTO-LAYOUT — Sugiyama-style layered layout ───
     1. Assign each node a column (= depth from any source). Sources go in col 0;
        each downstream node lands one column past its furthest predecessor.
     2. Within each column, sort nodes by the average y of their parents (or by
        original y if no parents) — minimizes line crossings without expensive
        crossing-count optimization (good enough for funnels with <20 nodes).
     3. Compute node positions: column x = column_index * (column_width + h_gap),
        rows within column stacked at v_gap intervals, vertically centered.
     4. Set layoutAnimating, push new nodes (which triggers CSS transition on
        left/top in card components), clear flag after 320ms. */
  const autoLayout = () => {
    if (!nodes.length) return;
    /* edge index for graph traversal */
    const incoming = {};
    const outgoing = {};
    nodes.forEach(n => { incoming[n.id] = []; outgoing[n.id] = []; });
    edges.forEach(e => {
      if (incoming[e.to])    incoming[e.to].push(e.from);
      if (outgoing[e.from])  outgoing[e.from].push(e.to);
    });

    /* Step 1 — column assignment via longest-path layering.
       BFS from "roots" (nodes with no incoming) outward. A node's column is
       max(parent_columns) + 1. Detached nodes get column 0. */
    const cols = {};
    const roots = nodes.filter(n => incoming[n.id].length === 0).map(n => n.id);
    /* if no roots (all cyclic), seed with the leftmost node */
    if (!roots.length && nodes.length) {
      const leftmost = nodes.reduce((a, b) => a.x < b.x ? a : b);
      roots.push(leftmost.id);
    }
    roots.forEach(id => { cols[id] = 0; });
    /* iterative relax until stable. Each iteration assigns/upgrades columns
       for any node whose parents all have columns. Bounded by node count. */
    for (let iter = 0; iter < nodes.length + 5; iter++) {
      let changed = false;
      nodes.forEach(n => {
        const parents = incoming[n.id];
        if (!parents.length) return;
        const knownParents = parents.filter(p => cols[p] !== undefined);
        if (!knownParents.length) return;
        const maxParentCol = Math.max(...knownParents.map(p => cols[p]));
        const want = maxParentCol + 1;
        if (cols[n.id] === undefined || cols[n.id] < want) {
          cols[n.id] = want;
          changed = true;
        }
      });
      if (!changed) break;
    }
    /* any node still unassigned (cycle, disconnected) → column 0 */
    nodes.forEach(n => { if (cols[n.id] === undefined) cols[n.id] = 0; });

    /* Step 2 — within each column, sort by avg parent y (heuristic for crossing
       reduction). First-column nodes sort by original y. */
    const byCol = {};
    nodes.forEach(n => {
      const c = cols[n.id];
      if (!byCol[c]) byCol[c] = [];
      byCol[c].push(n);
    });
    Object.keys(byCol).forEach(c => {
      byCol[c].sort((a, b) => {
        const aParents = incoming[a.id];
        const bParents = incoming[b.id];
        const aAvg = aParents.length
          ? aParents.reduce((s, p) => {
              const pn = nodes.find(x => x.id === p);
              return s + (pn ? pn.y : 0);
            }, 0) / aParents.length
          : a.y;
        const bAvg = bParents.length
          ? bParents.reduce((s, p) => {
              const pn = nodes.find(x => x.id === p);
              return s + (pn ? pn.y : 0);
            }, 0) / bParents.length
          : b.y;
        return aAvg - bAvg;
      });
    });

    /* Step 3 — assign positions. Column x = leftStart + col * (maxColWidth + hGap).
       Rows within column stacked at vGap, then vertically centered around 0. */
    const H_GAP = 100;
    const V_GAP = 60;
    const LEFT_START = 100;
    const TOP_START = 200;
    const colWidths = {};
    Object.keys(byCol).forEach(c => {
      const ws = byCol[c].map(n => NODE_W[n.type]);
      colWidths[c] = Math.max(...ws);
    });
    const colXs = {};
    let cursor = LEFT_START;
    const sortedColKeys = Object.keys(byCol).map(Number).sort((a, b) => a - b);
    sortedColKeys.forEach(c => {
      colXs[c] = cursor;
      cursor += colWidths[c] + H_GAP;
    });

    const newPositions = {};
    sortedColKeys.forEach(c => {
      const colNodes = byCol[c];
      /* total stack height for this column */
      const stackH = colNodes.reduce((s, n, i) => s + getNodeH(n, mode) + (i > 0 ? V_GAP : 0), 0);
      let yCursor = TOP_START - stackH / 2 + 400; /* +400 to keep canvas-positive */
      colNodes.forEach(n => {
        /* center each node horizontally within its column allocation */
        const nx = colXs[c] + (colWidths[c] - NODE_W[n.type]) / 2;
        /* snap to 10px grid (matches drag snap) for consistency */
        const SNAP = 10;
        newPositions[n.id] = {
          x: Math.round(nx / SNAP) * SNAP,
          y: Math.round(yCursor / SNAP) * SNAP,
        };
        yCursor += getNodeH(n, mode) + V_GAP;
      });
    });

    /* Step 4 — animate. Apply new positions in one setNodes call; the CSS
       transition (driven by layoutAnimating) eases everything to its new home. */
    setLayoutAnimating(true);
    setNodes(ns => ns.map(n => newPositions[n.id]
      ? { ...n, x: newPositions[n.id].x, y: newPositions[n.id].y }
      : n));
    /* fit-to-canvas after the animation completes so the user sees the result framed */
    setTimeout(() => {
      setLayoutAnimating(false);
      const updated = nodes.map(n => newPositions[n.id]
        ? { ...n, x: newPositions[n.id].x, y: newPositions[n.id].y }
        : n);
      fitToCanvas(updated);
    }, 340);
  };

  /* On demo state change: load preset data and center the view.
     First mount stays at 100% zoom (so users always land on a 100% view —
     small funnels don't shrink). Subsequent demo-state switches fit-to-canvas
     so the user can compare framings. */
  const firstMountRef = useRef(true);
  useEffect(() => {
    const s = DEMO_STATES[demoState] || DEMO_STATES.empty;
    setNodes(s.nodes);
    setEdges(s.edges);
    setSelected(null);
    setHoveredEdge(null);
    if (firstMountRef.current) {
      // Initial paint — keep zoom at 100%, just center.
      firstMountRef.current = false;
      setZoom(1);
      const t = setTimeout(() => {
        const el = containerRef.current;
        if (!el || !s.nodes.length) return;
        // Center on the bbox of nodes
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        s.nodes.forEach(n => {
          const w = NODE_W[n.type], h = getNodeH(n, mode);
          minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x + w); maxY = Math.max(maxY, n.y + h);
        });
        const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
        setPan({ x: el.clientWidth / 2 - cx, y: el.clientHeight / 2 - cy });
      }, 0);
      return () => clearTimeout(t);
    }
    /* defer one tick so containerRef has measured; pass fresh nodes directly */
    const t = setTimeout(() => fitToCanvas(s.nodes), 0);
    return () => clearTimeout(t);
  }, [demoState]);

  /* Mode change: when entering Analyse for the first time, snap to 100% and
     center so user can read card detail. (Auto-layout deferred — would conflict
     with user-positioned cards.) */
  const prevModeRef = useRef(mode);
  useEffect(() => {
    if (prevModeRef.current === mode) return;
    if (mode === 'analyse' && prevModeRef.current !== 'analyse') {
      setZoom(1);
      // Center on bbox
      const el = containerRef.current;
      if (el && nodes.length) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(n => {
          const w = NODE_W[n.type], h = getNodeH(n, mode);
          minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x + w); maxY = Math.max(maxY, n.y + h);
        });
        const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
        setPan({ x: el.clientWidth / 2 - cx, y: el.clientHeight / 2 - cy });
      }
    }
    prevModeRef.current = mode;
  }, [mode, nodes]);

  /* keyboard: Z = fit-to-canvas, Esc = deselect */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); fitToCanvas(); }
      if (e.key === 'Escape') { setSelected(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodes]);

  /* wheel: cmd+scroll = zoom toward cursor; plain wheel = pan.
     Attached as a native non-passive listener via useEffect because React's
     synthetic onWheel is registered passive in modern Chrome — meaning its
     preventDefault() is silently ignored, allowing browser-level zoom-the-page
     to fire on Cmd+wheel. Native listener with { passive: false } guarantees
     preventDefault works and the zoom stays scoped to the canvas. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      if (e.metaKey || e.ctrlKey) {
        const delta = -e.deltaY * 0.0015;
        const next = Math.max(0.4, Math.min(2, zoom * (1 + delta)));
        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const wx = (px - pan.x) / zoom;
        const wy = (py - pan.y) / zoom;
        const nx = px - wx * next;
        const ny = py - wy * next;
        setZoom(next);
        setPan({ x: nx, y: ny });
      } else {
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom, pan]);

  /* click-drag pan when grabbing empty canvas (not on a node) */
  const onMouseDown = (e) => {
    /* only start pan if mousedown was on canvas surface itself, not bubbled from a node */
    if (e.target !== e.currentTarget && !e.target.closest?.('[data-canvas-bg]')) return;
    setDrag({ startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y });
    setSelected(null);
    setInsertPicker(null);
    /* belt-and-suspenders dismissal — broadcast to all open popovers in addition
       to their own document listeners, in case a layered hit-test misses */
    document.dispatchEvent(new CustomEvent('close-popovers'));
  };
  const onMouseMove = (e) => {
    if (!drag) return;
    setPan({ x: drag.startPanX + (e.clientX - drag.startX), y: drag.startPanY + (e.clientY - drag.startY) });
  };
  const onMouseUp = () => setDrag(null);

  const isEmpty = demoState === 'empty' && !nodes.length;

  return (
    <main ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{
        backgroundColor: '#FAFCFF',
        cursor: drag ? 'grabbing' : 'default',
        touchAction: 'none',         /* block native browser pinch-zoom + pan inside the canvas */
        overscrollBehavior: 'contain', /* prevent wheel events bubbling up to page-scroll/zoom */
      }}
      onDragOver={onCanvasDragOver}
      onDragLeave={onCanvasDragLeave}
      onDrop={onCanvasDrop}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}>

      {/* drop-zone overlay — dashed outline + "Drop to add" hint when dragging from sidebar.
          z-30 so it sits above the canvas chrome but below modals/popovers. */}
      {dragOver && (
        <div className="absolute inset-3 z-30 rounded-lg pointer-events-none flex items-center justify-center"
             style={{
               border: '2px dashed #006CB5',
               background: 'rgba(0, 108, 181, 0.04)',
             }}>
          <div className="px-3 py-1.5 rounded-md bg-brand text-white text-[12px] font-semibold shadow-modal">
            Drop here to add to canvas
          </div>
        </div>
      )}

      {/* dot grid bg — drawn on a non-transformed layer so it stays consistent
          across zoom (subtle, doesn't compete with content). */}
      <div data-canvas-bg className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)',
        backgroundSize: `${18 * zoom}px ${18 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}/>

      {/* view switcher always visible */}
      <ViewSwitcher active={demoState} onChange={onDemoStateChange}/>

      {/* empty state */}
      {isEmpty && <EmptyCanvas onJumpToTemplates={onJumpToTemplates} onJumpToPages={onJumpToPages}/>}

      {/* transformed inner layer holds edges + nodes */}
      {!isEmpty && (
        <div
          data-layout-animating={layoutAnimating}
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: 1, height: 1, /* anchor; children are absolute */
          }}>
          {/* edges paths layer — sits behind nodes so cards always overlap connections */}
          <div className="absolute" style={{ left: 0, top: 0, width: 4000, height: 2000, pointerEvents: 'none' }}>
            <EdgePaths nodes={nodes} edges={edges} hovered={hoveredEdge} onHover={setHoveredEdge} mode={mode}/>
          </div>

          {/* node layer */}
          {nodes.map(n =>
              n.type === 'page'  ? <PageNode   key={n.id} node={n} mode={mode} selected={selected === n.id} onSelect={setSelected}
                                               onDragStart={onNodeDragStart}
                                               onConnectStart={onConnectStart}
                                               onRemove={removeNode}/>
            : n.type === 'logic' ? <LogicNode  key={n.id} node={n}              selected={selected === n.id} onSelect={setSelected}
                                               onDragStart={onNodeDragStart}
                                               onConnectStart={onConnectStart}
                                               onRemove={removeNode}
                                               outgoingCount={edges.filter(e => e.from === n.id).length}/>
            :                      <SourceNode key={n.id} node={n} mode={mode} selected={selected === n.id} onSelect={setSelected}
                                               onDragStart={onNodeDragStart}
                                               onConnectStart={onConnectStart}
                                               onChangeSource={changeSource}
                                               onRemove={removeNode}
                                               target={sourceTargets[n.id]}/>
          )}

          {/* edges UI overlay — arrow + chip + stats. Renders ABOVE nodes so neither
              the chip nor the arrow tip is occluded when an endpoint sits behind a card. */}
          <div className="absolute" style={{ left: 0, top: 0, width: 4000, height: 2000, pointerEvents: 'none' }}>
            <EdgeOverlays nodes={nodes} edges={edges} zoom={zoom} hovered={hoveredEdge} onHover={setHoveredEdge}
                          onRemove={removeEdge} onInsert={insertOnEdge} mode={mode}/>
          </div>

          {/* drop-target outline — pulses brand ring on the node we'd land on if mouse releases now */}
          {connecting?.dropTarget && (() => {
            const t = nodes.find(n => n.id === connecting.dropTarget);
            if (!t) return null;
            const w = NODE_W[t.type], h = getNodeH(t, mode);
            return (
              <div className="absolute pointer-events-none rounded-lg ring-2 ring-brand"
                   style={{ left: t.x - 4, top: t.y - 4, width: w + 8, height: h + 8, boxShadow: '0 0 0 4px rgba(0,108,181,0.12)' }}/>
            );
          })()}

          {/* connection ghost — curvy bezier from grabbed dot to cursor */}
          {connecting && (
            <svg className="absolute pointer-events-none" style={{ left: 0, top: 0, width: 4000, height: 2000, overflow: 'visible' }}>
              <ConnectionGhost from={connecting.fromPoint} side={connecting.side} to={connecting.currentPoint} branch={connecting.branch}/>
            </svg>
          )}
        </div>
      )}

      {/* canvas top-left controls + zoom — Optimise tests now live in
          the Inspector empty-state when in Optimise mode */}
      <ExportFunnelButton/>
      {!isEmpty && <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(2, z + 0.1))}
        onZoomOut={() => setZoom(z => Math.max(0.4, z - 0.1))}
        onFit={fitToCanvas}
        onAutoLayout={autoLayout}
        onSetZoom={(next) => {
          /* zoom toward viewport center so the visible content stays anchored
             rather than springing off in some direction. */
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) { setZoom(next); return; }
          const px = rect.width / 2;
          const py = rect.height / 2;
          const wx = (px - pan.x) / zoom;
          const wy = (py - pan.y) / zoom;
          setZoom(next);
          setPan({ x: px - wx * next, y: py - wy * next });
        }}/>}

      {/* insert-step picker — opens at edge midpoint; placeholder menu for now */}
      {insertPicker && createPortal(
        <div className="fixed inset-0 z-[9990]" onClick={() => setInsertPicker(null)}>
          <div className="absolute bg-white rounded-lg shadow-menu border border-line p-1"
               style={{
                 left: insertPicker.screenX,
                 top: insertPicker.screenY,
                 transform: 'translate(-50%, 8px)',
                 minWidth: 180,
               }}
               onClick={(e) => e.stopPropagation()}>
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Insert step here</div>
            <MenuItem icon={<FileIcon size={13}/>} label="Page" onClick={() => setInsertPicker(null)}/>
            <MenuItem icon={<Cart size={13}/>}     label="Checkout" onClick={() => setInsertPicker(null)}/>
            <MenuItem icon={<TrendUp size={13}/>}  label="Upsell" onClick={() => setInsertPicker(null)}/>
            <MenuDivider/>
            <MenuItem icon={<Workflow size={13}/>} label="Condition" onClick={() => insertLogicNode('condition')}/>
            <MenuItem icon={<Bars size={13}/>}     label="A/B test" onClick={() => insertLogicNode('abtest')}/>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}

/* ─── INSPECTOR — right-side panel, 320px, slides in on selection.
   Pattern source: V5 (rich page details + Suggested win) + V6 (tabbed Details/Leads/Settings).
   Three tabs:
     · Details → type-aware rich content (perf metrics + suggested win + details + actions)
     · Leads   → list of contacts that hit this step (V6 pattern, placeholder for now)
     · Settings → tracking, custom URL, advanced (V6 pattern, placeholder for now)
   Slides in/out via CSS transition on translateX. Empty state when nothing selected. ─── */
function Inspector({ node, api, mode }) {
  const [tab, setTab] = useState('details');
  const open = !!node;
  /* reset to Details tab whenever a different node is selected — feels right; users
     don't expect an old tab to persist across selections */
  useEffect(() => { if (node) setTab('details'); }, [node?.id]);

  return (
    <aside
      className="border-l border-line bg-white flex flex-col shrink-0 overflow-hidden"
      style={{
        width: open ? 320 : 0,
        transition: 'width 240ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* fixed-width content wrapper so the slide doesn't squash text mid-animation */}
      <div style={{ width: 320 }} className="flex-1 flex flex-col min-h-0">
        {open && (
          <>
            <InspectorHeader node={node} onClose={() => api.deselect()} api={api}/>
            <InspectorTabs tab={tab} onTabChange={setTab}/>
            <div className="flex-1 overflow-y-auto scroll-thin">
              {tab === 'details'  && <InspectorDetails node={node} api={api} mode={mode}/>}
              {tab === 'leads'    && <InspectorLeads node={node}/>}
              {tab === 'settings' && <InspectorSettings node={node} api={api}/>}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* InspectorHeader — type badge + title + close X. Title is editable inline. */
function InspectorHeader({ node, onClose, api }) {
  // Adds a clickable status pill (manual status change is discoverable here
  // rather than buried in Settings → General). Pulse animation now uses
  // pl-1 + py-1 padding on parent so the dot's outer ring isn't clipped.
  const meta = inspectorMeta(node);
  const Ic = meta.Icon;
  const status = node?.data?.status || 'draft';
  const [statusOpen, setStatusOpen] = useState(false);
  const STATUS = {
    live:   { label: 'Live',   dot: 'bg-good',   pulse: true },
    draft:  { label: 'Draft',  dot: 'bg-warn',   pulse: false },
    paused: { label: 'Paused', dot: 'bg-ink-soft', pulse: false },
  };
  const cur = STATUS[status] || STATUS.draft;
  return (
    <div className="px-4 py-3 border-b border-line-soft flex items-center gap-2.5 overflow-visible">
      <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: meta.color + '1a', color: meta.color }}>
        <Ic size={14}/>
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider"
             style={{ color: meta.color, letterSpacing: '0.06em' }}>
          {meta.kindLabel}
        </div>
        <div className="text-[13px] font-semibold text-ink truncate leading-tight mt-0.5">{meta.title}</div>
      </div>
      <div className="relative flex-shrink-0">
        <button onClick={() => setStatusOpen(o => !o)}
          className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-surface-sub border border-line-soft hover:border-line text-[10.5px] font-semibold text-ink transition-colors">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className={`absolute inset-0 rounded-full ${cur.dot}`}/>
            {cur.pulse && <span className={`absolute inset-0 rounded-full ${cur.dot} live-dot opacity-60`}/>}
          </span>
          {cur.label}
          <ChevronDown size={9} className="text-ink-soft" strokeWidth={2}/>
        </button>
        {statusOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 ctx-menu w-[120px] bg-white rounded-md border border-line shadow-menu p-1"
               onMouseLeave={() => setStatusOpen(false)}>
            {['draft', 'live', 'paused'].map(s => (
              <button key={s}
                onClick={() => { api?.updateNodeData(node.id, { status: s }); setStatusOpen(false); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] hover:bg-surface-sub transition-colors ${status === s ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS[s].dot}`}/>
                {STATUS[s].label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Tip label="Close inspector  Esc" side="bottom">
        <button onClick={onClose}
          className="w-6 h-6 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors flex-shrink-0">
          <X size={12}/>
        </button>
      </Tip>
    </div>
  );
}

/* meta — collapses node-type variation into a single shape the header can render */
function inspectorMeta(node) {
  if (!node) return { color: '#94A3B8', Icon: FileIcon, kindLabel: '—', title: '—' };
  if (node.type === 'page') {
    const t = PAGE_TYPE[node.data.pageType] || PAGE_TYPE.custom;
    return { color: t.color, Icon: t.Icon, kindLabel: 'Page · ' + t.label, title: node.data.title };
  }
  if (node.type === 'source') {
    const s = SOURCES.find(p => p.id === node.data.src) || SOURCES[0];
    return { color: s.color, Icon: s.Icon, kindLabel: 'Traffic source', title: s.name };
  }
  if (node.type === 'logic') {
    const k = node.data.kind === 'abtest' ? 'A/B test' : 'Condition';
    const Ic = node.data.kind === 'abtest' ? Bars : Workflow;
    return { color: '#7C3AED', Icon: Ic, kindLabel: 'Logic · ' + k, title: node.data.title || k };
  }
  return { color: '#94A3B8', Icon: FileIcon, kindLabel: '—', title: '—' };
}

/* InspectorTabs — three-tab strip below header. Typography mirrors
   topbar Build/Analyse/Optimise tabs: 12px medium, light grey → dark active,
   no underline indicator. */
function InspectorTabs({ tab, onTabChange }) {
  // Details + Settings only. Leads dropped permanently — funnel builder is
  // about structure, not lead management (that lives elsewhere in Estage).
  // Tabs left-aligned, stretched edge-to-edge so the underline-free strip
  // sits flush with the Details/Settings content below.
  const tabs = [
    { id: 'details',  label: 'Details'  },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <div className="border-b border-line-soft flex items-stretch">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTabChange(t.id)}
          className={`flex-1 px-4 py-2.5 text-[12px] font-medium text-left transition-colors
                      ${tab === t.id ? 'text-ink bg-white' : 'text-ink-soft hover:text-ink-muted hover:bg-surface-sub'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* InspectorDetails — type-aware rich content */
function InspectorDetails({ node, api, mode }) {
  if (node.type === 'page')   return <DetailsPage node={node} api={api} mode={mode}/>;
  if (node.type === 'source') return <DetailsSource node={node} api={api} mode={mode}/>;
  if (node.type === 'logic')  return <DetailsLogic node={node} api={api}/>;
  return null;
}

/* PAGE DETAILS — V5 pattern: Performance + Suggested win + Details + Actions */
function DetailsPage({ node, api, mode }) {
  const { title, path, status, visitors, rate } = node.data;
  const onlineNow = node.data.onlineNow || 14;
  const avgTime = node.data.avgTime || '1:48';
  const isAnalyse = mode === 'analyse';
  return (
    <div className="px-4 py-3 space-y-4">
      {/* Performance section */}
      <InspSection label="Performance" right={isAnalyse ? <span className="text-[10px] text-ink-soft">In funnel</span> : null}>
        <Stat label="Unique visitors" value={visitors?.toLocaleString() || '—'}/>
        <Stat label="Online now" value={
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-good live-dot"/>
            <span>{onlineNow}</span>
          </span>
        }/>
        <Stat label="Conversion to next" value={rate != null ? rate.toFixed(0) + '%' : '—'} accent={rate != null ? 'good' : null}/>
        <Stat label="Avg. time on page" value={avgTime}/>
      </InspSection>

      {/* Suggested win — the V5 standout. AI-generated optimisation card */}
      <SuggestedWin
        title="Shorten the hero section"
        body="Visitors who scroll past 60% convert 22% better. Trim two paragraphs."
        impact="+18%"
        cta="Apply suggestion"
      />

      {/* Details list */}
      <InspSection label="Details">
        <Row k="Status" v={
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-good live-dot' : 'bg-warn'}`}/>
            <span className="capitalize">{status}</span>
          </span>
        }/>
        <Row k="URL" v={<span className="font-mono text-[11px]">{path}</span>}/>
        <Row k="Tracking" v={<span className="text-good-deep">Active</span>}/>
        <Row k="Last edited" v="2h ago by RJ"/>
      </InspSection>

      {/* Actions */}
      <InspSection label="Actions">
        <ActionButton icon={<Edit size={11}/>}        label="Edit page" />
        <ActionButton icon={<Eye size={11}/>}         label="Preview" />
        <ActionButton icon={<Copy size={11}/>}        label="Duplicate" onClick={() => api.duplicateNode(node.id)}/>
        <ActionButton icon={<X size={11}/>}           label="Remove"   destructive onClick={() => api.removeNode(node.id)}/>
      </InspSection>
    </div>
  );
}

/* SOURCE DETAILS — Performance + Top campaigns + Actions */
function DetailsSource({ node, api, mode }) {
  const isCustom = node.data.src === 'custom';
  const s = SOURCES.find(p => p.id === node.data.src) || SOURCES[0];
  const visitors = node.data.visitorsNum || 0;
  const cpl = node.data.cpl != null ? '$' + node.data.cpl.toFixed(2) : '—';
  const connected = node.data.connected !== false;
  const customName  = node.data.customName  || 'Custom source';
  const customColor = node.data.customColor || '#475569';

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Type dropdown — switch between platform-connected and custom mode */}
      <InspSection label="Source type">
        <select value={node.data.src || 'fb'} onChange={(e) => api.updateNodeData(node.id, { src: e.target.value })}
          className="w-full h-8 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
          {SOURCES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          <option value="custom">Custom source…</option>
        </select>
      </InspSection>

      {/* Custom-source UI: name + color, no connection */}
      {isCustom && (
        <>
          <InspSection label="Custom source">
            <Field label="Name">
              <input value={customName} onChange={(e) => api.updateNodeData(node.id, { customName: e.target.value })}
                className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
            </Field>
            <Field label="Color">
              <div className="grid grid-cols-8 gap-1">
                {['#006CB5','#10B981','#7C3AED','#F59E0B','#DC2626','#475569','#0891B2','#EC4899'].map(c => (
                  <button key={c} onClick={() => api.updateNodeData(node.id, { customColor: c })}
                    className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-105 ${
                      customColor === c ? 'border-ink ring-2 ring-brand-soft' : 'border-white shadow-xs'
                    }`}
                    style={{ background: c }}/>
                ))}
              </div>
            </Field>
          </InspSection>
        </>
      )}

      {/* Connection (platform sources only) */}
      {!isCustom && (
        <InspSection label="Connection">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-surface-sub border border-line-soft rounded-md">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-good live-dot' : 'bg-ink-soft'}`}/>
            <span className="text-[11.5px] text-ink font-medium">{connected ? 'Connected' : 'Not connected'}</span>
            <span className="flex-1"/>
            <button onClick={() => api.updateNodeData(node.id, { connected: !connected })}
              className={`h-7 px-2.5 text-[11px] font-semibold rounded transition-colors ${
                connected
                  ? 'text-bad-deep bg-white border border-line hover:bg-bad-soft hover:border-bad'
                  : 'text-white bg-genesis hover:bg-genesis-hover'
              }`}>
              {connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </InspSection>
      )}

      <InspSection label="Performance">
        <Stat label="Visitors (7d)" value={visitors.toLocaleString()}/>
        <Stat label="Sessions" value={Math.round(visitors * 1.18).toLocaleString()}/>
        <Stat label="Cost (7d)" value={node.data.cost ? '$' + node.data.cost : '—'}/>
        <Stat label="Cost per lead" value={cpl} accent={node.data.cpl != null && node.data.cpl < 5 ? 'good' : null}/>
      </InspSection>

      <SuggestedWin
        title={`Lift ${s.name} match rate`}
        body="Audience overlap with your buyer list is 71%. Sharpen targeting to lift conversion."
        impact="+12%"
        cta="Open audience"/>

      <InspSection label="Details">
        <Row k="Platform" v={s.name}/>
        <Row k="Campaign" v={node.data.campaign || 'May Promo'}/>
        <Row k="UTM source" v={<span className="font-mono text-[11px]">{(node.data.utm || s.id).toLowerCase()}</span>}/>
        <Row k="Status" v={<span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-good live-dot"/>Active</span>}/>
      </InspSection>

      <InspSection label="Actions">
        <ActionButton icon={<ExternalLink size={11}/>} label={`Open in ${s.name}`}/>
        <ActionButton icon={<Copy size={11}/>}        label="Duplicate" onClick={() => api.duplicateNode(node.id)}/>
        <ActionButton icon={<X size={11}/>}           label="Remove"   destructive onClick={() => api.removeNode(node.id)}/>
      </InspSection>
    </div>
  );
}

/* LOGIC DETAILS — Condition rule builder OR A/B Test split slider */
function DetailsLogic({ node, api }) {
  const isAB = node.data.kind === 'abtest';
  const yLabel = node.data.yesLabel != null ? node.data.yesLabel : (isAB ? 'Variant A' : 'If condition is true');
  const nLabel = node.data.noLabel  != null ? node.data.noLabel  : (isAB ? 'Variant B' : 'If condition is false');
  const title  = node.data.title    != null ? node.data.title    : (isAB ? 'Untitled A/B test' : 'Untitled condition');
  return (
    <div className="px-4 py-3 space-y-4">
      <InspSection label={isAB ? 'Test name' : 'Condition name'}>
        <input value={title} onChange={(e) => api.updateNodeData(node.id, { title: e.target.value })}
          placeholder={isAB ? 'Untitled A/B test' : 'Untitled condition'}
          className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
      </InspSection>

      {!isAB && <ConditionRuleBuilder node={node} api={api}/>}
      {isAB  && <ABTestSplitSlider node={node} api={api}/>}

      <InspSection label="Branches">
        <EditableBranchRow
          letter={isAB ? 'A' : 'Y'}
          color={isAB ? '#7C3AED' : '#10B981'}
          value={yLabel}
          onChange={(v) => api.updateNodeData(node.id, { yesLabel: v })}/>
        <EditableBranchRow
          letter={isAB ? 'B' : 'N'}
          color={isAB ? '#F59E0B' : '#94A3B8'}
          value={nLabel}
          onChange={(v) => api.updateNodeData(node.id, { noLabel: v })}/>
      </InspSection>

      <InspSection label="Actions">
        <ActionButton icon={<Copy size={11}/>}        label="Duplicate" onClick={() => api.duplicateNode(node.id)}/>
        <ActionButton icon={<X size={11}/>}           label="Remove"   destructive onClick={() => api.removeNode(node.id)}/>
      </InspSection>
    </div>
  );
}

/* EditableBranchRow — branch letter + inline-editable label. Letters stay
   tied to edge-badge color identity (Y/N/A/B); only the description is editable. */
function EditableBranchRow({ letter, color, value, onChange }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-surface-sub border border-line-soft">
      <span className="w-5 h-5 inline-flex items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
        style={{ background: color }}>{letter}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 h-6 px-1.5 text-[11.5px] text-ink bg-transparent border-0 outline-none focus:bg-white focus:border focus:border-brand rounded"/>
    </div>
  );
}

/* ConditionRuleBuilder — list of "If X is Y" rows + Add condition button.
   For now, single-row default; user can edit values. Real backend wiring
   (data sources, operator dropdowns) is a larger spec later. */
function ConditionRuleBuilder({ node, api }) {
  const rules = node.data.rules || [{ field: 'cart_total', op: '>', value: '50' }];
  const updateRule = (idx, patch) => {
    const next = rules.map((r, i) => i === idx ? { ...r, ...patch } : r);
    api.updateNodeData(node.id, { rules: next });
  };
  const addRule = () => {
    api.updateNodeData(node.id, { rules: [...rules, { field: 'tag', op: '=', value: '' }] });
  };
  const removeRule = (idx) => {
    api.updateNodeData(node.id, { rules: rules.filter((_, i) => i !== idx) });
  };
  const FIELDS = ['cart_total', 'tag', 'page_views', 'time_on_site', 'country'];
  const OPS = ['=', '!=', '>', '<', 'contains'];
  return (
    <InspSection label="Rule">
      <div className="space-y-2">
        {rules.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[10.5px] text-ink-soft w-3 text-right">{i === 0 ? 'If' : 'and'}</span>
            <select value={r.field} onChange={(e) => updateRule(i, { field: e.target.value })}
              className="flex-1 min-w-0 h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand truncate">
              {FIELDS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
            </select>
            <select value={r.op} onChange={(e) => updateRule(i, { op: e.target.value })}
              className="h-7 px-1.5 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
              {OPS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <input value={r.value} onChange={(e) => updateRule(i, { value: e.target.value })}
              className="w-14 h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
            {rules.length > 1 && (
              <button onClick={() => removeRule(i)}
                className="w-6 h-7 inline-flex items-center justify-center text-ink-soft hover:text-bad-deep transition-colors">
                <X size={10}/>
              </button>
            )}
          </div>
        ))}
        <button onClick={addRule}
          className="w-full h-7 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-brand hover:bg-brand-soft rounded transition-colors">
          <Plus size={10}/> Add condition
        </button>
      </div>
    </InspSection>
  );
}

/* ABTestSplitSlider — drag the slider to set traffic split between A and B */
function ABTestSplitSlider({ node, api }) {
  const split = node.data.split != null ? node.data.split : 50;
  return (
    <InspSection label="Traffic split">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold tabular-nums">
          <span style={{ color: '#7C3AED' }}>A · {split}%</span>
          <span style={{ color: '#F59E0B' }}>B · {100 - split}%</span>
        </div>
        <input type="range" min="0" max="100" value={split}
          onChange={(e) => api.updateNodeData(node.id, { split: parseInt(e.target.value, 10) })}
          className="ab-slider w-full appearance-none cursor-ew-resize"
          style={{ background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${split}%, #F59E0B ${split}%, #F59E0B 100%)` }}/>
      </div>
    </InspSection>
  );
}

/* InspectorLeads — V6 stub for now */
/* InspectorLeads — adaptive lead-flow table.
   Columns and content vary by node type / kind. Anonymous leads on early
   steps; enriched (email/name) once forms are submitted; order data on checkouts.
   Uses mock data for now (real lead capture is API/backend work). */
function InspectorLeads({ node }) {
  const isPage   = node.type === 'page';
  const isSource = node.type === 'source';
  const isLogic  = node.type === 'logic';
  const kind     = node.data.kind || node.data.pageType;
  const [exportOpen, setExportOpen] = useState(false);

  // Generate appropriate mock leads given the node type.
  const leads = useMemo(() => buildMockLeads(node), [node.id, kind]);

  if (!leads.length) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-surface-sub mx-auto mb-3 inline-flex items-center justify-center">
          <Eye size={14} className="text-ink-soft"/>
        </div>
        <div className="text-[11.5px] font-semibold text-ink mb-1">No leads yet</div>
        <div className="text-[11px] text-ink-soft leading-relaxed">Contacts who reach this step will appear here.</div>
      </div>
    );
  }

  // Columns by node type. Email column removed everywhere — Identity covers
  // it where useful (sources show name+email inline as Recipient).
  const cols = (() => {
    if (isSource && node.data.src === 'email') return ['Recipient', 'Status', 'Time'];
    if (isSource) return ['Identity', 'Country', 'Device', 'Time'];
    if (isLogic)  return ['Identity', 'Source', 'Branch', 'Time'];
    if (isPage && (kind === 'checkout' || node.data.pageType === 'checkout'))
      return ['Name', 'Order', 'Country', 'Time'];
    if (isPage && (kind === 'form' || node.data.pageType === 'form'))
      return ['Name', 'Source', 'Time'];
    return ['Identity', 'Source', 'Country', 'Time'];
  })();

  return (
    <div className="px-2 py-2">
      <div className="px-2 py-1.5 flex items-center justify-between">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">{leads.length} leads</div>
        <button onClick={() => setExportOpen(true)} className="text-[10.5px] text-brand font-medium hover:underline">Export</button>
      </div>
      {exportOpen && <ExportLeadsModal node={node} onClose={() => setExportOpen(false)}/>}
      <table className="w-full">
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft text-left px-2 py-1">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((l, i) => (
            <tr key={i} className="border-t border-line-soft hover:bg-surface-sub transition-colors cursor-pointer">
              {cols.map(c => (
                <td key={c} className="text-[11.5px] text-ink px-2 py-1 truncate" style={{ maxWidth: 110 }}>
                  {leadCell(l, c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function leadCell(lead, col) {
  switch (col) {
    case 'Identity':
      return lead.email
        ? <span className="font-medium">{lead.email}</span>
        : <span className="text-ink-soft italic">Anonymous</span>;
    case 'Recipient':
      return lead.name ? <span><span className="font-medium">{lead.name}</span> · <span className="text-ink-soft">{lead.email}</span></span> : lead.email;
    case 'Email':
      return lead.email || <span className="text-ink-soft">—</span>;
    case 'Name':
      return lead.name || <span className="text-ink-soft italic">No name</span>;
    case 'Order':
      return lead.order ? <span className="font-semibold tabular-nums">${lead.order}</span> : <span className="text-ink-soft">—</span>;
    case 'Source':
      return <span className="text-ink-muted">{lead.source}</span>;
    case 'Country':
      return <span className="text-ink-muted tabular-nums">{lead.country}</span>;
    case 'Device':
      return <span className="text-ink-muted">{lead.device}</span>;
    case 'Branch':
      return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${lead.branch === 'Y' ? 'bg-good-soft text-good-deep' : 'bg-surface-muted text-ink-muted'}`}>{lead.branch}</span>;
    case 'Status':
      return <span className={`inline-flex items-center gap-1 text-[10.5px] ${lead.status === 'Opened' ? 'text-good-deep' : 'text-ink-muted'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${lead.status === 'Opened' ? 'bg-good' : 'bg-ink-soft'}`}/>
        {lead.status}
      </span>;
    case 'Time':
      return <span className="text-ink-soft tabular-nums">{lead.time}</span>;
    default:
      return null;
  }
}


/* ExportLeadsModal — universal export panel for any card's Leads tab.
   Field list adapts to what's actually capturable for this node type so
   irrelevant fields (e.g. Order value on a source card) don't appear. */
function ExportLeadsModal({ node, onClose }) {
  const isSource = node.type === 'source';
  const isLogic  = node.type === 'logic';
  const kind     = node.data.kind || node.data.pageType;

  // Universal field set, gated by what makes sense for this card type.
  const ALL_FIELDS = [
    { id: 'time',      label: 'Time entered',      always: true  },
    { id: 'identity',  label: 'Identity',          always: true  },
    { id: 'name',      label: 'Name',              if: () => kind === 'checkout' || kind === 'form' || (isSource && node.data.src === 'email') },
    { id: 'email',     label: 'Email',             if: () => kind === 'checkout' || (isSource && node.data.src === 'email') },
    { id: 'phone',     label: 'Phone',             if: () => kind === 'checkout' },
    { id: 'source',    label: 'Source',            if: () => !isSource },
    { id: 'utm_source', label: 'UTM source',       always: true },
    { id: 'utm_medium', label: 'UTM medium',       always: true },
    { id: 'utm_camp',   label: 'UTM campaign',     always: true },
    { id: 'country',   label: 'Country',           always: true },
    { id: 'device',    label: 'Device',            always: true },
    { id: 'browser',   label: 'Browser',           always: true },
    { id: 'order',     label: 'Order value',       if: () => kind === 'checkout' },
    { id: 'branch',    label: 'Branch taken',      if: () => isLogic },
    { id: 'status',    label: 'Email status',      if: () => isSource && node.data.src === 'email' },
  ];
  const FIELDS = ALL_FIELDS.filter(f => f.always || (typeof f.if === 'function' && f.if()));

  const [selected, setSelected] = useState(() => new Set(FIELDS.filter(f => f.always).map(f => f.id)));
  const [format,   setFormat]   = useState('csv');
  const [range,    setRange]    = useState('7d');

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
         style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="modal-card w-[480px] max-w-[92vw] bg-white rounded-xl shadow-modal border border-line overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-brand-soft text-brand inline-flex items-center justify-center"><Download size={14}/></span>
            <h3 className="text-[14px] font-semibold text-ink">Export leads</h3>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors"><X size={14}/></button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto scroll-thin">
          <Field label="Date range">
            <select value={range} onChange={(e) => setRange(e.target.value)}
              className="w-full h-8 pl-2 pr-7 text-[12px] text-ink bg-surface-sub border border-line-soft rounded-md outline-none focus:border-brand">
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </Field>

          <Field label="Format">
            <div className="grid grid-cols-3 gap-2">
              {['csv', 'xlsx', 'json'].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`h-8 text-[11.5px] font-semibold rounded-md transition-colors ${
                    format === f
                      ? 'bg-brand-soft text-brand border border-brand/40'
                      : 'bg-white text-ink-muted border border-line-soft hover:bg-surface-muted hover:text-ink'
                  }`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Fields (${selected.size}/${FIELDS.length})`} gap="loose">
            <div className="grid grid-cols-2 gap-1.5">
              {FIELDS.map(f => {
                const checked = selected.has(f.id);
                return (
                  <label key={f.id}
                    className="flex items-center gap-2 px-2 py-1.5 bg-surface-sub border border-line-soft rounded cursor-pointer hover:bg-surface-muted transition-colors">
                    <input type="checkbox" checked={checked} onChange={() => toggle(f.id)}
                      className="w-3.5 h-3.5 cursor-pointer accent-brand"/>
                    <span className="text-[11.5px] text-ink">{f.label}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => setSelected(new Set(FIELDS.map(f => f.id)))}
                className="text-[10.5px] text-brand font-medium hover:underline">Select all</button>
              <span className="text-ink-soft text-[10.5px]">·</span>
              <button onClick={() => setSelected(new Set(FIELDS.filter(f => f.always).map(f => f.id)))}
                className="text-[10.5px] text-ink-muted font-medium hover:underline">Reset to defaults</button>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-sub border-t border-line-soft flex items-center justify-between">
          <span className="text-[11px] text-ink-soft">Exports are emailed when ready (large datasets).</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="h-8 px-3 inline-flex items-center text-[12px] font-medium text-ink-muted bg-white border border-line rounded-md hover:bg-surface-muted hover:text-ink transition-colors">
              Cancel
            </button>
            <button onClick={onClose}
              className="h-8 px-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-genesis hover:bg-genesis-hover rounded-md transition-colors">
              <Download size={12}/> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildMockLeads(node) {
  const SOURCES_NAMES = ['Facebook', 'Google', 'Email', 'Direct'];
  const COUNTRIES = ['AU', 'US', 'GB', 'CA', 'DE', 'NZ', 'IN'];
  const DEVICES = ['iPhone', 'Mac', 'Android', 'Windows'];
  const FIRST = ['Sarah', 'Mike', 'Emma', 'James', 'Olivia', 'Noah', 'Ava', 'Liam'];
  const LAST  = ['Chen', 'Smith', 'Patel', 'Johnson', 'Brown', 'Wilson', 'Davis'];
  const TIMES = ['2m ago', '12m ago', '38m ago', '1h ago', '2h ago', '4h ago', '6h ago', '1d ago', '2d ago'];

  const make = (i, opts = {}) => {
    const fname = FIRST[i % FIRST.length];
    const lname = LAST[i % LAST.length];
    const name  = `${fname} ${lname}`;
    const email = `${fname.toLowerCase()}@example.com`;
    return {
      name:    opts.named ? name : null,
      email:   opts.captured ? email : null,
      source:  SOURCES_NAMES[i % SOURCES_NAMES.length],
      country: COUNTRIES[i % COUNTRIES.length],
      device:  DEVICES[i % DEVICES.length],
      time:    TIMES[i % TIMES.length],
      order:   opts.checkout ? (29 + i * 12) : null,
      branch:  opts.logic ? (i % 2 === 0 ? 'Y' : 'N') : null,
      status:  opts.email ? (i % 3 === 0 ? 'Opened' : 'Sent') : null,
    };
  };

  const isSource = node.type === 'source';
  const isLogic  = node.type === 'logic';
  const kind     = node.data.kind || node.data.pageType;

  if (isSource && node.data.src === 'email')
    return Array.from({ length: 7 }, (_, i) => make(i, { email: true, named: true, captured: true }));
  if (isSource)
    return Array.from({ length: 6 }, (_, i) => make(i)); // anonymous
  if (isLogic)
    return Array.from({ length: 6 }, (_, i) => make(i, { logic: true, captured: i % 2 === 0 }));
  if (kind === 'checkout' || node.data.pageType === 'checkout')
    return Array.from({ length: 5 }, (_, i) => make(i, { named: true, captured: true, checkout: true }));
  if (kind === 'form' || node.data.pageType === 'form')
    return Array.from({ length: 6 }, (_, i) => make(i, { named: true, captured: true }));
  // Default page: mix of anonymous + captured
  return Array.from({ length: 6 }, (_, i) => make(i, { captured: i < 3, named: i < 2 }));
}

/* InspectorSettings — V6 stub for now */
function InspectorSettings({ node, api }) {
  const title = node.data.title || '';
  const isPage = node.type === 'page';
  const PAGE_ICONS = ['file', 'home', 'cart', 'check', 'mail', 'video', 'star', 'gift'];
  const PAGE_COLORS = ['#006CB5', '#10B981', '#7C3AED', '#F59E0B', '#DC2626', '#475569', '#0891B2', '#EC4899'];
  const currentIcon  = node.data.icon  || 'file';
  const currentColor = node.data.color || '#006CB5';
  return (
    <div className="px-4 py-3 space-y-4">
      <InspSection label="General">
        {node.type !== 'logic' && (
          <Field label="Name">
            <input value={title} onChange={(e) => api.updateNodeData(node.id, { title: e.target.value })}
              className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
          </Field>
        )}
        <Field label="Status">
          <select value={node.data.status || 'draft'}
            onChange={(e) => api.updateNodeData(node.id, { status: e.target.value })}
            className="w-full h-7 pl-2 pr-7 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="paused">Paused</option>
          </select>
        </Field>
        {isPage && (
          <Field label="URL slug">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-ink-soft">/</span>
              <input value={(node.data.path || '').replace(/^\//, '')}
                onChange={(e) => api.updateNodeData(node.id, { path: '/' + e.target.value })}
                disabled={node.data.pageType !== 'custom'}
                title={node.data.pageType !== 'custom' ? 'URL is controlled by the linked Estage page. Switch type to Custom to edit.' : undefined}
                className="flex-1 h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand font-mono disabled:opacity-60 disabled:cursor-not-allowed"/>
            </div>
          </Field>
        )}
      </InspSection>

      {isPage && (
        <InspSection label="Page type">
          <Field label="Type">
            <select value={node.data.pageType || 'custom'} onChange={(e) => api.updateNodeData(node.id, { pageType: e.target.value })}
              className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
              <option value="landing">Landing</option>
              <option value="form">Lead form</option>
              <option value="sales">Sales</option>
              <option value="checkout">Checkout</option>
              <option value="thanks">Thank you</option>
              <option value="membership">Members</option>
              <option value="webinar">Webinar</option>
              <option value="upsell">Upsell</option>
              <option value="custom">Custom…</option>
            </select>
          </Field>
          <p className="text-[10.5px] text-ink-soft leading-snug -mt-1">
            {node.data.pageType === 'custom'
              ? 'Custom: edit icon, color, screenshot, and slug below.'
              : 'Type-defined: icon, color, and URL come from the linked Estage page. Pick "Custom…" to override.'}
          </p>
        </InspSection>
      )}

      {isPage && ['checkout', 'upsell', 'sales'].includes(node.data.pageType) && (
        <InspSection label="Pricing">
          <Field label="Product name">
            <input value={node.data.productName || ''}
              onChange={(e) => api.updateNodeData(node.id, { productName: e.target.value })}
              placeholder="e.g. Founding Member Plan"
              className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
          </Field>
          <Field label="Price">
            <div className="flex items-center gap-1">
              <select value={node.data.currency || 'USD'}
                onChange={(e) => api.updateNodeData(node.id, { currency: e.target.value })}
                className="h-7 pl-2 pr-6 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
              </select>
              <input type="number" inputMode="decimal" min="0" step="0.01"
                value={node.data.price != null ? node.data.price : ''}
                onChange={(e) => api.updateNodeData(node.id, { price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                placeholder="0.00"
                className="flex-1 h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand tabular-nums"/>
            </div>
          </Field>
          <p className="text-[10.5px] text-ink-soft leading-snug">
            Used for funnel-wide revenue, AOV, and ROI calculations. Multiple line items / order bumps coming soon.
          </p>
        </InspSection>
      )}

      {node.type === 'source' && (
        <InspSection label="Source kind">
          <Field label="Type">
            <select value={node.data.sourceKind || 'paid'}
              onChange={(e) => api.updateNodeData(node.id, { sourceKind: e.target.value })}
              className="w-full h-7 pl-2 pr-7 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
              <option value="paid">Paid</option>
              <option value="organic">Organic</option>
              <option value="email">Email</option>
              <option value="affiliate">Affiliate</option>
              <option value="other">Other</option>
            </select>
          </Field>
          {(node.data.sourceKind || 'paid') === 'paid' && (
            <Field label="Cost (last 7d)">
              <div className="flex items-center gap-1">
                <select value={node.data.currency || 'USD'}
                  onChange={(e) => api.updateNodeData(node.id, { currency: e.target.value })}
                  className="h-7 pl-2 pr-6 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                </select>
                <input type="number" inputMode="decimal" min="0" step="1"
                  value={node.data.cost != null ? node.data.cost : ''}
                  onChange={(e) => api.updateNodeData(node.id, { cost: e.target.value === '' ? null : parseFloat(e.target.value) })}
                  placeholder="0"
                  className="flex-1 h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand tabular-nums"/>
              </div>
            </Field>
          )}
        </InspSection>
      )}

      {isPage && node.data.pageType === 'custom' && (
        <InspSection label="Appearance">
          <Field label="Icon">
            <div className="grid grid-cols-8 gap-1">
              {PAGE_ICONS.map(ic => (
                <button key={ic} onClick={() => api.updateNodeData(node.id, { icon: ic })}
                  className={`w-7 h-7 inline-flex items-center justify-center rounded-md border transition-colors ${
                    currentIcon === ic
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-line-soft text-ink-muted hover:bg-surface-muted hover:text-ink'
                  }`}>
                  {ic === 'file'  && <FileIcon size={12}/>}
                  {ic === 'home'  && <HomeIcon size={12}/>}
                  {ic === 'cart'  && <Cart size={12}/>}
                  {ic === 'check' && <Check size={12}/>}
                  {ic === 'mail'  && <Mail size={12}/>}
                  {ic === 'video' && <PlayIcon size={12}/>}
                  {ic === 'star'  && <StarIcon size={12}/>}
                  {ic === 'gift'  && <GiftIcon size={12}/>}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Color">
            <div className="grid grid-cols-8 gap-1">
              {PAGE_COLORS.map(c => (
                <button key={c} onClick={() => api.updateNodeData(node.id, { color: c })}
                  className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-105 ${
                    currentColor === c ? 'border-ink ring-2 ring-brand-soft' : 'border-white shadow-xs'
                  }`}
                  style={{ background: c }}/>
              ))}
            </div>
          </Field>
          <Field label="Screenshot URL">
            <input value={node.data.screenshot || ''} onChange={(e) => api.updateNodeData(node.id, { screenshot: e.target.value })}
              placeholder="https://… or leave empty for wireframe"
              className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
          </Field>
        </InspSection>
      )}

      <InspSection label="Tracking">
        <Toggle label="Track conversions" defaultOn={!(node.type === 'source' && node.data.src === 'custom')}/>
        <Toggle label="Send to analytics" defaultOn={!(node.type === 'source' && node.data.src === 'custom')}/>
        <Toggle label="Notify on visit" />
      </InspSection>
    </div>
  );
}

/* ── Inspector primitives — small reusable bits ── */
function InspSection({ label, right, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft" style={{ letterSpacing: '0.07em' }}>{label}</div>
        {right}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const accentClass = accent === 'good' ? 'text-good-deep' : accent === 'bad' ? 'text-bad-deep' : 'text-ink';
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11.5px] text-ink-soft">{label}</span>
      <span className={`text-[12.5px] font-semibold tabular-nums ${accentClass}`}>{value}</span>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between py-1 gap-2 min-w-0">
      <span className="text-[11.5px] text-ink-soft flex-shrink-0">{k}</span>
      <span className="text-[11.5px] text-ink truncate text-right">{v}</span>
    </div>
  );
}

function Field({ label, children, gap = 'tight' }) {
  // gap: 'tight' (none) for plain inputs; 'loose' (8px) for stacked cards (Connect rows).
  const space = gap === 'loose' ? 'space-y-2' : '';
  return (
    <div>
      <div className="text-[11px] text-ink-soft mb-1">{label}</div>
      <div className={space}>{children}</div>
    </div>
  );
}

function ActionButton({ icon, label, destructive, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full h-8 px-2.5 inline-flex items-center gap-2 rounded text-[11.5px] font-medium transition-colors
                  ${destructive ? 'text-bad-deep hover:bg-bad-soft' : 'text-ink-muted hover:text-ink hover:bg-surface-sub'}`}>
      <span className="flex items-center justify-center w-4 h-4 flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Toggle({ label, defaultOn }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11.5px] text-ink">{label}</span>
      <button onClick={() => setOn(!on)}
        className={`w-7 h-4 rounded-full relative transition-colors ${on ? 'bg-brand' : 'bg-line'}`}>
        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${on ? 'left-3' : 'left-0.5'}`}/>
      </button>
    </div>
  );
}

function BranchRow({ letter, color, label }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: color }}>{letter}</span>
      <span className="text-[11.5px] text-ink flex-1 min-w-0 truncate">{label}</span>
    </div>
  );
}

/* SuggestedWin — V5's standout pattern. AI-generated optimisation card with
   subtle violet wash, ripple animation, impact chip on the right, primary CTA. */
function SuggestedWin({ title, body, impact, cta }) {
  return (
    <div className="rounded-md border border-line-soft p-3 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(124,58,237,0.02) 60%, transparent 100%)' }}>
      <div className="flex items-start gap-2 mb-2">
        <span className="ai-ripple w-5 h-5 rounded-md inline-flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,58,237,0.16)', color: '#7C3AED' }}>
          <Sparkles size={11} className="ai-breathe-icon"/>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: '#7C3AED', letterSpacing: '0.07em' }}>Suggested win</span>
            <span className="px-1.5 h-4 inline-flex items-center text-[9.5px] font-bold tabular-nums rounded text-white"
                  style={{ background: '#7C3AED' }}>{impact}</span>
          </div>
          <div className="text-[12.5px] font-semibold text-ink mt-1 leading-snug">{title}</div>
        </div>
      </div>
      <div className="text-[11.5px] text-ink-muted leading-relaxed mb-2.5">{body}</div>
      <button className="w-full h-7 px-2.5 inline-flex items-center justify-center gap-1 rounded text-[11.5px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#7C3AED' }}>
        {cta} <ChevronRight size={11}/>
      </button>
    </div>
  );
}

function InspectorEmpty({ funnel, canvasNodes = [], mode = "build" }) {
  /* Funnel overview — date range + Basic/Advanced toggle.
     Advanced (revenue/AOV/CPA/ROI) auto-unlocks only when the funnel has at
     least one priced checkout-class card OR at least one paid source with cost. */
  const [range, setRange]       = useState('7d');
  const [view,  setView]        = useState('basic'); // 'basic' | 'advanced'
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  // Detect what's actually in the funnel — drives whether Advanced is unlockable.
  const pricedPages = useMemo(
    () => canvasNodes.filter(n => n.type === 'page'
      && ['checkout', 'upsell', 'sales'].includes(n.data.pageType)
      && typeof n.data.price === 'number' && n.data.price > 0),
    [canvasNodes]
  );
  const paidSources = useMemo(
    () => canvasNodes.filter(n => n.type === 'source'
      && (n.data.sourceKind === 'paid' || n.data.sourceKind === undefined)
      && typeof n.data.cost === 'number' && n.data.cost > 0),
    [canvasNodes]
  );
  const canShowAdvanced = pricedPages.length > 0 || paidSources.length > 0;
  // If user previously selected advanced but conditions changed, snap back.
  useEffect(() => {
    if (view === 'advanced' && !canShowAdvanced) setView('basic');
  }, [canShowAdvanced, view]);

  // Compute basic stats (visits/conversions) from canvas data.
  const totalVisits = useMemo(
    () => canvasNodes.filter(n => n.type === 'source')
      .reduce((sum, n) => sum + (n.data.visitorsNum || 0), 0),
    [canvasNodes]
  );
  const totalSubmits = useMemo(
    () => canvasNodes.filter(n => n.type === 'page' && (n.data.pageType === 'form' || n.data.pageType === 'thanks'))
      .reduce((sum, n) => sum + (n.data.conversions || 0), 0),
    [canvasNodes]
  );
  const convPct = totalVisits ? ((totalSubmits / totalVisits) * 100).toFixed(1) : '0.0';
  const dropPct = totalVisits ? Math.max(0, 100 - parseFloat(convPct)).toFixed(1) : '0.0';

  // Compute advanced stats from priced pages + paid sources.
  const revenue = useMemo(
    () => pricedPages.reduce((sum, n) => sum + ((n.data.price || 0) * (n.data.conversions || 0)), 0),
    [pricedPages]
  );
  const totalCost = useMemo(
    () => paidSources.reduce((sum, n) => sum + (n.data.cost || 0), 0),
    [paidSources]
  );
  const totalOrders = useMemo(
    () => pricedPages.reduce((sum, n) => sum + (n.data.conversions || 0), 0),
    [pricedPages]
  );
  const aov = totalOrders ? (revenue / totalOrders) : 0;
  const cpa = totalOrders && totalCost ? (totalCost / totalOrders) : 0;
  const roi = totalCost ? (revenue / totalCost) : 0;

  const fmtMoney = (n) => '$' + (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : n.toFixed(2));

  const basicStats = [
    { label: 'Visits',          value: totalVisits.toLocaleString(), delta: '+12%',  good: true,  Icon: Globe,        color: '#006CB5' },
    { label: 'Unique visitors', value: Math.round(totalVisits * 0.78).toLocaleString(), delta: '+9%',   good: true,  Icon: Eye,          color: '#0891B2' },
    { label: 'Conversions',     value: totalSubmits.toLocaleString(),delta: '+8%',   good: true,  Icon: Check,        color: '#10B981' },
    { label: 'Conv rate',       value: convPct + '%',                delta: '−2.1%', good: false, Icon: TrendingUp,   color: '#7C3AED' },
    { label: 'Drop-off',        value: dropPct + '%',                delta: '−1%',   good: true,  Icon: Activity,     color: '#475569' },
    { label: 'Avg time',        value: '1m 24s',                     delta: '+4s',   good: true,  Icon: Eye,          color: '#0D9488' },
  ];
  const advStats = [
    ...basicStats,
    { label: 'Revenue',   value: fmtMoney(revenue),    delta: '+18%',  good: true,  Icon: DollarSign,   color: '#059669' },
    { label: 'Orders',    value: totalOrders.toLocaleString(), delta: '+12%', good: true, Icon: Tag, color: '#F59E0B' },
    { label: 'Avg order', value: fmtMoney(aov),        delta: '+3%',   good: true,  Icon: Tag,          color: '#F59E0B' },
    { label: 'Cost',      value: fmtMoney(totalCost),  delta: '−5%',   good: true,  Icon: Activity,     color: '#475569' },
    { label: 'CPA',       value: fmtMoney(cpa),        delta: '−5%',   good: true,  Icon: Activity,     color: '#475569' },
    { label: 'ROI',       value: roi.toFixed(1) + '×', delta: '+0.7×', good: true,  Icon: TrendingUp,   color: '#0D9488' },
  ];
  const stats = view === 'advanced' && canShowAdvanced ? advStats : basicStats;

  // Optimise mode — replace the stats grid entirely with the optimisation queue
  // (Urgent fixes / Growth tests / Completed learnings).
  if (mode === 'optimise') {
    return <OptimiseEmptyState funnel={funnel}/>;
  }

  // Analyse mode — diagnosis-first layout: biggest leak + best step + next action
  // ABOVE the stats. Build mode keeps the standard stats grid.
  const showDiagnosis = mode === 'analyse';
  const activity = [
    { color: '#10B981', icon: <Check    size={11}/>, text: <>Funnel <span className="font-medium">published</span></>,                                           time: '2m ago' },
    { color: '#EA4335', icon: <Mail     size={11}/>, text: <>New email step added to <span className="font-medium">Lead form</span></>,                          time: '24m ago' },
    { color: '#1877F2', icon: <Globe    size={11}/>, text: <><span className="font-medium">Facebook</span> source connected</>,                                  time: '1h ago' },
    { color: '#7C3AED', icon: <Sparkles size={11}/>, text: <>Suggestion: <span className="font-medium">A/B test the headline</span></>,                          time: '3h ago' },
    { color: '#006CB5', icon: <FileIcon size={11}/>, text: <>Landing page edited</>,                                                                             time: '1d ago' },
    { color: '#F59E0B', icon: <Edit     size={11}/>, text: <>Renamed step from <span className="font-medium">Step 2</span> to <span className="font-medium">Lead Magnet</span></>, time: '2d ago' },
    { color: '#10B981', icon: <Plus     size={11}/>, text: <>Added <span className="font-medium">Welcome email</span> to sequence</>,                            time: '3d ago' },
  ];
  return (
    <aside className="w-[320px] border-l border-line bg-white flex flex-col shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line-soft shrink-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">Funnel overview</div>
        <div className="text-[13px] font-semibold text-ink mt-0.5 truncate">{funnel?.name || 'Untitled funnel'}</div>

        <div className="mt-2 flex items-center gap-1.5">
          {/* Date range */}
          <select value={range} onChange={(e) => setRange(e.target.value)}
            className="h-6 pl-2 pr-6 text-[10.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
            <option value="custom">Custom range…</option>
          </select>
          <span className="flex-1"/>
          {/* Basic / Advanced toggle */}
          <div className="inline-flex items-center bg-surface-muted border border-line-soft rounded-md p-0.5 gap-0.5">
            <button onClick={() => setView('basic')}
              className={`h-5 px-1.5 text-[10.5px] font-medium rounded transition-colors ${view === 'basic' ? 'bg-white text-ink shadow-xs' : 'text-ink-soft hover:text-ink'}`}>
              Basic
            </button>
            <button onClick={() => canShowAdvanced && setView('advanced')}
              disabled={!canShowAdvanced}
              title={canShowAdvanced ? '' : 'Add pricing to a checkout, or cost to a paid source, to enable Advanced.'}
              className={`h-5 px-1.5 text-[10.5px] font-medium rounded transition-colors ${
                view === 'advanced' ? 'bg-white text-ink shadow-xs'
                : canShowAdvanced ? 'text-ink-soft hover:text-ink'
                : 'text-ink-whisper cursor-not-allowed'
              }`}>
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {/* Stats grid — 8 stats, 2 cols, white cards with category-colored icon chips */}
        <div className="px-4 py-3 grid grid-cols-2 gap-2 stat-stagger">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-line-soft rounded-md px-2.5 py-2 hover:border-line-strong transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded inline-flex items-center justify-center"
                  style={{ background: s.color + '1a', color: s.color }}>
                  <s.Icon size={11}/>
                </span>
                <span className={`text-[10px] font-semibold tabular-nums ${s.good ? 'text-good-deep' : 'text-bad-deep'}`}>{s.delta}</span>
              </div>
              <div className="text-[15px] font-semibold text-ink tabular-nums mt-1.5 leading-none">{s.value}</div>
              <div className="text-[10.5px] text-ink-soft mt-1 leading-none">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="border-t border-line-soft">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">Activity</div>
            <button className="text-[10.5px] text-brand font-medium hover:underline">View all</button>
          </div>
          <div className="pb-2">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 px-4 py-2 hover:bg-surface-sub transition-colors">
                <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0 mt-px"
                  style={{ background: a.color + '1a', color: a.color }}>
                  {a.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-ink leading-snug">{a.text}</div>
                  <div className="text-[10.5px] text-ink-soft mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t border-line-soft px-4 py-2.5 shrink-0 bg-surface-sub">
        <div className="text-[10.5px] text-ink-soft">Click a card on the canvas to inspect it.</div>
      </div>
    </aside>
  );
}


/* Toast system — shows brief confirmation messages in the bottom-center.
   Auto-dismisses after 1800ms. Provider in App, useToast hook anywhere. */
const ToastContext = React.createContext(() => {});
function useToast() { return React.useContext(ToastContext); }

function ToastViewport({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 pointer-events-none"
         style={{ animation: 'tipIn 160ms ease-out' }}>
      <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-ink text-white rounded-md shadow-tip text-[12.5px] font-medium">
        {toast.kind === 'success' && (
          <span className="w-4 h-4 rounded-full bg-good inline-flex items-center justify-center">
            <Check size={10} className="text-white"/>
          </span>
        )}
        {toast.kind === 'error' && (
          <span className="w-4 h-4 rounded-full bg-bad inline-flex items-center justify-center text-white text-[10px] font-bold">!</span>
        )}
        {toast.message}
      </div>
    </div>
  );
}


/* OptimiseTestsPanel — bottom-right floating panel showing active and
   suggested A/B tests. Compact, collapsible, doesn't fight canvas controls. */
function OptimiseTestsPanel() {
  const [open, setOpen] = useState(true);
  const ACTIVE = [
    { name: 'Hero headline · v2', card: 'Landing Page',     daysLeft: 4, lift: '+8%' },
    { name: 'Pricing layout',     card: 'Sales Page',       daysLeft: 9, lift: '+3%' },
    { name: 'Form length',        card: 'Lead Magnet Form', daysLeft: 2, lift: '+11%' },
  ];
  const SUGGESTED = [
    { name: 'A/B test the CTA color',  card: 'Landing Page',     impact: 'Med', why: 'Below benchmark conversion' },
    { name: 'Add testimonials block',  card: 'Sales Page',       impact: 'High', why: 'Funnels with social proof lift 22% median' },
  ];
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="absolute right-4 bottom-4 z-30 inline-flex items-center gap-2 h-9 px-3 rounded-md bg-white border border-line shadow-card hover:shadow-menu transition-shadow">
        <span className="w-5 h-5 rounded inline-flex items-center justify-center bg-violet-soft text-violet ai-ripple">
          <Spark size={11} className="ai-breathe-icon"/>
        </span>
        <span className="text-[12px] font-semibold text-ink">Tests</span>
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet text-white text-[10px] font-bold tabular-nums">{ACTIVE.length}</span>
      </button>
    );
  }
  return (
    <div className="absolute right-4 bottom-4 z-30 w-[320px] bg-white rounded-md border border-line shadow-card flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-line-soft flex items-center justify-between bg-surface-sub">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded inline-flex items-center justify-center bg-violet-soft text-violet ai-ripple">
            <Spark size={11} className="ai-breathe-icon"/>
          </span>
          <div className="text-[12px] font-semibold text-ink">Tests</div>
          <span className="text-[10.5px] text-ink-soft">{ACTIVE.length} active · {SUGGESTED.length} suggested</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-ink-soft hover:text-ink transition-colors"><X size={12}/></button>
      </div>

      <div className="flex-1 max-h-[340px] overflow-y-auto scroll-thin">
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Active</div>
        {ACTIVE.map((t, i) => (
          <div key={i} className="px-3 py-2 hover:bg-surface-sub transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-medium text-ink truncate">{t.name}</div>
              <span className="text-[10px] font-semibold tabular-nums text-good-deep shrink-0 ml-2">{t.lift}</span>
            </div>
            <div className="text-[10.5px] text-ink-soft mt-0.5 flex items-center gap-1.5">
              <span className="truncate">on {t.card}</span>
              <span>·</span>
              <span>{t.daysLeft}d left</span>
            </div>
          </div>
        ))}
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft border-t border-line-soft">Suggested</div>
        {SUGGESTED.map((t, i) => (
          <div key={i} className="px-3 py-2 hover:bg-surface-sub transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-medium text-ink truncate">{t.name}</div>
              <span className={`text-[10px] font-semibold rounded px-1.5 py-px shrink-0 ml-2 ${
                t.impact === 'High' ? 'bg-good-soft text-good-deep' : 'bg-warn-soft text-warn-deep'
              }`}>{t.impact}</span>
            </div>
            <div className="text-[10.5px] text-ink-soft mt-0.5 flex items-center gap-1.5">
              <span className="truncate">on {t.card}</span>
            </div>
            <div className="text-[10.5px] text-ink-soft mt-0.5 truncate italic">{t.why}</div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-line-soft bg-surface-sub flex items-center justify-between">
        <span className="text-[10.5px] text-ink-soft">Updated 4m ago</span>
        <button className="h-6 px-2 text-[11px] font-semibold text-violet hover:bg-violet-soft rounded transition-colors">Run AI audit</button>
      </div>
    </div>
  );
}


/* OptimiseSuggestionModal — bottom-centred panel detail for a card-level
   AI suggestion. Styling mirrors AIPopover (rounded card, violet accent,
   chips for badges). z-[9990] so it sits above ZoomControls. */
function OptimiseSuggestionModal({ open, nodeTitle, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-end justify-center pb-8 bg-ink/15"
         onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="ctx-menu w-[560px] max-w-[92vw] bg-white rounded-lg shadow-menu border border-line overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line-soft">
          <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center ai-ripple">
            <Spark size={14} className="ai-breathe-icon"/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink leading-tight">A/B test the headline</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5 truncate">on {nodeTitle || 'page'}</div>
          </div>
          <Chip kind="good" sm>+14% likely</Chip>
          <button onClick={onClose}
            className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-surface-sub text-ink-soft transition-colors ml-1">
            <X size={13}/>
          </button>
        </div>
        {/* Body */}
        <div className="px-4 py-3 grid grid-cols-3 gap-4">
          {/* Hypothesis + reasoning */}
          <div className="col-span-2">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft mb-1">Hypothesis</div>
            <div className="text-[12.5px] text-ink leading-snug mb-3">
              The hero headline hasn't been changed in 30 days. Funnels that A/B test their hero copy see a median lift of <span className="font-semibold tabular-nums">+14%</span> within 14 days.
            </div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft mb-1">Suggested variants</div>
            <ul className="text-[12px] text-ink leading-snug space-y-1">
              <li>· Lead with benefit: <span className="font-medium">"Get your first 100 leads in 7 days"</span></li>
              <li>· Lead with social proof: <span className="font-medium">"Join 2,400+ marketers using this funnel"</span></li>
            </ul>
          </div>
          {/* Sidebar — confidence + time */}
          <div className="space-y-2">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft mb-1">Confidence</div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-violet" style={{ width: '78%' }}/>
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-ink">78%</span>
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft mb-1">Time to significance</div>
              <div className="text-[12px] text-ink font-medium">~9 days</div>
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft mb-1">Sample size</div>
              <div className="text-[12px] text-ink font-medium tabular-nums">~ 1,400 visitors</div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-4 py-3 bg-surface-sub border-t border-line-soft flex items-center justify-end gap-2">
          <button onClick={onClose}
            className="h-8 px-3 text-[12px] font-medium text-ink-soft hover:text-ink transition-colors">
            Dismiss
          </button>
          <button onClick={onClose}
            className="h-8 px-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-violet hover:bg-violet-deep rounded-md transition-colors">
            <Spark size={12}/> Start test
          </button>
        </div>
      </div>
    </div>
  );
}



/* NewFunnelStarter — first-step modal when user clicks "+ New funnel".
   Choice between picking a template (gallery) or building from scratch.
   Same modal-card animation system as the FunnelActionModal. */
function NewFunnelStarter({ onClose, onPickTemplate, onScratch }) {
  const TEMPLATES = [
    { id:'lead',     name:'Lead Magnet',     pages:3, blurb:'Capture emails with a free download.', accent:'#006CB5' },
    { id:'webinar',  name:'Webinar',         pages:5, blurb:'Registration → live → replay → offer.',  accent:'#7C3AED' },
    { id:'sales',    name:'Sales Funnel',    pages:6, blurb:'Sales page → checkout → upsell → thanks.',accent:'#10B981' },
    { id:'tripwire', name:'Tripwire',        pages:4, blurb:'Low-cost offer → upsell ladder.',         accent:'#F59E0B' },
    { id:'launch',   name:'Product Launch',  pages:7, blurb:'Pre-launch → launch → cart-close.',       accent:'#DC2626' },
    { id:'sas',      name:'SaaS Free Trial', pages:5, blurb:'Landing → signup → onboarding → upgrade.', accent:'#0891B2' },
  ];
  return (
    <div className="fixed inset-0 z-[9985] flex items-center justify-center modal-backdrop"
         style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="modal-card w-[720px] max-w-[92vw] bg-white rounded-xl shadow-modal border border-line overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-line-soft">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Start a new funnel</h3>
            <p className="text-[11.5px] text-ink-soft mt-0.5">Pick a starting template or build from scratch.</p>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors"><X size={14}/></button>
        </div>

        {/* Templates grid */}
        <div className="px-5 py-4 grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto scroll-thin">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onPickTemplate(t)}
              className="group/tpl text-left bg-white border border-line-soft rounded-md p-3 hover:border-brand hover:shadow-card transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-md inline-flex items-center justify-center"
                  style={{ background: t.accent + '1a', color: t.accent }}>
                  <Workflow size={13}/>
                </span>
                <div className="text-[12.5px] font-semibold text-ink truncate flex-1 min-w-0">{t.name}</div>
              </div>
              <div className="text-[10.5px] text-ink-soft mb-2">{t.pages} pages</div>
              <div className="text-[11.5px] text-ink-muted leading-snug">{t.blurb}</div>
            </button>
          ))}
        </div>

        {/* Footer — build from scratch */}
        <div className="px-5 py-3 bg-surface-sub border-t border-line-soft flex items-center justify-between">
          <span className="text-[11.5px] text-ink-soft">Or skip templates entirely.</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="h-8 px-3 inline-flex items-center text-[12px] font-medium text-ink-muted bg-white border border-line rounded-md hover:bg-surface-muted hover:text-ink transition-colors">
              Cancel
            </button>
            <button onClick={onScratch}
              className="h-8 px-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-genesis hover:bg-genesis-hover rounded-md transition-colors">
              <Plus size={12}/> Build from scratch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



/* ExportFunnelButton — top-left of canvas. Opens a popover offering PNG / PDF
   / HTML download. UI only — no actual export wired (placeholders log to
   console). Sits at z-30 alongside ZoomControls. */
function ExportFunnelButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute left-4 top-4 z-30">
      <button onClick={() => setOpen(o => !o)}
        title="Export funnel"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white border border-line rounded-md shadow-xs text-[11.5px] font-medium text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors">
        <Download size={12}/> Export
        <ChevronDown size={9} strokeWidth={2}/>
      </button>
      {open && (
        <div className="ctx-menu absolute left-0 top-full mt-1 w-[210px] bg-white rounded-md border border-line shadow-menu p-1 z-50"
             onClick={(e) => e.stopPropagation()}>
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Coming soon</div>
          <button disabled
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-ink-soft cursor-not-allowed opacity-70">
            <FileIcon size={12} className="text-ink-soft"/> Download as PNG
          </button>
          <button disabled
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-ink-soft cursor-not-allowed opacity-70">
            <FileIcon size={12} className="text-ink-soft"/> Download as PDF
          </button>
          <button disabled
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-ink-soft cursor-not-allowed opacity-70">
            <FileIcon size={12} className="text-ink-soft"/> Copy share link
          </button>
        </div>
      )}
    </div>
  );
}



/* BuildWithAIChat — sidebar overlay activated by the "Build with AI" button.
   Sits above the regular sidebar, takes its width, mocks a chat conversation.
   Backed by static messages for the demo (no real LLM calls). The "back" arrow
   exits chat mode and restores the normal sidebar. */
function BuildWithAIChat({ open, onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'ai', text: "Hi! I'll help you build a funnel. What kind of business do you have, and what do you want this funnel to achieve?" },
  ]);
  const send = () => {
    const v = input.trim();
    if (!v) return;
    setMessages(ms => [...ms, { from: 'user', text: v }]);
    setInput('');
    // Mock AI response after a short delay
    setTimeout(() => {
      setMessages(ms => [...ms, {
        from: 'ai',
        text: "Great. Based on what you described, I'd recommend a Lead Magnet funnel: Landing → Form → Thank You. I can drop a starter onto the canvas with placeholder copy you can edit. Want me to do that?"
      }]);
    }, 700);
  };
  if (!open) return null;
  return (
    <aside className="absolute inset-0 z-40 bg-white flex flex-col"
      style={{ animation: 'slideInLeft 180ms ease-out' }}>
      {/* Header — back arrow + title */}
      <div className="px-3 py-2.5 border-b border-line-soft flex items-center gap-2 shrink-0">
        <button onClick={onClose}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors">
          <ChevronLeft size={14}/>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center ai-ripple shrink-0">
            <Spark size={13} className="ai-breathe-icon"/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-ink leading-tight">Build with AI</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5">Conversational funnel builder</div>
          </div>
        </div>
      </div>

      {/* Collapsed section bar — sections still visible as headers, just inert */}
      <div className="border-b border-line-soft shrink-0">
        {[
          { label: 'Add Pages',        count: 12 },
          { label: 'Current Funnel',   count: 0  },
          { label: 'Traffic',          count: 9  },
          { label: 'Funnel Templates', count: 7  },
        ].map(s => (
          <div key={s.label} className="px-4 py-1.5 flex items-center gap-2 text-[11px] text-ink-soft border-b border-line-soft last:border-b-0 opacity-60">
            <ChevronRight size={9} className="text-ink-soft"/>
            <span className="font-medium text-ink-muted">{s.label}</span>
            <span className="ml-auto tabular-nums">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Chat scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin px-3 py-3 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[12px] leading-snug ${
              m.from === 'user' ? 'bg-violet text-white' : 'bg-surface-sub text-ink border border-line-soft'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-line-soft p-2.5 shrink-0 flex items-end gap-1.5">
        <textarea value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Describe your funnel…"
          rows={1}
          className="flex-1 px-2.5 py-2 text-[12.5px] bg-surface-sub border border-line-soft rounded-md outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft resize-none placeholder:text-ink-soft"/>
        <button onClick={send}
          className="w-9 h-9 inline-flex items-center justify-center rounded-md bg-violet text-white hover:bg-violet-deep transition-colors shrink-0">
          <ChevronRight size={14}/>
        </button>
      </div>
    </aside>
  );
}



/* OptimiseEmptyState — replaces the stats grid in the Inspector empty-state
   when mode === 'optimise'. Three queues: Urgent fixes / Growth tests /
   Completed learnings. Each item is clickable and would open the suggestion
   modal in a real product. */
function OptimiseEmptyState({ funnel }) {
  const URGENT = [
    { name: 'Landing page drop-off', card: 'May Promo Landing', impact: 'High', why: '76% drop to Lead Form' },
    { name: 'Checkout abandonment',   card: 'Cart',              impact: 'High', why: 'Below benchmark' },
  ];
  const GROWTH = [
    { name: 'Headline A/B test',  card: 'Landing Page', impact: 'Med',  lift: '+8–14%' },
    { name: 'Pricing layout test', card: 'Sales Page',  impact: 'Med',  lift: '+3–6%'  },
    { name: 'Form length test',    card: 'Lead Form',   impact: 'High', lift: '+11%'   },
  ];
  const DONE = [
    { name: 'CTA color test',  card: 'Landing Page', result: '+8% lift', date: 'Apr 28' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-line-soft shrink-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">Optimise queue</div>
        <div className="text-[13px] font-semibold text-ink mt-0.5 truncate">{funnel?.name || 'Untitled funnel'}</div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet"/>
          <span className="text-[10.5px] text-ink-soft">{URGENT.length} urgent · {GROWTH.length} growth · {DONE.length} completed</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {/* Urgent fixes */}
        <OptimiseSection title="Urgent fixes" accent="bg-bad text-white" count={URGENT.length}>
          {URGENT.map((t, i) => (
            <OptimiseRow key={i} title={t.name} subtitle={`on ${t.card} · ${t.why}`} pill={t.impact} pillKind="bad"/>
          ))}
        </OptimiseSection>
        {/* Growth tests */}
        <OptimiseSection title="Growth tests" accent="bg-violet text-white" count={GROWTH.length}>
          {GROWTH.map((t, i) => (
            <OptimiseRow key={i} title={t.name} subtitle={`on ${t.card} · ${t.lift} estimated`} pill={t.impact} pillKind="violet"/>
          ))}
        </OptimiseSection>
        {/* Completed learnings */}
        <OptimiseSection title="Completed learnings" accent="bg-good text-white" count={DONE.length} last>
          {DONE.map((t, i) => (
            <OptimiseRow key={i} title={t.name} subtitle={`on ${t.card} · ${t.date}`} pill={t.result} pillKind="good"/>
          ))}
        </OptimiseSection>
      </div>

      <div className="px-3 py-2.5 border-t border-line-soft bg-surface-sub flex items-center gap-2 shrink-0">
        <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center ai-ripple">
          <Spark size={13} className="ai-breathe-icon"/>
        </span>
        <span className="text-[11.5px] text-ink-soft flex-1 leading-snug">Run an AI audit to discover more opportunities.</span>
        <button className="h-7 px-2.5 inline-flex items-center text-[11.5px] font-semibold text-violet hover:bg-violet-soft rounded transition-colors">
          Run audit
        </button>
      </div>
    </div>
  );
}

function OptimiseSection({ title, accent, count, last, children }) {
  return (
    <div className={`${last ? '' : 'border-b border-line-soft'}`}>
      <div className="px-4 py-2 flex items-center gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${accent} px-1.5 py-0.5 rounded`}>{count}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function OptimiseRow({ title, subtitle, pill, pillKind }) {
  const pillClass = {
    bad:    'bg-bad-soft text-bad-deep',
    violet: 'bg-violet-soft text-violet',
    good:   'bg-good-soft text-good-deep',
  }[pillKind] || 'bg-surface-sub text-ink';
  return (
    <button className="w-full px-4 py-2 flex items-start gap-2 hover:bg-surface-sub transition-colors text-left">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-ink truncate">{title}</div>
        <div className="text-[10.5px] text-ink-soft mt-0.5 truncate">{subtitle}</div>
      </div>
      <span className={`text-[10px] font-semibold rounded px-1.5 py-px ${pillClass} shrink-0`}>{pill}</span>
    </button>
  );
}


export default function App() {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false); // Build with AI sidebar mode
  const [collapsed, setCollapsed] = useState(false);
  const [focusSection, setFocusSection] = useState(null);
  const [toast, setToast] = useState(null); // { message, kind } | null
  const showToast = (message, kind = 'success') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 1800);
  };
  // Optimise suggestion modal — listens to "open-suggestion" CustomEvents
  // dispatched from the sparkle buttons on canvas cards.
  const [suggestion, setSuggestion] = useState(null);
  useEffect(() => {
    const handler = (e) => setSuggestion(e.detail || {});
    window.addEventListener('open-suggestion', handler);
    return () => window.removeEventListener('open-suggestion', handler);
  }, []);
  useEffect(() => {
    const handler = () => setNewFunnelOpen(true);
    window.addEventListener('open-new-funnel', handler);
    return () => window.removeEventListener('open-new-funnel', handler);
  }, []);
  const [project, setProject] = useState(PROJECTS[0]);
  const [funnel, setFunnel] = useState(FUNNELS[0]);
  const [mode, setMode] = useState('build');
  const [templateModal, setTemplateModal] = useState(null);
  const [demoState, setDemoState] = useState('empty');
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasNodes, setCanvasNodes] = useState([]);
  const [newFunnelOpen, setNewFunnelOpen] = useState(false);
  /* ref-based imperative API exposed by Canvas for the Inspector to call (rename,
     remove, duplicate, deselect). Canvas owns nodes/edges; Inspector mutates
     through this so there's a single source of truth. */
  const canvasApi = useRef(null);

  return (
    <ToastContext.Provider value={showToast}>
    <div className="h-screen flex flex-col bg-white">
      <TopbarWired project={project} onProjectChange={setProject} mode={mode} onModeChange={setMode}/>
      <ContextBar funnel={funnel} onFunnelChange={setFunnel} mode={mode}/>
      <div className="flex-1 flex min-h-0">
        <div className="relative flex"><Sidebar
          onAIClick={() => setAiOpen(true)}
          onBuildAIClick={() => setAiChatOpen(true)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(c => !c)}
          focusSection={focusSection}
          onFocusSection={setFocusSection}
          onTemplateClick={setTemplateModal}
          canvasApi={canvasApi}
          canvasNodes={canvasNodes}/><BuildWithAIChat open={aiChatOpen} onClose={() => setAiChatOpen(false)}/></div>
        <Canvas
          onNodesChange={setCanvasNodes}
          mode={mode}
          demoState={demoState}
          onDemoStateChange={setDemoState}
          onJumpToTemplates={() => setFocusSection('templates')}
          onJumpToPages={() => setFocusSection('pages')}
          onSelectionChange={setSelectedNode}
          canvasApiRef={canvasApi}/>
        {selectedNode
          ? <Inspector node={selectedNode} api={canvasApi.current || {}} mode={mode}/>
          : <InspectorEmpty funnel={funnel} canvasNodes={canvasNodes} mode={mode}/>}
      </div>
      <AIPopover open={aiOpen} onClose={() => setAiOpen(false)}/>
      <TemplateModal template={templateModal} onClose={() => setTemplateModal(null)} onConfirm={() => {}}/>
      <OptimiseSuggestionModal open={!!suggestion} nodeTitle={suggestion?.title} onClose={() => setSuggestion(null)}/>
      {newFunnelOpen && <NewFunnelStarter onClose={() => setNewFunnelOpen(false)} onPickTemplate={(t) => { setTemplateModal(t); setNewFunnelOpen(false); }} onScratch={() => setNewFunnelOpen(false)}/>}
      <ToastViewport toast={toast}/>
    </div>
    </ToastContext.Provider>
  );
}

