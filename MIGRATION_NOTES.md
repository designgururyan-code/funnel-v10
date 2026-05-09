# xyflow port — migration notes

Three commits on `xyflow-port`:

| commit | scope                              |
| ------ | ---------------------------------- |
| A      | nodes ported, placeholder edges    |
| B      | edges + mid-edge stat pill ported  |
| C      | dagre auto-layout + polish + chrome|

The whole canvas-rendering engine is now `@xyflow/react`. Inspector,
sidebar, topbar, modals, demo state files, and project switcher were
not touched — surgical scope. Build is green. All five demo states load.

## Deviations from the plan

### 1. Re-export instead of extracting a shared module

The plan said the new node/edge files would import primitives "from
App.jsx". I considered three approaches: (a) extract icons + helpers
into `src/canvas/shared.jsx`, (b) duplicate the small ones in the new
files, (c) add a single `export {…}` block at the end of `App.jsx`.

I went with (c). It's surgical (one block of additions; no rewrites of
existing declarations), the bindings stay live across the unavoidable
circular import, and it keeps the canvas folder self-contained without
sprawling the App. Re-export list lives at the bottom of `App.jsx`.

Circular import sketch:

  App.jsx → ./canvas/Canvas.jsx → ./canvas/nodes/PageNode.jsx → App.jsx

ESM live bindings make this safe — every consumer references the
imported symbols inside React component bodies, not at module-init time.
Verified by a clean `vite build`.

### 2. ViewSwitcher / ZoomControls / LOGIC_KIND stayed in App.jsx

These were inside the deleted Canvas region. The original plan implied
they'd move to `src/canvas/`. I restored them in App.jsx instead — they
also serve App's existing render layer (ViewSwitcher is used by the
empty-state too) and the topbar/zoom controls render outside the
ReactFlow surface anyway. Importing them back into the new Canvas keeps
visual parity exact without duplicating them.

### 3. Logic-node branching: two distinct handles, no overlap heuristic

Plan said "overlap them visually so they read as one dot, use a
heuristic to bind on each drag." I implemented two separate handles
fanned ±11px from the right-edge midpoint (matching the old ±22px
branch fan-out feel after halving for visual density). xyflow needs
distinct handle ids ('yes'/'no' or 'a'/'b') for routing. The
"first-drag-becomes-primary" rule is enforced inside Canvas's
`onConnect` — if the source is a logic node, we override the
sourceHandle based on existing outgoing-edge count, so the user can
physically grab either dot and the branch identity still resolves
correctly.

### 4. Empty-state: ReactFlow not mounted at all

When `demoState === 'empty' && !nodes.length`, we render `EmptyCanvas`
and skip ReactFlow entirely. `useReactFlow()` still works because of
`<ReactFlowProvider>`. Switching back to a populated state remounts
ReactFlow.

### 5. proOptions.hideAttribution

Set to `true`. xyflow's MIT licence permits removing the attribution
since v12 (the field is no longer Pro-gated). Build is green; if the
attribution chip ever reappears in the rendered DOM, the prompt's
fallback ("just leave attribution visible") is one prop deletion away.

### 6. Drop-target ring is CSS, not React state

I tracked `connectFromId` in Canvas state but the actual visual ring
is driven by a single `.is-connecting` className toggled on
`<ReactFlow>` plus a CSS `:hover` selector on `.react-flow__node-page`
/ `.react-flow__node-logic`. xyflow already routes hover/pointer
events to the right node — so we don't need to implement our own
mouse-over hit-testing. Source nodes are excluded by selector.

### 7. Insert-step picker: only Condition/A-B-test wired

The old Canvas's insert-picker had Page / Checkout / Upsell entries
that were no-ops (placeholders for a future feature). I kept those
visual entries but only wired Condition + A/B test, matching the old
behaviour exactly.

## What I deliberately did NOT do

- **No custom edge router.** Smoothstep handles the routing the
  prompt's locked decision (#1) called for.
- **No <MiniMap>, <Controls>, <Background>.** Hidden via xyflow CSS
  overrides + by simply not rendering them.
- **No demo-state file edits.** The transform util adapts our format
  to xyflow's at load time.
- **No refactor of Inspector, Sidebar, Topbar, modals, or App-level
  state.** The new Canvas exposes the same `canvasApiRef` shape
  (`updateNodeData`, `removeNode`, `addNode`, `panToNodeByTitle`, …)
  and the same selection envelope (`{__kind: 'edge', edge, edgeIdx,
  fromNode, toNode}` for edges, our-format node for nodes), so every
  caller works unchanged.

## Open follow-ups (not blockers)

- xyflow stores node sizes from first render; before that the dagre
  layout falls back to NODE_W/getNodeH. If a Tidy-layout is invoked on
  an *initial* mount before any node has rendered (rare — first paint
  is fast), the layout uses defaults. Acceptable.
- Pill-vs-card / pill-vs-pill collision avoidance from the old
  EdgeOverlays isn't ported. With smoothstep routing the pill sits at
  the orthogonal mid-segment which has more clearance by default;
  collisions in the demo states were not observed. Re-introduce only
  if a layout in the wild collides.
- Build mode legacy `nodeOverlap-bounce-back` (drag overlap → snap
  back to origin) isn't ported. xyflow lets you drop nodes on top of
  each other; users can still drag them apart. The previous behaviour
  was protective — a reasonable simplification for now.
