import { View, div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, run, openOverlay, theme, window, shared, layout, settings, props } from "herdr";

// The islands' fill at the opacity in islands-workspace-chrome/settings.json (1 when unset).
const islandFill = (c) => {
  const o = shared("islands.opacity");
  if (typeof o !== "number" || o >= 1 || !/^#[0-9a-f]{6}$/i.test(c)) return c;
  return c + Math.round(Math.max(0, o) * 255).toString(16).padStart(2, "0");
};

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class Tabs extends View {
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
    // Until the restore lands (or something else won), the old state isn't a choice.
    if (this.pending) {
      if (this.pending.want !== now && Date.now() < this.pending.until) return;
      this.pending = null;
    }
    if (this.panels[space.id] === now) return;
    this.panels[space.id] = now;
    localStorage.setItem("panels", JSON.stringify(this.panels));
  }

  // Which tabs the strip shows. All at full width when they fit. Otherwise the others shrink to
  // icons, and if even that is too wide, the run around the active tab that fits. The wheel and
  // clicks on the faded edge tabs reach the rest.
  fitTabs(tabs, width) {
    const room = this.stripWidth, gap = 3;
    const full = tabs.map(c => width(c, false));
    if (!room || full.reduce((n, w) => n + w + gap, -gap) <= room) return { compact: false, from: 0, to: tabs.length };
    const w = tabs.map((c, i) => c.active ? full[i] : width(c, true));
    const a = Math.max(0, tabs.findIndex(c => c.active));
    let from = a, to = a + 1, used = w[a] ?? 0, grew = true;
    while (grew) {
      grew = false;
      if (to < tabs.length && used + gap + w[to] <= room) { used += gap + w[to]; to++; grew = true; }
      if (from > 0 && used + gap + w[from - 1] <= room) { from--; used += gap + w[from]; grew = true; }
    }
    return { compact: true, from, to: Math.max(to, from + 1) };
  }

  render() {
    const t = theme();
    const space = spaces().find(p => p.active);
    const shown = space?.tabs ?? [];
    const stop = (_e, cx) => cx.stop_propagation();
    const button = (id, label, action, pill = false) => div().id(id).size(26).flex_none().flex().items_center().justify_center().rounded(6).text_color(t.dim)
      .when(pill, el => el.bg(t.surface).border(1).border_color(t.border)) // neutral pill, like a tab
      .hover(s => s.bg(t.hover).text_color(t.foreground))
      .on_mouse_down("left", stop).on_click(action).child(label);
    const info = (c) => {
      const program = panes().find(p => p.tab === c.id && p.program?.agent)?.program ?? panes().find(p => p.tab === c.id)?.program;
      const name = /^tb\d+$/.test(c.name) ? program?.name ?? "Terminal" : c.name;
      return { program, name: c.zoomed ? `${name} Z` : name };
    };
    // Mods can't measure text, so tab widths are estimated (12 px Geist, about 6.2 px a character).
    const width = (c, compact) => {
      const { program, name } = info(c);
      if (compact) return 2 + 20 + (program?.icon ? 14 : 8);
      const status = ["working", "blocked", "done"].includes(c.status) ? 19 : 0;
      return 30 + (program?.icon ? 21 : 0) + Math.min(name.length * 6.2, 170) + status + (c.active ? 19 : 0);
    };
    const fit = this.fitTabs(shown, width);
    // compact: icon only (first letter without one), name in a tooltip. faded: more tabs are hidden past it.
    const item = (c, i, compact, faded) => {
      const { program, name } = info(c);
      return h_flex().id(`tab-${c.id}`).h_full().px(compact ? 10 : 14).gap(7).rounded(14).items_center().flex_none().text_size(12) // as tall and round as the Herdr card
        .when(compact, el => el.tooltip(name)).when(faded, el => el.opacity(0.4))
        .border(1).border_color(t.border).bg(islandFill(t.surface)).text_color(c.active ? t.ansi3 : t.muted) // every tab is a pill, the active one in the theme's yellow (ansi3), like the branch pill
        .hover(s => s.bg(t.hover))
        .on_mouse_down("left", (e, cx) => { cx.stop_propagation(); this.pressed = i; if (e.click_count === 2) run("tab.rename", { id: c.id }); })
        .on_mouse_up("left", () => {
          const from = this.pressed; this.pressed = null;
          if (from !== null && from !== i) run("tab.move", { id: shown[from].id, index: space.tabs.findIndex(x => x.id === c.id) + 1 });
          else run("tab.select", { id: c.id });
        })
        .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "menu", kind: "popup", width: 200, props: { tab: "tab", target: { id: c.id, space: space.id } } }); })
        .when(Boolean(program?.icon), el => el.child(program.tint ? svg(program.icon).size(14).text_color(c.active ? t.ansi3 : t.muted) : image(program.icon).size(14)))
        .when(!compact || !program?.icon, el => el.child(div().max_w(170).truncate().child(compact ? name.slice(0, 1) : name)))
        .when(c.status === "working", el => el.child(svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900)))
        .when(c.status === "blocked" || c.status === "done", el => el.child(div().size(6).rounded(3).bg(t[c.status])))
        .when(c.active, el => el.child(div().id(`close-${c.id}`).text_color(t.dim).on_mouse_down("left", stop).on_click((_e, cx) => { cx.stop_propagation(); run("tab.close", { id: c.id }); }).child(svg("mods/pane/close.svg").size(12))));
    };
    const root = layout(), sidebar = find(root, "sidebar"), w = window();
    // Old saved rails and a dragged-narrow sidebar can be smaller than the window buttons.
    const lightsPadding = w?.platform === "macos" && w.titlebar === "none" && !w.fullscreen && root?.traffic_lights
      ? Math.max(10, (root.traffic_lights[0] + 64) / settings().zoom - (sidebar?.hidden ? 0 : sidebar?.size?.px ?? 0))
      : 0; // tabs line up with the main panel's left edge
    const panel = find(root, "panel"), body = find(root, "panel-body");
    const enabled = shared("workspace.panels") ?? ["files", "changes"];
    // props.part: "tabs" draws only the tab strip, "actions" only the button card, unset both.
    const part = props()?.part;
    if (part !== "tabs") this.syncPanel(space, panel, body, enabled);
    const panelButton = (id, icon) => {
      const on = panel && !panel.hidden && body?.active === id;
      return h_flex().id(`panel-${id}`).size(26).flex_none().items_center().justify_center().rounded(6)
        .border(1).border_color(on ? t.accent : "#00000000").text_color(on ? t.accent : t.muted)
        .hover(s => s.bg(t.hover)).on_mouse_down("left", stop)
        .on_click(() => {
          if (on) run("layout.hide", { id: "panel" });
          else { run("layout.select", { stack: "panel-body", child: id }); run("layout.show", { id: "panel" }); }
        }).child(svg(icon).size(14));
    };
    // The buttons on the right share one card, like the sidebar's, flush with the main panel's right edge.
    const actions = h_flex().id("tab-actions").flex_none().h_full().px(10).gap(2).items_center().rounded(14).bg(islandFill(t.chrome)).border(1).border_color(t.border)
        .child(button("tab-new", "+", () => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 })))
        .when(enabled.includes("files"), el => el.child(panelButton("files", "mods/files/file.svg")))
        .when(enabled.includes("changes"), el => el.child(panelButton("changes", "mods/changes/changes.svg")))
        .when(w?.buttons, el => el.child(div().w(1).h(16).mx(3).flex_none().bg(t.border))
          .child(button("minimize", w.platform === "windows" ? svg("mods/islands-tabs/win-min.svg").size(16) : "−", () => run("window.minimize")))
          .child(button("maximize", w.platform === "windows" ? svg(`mods/islands-tabs/${w.maximized ? "win-restore" : "win-max"}.svg`).size(16) : "□", () => run("window.maximize")))
          .child(button("close-window", w.platform === "windows" ? svg("mods/islands-tabs/win-close.svg").size(16) : svg("mods/pane/close.svg").size(13), () => run("window.close"))));
    if (part === "actions") return h_flex().size_full().justify_end().items_center().child(actions);
    return h_flex().size_full().min_w(0).pl(lightsPadding).gap(3).items_center() // no fill: the canvas shows through
      .on_mouse_up("left", () => { this.pressed = null; })
      .on_scroll_wheel(e => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
      .child(h_flex().id("tab-scroll").flex_1().min_w(0).h_full().items_center().gap(3).overflow_x_scrollbar()
        .on_size_change((s, cx) => { const w = Math.floor(s.width); if (w !== this.stripWidth) { this.stripWidth = w; cx.notify(); } })
        .children(shown.slice(fit.from, fit.to).map((c, k) => {
          const i = fit.from + k;
          return item(c, i, fit.compact && !c.active, (k === 0 && fit.from > 0) || (i === fit.to - 1 && fit.to < shown.length));
        })))
      .when(part !== "tabs", el => el.child(actions));
  }
}
