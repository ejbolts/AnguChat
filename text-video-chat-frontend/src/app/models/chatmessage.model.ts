export interface ChatMessage {
  id: string; // A unique identifier for the message.
  username: string; // The name of the user who sent the message.
  content: string; // The text content of the message.
  timestamp: Date; // The time the message was sent.
  isSystemMessage?: boolean; // A flag to differentiate system-generated messages from user messages.
  image?: string | null; // The s3 URL for displaying the chat images.
  channelId?: string; // Used for displaying the right message in the correct channel.
  profilePic?: string | null; // The s3 URL for displaying the profile picture of the user.
  isEdited?: boolean; // A flag to indicate if the message has been edited.
}
