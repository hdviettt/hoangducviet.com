export interface Block {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: number;
    style?: string;
    items?: string[];
    file?: {
      url: string;
      width?: number;
      height?: number;
    };
    caption?: string;
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
  };
}
