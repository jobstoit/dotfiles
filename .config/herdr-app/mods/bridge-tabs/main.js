// LCARS tab bar for the `bridge` layout, built from Herdr's `tabs` mod.
// Each tab is a pill (number + name) with a status segment after it:
// gold working, red blocked (flashes), sky done, gray idle, each with a small
// animated bar graph (the Tricorder, below). Then a + button,
// a filler bar naming the space, the Files/Changes panel buttons and an end cap.
// Behavior kept from `tabs`: drag to reorder, double-click to rename,
// right-click menu, scroll to switch, per-space side panel memory.

import { View, div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, run, openOverlay, window, shared, layout, settings } from "herdr";

const C = {
  orange: "#ff9966", peach: "#ffcc99", plum: "#9977aa", periwinkle: "#9999ff",
  gold: "#ffcc66", red: "#ff5544", sky: "#99ccff", gray: "#8a8a99", ink: "#000000",
};
const STATUS = { working: C.gold, blocked: C.red, done: C.sky, idle: C.gray };
// Tricorder: a tiny ink bar graph on the status colour. The same helper sits in
// bridge-tabs, bridge-agents and bridge-pane (mods can't import each other): 2 px
// bars 1 px apart, bottom-aligned in `area` px, animated natively with .loop and
// .transition, never a timer. Loops have no phase, so the different periods are
// what keep the bars out of step. Heights in px: [from, to].
const GRAPH = {
  block: { bars: 4, area: 14, base: 3, working: [3, 14], blocked: [6, 14], beat: [3, 9], idle: [3, 7], unknown: [2, 6] },
  segment: { bars: 3, area: 20, base: 4, working: [4, 20], blocked: [8, 20], beat: [4, 12], idle: [4, 10], unknown: [2, 8] },
};
const WORKING_MS = [500, 700, 900, 1100], UNKNOWN_MS = [900, 1300, 1700, 2100];
const KNOWN = ["working", "blocked", "done", "idle"];
// A profile fitted to a block of another height.
function scaleGraph(g, k) {
  const r = (v) => Math.max(1, Math.round(v * k)), p = ([a, b]) => [r(a), r(b)];
  return { bars: g.bars, area: r(g.area), base: r(g.base), working: p(g.working), blocked: p(g.blocked), beat: p(g.beat), idle: p(g.idle), unknown: p(g.unknown) };
}
// The block or segment holding a graph: blocked flashes, an unknown status is dimmed.
const graphHost = (el, status) =>
  status === "blocked" ? el.loop("opacity", { from: 0.5, to: 1, period: 900 }) : KNOWN.includes(status) ? el : el.opacity(0.75);
