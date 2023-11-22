import { ChatMessage } from "./chatmessage.model";

export interface Channel {
    _id: string;
    name: string;
    users?: string[]; 
    bannedUsers?: string[];   
    history: ChatMessage[];
}