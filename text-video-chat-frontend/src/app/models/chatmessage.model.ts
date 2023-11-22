export interface ChatMessage {
    username: string;
    content: string;
    timestamp: Date;
    isSystemMessage?: boolean;
    image?: string | null;  // Base64 encoded image
    channelId?: string;
  }