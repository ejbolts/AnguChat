import { Injectable, EventEmitter } from '@angular/core';
import {Socket, io} from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage.model';  
import { HttpClient } from '@angular/common/http';
import { CallDetails } from '../chat/chat.component'
@Injectable({
  providedIn: 'root'
})

export class ChatService {
  public apiUrl = 'http://localhost:3000'; 
  // socket information
  public socket: Socket;
  public socketId: string | null = null;

  // IDs of the current user
  public peerId?: string;
  public userId?: string;
  incomingCallEvent: EventEmitter<CallDetails> = new EventEmitter();
  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl);
    this.initializeSocketListeners();
  }

  private initializeSocketListeners(): void {
    this.socket.on('connection', (userId: string) => {
      console.log("Socket successfully connected with user ID: ", userId);
      this.socketId = userId;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error("Socket connection error:", error);
    });


    this.socket.on('incomingCall', (callDetails: any) => {
      console.log("Incoming call from: ", callDetails);
      this.incomingCallEvent.emit(callDetails);
    });

  }

  sendConnectionIDs(userId: String, peerId: String) {
    this.socket.emit('connectUserIDs', { userId, peerId }, { withCredentials: true });
   
  }

  startCall(anotherUserSockID: string, username: string) {
    this.socket.emit('callUser', { anotherUserSockID, from: this.peerId, socketID: this.socketId, username }, { withCredentials: true });
   
  }
  
  joinChannel(channelId: string, groupId: string, username: string) {
    console.log("Joining channel:", username, channelId);
    this.socket.emit('joinChannel', { channelId, groupId, username }, { withCredentials: true });
  }

  leaveChannel(channelId: string, groupId: string, username: string) {
    console.log("leaving channel:", username, channelId);

    this.socket.emit('leaveChannel', { channelId, groupId, username }, { withCredentials: true });
  }

  sendMessage(channelId: string, message: ChatMessage) {
    this.socket.emit('sendMessage', { channelId, message }, { withCredentials: true });
  }


  addMessageToChannel(channelId: string, message: ChatMessage) {
    console.log("Message sent to server with channelID:", message, channelId);
  
    return this.http.post(`${this.apiUrl}/channel/${channelId}/addMessage`, { channelId, message }, { withCredentials: true });
  }
  
  getSystemMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {
      this.socket.on('system-message', (message: ChatMessage) => {
        console.log("System message received:", message);
        observer.next(message);
      });
    });
}
  getMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {

      this.socket.on('channel-message', (msg: ChatMessage) => {
          observer.next(msg);
      });
    });
  }

  calldeclined(callerId: string) {
    this.socket.emit('call-declined', { callerId });
  }
}