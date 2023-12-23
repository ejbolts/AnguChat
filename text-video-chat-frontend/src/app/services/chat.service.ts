import { Injectable, EventEmitter } from '@angular/core';
import {io} from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage.model';  
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public socket: any;
  public apiUrl = 'http://localhost:3000'; 
  public socketId: string | null = null;
  incomingCall: any;
  public peerId: string | undefined; 
  public userId: string | undefined;
  incomingCallEvent: EventEmitter<any> = new EventEmitter();
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
  
  

  public getSystemMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {
      this.socket.on('system-message', (message: ChatMessage) => {
        console.log("System message received:", message);
        observer.next(message);
      });
    });
}
  public getMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {

      this.socket.on('channel-message', (msg: ChatMessage) => {
          observer.next(msg);
      });
    });
  }

  public calldeclined(callerId: string) {
    this.socket.emit('call-declined', { callerId });
  }
}