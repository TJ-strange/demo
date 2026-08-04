export type Locale = "zh-CN" | "en-US";

export type TaskStatus = "queued" | "running" | "completed";

export type ContextTab = "logs" | "media" | "settings";

export type MessageRole = "user" | "assistant" | "tool";

export type MediaKind = "image" | "video";

export type LocalizedText = Record<Locale, string>;

export interface Task {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  status: TaskStatus;
  updatedAt: string;
  accent: "neutral" | "active" | "done";
}

export interface Message {
  id: string;
  taskId: string;
  role: MessageRole;
  content: LocalizedText;
  createdAt: string;
  mediaAssetIds?: string[];
  mediaLoading?: boolean;
  visibleMediaCount?: number;
  streaming?: boolean;
  cancelled?: boolean;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  type: "folder" | "file";
  children?: WorkspaceFile[];
}

export interface RunLog {
  id: string;
  taskId: string;
  level: "info" | "success" | "warn";
  content: LocalizedText;
  time: string;
}

export interface MediaAsset {
  id: string;
  taskId: string;
  kind: MediaKind;
  title: LocalizedText;
  description: LocalizedText;
  src?: string;
}

export interface WorkspaceData {
  tasks: Task[];
  messages: Message[];
  files: WorkspaceFile[];
  logs: RunLog[];
  media: MediaAsset[];
}
