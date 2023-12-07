export interface ChatMessage {
    username: string;
    content: string;
    timestamp: Date;
    isSystemMessage?: boolean;
    image?: string | null;  
    channelId?: string;
    profilePic?: string | null;
  }