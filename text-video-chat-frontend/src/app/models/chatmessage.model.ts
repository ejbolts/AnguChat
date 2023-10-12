export interface ChatMessage {
    username: string;
    content: string;
    timestamp: Date;
    isSystemMessage?: boolean;
  }