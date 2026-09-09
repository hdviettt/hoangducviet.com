/**
 * Window events the admin surfaces talk to each other with.
 *
 * The editor, the navigation panel and the command palette all live in
 * different parts of the tree: the nav and the palette are mounted by the
 * layout, the editor by a page. Lifting their shared state into a provider
 * would mean the layout holding editor state on every route that has no
 * editor. Three named events are smaller and each one is one-directional.
 */

export interface OutlineItem {
  /** The heading's ProseMirror document position, as a string. */
  id: string;
  text: string;
  level: number;
}

/** Editor -> nav/palette: here is the current document's heading list. */
export const OUTLINE_EVENT = "admin:outline";

/** Nav/palette -> editor: scroll to this heading. */
export const OUTLINE_GOTO_EVENT = "admin:outline-goto";

/** Palette -> editor: run an editor command. */
export const CMD_EVENT = "admin:cmd";

export type CommandId =
  | "save"
  | "publish"
  | "zen"
  | "preview"
  | "drawer"
  | "split";

export function runCommand(id: CommandId) {
  window.dispatchEvent(new CustomEvent(CMD_EVENT, { detail: id }));
}

export function publishOutline(items: OutlineItem[]) {
  window.dispatchEvent(new CustomEvent(OUTLINE_EVENT, { detail: items }));
}

export function gotoHeading(id: string) {
  window.dispatchEvent(new CustomEvent(OUTLINE_GOTO_EVENT, { detail: id }));
}
