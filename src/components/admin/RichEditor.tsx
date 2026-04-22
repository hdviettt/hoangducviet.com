"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import TableControls from "@/components/admin/TableControls";
import StreakEffects from "@/components/admin/StreakEffects";
import { widgetRegistry } from "@/components/widgets/registry";
import {
  MathInline,
  MathBlock,
  preprocessMathInMarkdown,
} from "@/components/admin/extensions/MathExtension";
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
  isImagePicker?: boolean;
  isWidgetPicker?: boolean;
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
    title: "Table",
    description: "Insert a table",
    icon: "⊞",
    command: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Visual Embed",
    description: "Render HTML/SVG code inline",
    icon: "◆",
    command: (editor) =>
      editor.chain().focus().setCodeBlock({ language: "render" }).run(),
  },
  {
    title: "Widget",
    description: "Insert interactive widget",
    icon: "⚡",
    command: () => {},
    isWidgetPicker: true,
  },
  {
    title: "Math Inline",
    description: "Inline LaTeX formula ($...$)",
    icon: "∑",
    command: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({ type: "mathInline", attrs: { latex: "" } })
        .run(),
  },
  {
    title: "Math Block",
    description: "Display equation ($$...$$)",
    icon: "∫",
    command: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({ type: "mathBlock", attrs: { latex: "" } })
        .run(),
  },
  {
    title: "Image",
    description: "Choose from library or upload",
    icon: "🖼",
    command: () => {
      // Handled specially via onImagePicker callback in SlashMenu
    },
    isImagePicker: true,
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
  onImagePicker,
  onWidgetPicker,
}: {
  editor: Editor;
  onClose: () => void;
  onImagePicker: () => void;
  onWidgetPicker: () => void;
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
      // Delete only the "/" character that triggered the menu
      // (query characters go into the filter input, not the editor)
      editor
        .chain()
        .focus()
        .deleteRange({
          from: editor.state.selection.from - 1,
          to: editor.state.selection.from,
        })
        .run();
      if (item.isImagePicker) {
        onClose();
        onImagePicker();
      } else if (item.isWidgetPicker) {
        onClose();
        onWidgetPicker();
      } else {
        item.command(editor);
        onClose();
      }
    },
    [editor, onClose, onImagePicker],
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
    } else if (e.key === "Backspace" && query === "") {
      e.preventDefault();
      // Close menu but keep the "/" — user can delete it normally after
      editor.chain().focus().run();
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
  onChange: (value: string) => void;
  outputFormat?: "markdown" | "html";
}

