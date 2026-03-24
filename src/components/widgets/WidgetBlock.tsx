"use client";

import registry from "./index";

interface WidgetBlockProps {
  name: string;
  props: Record<string, unknown>;
}

export default function WidgetBlock({ name, props }: WidgetBlockProps) {
  const Widget = registry[name];

  if (!Widget) {
    return (
      <div className="my-6 border border-destructive/50 rounded-md p-4 text-sm text-destructive">
        Unknown widget: <code>{name}</code>
      </div>
    );
  }

  return <Widget {...props} />;
}
