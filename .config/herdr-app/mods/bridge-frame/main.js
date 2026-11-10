// LCARS-style frame pieces for the `bridge` layout. One mod, several parts,
// chosen by props().part:
//   top     the upper elbow: the macOS window buttons sit on it; search and sidebar buttons
//   bottom  the lower elbow
//   rail    a sidebar rail segment beside a list; props().section picks its color and count
//   footer  Settings and Add machine as pill buttons
// Fonts: all SIL OFL 1.1, in ./fonts, loaded for the whole layout. Barlow Semi Condensed is the
// layout's ui_font (Herdr's own panels); Antonio is set on the root of every bridge-* view.

import { View, div, svg } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { props, run, spaces, agents, updates, layout, window, shared, setShared } from "herdr";

const C = {
  orange: "#ff9966", peach: "#ffcc99", lavender: "#cc99cc", periwinkle: "#9999ff",
  gold: "#ffcc66", sky: "#99ccff", ink: "#000000",
};
const RAIL = { spaces: C.orange, agents: C.lavender, footer: C.gold };

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// The sidebar's rail goes by its width, as in Herdr's own mods.
const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

// To the rail (on macOS wide enough for the traffic lights), or back to the width it had.
function toggleSidebar() {
  const width = find(layout(), "sidebar")?.size?.px;
  if (!narrow()) setShared("sidebar.width", width);
  setShared("sidebar.collapsed", !narrow());
  run("layout.resize", { id: "sidebar", px: narrow() ? (shared("sidebar.width") ?? 260) : window()?.platform === "macos" ? 76 : 44 });
}

const two = (n) => String(n).padStart(2, "0");
const stop = (_e, cx) => cx.stop_propagation();

export default class BridgeFrame extends View {
  icon(id, name, action) {
    return div().id(id).size(22).flex_none().flex().items_center().justify_center().rounded(11)
      .text_color(C.ink).hover((s) => s.bg("#00000026"))
      .on_mouse_down("left", stop).on_click(action)
      .child(svg(`mods/workspace-chrome/${name}.svg`).size(14));
  }

  top() {
    const collapsed = narrow();
    return div().id("elbow-top").relative().size_full().bg(C.orange).rounded_tl(30)
      .when(!collapsed, (el) => el.child(h_flex().absolute().top(0).right(0).h(28).pr(10).gap(2).items_center()
        .child(this.icon("search", "search", () => run("mod.open", { name: "picker" })))
        .child(this.icon("sidebar-toggle", "sidebar", toggleSidebar))
        .child(div().pl(6).text_size(19).font_bold().text_color(C.ink).child("HERDR"))))
      .child(div().absolute().left(36).right(0).bottom(0).h(16).bg(C.ink).rounded_tl(16));
  }

  bottom() {
    return div().id("elbow-bottom").relative().size_full().bg(C.gold).rounded_bl(26)
      .child(div().absolute().left(36).right(0).top(0).h(12).bg(C.ink).rounded_bl(12))
      .when(!narrow(), (el) => el.child(h_flex().absolute().right(12).bottom(0).h(24).items_center()
        .text_size(14).font_bold().text_color(C.ink).child("HERDR-CORE")));
  }

  rail() {
    const section = props()?.section;
    const n = section === "spaces" ? spaces().length : section === "agents" ? agents().length : null;
    return v_flex().size_full().bg(RAIL[section] ?? C.periwinkle).justify_end().items_end().p(6)
      .text_size(14).font_bold().text_color(C.ink)
      .when(n !== null, (el) => el.child(two(n)));
  }

  footer() {
    const collapsed = narrow();
    const pill = (id, bg, icon, label, action, dot) => h_flex().id(id).h(30).flex_none().gap(8).items_center()
      .px(collapsed ? 0 : 14).when(collapsed, (el) => el.justify_center())
      .rounded_l(15).rounded_r(4).bg(bg).text_size(15).font_semibold().text_color(C.ink)
      .cursor_pointer().hover((s) => s.opacity(0.85)).on_click(action)
      .when(collapsed, (el) => el.child(svg(`mods/workspace-chrome/${icon}.svg`).size(14)))
      .when(!collapsed, (el) => el.child(div().flex_1().child(label)))
      .when(dot && !collapsed, (el) => el.child(div().size(8).rounded(4).bg(C.ink)));
    return v_flex().size_full().justify_center().gap(6).pr(collapsed ? 0 : 4)
      .child(pill("settings", C.sky, "settings", "SETTINGS", () => run("app.settings"), Boolean(updates()?.app?.ready)))
      .child(pill("machine", C.peach, "plus", "ADD MACHINE", () => run("mod.open", { name: "machine-add" }), false));
  }

  render() {
    const part = props()?.part;
    const body = part === "top" ? this.top() : part === "bottom" ? this.bottom() : part === "footer" ? this.footer() : this.rail();
    return body.font_family("Antonio");
  }
}
