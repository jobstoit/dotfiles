// LCARS status strip for the `bridge` layout, built from Herdr's `workspace-status`.
// Sits on the bottom 24 px of its 36 px block, beside the lower elbow:
// machine (and branch) | space count | agents | filler | clock | palette key | end cap.

import { View, div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, agents, run, window, keys } from "herdr";

const C = {
  orange: "#ff9966", peach: "#ffcc99", lavender: "#cc99cc", periwinkle: "#9999ff",
  gold: "#ffcc66", red: "#ff5544", sky: "#99ccff", ink: "#000000",
};

const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default class BridgeStatus extends View {
  init(_props, cx) {
    this.time = clock();
    // The clock shows minutes: check every 10 s, redraw only when it changes.
    cx.timer.every(10000, (cx) => {
      const now = clock();
      if (now !== this.time) { this.time = now; cx.notify(); }
    });
  }

  // The palette key as actually bound, not a hardcoded one.
  hint() {
    const mac = window()?.platform === "macos";
    const mod = { cmd: mac ? "⌘" : "Ctrl+", ctrl: mac ? "⌃" : "Ctrl+", shift: mac ? "⇧" : "Shift+", alt: mac ? "⌥" : "Alt+", option: mac ? "⌥" : "Alt+" };
    const b = keys().find((k) => k.section === "global" && k.action === "app.palette");
    const parts = b && b.keys.endsWith("--") ? [...b.keys.slice(0, -2).split("-"), "-"] : b?.keys.split("-");
    const key = parts && parts.map((p) => mod[p.toLowerCase()] ?? p.toUpperCase()).join("");
    return key ? `${key} COMMANDS` : "COMMANDS";
  }

  render() {
    const all = spaces();
    const space = all.find((s) => s.active);
    const list = agents();
    const needs = list.filter((a) => a.status === "blocked").length;
    const working = list.filter((a) => a.status === "working").length;
    const agentText = needs
      ? `${needs} BLOCKED · ${working} WORKING`
      : `${list.length} AGENT${list.length === 1 ? "" : "S"}${working ? ` · ${working} WORKING` : ""}`;
    const where = [space?.machine ?? "this computer", space?.branch].filter(Boolean).join(" · ").toUpperCase();
    const seg = (id, bg, text) => h_flex().id(id).h(24).px(12).flex_none().items_center().bg(bg).child(text);
    return h_flex().font_family("Antonio").size_full().items_end().gap(4).bg(C.ink).text_size(14).font_semibold().text_color(C.ink)
      .child(seg("st-where", C.gold, where))
      .child(seg("st-spaces", C.peach, `${all.length} SPACE${all.length === 1 ? "" : "S"}`))
      .child(seg("st-agents", needs ? C.red : C.lavender, agentText))
      .child(div().flex_1().min_w(0).h(24).bg(C.periwinkle))
      .child(seg("st-clock", C.sky, this.time))
      .child(seg("palette", C.orange, this.hint()).cursor_pointer().hover((s) => s.opacity(0.85)).on_click(() => run("app.palette")))
      .child(div().w(24).h(24).flex_none().rounded_r(12).bg(C.orange));
  }
}
