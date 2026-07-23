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
  carousel: {
    name: "Media carousel",
    description: "Full-bleed swipeable strip of images/clips, one caption each",
    icon: "<>",
    defaultProps: {
      items: [
        { src: "", caption: "" },
        { src: "", caption: "" },
      ],
    },
  },
};
