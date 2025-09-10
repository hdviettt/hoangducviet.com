export interface Tool {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: "published" | "coming_soon" | "draft";
  password?: string;
  date_created?: string;
  date_updated?: string;
}

export interface ToolsResponse {
  data: Tool[];
}

export interface SingleToolResponse {
  data: Tool;
}