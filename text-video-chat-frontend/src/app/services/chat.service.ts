import { Injectable, EventEmitter } from '@angular/core';
import {io} from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage.model';  
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: any;
  public apiUrl = 'http://localhost:3000'; 
  public socketId: string | null = null;
  incomingCall: any;
  peerId: string | undefined; // To store the PeerJS ID
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
      console.log("Incoming call from: ", callDetails.from);
      this.incomingCallEvent.emit(callDetails.from); // Emit the entire callDetails object
    });
    
  }


  startCall(anotherUserSockID: string) {
    this.socket.emit('callUser', { anotherUserSockID, from: this.peerId });
   
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


  addMessageToChannel(channelId: string,  message: ChatMessage ) {
    console.log("Message sent to server with channelID:", message, channelId);
    console.log("this.apiUrl",this.apiUrl)
    return this.http.post(`${this.apiUrl}/channel/${channelId}/addMessage`, { channelId, message });
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
          observer.next(msg);
      });
    });
  }

}