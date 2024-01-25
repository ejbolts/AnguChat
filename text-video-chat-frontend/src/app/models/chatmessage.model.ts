export interface ChatMessage {
  username: string; // The name of the user who sent the message.
  content: string; // The text content of the message.
  timestamp: Date; // The time the message was sent.
  isSystemMessage?: boolean; // A flag to differentiate system-generated messages from user messages.
  image?: string | null; // Base64 encoded image string if the message contains an image attachment.
  channelId?: string; // Used for displaying the right message in the correct channel.
  profilePic?: string | null; // The s3 URL for displaying the profile picture of the user.
}
