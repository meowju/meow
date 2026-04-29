// Message type for chat history

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}