export default function RichEditor({ content, onChange, outputFormat = "markdown" }: RichEditorProps) {
  const [showSlash, setShowSlash] = useState(false);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Image picker modal state
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerItems, setImagePickerItems] = useState<Array<{ id: number; filename: string; originalName: string; mimeType: string | null; url: string }>>([]);
  const [imagePickerLoading, setImagePickerLoading] = useState(false);
  const [imagePickerSearch, setImagePickerSearch] = useState("");
  const [imagePickerUploading, setImagePickerUploading] = useState(false);

  // Widget picker state
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [widgetPropsText, setWidgetPropsText] = useState("");

  const openWidgetPicker = useCallback(() => {
    setShowWidgetPicker(true);
    setSelectedWidget(null);
    setWidgetPropsText("");
  }, []);

  const openImagePicker = useCallback(async () => {
    setShowImagePicker(true);
    setImagePickerSearch("");
    setImagePickerLoading(true);
    const res = await fetch("/api/media");
    if (res.ok) setImagePickerItems(await res.json());
    setImagePickerLoading(false);
  }, []);

  const handleImagePickerUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePickerUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setShowImagePicker(false);
      // Insert after a tick so editor regains focus
      setTimeout(() => {
        editorInstance.current?.chain().focus().setImage({ src: url }).run();
      }, 10);
    }
    setImagePickerUploading(false);
    e.target.value = "";
  }, []);

  const selectImageFromPicker = useCallback((url: string) => {
    setShowImagePicker(false);
    setTimeout(() => {
      editorInstance.current?.chain().focus().setImage({ src: url }).run();
    }, 10);
  }, []);

  const insertWidget = useCallback(() => {
    if (!selectedWidget) return;
    setShowWidgetPicker(false);
    const propsText = widgetPropsText.trim() || "{}";
    setTimeout(() => {
      editorInstance.current
        ?.chain()
        .focus()
        .insertContent({
          type: "codeBlock",
          attrs: { language: `widget:${selectedWidget}` },
          content: [{ type: "text", text: propsText }],
        })
        .run();
    }, 10);
  }, [selectedWidget, widgetPropsText]);

  const editorInstance = useRef<ReturnType<typeof useEditor> | null>(null);
  const initialContent = useRef(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.extend({
        addStorage() {
          return {
            markdown: {
              serialize(state: any, node: any) {
                state.write(
                  "![" +
                    state.esc(node.attrs.alt || "") +
                    "](" +
                    state.esc(node.attrs.src || "") +
                    (node.attrs.title
                      ? ' "' + node.attrs.title.replace(/"/g, '\\"') + '"'
                      : "") +
                    ")",
                );
                state.closeBlock(node);
              },
              parse: {},
            },
          };
        },
      }).configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      MathInline,
      MathBlock,
      Placeholder.configure({ placeholder: 'Start writing, or type "/" for commands...' }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: "",
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
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        // VS Code puts vscode-editor-data on the clipboard and wraps text
        // in <pre><code>, which Tiptap interprets as a code block.
        // Force plain text paste so tiptap-markdown handles it correctly.
        const hasVSCode = clipboardData.types.some(
          (t) => t === "vscode-editor-data",
        );
        if (hasVSCode) {
          const text = clipboardData.getData("text/plain");
          if (text) {
            event.preventDefault();
            editor?.commands.insertContent(text);
            return true;
          }
        }

        const items = clipboardData.items;
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
      const value = outputFormat === "html"
        ? editor.getHTML()
        : ((editor.storage as any).markdown?.getMarkdown?.() ?? "");
      onChange(value);
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

  // Set content after editor is created — bypasses onBeforeCreate timing issues
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (initialContent.current) {
      editor.commands.setContent(
        preprocessMathInMarkdown(initialContent.current),
        { emitUpdate: false },
      );
    }
  }, [editor]);

  // Close slash menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showSlash) setShowSlash(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showSlash]);

  // Keep ref in sync for callbacks
  editorInstance.current = editor;

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
          onClick={openImagePicker}
          title="Insert image"
        >
          IMG
        </ToolbarButton>

        {/* Table controls — visible when cursor is inside a table */}
        {editor.isActive("table") && (
          <>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Insert column before"
            >
              ←Col
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Insert column after"
            >
              Col→
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete column"
            >
              ×Col
            </ToolbarButton>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Insert row above"
            >
              ↑Row
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add row below"
            >
              Row↓
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Delete row"
            >
              ×Row
            </ToolbarButton>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              title="Toggle header row"
            >
              TH
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete table"
            >
              ×Table
            </ToolbarButton>
          </>
        )}

      </div>

      {/* Editor Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto min-h-0 relative">
        <EditorContent editor={editor} />

        {/* Streak Effects */}
        <StreakEffects editor={editor} containerRef={contentRef} />

        {/* Table Controls */}
        <TableControls editor={editor} containerRef={contentRef} />

        {/* Slash Command Menu */}
        {showSlash && (
          <div style={{ position: "absolute", top: slashPos.top, left: slashPos.left }}>
            <SlashMenu editor={editor} onClose={() => setShowSlash(false)} onImagePicker={openImagePicker} onWidgetPicker={openWidgetPicker} />
          </div>
        )}
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-border w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-medium shrink-0">insert image</span>
              <input
                type="text"
                value={imagePickerSearch}
                onChange={(e) => setImagePickerSearch(e.target.value)}
                placeholder="search..."
                className="bg-input border border-border px-2 py-1 text-xs focus:outline-none focus:border-primary flex-1"
              />
              <label className="bg-primary text-primary-foreground px-3 py-1 text-xs hover:opacity-90 cursor-pointer shrink-0">
                {imagePickerUploading ? "uploading..." : "upload new"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagePickerUpload}
                  className="hidden"
                  disabled={imagePickerUploading}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0"
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {imagePickerLoading ? (
                <div className="text-sm text-muted-foreground text-center py-10">loading...</div>
              ) : (() => {
                const images = imagePickerItems.filter((i) => {
                  if (!i.mimeType?.startsWith("image/")) return false;
                  if (imagePickerSearch) {
                    const q = imagePickerSearch.toLowerCase();
                    return i.originalName.toLowerCase().includes(q) || i.filename.toLowerCase().includes(q);
                  }
                  return true;
                });
                return images.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-10">
                    no images found. upload one above.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {images.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectImageFromPicker(item.url)}
                        className="aspect-square border border-border overflow-hidden hover:border-primary transition-colors"
                      >
                        <img
                          src={item.url}
                          alt={item.originalName}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-border w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
              <span className="text-sm font-medium flex-1">insert widget</span>
              <button
                type="button"
                onClick={() => setShowWidgetPicker(false)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                x
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {Object.entries(widgetRegistry).map(([key, widget]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedWidget(key);
                    setWidgetPropsText(
                      JSON.stringify(widget.defaultProps, null, 2),
                    );
                  }}
                  className={`w-full text-left px-4 py-3 border transition-colors ${
                    selectedWidget === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {widget.icon}
                    </span>
                    <span className="font-medium text-sm">{widget.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {widget.description}
                  </p>
                </button>
              ))}
              {Object.keys(widgetRegistry).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-10">
                  no widgets registered.
                </div>
              )}
            </div>
            {selectedWidget && (
              <div className="border-t border-border p-4 space-y-3 shrink-0">
                <label className="block text-xs text-muted-foreground">
                  props (JSON)
                </label>
                <textarea
                  value={widgetPropsText}
                  onChange={(e) => setWidgetPropsText(e.target.value)}
                  rows={4}
                  className="w-full bg-input border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary resize-none"
                />
                <button
                  type="button"
                  onClick={insertWidget}
                  className="bg-primary text-primary-foreground px-4 py-1.5 text-sm hover:opacity-90 transition-opacity"
                >
                  insert
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
