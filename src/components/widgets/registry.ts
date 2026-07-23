export interface WidgetInfo {
  name: string;
  description: string;
  icon: string;
  defaultProps: Record<string, unknown>;
}

export const widgetRegistry: Record<string, WidgetInfo> = {
  counter: {
    name: "Counter",
    description: "Interactive counter with +/- buttons",
    icon: "+-",
    defaultProps: { label: "Counter", initial: 0, step: 1 },
  },
};

// Note: `carousel` is deliberately absent. It has its own editor node (see
// admin/extensions/CarouselExtension) with a real slide UI, so routing it
// through this raw-JSON picker as well would give authors two doors to the
// same room — one of them much worse.
