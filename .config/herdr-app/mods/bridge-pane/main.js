// LCARS pane header for the `bridge` layout, built from Herdr's `pane` mod:
//   { "tab": "active", "pane": { "header": { "content": { "mod": "bridge-pane" } } } }
// End cap, a bar with the program and folder, the agent's status block, then
// SPLIT R / SPLIT D / ZOOM / CLOSE (hidden when the pane is narrow), end cap.
// Focused: orange bars. Blocked: red bars, status flashes. Otherwise gray.
// The status block carries the Tricorder bar graph after its word.
// Props from the app: { pane, terminal }. Click: focus the pane.

import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, home } from "herdr";

const C = {
  orange: "#ff9966", red: "#ff5544", gold: "#ffcc66", sky: "#99ccff", coral: "#ff7766",
  gray: "#8a8a99", dimbar: "#34343f", dimtext: "#b8b8c8", ink: "#000000",
};
const STATUS = { working: C.gold, blocked: C.red, done: C.sky, idle: C.gray };
const WORD = { working: "WORKING", blocked: "BLOCKED", done: "DONE", idle: "IDLE" };
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
// The header's block is 20 px tall, not 22: its graph scales with it.
const PANE_GRAPH = scaleGraph(GRAPH.block, 20 / 22);

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class BridgePane extends View {
  init() { this.width = 0; }

  me() {
    return panes().find((p) => p.pane === props()?.pane);
  }

  render() {
    const p = this.me();
    if (!p) return div();
    const name = ((p.program?.agent || p.program?.shell) && p.program.name) || p.title || p.program?.name || "shell";
    const st = p.status;
    const pane = p.pane;
    const lit = p.focused || st === "blocked";
    const bar = st === "blocked" ? C.red : p.focused ? C.orange : C.dimbar;
    const ink = lit ? C.ink : C.dimtext;
    const roomy = this.width === 0 || this.width > 460;
    const button = (id, label, bg, command, args) => h_flex().id(id).h(20).px(8).flex_none().items_center().rounded(2)
      .bg(lit ? bg : C.dimbar).text_size(13).font_semibold().text_color(ink)
      .hover((s) => s.opacity(0.8))
      .on_click((_e, cx) => { cx.stop_propagation(); run(command, args); })
      .child(label);
    return h_flex().id(`pane-head-${pane}`).font_family("Antonio").size_full().pt(3).px(3).gap(3).items_start().bg(C.ink)
      .on_size_change((size, cx) => { if (Math.abs(size.width - this.width) > 1) { this.width = size.width; cx.notify(); } })
      .on_click(() => run("pane.focus", { pane }))
      .child(div().w(14).h(20).flex_none().rounded_l(10).rounded_r(2).bg(bar))
      .child(h_flex().flex_1().min_w(0).h(20).px(8).gap(10).items_center().rounded(2).bg(bar)
        .text_size(14).font_semibold().text_color(ink)
        .child(div().flex_none().max_w(220).truncate().child(name.toUpperCase()))
        .child(div().flex_1().min_w(0).truncate().font_normal().child(folder(p.cwd).toUpperCase())))
      .when(Boolean(WORD[st]), (el) => el.child(graphHost(h_flex().w(84).h(20).flex_none().items_center().justify_center().gap(5).rounded(2)
        .bg(STATUS[st]).text_size(13).font_bold().text_color(C.ink)
        .child(WORD[st]).child(graph(st, PANE_GRAPH)), st)))
      .when(roomy, (el) => el
        .child(button(`ph-r-${pane}`, "SPLIT R", C.sky, "pane.split", { direction: "right", pane }))
        .child(button(`ph-d-${pane}`, "SPLIT D", C.sky, "pane.split", { direction: "down", pane }))
        .child(button(`ph-z-${pane}`, p.zoomed ? "UNZOOM" : "ZOOM", C.sky, "pane.zoom", { pane }))
        .child(button(`ph-x-${pane}`, "CLOSE", C.coral, "pane.close", { pane })))
      .child(div().w(14).h(20).flex_none().rounded_l(2).rounded_r(10).bg(bar));
  }
}
