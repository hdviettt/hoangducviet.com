export interface Block {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: number;
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