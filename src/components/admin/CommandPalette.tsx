"use client";

import { useTheme } from "@/components/admin/ThemeProvider";
import { Icon } from "@/components/ui/Icon";
import {
  type CommandId,
  OUTLINE_EVENT,
  type OutlineItem,
  gotoHeading,
  runCommand,
} from "@/lib/admin-events";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * One surface, five jobs, selected by a prefix character.
 *
 * Zed, Linear and Superhuman all settle on Cmd/Ctrl+K for "invoke something",
 * so this uses that rather than inventing a binding. The prefixes are what
 * stop it turning into a second navigation system: without them you would need
 * a separate palette per kind of thing, and then a way to choose between
 * palettes, which is the problem the palette was supposed to remove.
 *
 * Editor-scoped commands are dispatched as window events rather than wired
 * through props, because the palette lives in the layout and the editor does
 * not exist on most routes.
 */

interface PaletteProps {
  posts: Array<{ slug: string; title: string; status: string }>;
  series: Array<{ slug: string; title: string }>;
  /** True while a post edit route is open, so editor commands are offered. */
  inEditor: boolean;
}

const PREFIXES = [
  { char: ">", label: "commands" },
  { char: "#", label: "headings in this post" },
  { char: "@", label: "media" },
  { char: ":", label: "widgets" },
];