// Each bar keeps its id across status changes, so done's drop is a native transition
// from the full height working and blocked leave as the target.
function graph(status, g) {
  const bar = (i) => {
    const el = div().id(`bar-${i}`).w(2).flex_none().bg("#000000");
    const loop = ([from, to], period, easing = "ease-in-out") => el.h(to).loop("height", { from, to, period, easing });
    if (status === "working") return loop(g.working, WORKING_MS[i]);
    if (status === "blocked") return loop(g.blocked, 900);
    if (status === "done") return i === g.bars - 1 ? loop(g.beat, 4000) : el.h(g.base).transition("height", { duration: 1200, easing: "ease-out" });
    if (status === "idle") return i === 1 ? loop(g.idle, 6000) : el.h(g.base);
    return loop(g.unknown, UNKNOWN_MS[i], "linear");
  };
  return h_flex().h(g.area).flex_none().items_end().gap(1).children(Array.from({ length: g.bars }, (_, i) => bar(i)));
}
const two = (n) => String(n).padStart(2, "0");

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class BridgeTabs extends View {
  init() {
    this.pressed = null;
    this.panels = JSON.parse(localStorage.getItem("panels") ?? "{}");
  }

  // The side panel is remembered per space: switching shows that space's choice
  // (closed if it never had one), and opening or closing it records it.
  syncPanel(space, panel, body, enabled) {
    if (!space || !panel) return;
    const now = panel.hidden ? null : body?.active ?? null;
    if (space.id !== this.space) {
      const first = this.space === undefined;
      this.space = space.id; this.pending = null;
      if (!(first && !(space.id in this.panels))) {
        const stored = this.panels[space.id] ?? null, want = enabled.includes(stored) ? stored : null;
        if (want !== now) {
          this.pending = { want, until: Date.now() + 1000 };
          if (want) { run("layout.select", { stack: "panel-body", child: want }); run("layout.show", { id: "panel" }); }
          else run("layout.hide", { id: "panel" });
          return;
        }
      }
    }
    if (this.pending) {
      if (this.pending.want !== now && Date.now() < this.pending.until) return;
      this.pending = null;
    }
    if (this.panels[space.id] === now) return;
    this.panels[space.id] = now;
    localStorage.setItem("panels", JSON.stringify(this.panels));
  }

  render() {
    const space = spaces().find((p) => p.active);
    const shown = space?.tabs ?? [];
    const stop = (_e, cx) => cx.stop_propagation();

    const item = (c, i) => {
      const program = panes().find((p) => p.tab === c.id && p.program?.agent)?.program ?? panes().find((p) => p.tab === c.id)?.program;
      // An unnamed tab is called by its number, which the pill already shows: use the program instead.
      const name = /^(tb)?\d+$/.test(c.name) ? program?.name ?? "Terminal" : c.name;
      const blocked = c.status === "blocked";
      const fill = blocked ? C.red : c.active ? C.peach : C.plum;
      return h_flex().id(`tab-${c.id}`).h(28).flex_none().gap(3).cursor_pointer()
        .on_mouse_down("left", (e, cx) => { cx.stop_propagation(); this.pressed = i; if (e.click_count === 2) run("tab.rename", { id: c.id }); })
        .on_mouse_up("left", () => {
          const from = this.pressed; this.pressed = null;
          if (from !== null && from !== i) run("tab.move", { id: shown[from].id, index: space.tabs.findIndex((x) => x.id === c.id) + 1 });
          else run("tab.select", { id: c.id });
        })
        .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "menu", kind: "popup", width: 200, props: { tab: "tab", target: { id: c.id, space: space.id } } }); })
        .child(h_flex().h(28).px(14).gap(10).items_center().rounded_l(14).bg(fill)
          .text_size(16).font_semibold().text_color(C.ink).hover((s) => s.opacity(0.85))
          .child(div().font_bold().child(two(i + 1)))
          .child(div().max_w(170).truncate().child((c.zoomed ? `${name} · zoom` : name).toUpperCase()))
          .when(c.active, (el) => el.child(div().id(`close-${c.id}`).flex_none().rounded(8).p(2).hover((s) => s.bg("#00000026"))
            .on_mouse_down("left", stop).on_click((_e, cx) => { cx.stop_propagation(); run("tab.close", { id: c.id }); })
            .child(svg("mods/pane/close.svg").size(12)))))
        .child(graphHost(h_flex().w(12).h(28).flex_none().items_end().justify_center().pb(4).rounded_r(6)
          .bg(STATUS[c.status] ?? C.gray).child(graph(c.status, GRAPH.segment)), c.status));
    };

    const root = layout(), sidebar = find(root, "sidebar"), w = window();
    // With the sidebar hidden the window buttons sit on the tab bar: give them an orange cap.
    const lights = w?.platform === "macos" && w.titlebar === "none" && !w.fullscreen && root?.traffic_lights;
    const lead = lights ? Math.max(0, (root.traffic_lights[0] + 64) / settings().zoom - (sidebar?.hidden ? 0 : sidebar?.size?.px ?? 0)) : 0;

    const panel = find(root, "panel"), body = find(root, "panel-body");
    const enabled = shared("workspace.panels") ?? ["files", "changes"];
    this.syncPanel(space, panel, body, enabled);
    const panelButton = (id, label) => {
      const on = panel && !panel.hidden && body?.active === id;
      return h_flex().id(`panel-${id}`).h(28).px(10).flex_none().items_center()
        .bg(on ? C.peach : C.sky).text_size(14).font_semibold().text_color(C.ink)
        .hover((s) => s.opacity(0.85)).on_mouse_down("left", stop)
        .on_click(() => {
          if (on) run("layout.hide", { id: "panel" });
          else { run("layout.select", { stack: "panel-body", child: id }); run("layout.show", { id: "panel" }); }
        }).child(label);
    };
    const winButton = (id, label, action) => h_flex().id(id).h(28).px(10).flex_none().items_center().bg(C.periwinkle)
      .text_size(14).font_semibold().text_color(C.ink).hover((s) => s.opacity(0.85)).on_mouse_down("left", stop).on_click(action).child(label);
    const where = [space?.name, space?.machine ?? "this computer"].filter(Boolean).join(" · ").toUpperCase();

    return h_flex().font_family("Antonio").size_full().min_w(0).items_start().gap(4).bg(C.ink)
      .on_mouse_up("left", () => { this.pressed = null; })
      .on_scroll_wheel((e) => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
      .when(lead > 0, (el) => el.child(div().w(lead).h(28).flex_none().rounded_l(14).bg(C.orange)))
      // Tabs, +, and the filler share one scrolling row: the filler takes what the tabs leave.
      .child(h_flex().id("tab-scroll").flex_1().min_w(0).h(28).items_center().gap(4).overflow_x_scrollbar()
        .children(shown.map(item))
        .child(h_flex().id("tab-new").w(36).h(28).flex_none().items_center().justify_center().rounded(4).bg(C.orange)
          .text_color(C.ink).hover((s) => s.opacity(0.85)).on_mouse_down("left", stop)
          .on_click(() => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 }))
          .child(svg("mods/workspace-chrome/plus.svg").size(14)))
        .child(h_flex().flex_1().min_w(40).h(28).px(12).items_center().justify_end().bg(C.periwinkle)
          .text_size(14).font_semibold().text_color(C.ink).child(div().min_w(0).truncate().child(where))))
      .when(enabled.includes("files"), (el) => el.child(panelButton("files", "FILES")))
      .when(enabled.includes("changes"), (el) => el.child(panelButton("changes", "CHANGES")))
      .when(Boolean(w?.buttons), (el) => el
        .child(winButton("minimize", "MIN", () => run("window.minimize")))
        .child(winButton("maximize", w.maximized ? "RESTORE" : "MAX", () => run("window.maximize")))
        .child(winButton("close-window", "CLOSE", () => run("window.close"))))
      .child(div().w(28).h(28).flex_none().rounded_r(14).bg(C.periwinkle));
  }
}
