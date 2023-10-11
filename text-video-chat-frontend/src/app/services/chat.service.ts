import { Injectable } from '@angular/core';
import {io} from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: any;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  public sendMessage(message: string): void {
    this.socket.emit('broadcast', message);
  }

  public getMessages(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('broadcast', (message: string) => {
        observer.next(message);
      });
    });
  }
}
