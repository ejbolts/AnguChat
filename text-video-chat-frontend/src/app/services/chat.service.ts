import { Injectable } from '@angular/core';
import {io} from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage.model';  

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: any;
  public socketId: string | null = null;
  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log("Socket successfully connected");
    });
  
    this.socket.on('connect_error', (error: any) => {
      console.error("Socket connection error:", error);
    });
    this.socket.on('assign-id', (id: string) => {
      this.socketId = id;
  });
  }

  joinChannel(channelId: string, groupId: string,userId: string) {
    this.socket.emit('joinChannel', { channelId, groupId, userId });
  }

  leaveChannel(channelId: string, groupId: string,userId: string) {
    this.socket.emit('leaveChannel', { channelId, groupId, userId });
  }

  sendMessage(channelId: string, message: ChatMessage) {
    this.socket.emit('sendMessage', { channelId, message });
  }

  

  public getSystemMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {
      this.socket.on('system-message', (message: ChatMessage) => {
        observer.next(message);
      });
    });
}
public getMessages(): Observable<ChatMessage> {
  return new Observable<ChatMessage>(observer => {

    this.socket.on('channel-message', (msg: ChatMessage) => {
        console.log("Message received in service:", msg);
        observer.next(msg);
    });
  });
}








}