export default function CommandPalette({
  posts,
  series,
  inEditor,
}: PaletteProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const router = useRouter();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onOutline = (e: Event) =>
      setOutline((e as CustomEvent<OutlineItem[]>).detail ?? []);
    window.addEventListener(OUTLINE_EVENT, onOutline);
    return () => window.removeEventListener(OUTLINE_EVENT, onOutline);
  }, []);

  // Reset the query on close so reopening never lands mid-search.
  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const mode = useMemo(() => {
    const c = q.charAt(0);
    const hit = PREFIXES.find((p) => p.char === c);
    return {
      prefix: hit?.char ?? null,
      label: hit?.label ?? null,
      term: hit ? q.slice(1) : q,
    };
  }, [q]);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const fire = useCallback(
    (id: CommandId) => {
      close();
      runCommand(id);
    },
    [close],
  );

  if (!open) return null;

  const showPosts = mode.prefix === null;
  const showCommands = mode.prefix === ">" || mode.prefix === null;
  const showOutline = mode.prefix === "#";
  const showMedia = mode.prefix === "@";
  const showWidgets = mode.prefix === ":";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-md-scrim/50"
      onMouseDown={close}
    >
      <Command
        label="Command palette"
        loop
        shouldFilter
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] rounded-xl border border-md-outline bg-md-surface-container-highest shadow-md-4 overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 h-12 border-b border-md-outline-variant">
          <span className="text-md-on-surface-variant shrink-0">
            <Icon name="search" size={16} />
          </span>
          <Command.Input
            autoFocus
            value={q}
            onValueChange={setQ}
            placeholder="Search posts, or type > # @ :"
            className="flex-1 bg-transparent text-[15px] text-md-on-surface placeholder:text-md-on-surface-variant/70 focus:outline-none"
          />
          {mode.label && (
            <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-md-primary/15 text-md-primary">
              {mode.label}
            </span>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="shrink-0 text-md-on-surface-variant hover:text-md-on-surface transition-colors duration-fast"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <Command.List className="max-h-[min(52vh,420px)] overflow-y-auto py-1.5">
          <Command.Empty className="px-4 py-6 text-center text-[13px] text-md-on-surface-variant">
            Nothing matches.
          </Command.Empty>

          {showCommands && (
            <Group heading="Commands">
              {inEditor && (
                <>
                  <Row onSelect={() => fire("publish")} icon="check" hint="⌘⇧P">
                    Publish or unpublish this post
                  </Row>
                  <Row onSelect={() => fire("save")} icon="refresh" hint="⌘S">
                    Save now
                  </Row>
                  <Row
                    onSelect={() => fire("split")}
                    icon="vertical_split"
                    hint="⌘\"
                  >
                    Split with live preview
                  </Row>
                  <Row onSelect={() => fire("preview")} icon="visibility">
                    Preview full width
                  </Row>
                  <Row
                    onSelect={() => fire("drawer")}
                    icon="right_panel_open"
                    hint="⌘."
                  >
                    Toggle metadata drawer
                  </Row>
                  <Row
                    onSelect={() => fire("zen")}
                    icon="fullscreen"
                    hint="⌘K Z"
                  >
                    Zen mode
                  </Row>
                </>
              )}
              <Row onSelect={() => go("/admin/posts/new")} icon="add" hint="N">
                New post
              </Row>
              <Row
                onSelect={() => {
                  close();
                  toggle();
                }}
                icon={theme === "dark" ? "light_mode" : "dark_mode"}
              >
                Switch to {theme === "dark" ? "light" : "dark"} theme
              </Row>
              <Row onSelect={() => go("/admin/media")} icon="image">
                Media library
              </Row>
              <Row onSelect={() => go("/admin/internal-links")} icon="link">
                Internal links
              </Row>
              <Row onSelect={() => go("/admin/settings")} icon="settings">
                Settings
              </Row>
            </Group>
          )}

          {showOutline && (
            <Group heading="Headings">
              {outline.length === 0 && (
                <Row onSelect={close} icon="format_list_bulleted">
                  No headings in this document
                </Row>
              )}
              {outline.map((h) => (
                <Row
                  key={h.id}
                  onSelect={() => {
                    close();
                    gotoHeading(h.id);
                  }}
                  icon="format_list_bulleted"
                  indent={h.level - 1}
                >
                  {h.text}
                </Row>
              ))}
            </Group>
          )}

          {showMedia && (
            <Group heading="Media">
              <Row onSelect={() => go("/admin/media")} icon="image">
                Open the media library
              </Row>
            </Group>
          )}

          {showWidgets && (
            <Group heading="Widgets">
              <Row onSelect={close} icon="widgets">
                Type / inside the editor to insert a widget
              </Row>
            </Group>
          )}

          {showPosts && (
            <>
              <Group heading="Posts">
                {posts.slice(0, 40).map((p) => (
                  <Row
                    key={p.slug}
                    onSelect={() => go(`/admin/posts/${p.slug}/edit`)}
                    icon="description"
                    hint={p.status === "published" ? undefined : "draft"}
                  >
                    {p.title}
                  </Row>
                ))}
              </Group>
              <Group heading="Collections">
                {series.slice(0, 20).map((s) => (
                  <Row
                    key={s.slug}
                    onSelect={() => go(`/admin/projects/${s.slug}/edit`)}
                    icon="folder"
                  >
                    {s.title}
                  </Row>
                ))}
              </Group>
            </>
          )}
        </Command.List>

        <div className="flex items-center gap-3 px-4 h-8 border-t border-md-outline-variant text-[11px] font-mono text-md-on-surface-variant">
          {PREFIXES.map((p) => (
            <span key={p.char}>
              <span className="text-md-primary">{p.char}</span> {p.label}
            </span>
          ))}
        </div>
      </Command>
    </div>
  );
}

function Group({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-md-on-surface-variant/70"
    >
      {children}
    </Command.Group>
  );
}

function Row({
  children,
  onSelect,
  icon,
  hint,
  indent = 0,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon: string;
  hint?: string;
  indent?: number;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2.5 px-4 h-8 text-[13.5px] text-md-on-surface-variant cursor-pointer data-[selected=true]:bg-md-primary/15 data-[selected=true]:text-md-on-surface"
      style={{ paddingLeft: 16 + indent * 12 }}
    >
      <span className="shrink-0 opacity-70">
        <Icon name={icon} size={15} />
      </span>
      <span className="truncate">{children}</span>
      {hint && (
        <span className="ml-auto shrink-0 text-[11px] font-mono text-md-on-surface-variant/70">
          {hint}
        </span>
      )}
    </Command.Item>
  );
}
