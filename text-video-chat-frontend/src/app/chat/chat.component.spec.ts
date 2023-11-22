import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { UserService } from '../services/user.service';
import { ChatService } from '../services/chat.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ChatMessage } from '../models/chatmessage.model';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let chatServiceMock: jasmine.SpyObj<ChatService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    userServiceMock = jasmine.createSpyObj('UserService', ['fetchAllGroups']);
    chatServiceMock = jasmine.createSpyObj('ChatService', ['getMessages', 'getSystemMessages']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [ChatComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ChatService, useValue: chatServiceMock },
        { provide: Router, useValue: routerSpy }
      ]
    });

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch all groups on initialization', () => {
    const mockGroups = [{ _id: '1', name: 'Group 1', channels: [], admins: [] }];
    userServiceMock.fetchAllGroups.and.returnValue(of(mockGroups));

    component.ngOnInit();

    expect(component.allGroups).toEqual(mockGroups);
  });

  it('should handle error while fetching groups', () => {
    userServiceMock.fetchAllGroups.and.returnValue(throwError('Error'));

    component.ngOnInit();

    expect(component.allGroups).toEqual([]);
  });

  // it('should receive chat and system messages', () => {
  //   const mockChatMessage = { username: 'user', content: 'message', timestamp: new Date() };
  //   const mockSystemMessage = { ...mockChatMessage, isSystemMessage: true };
    
  //   chatServiceMock.getMessages.and.returnValue(of(mockChatMessage));
  //   chatServiceMock.getSystemMessages.and.returnValue(of(mockSystemMessage));

  //   component.ngOnInit();

  //   expect(component.messages).toContain(mockChatMessage);
  //   expect(component.messages).toContain(mockSystemMessage);
  // });

  // it('should fetch channels for a group and assign them to groupChannels', () => {
  //   const groupId = '123';
  //   const mockChannels = [{ _id: 'a', name: 'Channel A' }];
    
  //   userServiceMock.getChannelsByGroupId.and.returnValue(of(mockChannels));
    
  //   component.fetchChannelsPerGroup(groupId);
    
  //   expect(component.groupChannels[groupId]).toEqual(mockChannels);
  // });
  
  it('should assign Base64 string of an image to selectedImage', () => {
    const mockFile = new Blob([''], { type: 'image/jpg' });
    const mockEvent = { target: { files: [mockFile] } };
    
    const reader = jasmine.createSpyObj('FileReader', ['readAsDataURL', 'onloadend']);
    spyOn(window as any, 'FileReader').and.returnValue(reader);
    
    component.onImageSelected(mockEvent);
    expect(reader.readAsDataURL).toHaveBeenCalledWith(mockFile);
  
    // Simulating reader's onloadend event
    reader.onloadend();
    expect(component.selectedImage).toBeDefined();
  });
  
 
  
});
