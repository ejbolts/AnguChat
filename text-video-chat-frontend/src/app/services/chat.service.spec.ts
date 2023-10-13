import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service'; 
import { ChatMessage } from '../models/chatmessage.model';
import * as io from 'socket.io-client';

describe('ChatService', () => {
  let service: ChatService;
  let socketMock: any;

  beforeEach(() => {
    socketMock = {
      emit: jasmine.createSpy('emit')
    };

    spyOn(io, 'connect').and.returnValue(socketMock);

    TestBed.configureTestingModule({
      providers: [ChatService]
    });

    service = TestBed.inject(ChatService);
  });

  it('should send message via socket', () => {
    const mockMessage: ChatMessage = {
      username: 'testUser',
      content: 'testContent',
      timestamp: new Date(),
      isSystemMessage: false,
      image: null
    };
    service.sendMessage(mockMessage);
    expect(socketMock.emit).toHaveBeenCalledWith('broadcast', mockMessage);
  });
});
