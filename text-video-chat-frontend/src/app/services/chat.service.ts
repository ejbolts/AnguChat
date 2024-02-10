import { Injectable, EventEmitter } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chatmessage.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CallDetails, IncomingCallDetails } from '../models/callDetails.model';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  apiUrl = environment.apiUrl;
  private typingSubject = new Subject<{
    channelId: string;
    username: string;
  }>();

  // socket information
  socketId: string | null = null;
  socket: Socket;
  // IDs of the current user
  peerId?: string;
  userId?: string;
  incomingCallEvent: EventEmitter<IncomingCallDetails> = new EventEmitter();
  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl);

    this.socket.on('connection', (userId: string) => {
      this.socketId = userId;
    });

    // Initialize typing event listener
    this.typingSubject
      .pipe(throttleTime(1000))
      .subscribe(({ channelId, username }) => {
        this.socket.emit('typing', { channelId, username });
      });

    this.initializeSocketListeners();
  }

  notifyTyping(channelId: string, username: string): void {
    this.typingSubject.next({ channelId, username });
  }

  getUserTyping(): Observable<{ channelId: string; message: string }> {
    return new Observable<{ channelId: string; message: string }>(
      (observer) => {
        this.socket.on(
          'serverEmitTyping',
          (data: { channelId: string; message: string }) => {
            // console.log(data);
            observer.next(data);
          }
        );
      }
    );
  }

  private initializeSocketListeners(): void {
    this.socket.on('error', (err) => console.log('error:', err));

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('incomingCall', (callDetails: IncomingCallDetails) => {
      // console.log("Incoming call from: ", callDetails);
      this.incomingCallEvent.emit(callDetails);
    });
  }
  // acts as emit signal for logging in user
  sendConnectionIDs(userId: String, peerId: String) {
    this.socket.emit(
      'connectUserIDs',
      { userId, peerId },
      { withCredentials: true }
    );
  }

  startCall(anotherUserSockID: string, username: string) {
    this.socket.emit(
      'callUser',
      {
        anotherUserSockID,
        from: this.peerId,
        socketID: this.socketId,
        username,
      },
      { withCredentials: true }
    );
  }

  joinChannel(channelId: string, groupId: string, username: string) {
    // console.log("Joining channel:", username, channelId);
    this.socket.emit(
      'joinChannel',
      { channelId, groupId, username },
      { withCredentials: true }
    );
  }

  leaveChannel(channelId: string, groupId: string, username: string) {
    // console.log("leaving channel:", username, channelId);
    this.socket.emit(
      'leaveChannel',
      { channelId, groupId, username },
      { withCredentials: true }
    );
  }

  sendMessage(channelId: string, message: ChatMessage) {
    this.socket.emit(
      'sendMessage',
      { channelId, message },
      { withCredentials: true }
    );
  }

  addMessageToChannel(channelId: string, message: ChatMessage) {
    return this.http.post(
      `${this.apiUrl}/api/channel/${channelId}/addMessage`,
      { channelId, message },
      { withCredentials: true }
    );
  }

  getSystemMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      this.socket.on('system-message', (message: ChatMessage) => {
        // console.log("System message received:", message);
        observer.next(message);
      });
    });
  }
  getMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      this.socket.on('channel-message', (msg: ChatMessage) => {
        observer.next(msg);
      });
    });
  }

  calldeclined(callerId: string) {
    this.socket.emit('call-declined', { callerId });
  }

  getLoginUpdates(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('login', (userId: string) => {
        observer.next(userId);
      });
    });
  }

  logoutUser(
    username: string,
    userId: string
  ): Observable<{ message: string }> {
    //console.log('userId logging out:', userId);
    this.socket.emit('UserLogout', userId, { withCredentials: true });
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/api/authentication/logout`,
      { username: username },
      { withCredentials: true }
    );
  }
  getlogoutUser(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('logout', (userId: string) => {
        observer.next(userId);
      });
    });
  }
}
