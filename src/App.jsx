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
import Canvas from './canvas/Canvas.jsx'

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
const UploadIcon   = I(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>);
const FacebookIcon = ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>;
const YoutubeIcon  = ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"/></svg>;
const InstaIcon    = I(<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></>);

const PAGE_TYPE = {
  landing:    { Icon: StarIcon, color: '#006CB5', label:'Landing'   },
  form:       { Icon: Form,     color: '#006CB5', label:'Lead form' },
  sales:      { Icon: Tag,      color: '#7C3AED', label:'Sales'     },
  checkout:   { Icon: Cart,     color: '#0891B2', label:'Checkout'  }, /* cyan to match Quick Add */
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
        <a href="#" className="shrink-0 inline-flex items-center justify-center w-7 h-7" title="Estage">
          {/* Inline Estage logo — the official mark, scaled to fit the topbar slot. */}
          <svg viewBox="0 0 68 68" width="28" height="28" xmlns="http://www.w3.org/2000/svg" fill="none">
            <mask id="estagemask" maskUnits="userSpaceOnUse" x="8" y="8" width="52" height="52">
              <path d="m60 34c0 14.3594-11.6406 26-26 26s-26-11.6406-26-26 11.6406-26 26-26 26 11.6406 26 26z" fill="#fff"/>
            </mask>
            <circle cx="34" cy="34" r="26" fill="#fff"/>
            <path d="m33.8161 67.6322c-18.6466 0-33.8161-15.1695-33.8161-33.8161s15.1695-33.8161 33.8161-33.8161 33.8161 15.1695 33.8161 33.8161-15.1695 33.8161-33.8161 33.8161zm0-62.77228c-15.9625 0-28.95618 12.99368-28.95618 28.95618s12.99368 28.9562 28.95618 28.9562 28.9562-12.9937 28.9562-28.9562-12.9937-28.95618-28.9562-28.95618z" fill="#006cb5"/>
            <g clipRule="evenodd" fillRule="evenodd" mask="url(#estagemask)">
              <path d="m19 49.8335h30.5v-2.008-3.6196h-24.9419v-7.9434h24.9419v-2.0077-3.6195h-30.5z" fill="#0F172A"/>
              <path d="m19 23.3773h30.5v-2.0078-3.6195h-30.5z" fill="#006cb5"/>
            </g>
          </svg>
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
        <Tip label="Refresh data" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors"><Refresh size={15}/></button></Tip>
        <Tip label="Account settings" side="bottom"><button className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted transition-colors"><Cog size={15}/></button></Tip>
        <span className="w-px h-5 bg-line mx-0.5"/>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-pre-publish'))}
          className="inline-flex items-center gap-1.5 h-[35px] px-3.5 bg-genesis hover:bg-genesis-hover text-white text-[12.5px] font-semibold rounded-lg shadow-publish transition-colors">
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
  { id:'custom', name:'Custom source',Icon:Plus,      color:'#94A3B8', usage:'available', meta:'Available'     },
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
      { id:'s1', type:'source', x:60,   y:240, data:{ src:'fb', visitorsNum:5160, visitorsLabel:'5.2k', sourceKind: 'paid', cost: 380, currency: 'USD' } },
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
      { id:'p2', type:'page', x:440,  y:220, data:{ pageType:'checkout', title:'Order Form',        path:'/checkout',    status:'live',  visitors:286,  conversions:204, rate:71.3, price: 27, currency: 'USD', productName: 'Tripwire Offer' } },
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
      { id:'p4', type:'page',   x:1460, y:220, data:{ pageType:'checkout',   title:'Checkout',         path:'/buy',         status:'live',  visitors:124,  conversions:96,   rate:77.4, price: 197, currency: 'USD', productName: 'Sales Funnel Offer' } },
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
          onClick={() => canvasApi?.current?.addNode({ type:'page',   data:{ title:'New page', path:'/new', pageType:'landing', kind:'landing' } })}/>
        <QuickIcon Icon={Cart}     color="#0891B2" tint="#E0F7FA" tintHover="#B2EBF2" label="Add checkout"
          onClick={() => canvasApi?.current?.addNode({ type:'page',   data:{ title:'Checkout', path:'/checkout', pageType:'checkout', kind:'checkout' } })}/>
        {/* A/B Test and Condition removed from Quick Add — logic nodes are
           created from a connecting line's quick action, not via this menu. */}
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
                onRemove={() => {
                  canvasApi?.current?.removeNodeByTitle(p.title);
                  if (activePage === p.id) setActivePage(null);
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
        {/* Primary AI action — opens conversational sidebar mode.
           Style cousin of AI Suggestions below: white card, violet wash.
           Icon flipped to white square + violet glyph. */}
        <button onClick={onBuildAIClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-violet-soft border border-violet/20 hover:border-violet hover:bg-white transition-colors">
          <span className="w-7 h-7 rounded-md bg-white text-violet flex items-center justify-center shadow-xs ai-ripple">
            <Spark size={14} className="ai-breathe-icon"/>
          </span>
          <div className="flex-1 text-left">
            <div className="text-[12.5px] font-semibold text-ink leading-none">Build with AI</div>
            <div className="text-[10.5px] text-violet/70 mt-0.5">Describe it. AI builds it.</div>
          </div>
          <ChevronRight size={11} className="text-violet"/>
        </button>
        {/* Secondary — passive suggestions */}
        <button onClick={onAIClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-line hover:border-violet hover:bg-violet-soft transition-colors">
          <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center">
            <Spark size={14}/>
          </span>
          <div className="flex-1 text-left">
            <div className="text-[12.5px] font-semibold text-ink leading-none">AI suggestions</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5">3 ways to lift conversion</div>
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

function PageRow({ page, inFunnel, draggable=true, active=false, isInFunnel=false, onClick, onContextMenu, onRemove }) {
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
        {/* Add-to-funnel quick action (drag alternative). Only shows for
            library rows that aren't already on canvas, and only on row hover. */}
        {!inFunnel && draggable && (
          <Tip label="Add to funnel" side="top">
            <button onClick={(e) => {
                e.stopPropagation();
                /* Custom event so Canvas can listen and do the add */
                window.dispatchEvent(new CustomEvent('sidebar-add-page', { detail: { page } }));
              }}
              className="row-action w-5 h-5 inline-flex items-center justify-center rounded hover:bg-brand-soft text-ink-soft hover:text-brand transition-colors opacity-0 group-hover/row:opacity-100">
              <Plus size={12}/>
            </button>
          </Tip>
        )}
        <Tip label="Open page in new window" side="top">
          <button onClick={(e) => { e.stopPropagation(); window.open('#preview-' + page.id, '_blank'); }}
            className="row-action w-5 h-5 inline-flex items-center justify-center rounded hover:bg-white text-ink-soft hover:text-brand transition-colors">
            <Eye size={12}/>
          </button>
        </Tip>
        <Chip kind={page.status === 'live' ? 'live' : 'draft'} sm>{page.status === 'live' ? 'Live' : 'Draft'}</Chip>
        {inFunnel && (
          <Tip label="Remove from funnel" side="top">
            <button onClick={(e) => { e.stopPropagation(); onRemove && onRemove(); }}
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
      {!inFunnel && (
        <Tip label="Add to funnel" side="top">
          <button onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('sidebar-add-source', { detail: { source } }));
            }}
            className="ml-auto w-5 h-5 inline-flex items-center justify-center rounded hover:bg-brand-soft text-ink-soft hover:text-brand transition-colors opacity-0 group-hover/row:opacity-100 mt-px shrink-0">
            <Plus size={12}/>
          </button>
        </Tip>
      )}
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
            <div className="text-[10.5px] text-ink-soft mt-0.5">3 ways to lift conversion</div>
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
  /* 3-step start wizard. Bigger cards, more breathing room — second pass. */
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[760px] mx-auto">
        <div className="text-center mb-7">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">Get started</div>
          <h2 className="text-[22px] font-semibold text-ink mt-1.5">Build your funnel in 3 steps</h2>
          <p className="text-[13px] text-ink-soft mt-2 max-w-[460px] mx-auto leading-relaxed">
            Add a traffic source, then your first page, then connect them. Or start from a template.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <WizardStep n={1} accent="#10B981" tint="#ECFDF5" Icon={Globe}
            title="Add a traffic source"
            sub="Where do visitors come from? Facebook, Email, YouTube and more."
            cta="Add source"
            onClick={() => window.dispatchEvent(new CustomEvent('sidebar-focus', { detail: { section: 'sources' } }))}/>
          <WizardStep n={2} accent="#006CB5" tint="#E6F0F9" Icon={FileIcon}
            title="Add your first page"
            sub="Landing page, lead form, sales page, checkout, thank you."
            cta="Add page" onClick={onJumpToPages}/>
          <WizardStep n={3} accent="#7C3AED" tint="#F3EEFF" Icon={Workflow}
            title="Connect the path"
            sub="Drag from each card's connector dot to draw the next step."
            cta="Got it" onClick={onJumpToPages}/>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2.5 text-[12.5px]">
          <button onClick={onJumpToTemplates}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-white border border-line text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors font-medium">
            <Workflow size={13}/> Use a template
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-build-ai'))}
            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-violet-soft border border-violet/20 text-violet hover:bg-white transition-colors font-medium">
            <Spark size={13}/> Ask AI to build it
          </button>
        </div>
      </div>
    </div>
  );
}

function WizardStep({ n, accent, tint, Icon, title, sub, cta, onClick }) {
  return (
    <div className="bg-white border border-line-soft rounded-xl p-5 hover:border-line-strong hover:shadow-card transition-all min-h-[200px] flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-9 h-9 rounded-md inline-flex items-center justify-center" style={{ background: tint, color: accent }}>
          <Icon size={16}/>
        </span>
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-soft">Step {n}</span>
      </div>
      <div className="text-[14px] font-semibold text-ink leading-tight mb-1.5">{title}</div>
      <div className="text-[12px] text-ink-soft leading-relaxed mb-4 flex-1">{sub}</div>
      <button onClick={onClick}
        className="h-8 px-3 inline-flex items-center justify-center gap-1 rounded-md text-[12px] font-semibold text-white transition-opacity hover:opacity-90 self-start"
        style={{ background: accent }}>
        {cta} <ChevronRight size={12}/>
      </button>
    </div>
  );
}

/* ─── WIREFRAME — small SVG mock of a webpage body, tinted per page type ─── */
function Wireframe({ type }) {
  /* Upgraded skeleton mockups — every layout sits inside a faux browser
     chrome (3 traffic-light dots + URL bar), uses subtle gradients on hero
     blocks, and renders realistic UI proportions for buttons and inputs.
     The page TYPE is conveyed by the colored top border + icon on the
     parent card; the wireframe stays neutral grey. */
  const BG       = '#FAFBFC';                    /* near-white page surface */
  const CHROME   = '#F1F4F8';                    /* browser chrome */
  const PRIMARY  = 'rgba(100,116,139,0.55)';     /* hero/CTA blocks */
  const SOLID    = 'rgba(100,116,139,0.85)';     /* button */
  const SECONDARY= 'rgba(100,116,139,0.30)';     /* text lines */
  const FAINT    = 'rgba(100,116,139,0.16)';     /* sub-blocks */
  const BORDER   = 'rgba(100,116,139,0.22)';     /* card outlines */
  /* Browser chrome — sits at top of every layout, gives "real page" affordance */
  const Chrome = (
    <g>
      <rect x="0" y="0" width="240" height="14" fill={CHROME}/>
      <circle cx="6.5" cy="7" r="1.6" fill="#E94B4B" opacity="0.65"/>
      <circle cx="11.5" cy="7" r="1.6" fill="#F2B33D" opacity="0.7"/>
      <circle cx="16.5" cy="7" r="1.6" fill="#42C168" opacity="0.7"/>
      <rect x="62" y="3.5" width="116" height="7" rx="3.5" fill="white" stroke={BORDER} strokeWidth="0.5"/>
      <line x1="0" y1="14" x2="240" y2="14" stroke={BORDER} strokeWidth="0.5"/>
    </g>
  );
  const layouts = {
    landing: (
      <>
        {Chrome}
        {/* hero with subtle vertical gradient */}
        <defs>
          <linearGradient id="wf-hero" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(100,116,139,0.70)"/>
            <stop offset="100%" stopColor="rgba(100,116,139,0.40)"/>
          </linearGradient>
        </defs>
        <rect x="20" y="28" width="200" height="14" rx="2" fill="url(#wf-hero)"/>
        <rect x="20" y="50" width="180" height="2.5" rx="1" fill={FAINT}/>
        <rect x="20" y="56" width="160" height="2.5" rx="1" fill={FAINT}/>
        <rect x="20" y="62" width="170" height="2.5" rx="1" fill={FAINT}/>
        {/* CTA button with subtle shadow strip below */}
        <rect x="20" y="74" width="64" height="14" rx="3" fill={SOLID}/>
        <rect x="20" y="88" width="64" height="1.5" rx="0.75" fill="rgba(15,23,42,0.06)"/>
      </>
    ),
    form: (
      <>
        {Chrome}
        <rect x="20" y="22" width="120" height="9" rx="2" fill={PRIMARY}/>
        <rect x="20" y="36" width="40"  height="3" rx="1" fill={FAINT}/>
        <rect x="20" y="44" width="200" height="11" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="20" y="60" width="40"  height="3" rx="1" fill={FAINT}/>
        <rect x="20" y="68" width="200" height="11" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="20" y="84" width="200" height="14" rx="3" fill={SOLID}/>
      </>
    ),
    sales: (
      <>
        {Chrome}
        <rect x="20" y="22" width="200" height="12" rx="2" fill={PRIMARY}/>
        {/* 3 product/benefit cards with soft borders */}
        <rect x="20" y="44" width="58" height="22" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="91" y="44" width="58" height="22" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="162" y="44" width="58" height="22" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        {/* tiny content inside each card */}
        <rect x="26" y="48" width="20" height="2" rx="1" fill={SECONDARY}/>
        <rect x="26" y="54" width="46" height="2" rx="1" fill={FAINT}/>
        <rect x="26" y="60" width="32" height="2" rx="1" fill={FAINT}/>
        <rect x="97" y="48" width="20" height="2" rx="1" fill={SECONDARY}/>
        <rect x="97" y="54" width="46" height="2" rx="1" fill={FAINT}/>
        <rect x="97" y="60" width="32" height="2" rx="1" fill={FAINT}/>
        <rect x="168" y="48" width="20" height="2" rx="1" fill={SECONDARY}/>
        <rect x="168" y="54" width="46" height="2" rx="1" fill={FAINT}/>
        <rect x="168" y="60" width="32" height="2" rx="1" fill={FAINT}/>
        <rect x="20" y="74" width="80" height="14" rx="3" fill={SOLID}/>
      </>
    ),
    checkout: (
      <>
        {Chrome}
        {/* form fields stacked left */}
        <rect x="20" y="22" width="130" height="10" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="20" y="36" width="130" height="10" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="20" y="50" width="130" height="10" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="20" y="74" width="60"  height="14" rx="3" fill={SOLID}/>
        {/* order summary card right */}
        <rect x="160" y="22" width="62" height="60" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="167" y="30" width="40" height="3"  rx="1" fill={SECONDARY}/>
        <rect x="167" y="40" width="48" height="2.5" rx="1" fill={FAINT}/>
        <rect x="167" y="48" width="44" height="2.5" rx="1" fill={FAINT}/>
        <line x1="167" y1="58" x2="215" y2="58" stroke={BORDER} strokeWidth="0.5"/>
        <rect x="167" y="64" width="20" height="3"  rx="1" fill={SECONDARY}/>
        <rect x="195" y="64" width="20" height="3"  rx="1" fill={SOLID}/>
      </>
    ),
    thanks: (
      <>
        {Chrome}
        {/* big check circle with soft halo */}
        <circle cx="120" cy="42" r="18" fill="rgba(66,193,104,0.10)"/>
        <circle cx="120" cy="42" r="13" fill="rgba(66,193,104,0.85)"/>
        <path d="M114 42 L118 46 L126 38" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="60" y="68" width="120" height="6" rx="1" fill={SECONDARY}/>
        <rect x="80" y="80" width="80"  height="2.5" rx="1" fill={FAINT}/>
        <rect x="86" y="86" width="68"  height="2.5" rx="1" fill={FAINT}/>
      </>
    ),
    upsell: (
      <>
        {Chrome}
        <rect x="20" y="22" width="180" height="12" rx="2" fill={PRIMARY}/>
        {/* product image + description */}
        <rect x="20" y="44" width="60"  height="38" rx="2" fill={FAINT} stroke={BORDER} strokeWidth="0.5"/>
        <rect x="86" y="48" width="80"  height="3"  rx="1" fill={SECONDARY}/>
        <rect x="86" y="56" width="100" height="2.5" rx="1" fill={FAINT}/>
        <rect x="86" y="62" width="90"  height="2.5" rx="1" fill={FAINT}/>
        <rect x="86" y="74" width="100" height="11" rx="3" fill={SOLID}/>
      </>
    ),
    webinar: (
      <>
        {Chrome}
        {/* video player frame with play button + faux progress bar */}
        <rect x="20" y="22" width="200" height="46" rx="3" fill={PRIMARY}/>
        <circle cx="120" cy="45" r="11" fill="rgba(255,255,255,0.12)"/>
        <polygon points="115,40 115,50 124,45" fill="white"/>
        <rect x="24" y="62" width="192" height="2" rx="1" fill="rgba(255,255,255,0.18)"/>
        <rect x="24" y="62" width="58" height="2" rx="1" fill="white"/>
        <rect x="20" y="74" width="120" height="4" rx="1" fill={SECONDARY}/>
        <rect x="20" y="82" width="80"  height="2.5" rx="1" fill={FAINT}/>
      </>
    ),
    membership: (
      <>
        {Chrome}
        {/* avatar + welcome */}
        <circle cx="34" cy="32" r="10" fill={SECONDARY}/>
        <rect x="50" y="26" width="80" height="5" rx="1" fill={SECONDARY}/>
        <rect x="50" y="35" width="60" height="3" rx="1" fill={FAINT}/>
        {/* 2 module cards */}
        <rect x="20" y="50" width="92" height="36" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="120" y="50" width="92" height="36" rx="2" fill="white" stroke={BORDER} strokeWidth="0.8"/>
        <rect x="26" y="54" width="80" height="14" rx="2" fill={FAINT}/>
        <rect x="26" y="72" width="50" height="3" rx="1" fill={SECONDARY}/>
        <rect x="26" y="78" width="60" height="2.5" rx="1" fill={FAINT}/>
        <rect x="126" y="54" width="80" height="14" rx="2" fill={FAINT}/>
        <rect x="126" y="72" width="50" height="3" rx="1" fill={SECONDARY}/>
        <rect x="126" y="78" width="60" height="2.5" rx="1" fill={FAINT}/>
      </>
    ),
    custom: (
      <>
        {Chrome}
        {/* generic block layout — 3 wide bars + a smaller one, suggests content */}
        <rect x="20" y="24" width="200" height="10" rx="2" fill={PRIMARY}/>
        <rect x="20" y="40" width="200" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="48" width="180" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="56" width="200" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="64" width="120" height="3"  rx="1" fill={FAINT}/>
        <rect x="20" y="76" width="60"  height="12" rx="3" fill={SOLID}/>
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

/* PAGE_ICON_LOOKUP — used by the page node (rendered via xyflow in src/canvas)
   to swap a page's default icon for a custom one selected in the Inspector. */
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

/* LOGIC_KIND — primary/secondary branch labels per logic-node kind.
   Read by the xyflow LogicNode + by Canvas.jsx for branch assignment. */
const LOGIC_KIND = {
  condition: { label: 'Condition', subtitle: 'rule-based split', primaryBranch:'yes', secondaryBranch:'no' },
  abtest:    { label: 'A/B Test',  subtitle: 'random split',     primaryBranch:'a',   secondaryBranch:'b'  },
};

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
      <Tip label="Tidy layout" side="top">
        <button onClick={onAutoLayout} className="w-8 h-8 inline-flex items-center justify-center text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
          <Sparkles size={13}/>
        </button>
      </Tip>
      <span className="w-px bg-line-soft"/>
      <Tip label="Fit view  Z" side="top">
        <button onClick={onFit} className="w-8 h-8 inline-flex items-center justify-center text-ink-muted hover:bg-surface-sub hover:text-ink transition-colors">
          <Maximize size={13}/>
        </button>
      </Tip>
    </div>
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
      {node?.type !== 'source' && <div className="relative flex-shrink-0">
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
      </div>}
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
    const color = node.data.kind === 'abtest' ? '#F59E0B' : '#7C3AED';
    return { color, Icon: Ic, kindLabel: 'Logic · ' + k, title: node.data.title || k };
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
  if (node.type === 'logic')  return <DetailsLogic node={node} api={api} mode={mode}/>;
  return null;
}

/* PAGE DETAILS — V5 pattern: Performance + Suggested win + Details + Actions */
function DetailsPage({ node, api, mode }) {
  const { title, path, status, visitors, rate } = node.data;
  const onlineNow = node.data.onlineNow || 14;
  const avgTime = node.data.avgTime || '1:48';
  const isAnalyse = mode === 'analyse';
  return (
    <div className="space-y-0">
      {/* Performance — mirrors the analyse-mode card stats so the
         right-panel reflects what's on the card 1:1. */}
      <InspSection label="Performance" right={isAnalyse ? <span className="text-[10px] text-ink-soft">In funnel</span> : null}>
        <Stat label="Unique visitors" value={visitors?.toLocaleString() || '—'}/>
        <Stat label="Online now" value={
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-good live-dot"/>
            <span>{onlineNow}</span>
          </span>
        }/>
        <Stat label="Conversion to next" value={rate != null ? rate.toFixed(0) + '%' : '—'} accent={rate != null ? 'good' : null}/>
        <Stat label="Drop-off" value={rate != null ? Math.max(0, 100 - rate).toFixed(0) + '%' : '—'} accent={rate != null && rate < 30 ? 'bad' : null}/>
        <Stat label="Avg. time on page" value={avgTime}/>
      </InspSection>

      {/* Traffic snapshot — Analyse mode only. Walks back from this page to
         find every source feeding it, computes each source's contribution.
         Shows: source name + colored badge + visitor count + % of total. */}
      {isAnalyse && api.getIncomingEdges && (() => {
        const allNodes = api.getNodes ? api.getNodes() : [];
        // Walk back through the graph BFS-style to find all source nodes
        // feeding this page (direct OR via intermediate pages/logic).
        const visited = new Set();
        const sourceContribs = []; // [{ source, vol }]
        const walk = (nodeId, vol) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          const incoming = api.getIncomingEdges(nodeId);
          incoming.forEach(e => {
            const fromNode = allNodes.find(n => n.id === e.from);
            if (!fromNode) return;
            if (fromNode.type === 'source') {
              const existing = sourceContribs.find(s => s.id === fromNode.id);
              if (existing) existing.vol += (e.volume || 0);
              else sourceContribs.push({
                id: fromNode.id, node: fromNode, vol: e.volume || 0,
              });
            } else {
              walk(e.from, e.volume || 0);
            }
          });
        };
        walk(node.id, 0);
        if (sourceContribs.length === 0) return null;
        const total = sourceContribs.reduce((sum, s) => sum + s.vol, 0);
        return (
          <InspSection label="Traffic snapshot" right={<span className="text-[10px] text-ink-soft">By source</span>}>
            {sourceContribs.map(c => {
              const sourceData = SOURCES.find(s => s.id === c.node.data.src);
              const isCustomSrc = c.node.data.src === 'custom';
              const name = isCustomSrc ? (c.node.data.customName || 'Custom') : (sourceData?.name || 'Source');
              const color = isCustomSrc ? (c.node.data.customColor || '#475569') : (sourceData?.color || '#475569');
              const pct = total ? Math.round((c.vol / total) * 100) : 0;
              // Styling matches the Stat component used by Performance:
              // py-1, ink-soft label, ink-strong tabular-nums value. Source name
              // gets a small dot prefix in the source's brand color.
              return (
                <div key={c.id} className="flex items-center justify-between py-1 gap-2 min-w-0">
                  <span className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }}/>
                    <span className="text-[11.5px] text-ink-soft truncate">{name}</span>
                  </span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="text-[11px] text-ink-soft">{c.vol.toLocaleString()}</span>
                    <span className="text-[12.5px] font-semibold w-9 text-right" style={{ color }}>{pct}%</span>
                  </span>
                </div>
              );
            })}
            {/* Total — uses the same Stat styling pattern (label/value pair) */}
            <div className="flex items-center justify-between py-1 pt-2 mt-1 border-t border-line-soft">
              <span className="text-[11.5px] text-ink-soft">Total</span>
              <span className="text-[12.5px] font-semibold tabular-nums text-ink">{total.toLocaleString()}</span>
            </div>
          </InspSection>
        );
      })()}

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
    <div className="space-y-0">
      {/* Type dropdown — switch between platform-connected and custom mode */}
      <InspSection label="Source type">
        <select value={node.data.src || 'fb'} onChange={(e) => api.updateNodeData(node.id, { src: e.target.value })}
          className="w-full h-8 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
          {SOURCES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </InspSection>

      {/* Custom-source UI: name + color, no connection */}
      {isCustom && (
        <>
          <InspSection label="Source details">
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

      {/* Ad tracking URL — always visible, regardless of source type. Client
         flagged this as a frequently-needed field that was previously buried.
         Includes a copy button + small UTM auto-tag toggle helper. */}
      <InspSection label="Ad tracking URL">
        <Field label="Tracking link">
          <div className="flex items-center gap-1">
            <input value={node.data.trackingUrl || ''}
              onChange={(e) => api.updateNodeData(node.id, { trackingUrl: e.target.value })}
              placeholder="https://example.com?utm_source=…"
              className="flex-1 h-7 px-2 text-[11px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand font-mono"/>
            <Tip label="Copy" side="top">
              <button onClick={() => navigator.clipboard?.writeText(node.data.trackingUrl || '')}
                className="h-7 px-2 inline-flex items-center justify-center rounded text-ink-soft hover:text-ink hover:bg-surface-sub border border-line-soft transition-colors">
                <Copy size={11}/>
              </button>
            </Tip>
          </div>
        </Field>
        <Field label="UTM campaign">
          <input value={node.data.utmCampaign || ''}
            onChange={(e) => api.updateNodeData(node.id, { utmCampaign: e.target.value })}
            placeholder="e.g. spring-launch-2026"
            className="w-full h-7 px-2 text-[11px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
        </Field>
      </InspSection>

      <InspSection label="Performance">
        <Stat label="Visitors (7d)" value={visitors.toLocaleString()}/>
        <Stat label="Sessions" value={Math.round(visitors * 1.18).toLocaleString()}/>
        <Stat label="Cost (7d)" value={node.data.cost ? '$' + node.data.cost : '—'}/>
        <Stat label="Cost per lead" value={cpl} accent={node.data.cpl != null && node.data.cpl < 5 ? 'good' : null}/>
      </InspSection>

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
function DetailsLogic({ node, api, mode }) {
  const isAB = node.data.kind === 'abtest';
  const yLabel = node.data.yesLabel != null ? node.data.yesLabel : (isAB ? 'Variant A' : 'If condition is true');
  const nLabel = node.data.noLabel  != null ? node.data.noLabel  : (isAB ? 'Variant B' : 'If condition is false');
  const title  = node.data.title    != null ? node.data.title    : (isAB ? 'Untitled A/B test' : 'Untitled condition');

  // Pull live edge data for this logic node so the Performance section reflects
  // the actual visitor split rather than mocked numbers. Only used in Analyse mode.
  const showPerformance = mode === 'analyse';
  const outEdges = (showPerformance && api.getOutgoingEdges) ? api.getOutgoingEdges(node.id) : [];
  const primaryEdge   = outEdges.find(e => e.branch === (isAB ? 'a' : 'yes')) || outEdges[0];
  const secondaryEdge = outEdges.find(e => e.branch === (isAB ? 'b' : 'no'))  || outEdges[1];
  const yVol = primaryEdge?.volume   || 0;
  const nVol = secondaryEdge?.volume || 0;
  const total = yVol + nVol;
  const yPct = total ? Math.round((yVol / total) * 100) : 0;
  const nPct = total ? Math.round((nVol / total) * 100) : 0;

  return (
    <div className="space-y-0">
      <InspSection label={isAB ? 'Test name' : 'Condition name'}>
        <input value={title} onChange={(e) => api.updateNodeData(node.id, { title: e.target.value })}
          placeholder={isAB ? 'Untitled A/B test' : 'Untitled condition'}
          className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
      </InspSection>

      {/* Performance — Analyse mode only. Build mode users are wiring things up;
         performance data is irrelevant until the funnel is live. */}
      {showPerformance && (
        <InspSection label="Performance">
        {total === 0 ? (
          <div className="px-2.5 py-2 bg-surface-sub border border-line-soft rounded-md">
            <div className="text-[11.5px] text-ink-muted">No traffic yet</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5 leading-snug">Connect both branches and run traffic to see the split.</div>
          </div>
        ) : (
          <>
            {/* Two stat cards side-by-side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-line-soft rounded-md px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: isAB ? '#7C3AED' : '#10B981' }}>{isAB ? 'A' : 'Y'}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft truncate">{isAB ? 'Variant A' : 'Yes'}</span>
                </div>
                <div className="text-[14px] font-semibold tabular-nums leading-none" style={{ color: isAB ? '#7C3AED' : '#10B981' }}>{yPct}%</div>
                <div className="text-[10px] text-ink-soft tabular-nums mt-1">{yVol.toLocaleString()} visitors</div>
              </div>
              <div className="bg-white border border-line-soft rounded-md px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: isAB ? '#F59E0B' : '#94A3B8' }}>{isAB ? 'B' : 'N'}</span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft truncate">{isAB ? 'Variant B' : 'No'}</span>
                </div>
                <div className="text-[14px] font-semibold tabular-nums leading-none" style={{ color: isAB ? '#F59E0B' : '#94A3B8' }}>{nPct}%</div>
                <div className="text-[10px] text-ink-soft tabular-nums mt-1">{nVol.toLocaleString()} visitors</div>
              </div>
            </div>
            {/* Stacked bar — visualises the split as one continuous element */}
            <div className="mt-2 h-2 rounded-full bg-surface-muted overflow-hidden flex">
              <div style={{ width: yPct + '%', background: isAB ? '#7C3AED' : '#10B981' }}/>
              <div style={{ width: nPct + '%', background: isAB ? '#F59E0B' : '#94A3B8' }}/>
            </div>
            <div className="mt-1.5 text-[10.5px] text-ink-soft tabular-nums">{total.toLocaleString()} total visitors · last 7 days</div>
          </>
        )}
      </InspSection>
      )}

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
    <div className="space-y-0">
      <InspSection label="General">
        {node.type !== 'logic' && (
          <Field label="Name">
            <input value={title} onChange={(e) => api.updateNodeData(node.id, { title: e.target.value })}
              className="w-full h-7 px-2 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand"/>
          </Field>
        )}
        {node.type !== 'source' && (
          <Field label="Status">
            <select value={node.data.status || 'draft'}
              onChange={(e) => api.updateNodeData(node.id, { status: e.target.value })}
              className="w-full h-7 pl-2 pr-7 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
            </select>
          </Field>
        )}
        {node.type === 'page' && (
          <Field label="Replace page">
            <select
              value={node.data.linkedPageId || ''}
              onChange={(e) => {
                const pid = e.target.value;
                if (!pid) return;
                const page = PAGES[pid];
                if (page) {
                  api.updateNodeData(node.id, {
                    linkedPageId: pid,
                    title: page.title,
                    path: page.path,
                    pageType: page.type || node.data.pageType,
                    status: page.status || node.data.status,
                  });
                }
              }}
              className="w-full h-7 pl-2 pr-7 text-[11.5px] text-ink bg-surface-sub border border-line-soft rounded outline-none focus:border-brand">
              <option value="">Keep template page…</option>
              {Object.values(PAGES).map(p => (
                <option key={p.id} value={p.id}>{p.title} · {p.path}</option>
              ))}
            </select>
            <p className="text-[10.5px] text-ink-soft leading-snug mt-1">
              Swap the template placeholder for a real page from your project.
            </p>
          </Field>
        )}
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
            Drives funnel-wide revenue, AOV, and ROI. Multi-line carts coming soon.
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
        </InspSection>
      )}

      {/* Page image — available for ALL page types, not just custom. Image
         appears on the canvas card preview area when set. */}
      {isPage && (
        <InspSection label="Page image">
          <Field label="Preview">
            {node.data.screenshot ? (
              <div className="space-y-1.5">
                <div className="relative rounded-md overflow-hidden border border-line-soft bg-surface-sub">
                  <img src={node.data.screenshot} alt="" className="w-full h-20 object-cover object-top"/>
                  <button onClick={() => api.updateNodeData(node.id, { screenshot: '' })}
                    title="Remove image"
                    className="absolute top-1 right-1 w-5 h-5 inline-flex items-center justify-center rounded bg-white/90 text-ink-muted hover:text-bad-deep hover:bg-white transition-colors shadow-xs">
                    <X size={11}/>
                  </button>
                </div>
                <input value={node.data.screenshot} onChange={(e) => api.updateNodeData(node.id, { screenshot: e.target.value })}
                  className="w-full h-7 px-2 text-[10.5px] text-ink-soft bg-surface-sub border border-line-soft rounded outline-none focus:border-brand font-mono truncate"/>
              </div>
            ) : (
              <label className="block w-full border-2 border-dashed border-line-soft rounded-md hover:border-brand hover:bg-brand-soft/40 transition-colors cursor-pointer text-center py-4">
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => api.updateNodeData(node.id, { screenshot: ev.target?.result });
                    reader.readAsDataURL(file);
                  }}/>
                <UploadIcon size={16} className="mx-auto text-ink-soft mb-1"/>
                <div className="text-[11px] font-medium text-ink-muted">Click to upload</div>
                <div className="text-[10px] text-ink-soft mt-0.5">PNG, JPG up to 5MB</div>
              </label>
            )}
            <p className="text-[10px] text-ink-soft leading-snug mt-1">Or paste a URL above. Leave empty for a wireframe placeholder.</p>
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
  /* Matches the left-sidebar Section tab style: heading row sits in its own
     band with a top + bottom border, content sits below in unbordered space.
     The first section's top border is suppressed via :first-of-type CSS so
     the panel doesn't double-up with the panel header. */
  return (
    <div className="insp-section">
      <div className="flex items-center justify-between px-3 py-2 border-y border-line-soft bg-surface-sub/40">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft" style={{ letterSpacing: '0.07em' }}>{label}</div>
        {right}
      </div>
      <div className="px-3 py-3 space-y-1.5">{children}</div>
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
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="rounded-md border border-line-soft p-3 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(124,58,237,0.02) 60%, transparent 100%)' }}>
      {/* Dismiss × — top-right corner, lightly muted so it doesn't fight the
         primary CTA visually. */}
      <button onClick={() => setDismissed(true)}
        title="Dismiss"
        className="absolute top-1.5 right-1.5 w-5 h-5 inline-flex items-center justify-center rounded text-ink-soft hover:text-ink hover:bg-white/60 transition-colors z-10">
        <X size={11}/>
      </button>
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
  const [activityOpen, setActivityOpen] = useState(false);

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
    // CRITICAL: wrap in the same aside as the build/analyse path so the
    // panel keeps its 320px width. Without this wrapper, OptimiseEmptyState
    // expands to fill available space and the right panel looks bloated.
    return (
      <aside className="w-[320px] border-l border-line bg-white flex flex-col shrink-0">
        <OptimiseEmptyState funnel={funnel}/>
      </aside>
    );
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
    { color: '#F59E0B', icon: <Edit     size={11}/>, text: <>Renamed <span className="font-medium">Step 2</span> → <span className="font-medium">Lead Magnet</span></>, time: '2d ago' },
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
              title={canShowAdvanced ? '' : 'Add pricing to a checkout (or cost to a paid source) to unlock Advanced.'}
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
        {/* Funnel flow graph — Analyse only */}
        {showDiagnosis && <FunnelGraph canvasNodes={canvasNodes}/>}
        {/* Stats grid — moved up to sit directly under the graph (was after
           the health card). 8 stats, 2 cols, white cards with category-colored
           icon chips. */}
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
              <div className="text-[15px] font-semibold tabular-nums mt-1.5 leading-none" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10.5px] text-ink-soft mt-1 leading-none">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Diagnosis-first Analyse callout */}
        {showDiagnosis && (() => {
          const pages = canvasNodes.filter(n => n.type === 'page' && typeof n.data.rate === 'number');
          if (!pages.length) return null;
          const sorted = [...pages].sort((a, b) => (a.data.rate || 0) - (b.data.rate || 0));
          const worst = sorted[0];
          const best  = sorted[sorted.length - 1];
          const worstDrop = Math.max(0, 100 - (worst?.data?.rate || 0));
          return (
            <div className="px-4 pt-4 pb-2">
              <div className="rounded-lg border border-line-soft p-4 bg-white">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span className="w-8 h-8 rounded-md bg-warn-soft text-warn-deep inline-flex items-center justify-center shrink-0">
                    <Activity size={14}/>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft" style={{ letterSpacing: '0.07em' }}>Funnel health</div>
                    <div className="text-[12.5px] font-semibold text-ink leading-tight mt-0.5">Needs attention</div>
                  </div>
                </div>
                <div className="space-y-3 text-[11.5px]">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-soft" style={{ letterSpacing: '0.07em' }}>Biggest leak</div>
                    <div className="text-ink leading-snug mt-1">
                      <span className="font-semibold">{worst?.data?.title || '—'}</span>
                      <span className="text-bad-deep font-semibold tabular-nums"> · {worstDrop.toFixed(0)}% drop-off</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-soft" style={{ letterSpacing: '0.07em' }}>Best step</div>
                    <div className="text-ink leading-snug mt-1">
                      <span className="font-semibold">{best?.data?.title || '—'}</span>
                      <span className="text-good-deep font-semibold tabular-nums"> · {(best?.data?.rate || 0).toFixed(0)}% conversion</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => window.dispatchEvent(new CustomEvent('open-ai-suggestions'))}
                  className="mt-4 w-full h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded text-[11.5px] font-semibold text-white bg-violet hover:bg-violet-deep transition-colors">
                  <Spark size={11}/> Open in AI suggestions
                </button>
              </div>
            </div>
          );
        })()}

        {/* Activity feed — collapsible. Click the heading row to toggle. */}
        <div className="border-t border-line-soft">
          <button onClick={() => setActivityOpen(!activityOpen)}
            className="w-full flex items-center gap-1.5 px-4 py-2.5 hover:bg-surface-sub transition-colors group">
            <ChevronDown size={11} sw={2} className={`text-ink-soft chev ${activityOpen ? '' : '-rotate-90'}`}/>
            <span className="flex-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft text-left" style={{ letterSpacing: '0.07em' }}>Activity</span>
            <span className="text-[10.5px] font-medium text-ink-soft tabular-nums bg-surface-muted group-hover:bg-white px-1.5 py-0.5 rounded transition-colors">{activity.length}</span>
          </button>
          <div className="accordion" data-open={activityOpen}>
            <div>
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
                <div className="px-4 pt-1">
                  <button className="text-[10.5px] text-brand font-medium hover:underline">View all</button>
                </div>
              </div>
            </div>
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
        className="ctx-menu w-[560px] max-w-[92vw] bg-white rounded-lg shadow-menu overflow-hidden">
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
  const [sectionsOpen, setSectionsOpen] = useState({ pages: false, inFunnel: false, sources: false, templates: false });
  const toggleSection = (key) => setSectionsOpen(s => ({ ...s, [key]: !s[key] }));
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
          <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center shrink-0">
            <Spark size={13}/>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-ink leading-tight">Build with AI</div>
            <div className="text-[10.5px] text-ink-soft mt-0.5">Conversational funnel builder</div>
          </div>
        </div>
      </div>

      {/* Same Section components as the regular sidebar — and they render
         the SAME content (PageRow / SourceRow / TemplateCard rows). The only
         difference vs the real sidebar is that drag is mocked and the chat
         takes over the bottom of the panel. */}
      <div className="border-b border-line-soft shrink-0 max-h-[40%] overflow-y-auto scroll-thin">
        <Section title="Add Pages" count={Object.keys(PAGES).length}
          open={sectionsOpen.pages} onToggle={() => toggleSection('pages')}>
          {Object.values(PAGES).slice(0, 6).map(p => (
            <PageRow key={p.id} page={p} draggable={false} active={false}
              onClick={() => {}} onContextMenu={() => {}}/>
          ))}
        </Section>
        <Section title="Current Funnel" count={0}
          open={sectionsOpen.inFunnel} onToggle={() => toggleSection('inFunnel')}>
          <div className="px-4 py-3 text-[11px] text-ink-soft leading-relaxed">
            No pages added yet. Use the chat below or drag from Add Pages.
          </div>
        </Section>
        <Section title="Traffic" count={SOURCES.length}
          open={sectionsOpen.sources} onToggle={() => toggleSection('sources')}>
          {SOURCES.slice(0, 6).map(s => <SourceRow key={s.id} source={s} inFunnel={false}/>)}
        </Section>
        <Section title="Funnel Templates" count={TEMPLATES.length}
          open={sectionsOpen.templates} onToggle={() => toggleSection('templates')} last>
          <div className="space-y-1.5 py-1">
            {TEMPLATES.slice(0, 4).map(t => <TemplateCard key={t.id} tpl={t} onClick={() => {}}/>)}
          </div>
        </Section>
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
  // Make the queue stateful so the audit interaction can append + dismiss
  // suggestions live.
  const [urgent, setUrgent] = useState([
    { id: 'u1', name: 'Landing page drop-off', card: 'May Promo Landing', impact: 'High', why: '76% drop to Lead Form' },
    { id: 'u2', name: 'Checkout abandonment',   card: 'Cart',              impact: 'High', why: 'Below benchmark' },
  ]);
  const [growth, setGrowth] = useState([
    { id: 'g1', name: 'Headline A/B test',  card: 'Landing Page', impact: 'Med',  lift: '+8–14%' },
    { id: 'g2', name: 'Pricing layout test', card: 'Sales Page',  impact: 'Med',  lift: '+3–6%'  },
    { id: 'g3', name: 'Form length test',    card: 'Lead Form',   impact: 'High', lift: '+11%'   },
  ]);
  const [other, setOther] = useState([]);
  const [done, setDone] = useState([
    { id: 'd1', name: 'CTA color test',  card: 'Landing Page', result: '+8% lift', date: 'Apr 28' },
  ]);
  const [auditing, setAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const runAudit = () => {
    if (auditing) return;
    setAuditing(true);
    setAuditProgress(0);
    let p = 0;
    const tick = setInterval(() => {
      p += 8 + Math.random() * 12;
      if (p >= 100) {
        p = 100;
        clearInterval(tick);
        // Inject new suggestions after the bar fills
        setTimeout(() => {
          setUrgent(u => [...u, { id: 'u-' + Date.now(), name: 'Trim hero copy length', card: 'May Promo Landing', impact: 'High', why: 'Above-fold copy too dense' }]);
          setGrowth(g => [...g, { id: 'g-' + Date.now(), name: 'Test trust-badges row', card: 'Sales Page', impact: 'Med', lift: '+5–9%' }]);
          setOther(o => [...o, { id: 'o-' + Date.now(), name: 'Add exit-intent popup', card: 'May Promo Landing', impact: 'Low', lift: '+2–4%' }]);
          setAuditing(false);
        }, 200);
      }
      setAuditProgress(p);
    }, 110);
  };
  const dismiss = (kind, id) => {
    if (kind === 'urgent') setUrgent(u => u.filter(x => x.id !== id));
    if (kind === 'growth') setGrowth(g => g.filter(x => x.id !== id));
    if (kind === 'other')  setOther(o => o.filter(x => x.id !== id));
    if (kind === 'done')   setDone(d => d.filter(x => x.id !== id));
  };
  // Backwards-compat aliases for the existing render
  const URGENT = urgent, GROWTH = growth, DONE = done;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 border-b border-line-soft shrink-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">Optimise queue</div>
        <div className="text-[13px] font-semibold text-ink mt-0.5 truncate">{funnel?.name || 'Untitled funnel'}</div>
        <div className="mt-1 text-[10.5px] text-ink-soft inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet"/>
          {URGENT.length} urgent · {GROWTH.length} growth · {DONE.length} completed
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
        {/* Urgent fixes */}
        {URGENT.length > 0 && (
          <OptimiseSection title="Urgent fixes" count={URGENT.length}>
            {URGENT.map(t => (
              <OptimiseRow key={t.id} title={t.name} subtitle={`on ${t.card} · ${t.why}`}
                pill={t.impact} pillKind="bad"
                onDismiss={() => dismiss('urgent', t.id)}/>
            ))}
          </OptimiseSection>
        )}
        {/* Growth tests */}
        {GROWTH.length > 0 && (
          <OptimiseSection title="Growth tests" count={GROWTH.length}>
            {GROWTH.map(t => (
              <OptimiseRow key={t.id} title={t.name} subtitle={`on ${t.card} · ${t.lift} estimated`}
                pill={t.impact} pillKind="violet"
                onDismiss={() => dismiss('growth', t.id)}/>
            ))}
          </OptimiseSection>
        )}
        {/* Other suggestions — appears after Run audit fills it in */}
        {other.length > 0 && (
          <OptimiseSection title="Other suggestions" count={other.length}>
            {other.map(t => (
              <OptimiseRow key={t.id} title={t.name} subtitle={`on ${t.card} · ${t.lift || t.why || ''}`}
                pill={t.impact} pillKind="violet"
                onDismiss={() => dismiss('other', t.id)}/>
            ))}
          </OptimiseSection>
        )}
        {/* Completed learnings */}
        {DONE.length > 0 && (
          <OptimiseSection title="Completed learnings" count={DONE.length} last>
            {DONE.map(t => (
              <OptimiseRow key={t.id} title={t.name} subtitle={`on ${t.card} · ${t.date}`}
                pill={t.result} pillKind="good"
                onDismiss={() => dismiss('done', t.id)}/>
            ))}
          </OptimiseSection>
        )}
      </div>

      {/* Audit footer — pill turns into a progress bar while running */}
      <div className="px-3 py-2.5 border-t border-line-soft bg-surface-sub shrink-0">
        {auditing ? (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center ai-ripple">
                <Spark size={13} className="ai-breathe-icon"/>
              </span>
              <span className="text-[11.5px] text-ink font-medium flex-1">Running AI audit…</span>
              <span className="text-[10.5px] text-ink-soft tabular-nums">{Math.round(auditProgress)}%</span>
            </div>
            <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-violet rounded-full transition-all duration-150" style={{ width: auditProgress + '%' }}/>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-violet-soft text-violet flex items-center justify-center ai-ripple">
              <Spark size={13} className="ai-breathe-icon"/>
            </span>
            <span className="text-[11.5px] text-ink-soft flex-1 leading-snug">Find more opportunities. AI scans every step + suggests tests.</span>
            <button onClick={runAudit}
              className="h-7 px-2.5 inline-flex items-center text-[11.5px] font-semibold text-violet hover:bg-violet-soft rounded transition-colors">
              Run audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OptimiseSection({ title, accent, count, last, children }) {
  // Match the standard sidebar Section header style: 10.5px semibold,
  // uppercase, tracking-wider, ink-soft. Count pill kept but muted.
  return (
    <div className={`${last ? '' : 'border-b border-line-soft'}`}>
      <div className="px-4 pt-3.5 pb-2 flex items-center gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">{title}</span>
        <span className="text-[10.5px] font-medium text-ink-soft tabular-nums bg-surface-muted px-1.5 py-0.5 rounded">{count}</span>
      </div>
      <div className="pb-2">{children}</div>
    </div>
  );
}

function OptimiseRow({ title, subtitle, pill, pillKind, onDismiss }) {
  const pillClass = {
    bad:    'bg-bad-soft text-bad-deep',
    violet: 'bg-violet-soft text-violet',
    good:   'bg-good-soft text-good-deep',
  }[pillKind] || 'bg-surface-sub text-ink';
  const openSuggestion = () => {
    window.dispatchEvent(new CustomEvent('open-suggestion', { detail: { title, subtitle, pill } }));
  };
  return (
    <div onClick={openSuggestion}
      className="group/row w-full px-4 py-2 flex items-start gap-2 hover:bg-surface-sub transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-ink truncate">{title}</div>
        <div className="text-[10.5px] text-ink-soft mt-0.5 truncate">{subtitle}</div>
      </div>
      <span className={`text-[10px] font-semibold rounded px-1.5 py-px ${pillClass} shrink-0`}>{pill}</span>
      {onDismiss && (
        <button onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          title="Dismiss"
          className="w-4 h-4 inline-flex items-center justify-center rounded text-ink-soft hover:text-bad-deep hover:bg-bad-soft transition-colors opacity-0 group-hover/row:opacity-100 shrink-0">
          <X size={10}/>
        </button>
      )}
    </div>
  );
}



/* InspectorEdge — right-panel view when the user clicks a connection line.
   Shows From → To, mid-edge stats, and quick actions (Add condition,
   Add A/B split, Disconnect). Identical aside width as node Inspector. */
function InspectorEdge({ envelope, api }) {
  const { edge, edgeIdx, fromNode, toNode } = envelope || {};
  const fromTitle = fromNode?.data?.title || (fromNode?.type === 'source' ? (SOURCES.find(s => s.id === fromNode?.data?.src)?.name || 'Source') : 'From');
  const toTitle   = toNode?.data?.title   || 'To';
  const fromColor = fromNode?.type === 'source'
    ? (SOURCES.find(s => s.id === fromNode?.data?.src)?.color || '#006CB5')
    : (PAGE_TYPE[fromNode?.data?.pageType]?.color || '#006CB5');
  const vol = edge?.volume || 0;
  const fromVisitors = fromNode?.data?.visitorsNum || fromNode?.data?.visitors || 100;
  const conv = vol ? Math.round((vol / Math.max(1, fromVisitors)) * 100) : 0;
  const drop = Math.max(0, 100 - conv);
  const branch = edge?.branch;

  return (
    <aside className="w-[320px] border-l border-line bg-white flex flex-col shrink-0">
      {/* Header — From → To, coloured by source */}
      <div className="px-4 py-3 border-b border-line-soft flex items-center gap-2.5 overflow-visible">
        <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: fromColor + '1a', color: fromColor }}>
          <TrendingUp size={14}/>
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider"
               style={{ color: fromColor, letterSpacing: '0.06em' }}>
            Connection · selected
          </div>
          <div className="text-[12.5px] font-semibold text-ink truncate leading-tight mt-0.5">
            {fromTitle} <span className="text-ink-soft">→</span> {toTitle}
          </div>
        </div>
        <Tip label="Close inspector  Esc" side="bottom">
          <button onClick={() => api.deselect && api.deselect()}
            className="w-6 h-6 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-surface-sub transition-colors flex-shrink-0">
            <X size={12}/>
          </button>
        </Tip>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin space-y-0">
        {/* Performance */}
        <InspSection label="Performance">
          <div className="grid grid-cols-2 gap-2">
            <EdgeStatCard label="Visitors" value={vol.toLocaleString()} color="#006CB5" Icon={Eye}/>
            <EdgeStatCard label="Conversion" value={conv + '%'} color="#10B981" Icon={TrendingUp}/>
            <EdgeStatCard label="Drop-off" value={drop + '%'} color="#DC2626" Icon={Activity}/>
            <EdgeStatCard label="Time-to-next" value="0:42" color="#7C3AED" Icon={Eye}/>
          </div>
        </InspSection>

        {/* Routing rule (read-only display of branch identity) */}
        {branch && (
          <InspSection label="Routing rule">
            <div className="flex items-center gap-2 px-2.5 py-2 bg-surface-sub border border-line-soft rounded-md">
              <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background:
                  branch === 'yes' ? '#10B981' :
                  branch === 'no'  ? '#94A3B8' :
                  branch === 'a'   ? '#7C3AED' :
                  branch === 'b'   ? '#F59E0B' : '#94A3B8'
                }}>
                {branch.toUpperCase().charAt(0)}
              </span>
              <span className="text-[11.5px] text-ink font-medium capitalize">{branch}</span>
              <span className="text-[10.5px] text-ink-soft ml-auto">branch</span>
            </div>
          </InspSection>
        )}
        {!branch && (
          <InspSection label="Routing rule">
            <div className="px-2.5 py-2 bg-surface-sub border border-line-soft rounded-md">
              <div className="text-[11.5px] text-ink">Everyone</div>
              <div className="text-[10.5px] text-ink-soft mt-0.5 leading-snug">All visitors take this path. Add a condition or A/B split below to branch the flow.</div>
            </div>
          </InspSection>
        )}

        {/* Actions */}
        <InspSection label="Actions">
          <ActionButton icon={<Workflow size={11}/>} label="Add condition"
            onClick={() => api.addEdgeBranch && api.addEdgeBranch(edgeIdx, 'yes')}/>
          <ActionButton icon={<Bars size={11}/>}     label="Add A/B split"
            onClick={() => api.addEdgeBranch && api.addEdgeBranch(edgeIdx, 'a')}/>
          <ActionButton icon={<X size={11}/>}        label="Disconnect" destructive
            onClick={() => { api.removeEdge && api.removeEdge(edgeIdx); api.deselect && api.deselect(); }}/>
        </InspSection>
      </div>
    </aside>
  );
}

function EdgeStatCard({ label, value, color, Icon }) {
  return (
    <div className="bg-white border border-line-soft rounded-md px-2.5 py-2 hover:border-line-strong transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="w-5 h-5 rounded inline-flex items-center justify-center"
              style={{ background: color + '1a', color }}>
          <Icon size={11}/>
        </span>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-soft">{label}</div>
      <div className="text-[14px] font-semibold tabular-nums leading-none mt-0.5" style={{ color }}>{value}</div>
    </div>
  );
}



function FunnelGraph({ canvasNodes }) {
  const pages = canvasNodes
    .filter(n => n.type === 'page' && typeof n.data.visitors === 'number')
    .sort((a, b) => a.x - b.x);
  if (pages.length < 2) return null;
  const maxVisitors = Math.max(...pages.map(p => p.data.visitors));
  /* Increased H from 130 → 150 to accommodate bigger labels below bars.
     Increased barAreaH offset from 36 → 44 for more label breathing room. */
  const W = 280, H = 150, pad = 6;
  const barW = (W - pad * 2) / pages.length;
  const barAreaH = H - 44;
  return (
    <div className="px-4 pt-3">
      <div className="rounded-lg border border-line-soft bg-white p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">Funnel flow</div>
          <div className="text-[10px] text-ink-soft">Last 7 days</div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow: 'visible' }}>
          {pages.map((p, i) => {
            const visitors = p.data.visitors || 0;
            const conversions = p.data.conversions || 0;
            const dropOff = visitors - conversions;
            const fullH = (visitors / maxVisitors) * barAreaH;
            const convH = (conversions / maxVisitors) * barAreaH;
            const dropH = fullH - convH;
            const x = pad + i * barW;
            const y = barAreaH - fullH;
            const color = (PAGE_TYPE[p.data.pageType] || PAGE_TYPE.custom).color;
            const next = pages[i + 1];
            const nextX = next ? pad + (i + 1) * barW : null;
            const nextH = next ? (next.data.visitors / maxVisitors) * barAreaH : null;
            const nextY = next ? barAreaH - nextH : null;
            const dropPct = visitors ? Math.round((dropOff / visitors) * 100) : 0;
            const titleStr = (p.data.title || '');
            const truncTitle = titleStr.length > 12 ? titleStr.slice(0, 11) + '…' : titleStr;
            return (
              <g key={p.id}>
                {next && (
                  <polygon
                    points={`${x + barW * 0.85},${y + dropH} ${x + barW * 0.85},${barAreaH} ${nextX + barW * 0.15},${barAreaH} ${nextX + barW * 0.15},${nextY}`}
                    fill={color} opacity="0.10"/>
                )}
                {dropH > 1 && (
                  <rect x={x + barW * 0.15} y={y} width={barW * 0.7} height={dropH}
                    fill={color} opacity="0.25" rx="2"/>
                )}
                <rect x={x + barW * 0.15} y={y + dropH} width={barW * 0.7} height={convH}
                  fill={color} rx="2"/>
                {/* Title label — kept at 8.5px small */}
                <text x={x + barW * 0.5} y={barAreaH + 14} textAnchor="middle" fontSize="9" fill="#475569" fontWeight="500">
                  {truncTitle}
                </text>
                {/* Visitor number — bumped from 9px to 13px for legibility */}
                <text x={x + barW * 0.5} y={barAreaH + 30} textAnchor="middle" fontSize="13" fill="#0F172A" fontWeight="700"
                      style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {visitors >= 1000 ? (visitors / 1000).toFixed(1) + 'k' : visitors}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}



/* PrePublishModal — opens when user clicks Publish in the topbar.
   Shows a quick checklist computed from canvas state:
   pages connected · thank-you exists · tracking · checkout priced · mobile
   reviewed. Each item is green/red with a ✓ or × icon. User can either
   "Fix issues" (close + return to canvas) or "Publish anyway". */
function PrePublishModal({ open, canvasNodes, onClose, onPublish }) {
  if (!open) return null;
  const pages = canvasNodes.filter(n => n.type === 'page');
  const sources = canvasNodes.filter(n => n.type === 'source');
  // Approximate "all connected" — in this demo we lack edges in App scope, so
  // just check pages > 0 + sources > 0 (real impl would inspect edges).
  const hasFlow      = pages.length >= 1 && sources.length >= 1;
  const hasThanks    = pages.some(p => p.data.pageType === 'thanks');
  const hasTracking  = sources.length >= 1;
  const hasCheckout  = pages.some(p => p.data.pageType === 'checkout');
  const checkoutPriced = !hasCheckout || pages.some(p => p.data.pageType === 'checkout' && typeof p.data.price === 'number' && p.data.price > 0);
  const checks = [
    { ok: hasFlow,        label: 'Pages and sources connected' },
    { ok: hasThanks,      label: 'Thank-you page exists' },
    { ok: hasTracking,    label: 'At least one traffic source' },
    { ok: checkoutPriced, label: hasCheckout ? 'Checkout has a price set' : 'No checkout in this funnel — skipped', soft: !hasCheckout },
    { ok: false,          label: 'Mobile preview reviewed', soft: true },
  ];
  const blockers = checks.filter(c => !c.ok && !c.soft).length;
  return (
    <div className="fixed inset-0 z-[9985] flex items-center justify-center modal-backdrop"
         style={{ background: 'rgba(15,23,42,0.45)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="modal-card w-[480px] max-w-[92vw] bg-white rounded-xl shadow-modal overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-line-soft flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Ready to publish?</h3>
            <p className="text-[11.5px] text-ink-soft mt-0.5">Quick check before your funnel goes live.</p>
          </div>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors"><X size={14}/></button>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center shrink-0 ${
                c.ok ? 'bg-good-soft text-good-deep' : c.soft ? 'bg-warn-soft text-warn-deep' : 'bg-bad-soft text-bad-deep'
              }`}>
                {c.ok ? <Check size={11}/> : c.soft ? <Activity size={11}/> : <X size={11}/>}
              </span>
              <span className={`text-[12.5px] ${c.ok ? 'text-ink' : c.soft ? 'text-ink-muted' : 'text-ink'}`}>{c.label}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-surface-sub border-t border-line-soft flex items-center justify-between">
          <span className="text-[10.5px] text-ink-soft">
            {blockers > 0 ? `${blockers} item${blockers === 1 ? '' : 's'} need attention.` : 'All set — you\'re good to go.'}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="h-8 px-3 inline-flex items-center text-[12px] font-medium text-ink-muted bg-white border border-line rounded-md hover:bg-surface-muted hover:text-ink transition-colors">
              Fix issues
            </button>
            <button onClick={onPublish}
              className="h-8 px-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-genesis hover:bg-genesis-hover rounded-md transition-colors">
              <Globe size={12}/> {blockers > 0 ? 'Publish anyway' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
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
  // Wizard "Ask AI to build it" → open the Build with AI chat sidebar.
  useEffect(() => {
    const handler = () => setAiChatOpen(true);
    window.addEventListener('open-build-ai', handler);
    return () => window.removeEventListener('open-build-ai', handler);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      const sec = e?.detail?.section;
      if (sec) setFocusSection(sec);
    };
    window.addEventListener('sidebar-focus', handler);
    return () => window.removeEventListener('sidebar-focus', handler);
  }, []);
  useEffect(() => {
    const handler = () => setAiOpen(true);
    window.addEventListener('open-ai-suggestions', handler);
    return () => window.removeEventListener('open-ai-suggestions', handler);
  }, []);
  useEffect(() => {
    const handler = (e) => {
      const source = e?.detail?.source;
      if (source && canvasApi.current) {
        canvasApi.current.addNode({ type: 'source', data: { src: source.id, visitorsNum: 0 } });
      }
    };
    window.addEventListener('sidebar-add-source', handler);
    return () => window.removeEventListener('sidebar-add-source', handler);
  }, []);
  useEffect(() => {
    const handler = () => setPrePublishOpen(true);
    window.addEventListener('open-pre-publish', handler);
    return () => window.removeEventListener('open-pre-publish', handler);
  }, []);
  const [project, setProject] = useState(PROJECTS[0]);
  const [funnel, setFunnel] = useState(FUNNELS[0]);
  const [mode, setMode] = useState('build');
  const [templateModal, setTemplateModal] = useState(null);
  const [demoState, setDemoState] = useState('empty');
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasNodes, setCanvasNodes] = useState([]);
  const [newFunnelOpen, setNewFunnelOpen] = useState(false);
  const [prePublishOpen, setPrePublishOpen] = useState(false);
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
          ? (selectedNode.__kind === 'edge'
              ? <InspectorEdge envelope={selectedNode} api={canvasApi.current || {}}/>
              : <Inspector node={selectedNode} api={canvasApi.current || {}} mode={mode}/>)
          : <InspectorEmpty funnel={funnel} canvasNodes={canvasNodes} mode={mode}/>}
      </div>
      <AIPopover open={aiOpen} onClose={() => setAiOpen(false)}/>
      <TemplateModal template={templateModal} onClose={() => setTemplateModal(null)} onConfirm={() => {}}/>
      <OptimiseSuggestionModal open={!!suggestion} nodeTitle={suggestion?.title} onClose={() => setSuggestion(null)}/>
      {newFunnelOpen && <NewFunnelStarter onClose={() => setNewFunnelOpen(false)} onPickTemplate={(t) => { setTemplateModal(t); setNewFunnelOpen(false); }} onScratch={() => setNewFunnelOpen(false)}/>}
      <PrePublishModal open={prePublishOpen} canvasNodes={canvasNodes}
        onClose={() => setPrePublishOpen(false)}
        onPublish={() => { setPrePublishOpen(false); /* real publish would happen here */ }}/>
      <ToastViewport toast={toast}/>
    </div>
    </ToastContext.Provider>
  );
}

/* ─── Re-exports consumed by src/canvas/* ─────────────────────────────────
   The xyflow port (src/canvas/Canvas.jsx + nodes + edges) imports these so
   the visual primitives + demo state stay defined in one place. Live
   bindings — circular import is safe because every consumer references
   these inside React component bodies, not at module-init time. */
export {
  DEMO_STATES,
  PAGE_TYPE, PAGE_ICON_LOOKUP,
  NODE_W, NODE_H, getNodeH,
  SOURCES, SOURCE_BY_ID, LOGIC_KIND,
  useCountUp, formatVolume, heatTextColor,
  Tip, Popover, MenuItem, MenuDivider, Wireframe,
  EmptyCanvas, ViewSwitcher, ZoomControls, ExportFunnelButton,
  X, Edit, ChevronRight, Spark, Sparkles, Bars, Workflow,
  UsersIcon, TrendingUp, Activity, Eye, FileIcon, Cart, TrendUp,
};

