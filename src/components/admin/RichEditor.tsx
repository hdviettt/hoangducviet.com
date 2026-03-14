"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";

const lowlight = createLowlight(common);

// ---- Slash Command Menu ----

interface SlashItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
}

const slashItems: SlashItem[] = [
  {
    title: "Heading 1",
    description: "Large heading",
    icon: "H1",
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium heading",
    icon: "H2",
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small heading",
    icon: "H3",
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    icon: "•",
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    icon: "1.",
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Blockquote",
    description: "Quote block",
    icon: ">",
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Code with syntax highlighting",
    icon: "<>",
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Horizontal Rule",
    description: "Divider line",
    icon: "—",
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Upload or paste an image",
    icon: "🖼",
    command: (editor) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          const url = await uploadImage(file);
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }
      };
      input.click();
    },
  },
];

// ---- Image Upload ----

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/media", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  } catch {
    return null;
  }
}

// ---- Slash Menu Component ----

function SlashMenu({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = slashItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const execute = useCallback(
    (item: SlashItem) => {
      // Delete the "/" character that triggered the menu
      editor
        .chain()
        .focus()
        .deleteRange({
          from: editor.state.selection.from - 1 - query.length,
          to: editor.state.selection.from,
        })
        .run();
      item.command(editor);
      onClose();
    },
    [editor, onClose, query],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selected]) execute(filtered[selected]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="absolute z-50 bg-card border border-border shadow-lg w-64 max-h-72 overflow-y-auto">
      <div className="p-2 border-b border-border">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Filter..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>
      {filtered.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onClick={() => execute(item)}
          className={`w-full text-left px-3 py-2 flex items-center gap-3 text-sm transition-colors ${
            i === selected
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted text-foreground"
          }`}
        >
          <span className="w-6 text-center font-mono text-xs text-muted-foreground">
            {item.icon}
          </span>
          <div>
            <div className="font-medium">{item.title}</div>
            <div className="text-xs text-muted-foreground">
              {item.description}
            </div>
          </div>
        </button>
      ))}
      {filtered.length === 0 && (
        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
          No results
        </div>
      )}
    </div>
  );
}

// ---- Toolbar Button ----

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-xs font-mono transition-colors ${
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ---- Main Editor ----

interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const [showSlash, setShowSlash] = useState(false);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing, or type "/" for commands...' }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "article-content prose-editor focus:outline-none min-h-[400px] px-4 py-3",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "/" && !showSlash) {
          // Show slash menu after the "/" is typed
          setTimeout(() => {
            const coords = _view.coordsAtPos(_view.state.selection.from);
            const editorRect = editorRef.current?.getBoundingClientRect();
            if (editorRect) {
              setSlashPos({
                top: coords.bottom - editorRect.top + 4,
                left: coords.left - editorRect.left,
              });
            }
            setShowSlash(true);
          }, 10);
          return false;
        }
        if (event.key === "Escape" && showSlash) {
          setShowSlash(false);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadImage(file).then((url) => {
                if (url) {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({ src: url });
                  const tr = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(tr);
                }
              });
            }
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;

        for (const file of files) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            uploadImage(file).then((url) => {
              if (url) {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const tr = view.state.tr.insert(pos ?? view.state.selection.from, node);
                view.dispatch(tr);
              }
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
      onChange(md);
      // Close slash menu if user typed something else
      if (showSlash) {
        const { from } = editor.state.selection;
        const text = editor.state.doc.textBetween(
          Math.max(0, from - 20),
          from,
        );
        if (!text.includes("/")) {
          setShowSlash(false);
        }
      }
    },
  });

  // Close slash menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showSlash) setShowSlash(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showSlash]);

  if (!editor) return null;

  return (
    <div ref={editorRef} className="border border-border bg-background relative flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-card overflow-x-auto sticky top-0 z-10 shrink-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          I
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          S̶
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          {"</>"}
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          {">"}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          {"{ }"}
        </ToolbarButton>

        <span className="w-px h-5 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          —
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = prompt("Enter link URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive("link")}
          title="Insert link"
        >
          🔗
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (file) {
                const url = await uploadImage(file);
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              }
            };
            input.click();
          }}
          title="Upload image"
        >
          IMG
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <EditorContent editor={editor} />

        {/* Slash Command Menu */}
        {showSlash && (
          <div style={{ position: "absolute", top: slashPos.top, left: slashPos.left }}>
            <SlashMenu editor={editor} onClose={() => setShowSlash(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
