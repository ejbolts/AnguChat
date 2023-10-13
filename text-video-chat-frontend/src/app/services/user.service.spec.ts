import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { Channel } from '../models/channel.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const dummyUser: User = {
      username: 'John',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      groups: []
    };

    service.registerUser(dummyUser).subscribe(user => {
      expect(user).toEqual(dummyUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/register');
    expect(req.request.method).toBe('POST');
    req.flush(dummyUser);
  });

  it('should login a user', () => {
    const dummyResponse = {
      message: 'Logged in successfully',
      user: {
        username: 'John',
        email: 'john@example.com',
        role: 'user',
        groups: []
      }
    };

    service.loginUser({ username: 'John', password: 'password123' }).subscribe(response => {
      expect(response).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    req.flush(dummyResponse);
  });


  it('should delete a user', () => {
    const userId = '123';

    service.deleteUser(userId).subscribe(response => {
      expect(response).toEqual({ status: 'success' });
    });

    const req = httpMock.expectOne(`http://localhost:3000/remove/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ status: 'success' });
  });

  it('should update a user role', () => {
    const userId = '123';
    const role = 'admin';

    service.updateUserRole(userId, role).subscribe(response => {
      expect(response).toEqual({ status: 'success' });
    });

    const req = httpMock.expectOne(`http://localhost:3000/update/${userId}/role`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ role: role });
    req.flush({ status: 'success' });
  });

  it('should fetch all users', () => {
    const dummyUsers: User[] = [
      { username: 'John', email: 'john@example.com', role: 'user', groups: [] },
      { username: 'Jane', email: 'jane@example.com', role: 'admin', groups: [] }
    ];

    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(dummyUsers);
    });

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('GET');
    req.flush(dummyUsers);
  });

  it('should fetch a user by ID', () => {
    const dummyUser: User = { username: 'John', email: 'john@example.com', role: 'user', groups: [] };
    const userId = '123';

    service.getUserById(userId).subscribe(user => {
      expect(user).toEqual(dummyUser);
    });

    const req = httpMock.expectOne(`http://localhost:3000/login/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyUser);
  });


  it('should create a group', () => {
    const name = 'Test Group';
    const userId = '12345';
    const expectedResponse = { status: 'success', groupId: '6789' };

    service.createGroup(name, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: name, userId: userId });
    req.flush(expectedResponse);
  });

  it('should fetch all groups', () => {
    const dummyGroups: Group[] = [
      { _id: '1', name: 'Group 1', channels: [], admins: [] },
      { _id: '2', name: 'Group 2', channels: [], admins: [] }
    ];

    service.fetchAllGroups().subscribe(groups => {
      expect(groups).toEqual(dummyGroups);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyGroups);
  });

  it('should delete a group', () => {
    const groupId = '1';
    const expectedResponse = { status: 'success' };

    service.deleteGroup(groupId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/${groupId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(expectedResponse);
  });

  it('should create a channel in a group', () => {
    const groupId = '1';
    const channelName = 'Channel 1';
    const expectedResponse = { status: 'success', channelId: '1234' };

    service.createChannel(groupId, channelName).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/channel`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ groupId: groupId, name: channelName });
    req.flush(expectedResponse);
  });


  it('should delete a channel', () => {
    const channelId = '12345';
    const expectedResponse = { status: 'success' };

    service.deleteChannel(channelId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/channel/${channelId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(expectedResponse);
  });

  it('should fetch channels by group id', () => {
    const groupId = '6789';
    const dummyChannels: Channel[] = [
      { _id: '1', name: 'Channel 1' },
      { _id: '2', name: 'Channel 2' }
    ];

    service.getChannelsByGroupId(groupId).subscribe(channels => {
      expect(channels).toEqual(dummyChannels);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/${groupId}/channels`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyChannels);
  });

  it('should add user to group', () => {
    const groupId = '6789';
    const userId = '12345';
    const expectedResponse = { status: 'success' };

    service.addUserToGroup(groupId, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/${groupId}/addUser`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(expectedResponse);
  });

  it('should remove user from group', () => {
    const groupId = '6789';
    const userId = '12345';
    const expectedResponse = { status: 'success' };

    service.removeUserFromGroup(groupId, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/${groupId}/removeUser`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(expectedResponse);
  });


  it('should add user to channel', () => {
    const channelId = 'channel123';
    const groupId = 'group123';
    const userId = 'user123';
    const expectedResponse = { status: 'success' };

    service.addUserToChannel(channelId, groupId, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/channel/${channelId}/addUser`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ groupId, userId });
    req.flush(expectedResponse);
  });

  it('should remove user from channel', () => {
    const channelId = 'channel123';
    const userId = 'user123';
    const expectedResponse = { status: 'success' };

    service.removeUserFromChannel(channelId, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/channel/${channelId}/removeUser`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ userId });
    req.flush(expectedResponse);
  });

  it('should join a group', () => {
    const groupId = 'group123';
    const userId = 'user123';
    const expectedResponse = { status: 'joined' };

    service.joinGroup(groupId, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/${groupId}/join`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(expectedResponse);
  });

  it('should approve a user for a group', () => {
    const groupId = 'group123';
    const userId = 'user123';
    const expectedResponse = { status: 'approved' };

    service.approveUserForGroup(groupId, userId).subscribe(response => {
      expect(response).toEqual(expectedResponse);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/group/${groupId}/approveUser`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId });
    req.flush(expectedResponse);
  });

});






