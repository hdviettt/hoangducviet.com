"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";

interface Pos {
  top: number;
  left: number;
}

interface ContextMenuState {
  open: boolean;
  pos: Pos;
}

export default function TableControls({ editor, containerRef }: { editor: Editor; containerRef: React.RefObject<HTMLDivElement | null> }) {
  // Floating "+" buttons (viewport coordinates for fixed positioning)
  const [addColBtn, setAddColBtn] = useState<Pos | null>(null);
  const [addRowBtn, setAddRowBtn] = useState<Pos | null>(null);
  const [hoveredTable, setHoveredTable] = useState<HTMLTableElement | null>(null);
  const addColRef = useRef<HTMLButtonElement>(null);
  const addRowRef = useRef<HTMLButtonElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Context menu (viewport coordinates)
  const [ctx, setCtx] = useState<ContextMenuState>({ open: false, pos: { top: 0, left: 0 } });
  const ctxRef = useRef<HTMLDivElement>(null);

  // Position buttons using viewport coordinates (for fixed positioning via portal)
  const updateButtons = useCallback((table: HTMLTableElement) => {
    const tRect = table.getBoundingClientRect();

    setAddColBtn({
      top: tRect.top + tRect.height / 2 - 12,
      left: tRect.right + 4,
    });
    setAddRowBtn({
      top: tRect.bottom + 4,
      left: tRect.left + tRect.width / 2 - 12,
    });
  }, []);

  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      setHoveredTable(null);
      setAddColBtn(null);
      setAddRowBtn(null);
    }, 150);
  };

  // Track mouse hover over tables
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if hovering over a "+" button (rendered in portal)
      if (
        addColRef.current?.contains(target) ||
        addRowRef.current?.contains(target)
      ) {
        clearHideTimer();
        return;
      }

      const table = target.closest("table") as HTMLTableElement | null;
      if (table && container.contains(table)) {
        clearHideTimer();
        setHoveredTable(table);
        updateButtons(table);
      } else {
        scheduleHide();
      }
    };

    const handleMouseLeave = () => {
      scheduleHide();
    };

    // Update button positions on scroll (viewport coords change)
    const handleScroll = () => {
      if (hoveredTable) {
        updateButtons(hoveredTable);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("scroll", handleScroll);
      clearHideTimer();
    };
  }, [containerRef, updateButtons, hoveredTable]);

  // Right-click context menu
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (e: MouseEvent) => {
      const cell = (e.target as HTMLElement).closest("td, th");
      if (!cell || !container.contains(cell)) return;

      e.preventDefault();
      setCtx({
        open: true,
        pos: {
          top: e.clientY,
          left: e.clientX,
        },
      });
    };

    container.addEventListener("contextmenu", handleContextMenu);
    return () => container.removeEventListener("contextmenu", handleContextMenu);
  }, [containerRef]);

  // Close context menu on click outside or Escape
  useEffect(() => {
    if (!ctx.open) return;
    const close = () => setCtx((c) => ({ ...c, open: false }));
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("click", close);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ctx.open]);

  const ctxAction = (fn: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      fn();
      setCtx({ open: false, pos: { top: 0, left: 0 } });
    };
  };

  const contextMenuItems = [
    { label: "Insert column before", action: () => editor.chain().focus().addColumnBefore().run() },
    { label: "Insert column after", action: () => editor.chain().focus().addColumnAfter().run() },
    { label: "Delete column", action: () => editor.chain().focus().deleteColumn().run(), destructive: true },
    { type: "separator" as const },
    { label: "Insert row above", action: () => editor.chain().focus().addRowBefore().run() },
    { label: "Insert row below", action: () => editor.chain().focus().addRowAfter().run() },
    { label: "Delete row", action: () => editor.chain().focus().deleteRow().run(), destructive: true },
    { type: "separator" as const },
    { label: "Toggle header row", action: () => editor.chain().focus().toggleHeaderRow().run() },
    { label: "Delete table", action: () => editor.chain().focus().deleteTable().run(), destructive: true },
  ];

  // Render floating UI via portal to avoid overflow clipping
  const portalContent = (
    <>
      {/* Add column button — right edge */}
      {hoveredTable && addColBtn && (
        <button
          ref={addColRef}
          type="button"
          onMouseEnter={clearHideTimer}
          onMouseLeave={scheduleHide}
          onClick={() => {
            editor.chain().focus().addColumnAfter().run();
          }}
          className="fixed z-[9999] w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          style={{ top: addColBtn.top, left: addColBtn.left }}
          title="Add column"
        >
          <span className="text-sm leading-none">+</span>
        </button>
      )}

      {/* Add row button — bottom edge */}
      {hoveredTable && addRowBtn && (
        <button
          ref={addRowRef}
          type="button"
          onMouseEnter={clearHideTimer}
          onMouseLeave={scheduleHide}
          onClick={() => {
            editor.chain().focus().addRowAfter().run();
          }}
          className="fixed z-[9999] w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          style={{ top: addRowBtn.top, left: addRowBtn.left }}
          title="Add row"
        >
          <span className="text-sm leading-none">+</span>
        </button>
      )}

      {/* Right-click context menu */}
      {ctx.open && (
        <div
          ref={ctxRef}
          className="fixed z-[9999] bg-card border border-border py-1 min-w-[180px] shadow-lg"
          style={{ top: ctx.pos.top, left: ctx.pos.left }}
        >
          {contextMenuItems.map((item, i) =>
            "type" in item && item.type === "separator" ? (
              <div key={i} className="border-t border-border my-1" />
            ) : (
              <button
                key={i}
                type="button"
                onClick={ctxAction(item.action!)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  "destructive" in item && item.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </>
  );

  return createPortal(portalContent, document.body);
}
