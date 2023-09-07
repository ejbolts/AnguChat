export interface Channel {
    id: string;
    name: string;
    users?: string[]; 
    bannedUsers?: string[];   
}