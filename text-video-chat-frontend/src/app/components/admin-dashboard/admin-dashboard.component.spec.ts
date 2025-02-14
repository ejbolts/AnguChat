import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';  // RxJS method to mock successful observables
import { throwError } from 'rxjs';  // RxJS method to mock error observables
import { User } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const mockUsers: User[] = [
    {
      _id: '1',
      username: 'john123',
      email: 'john@email.com',
      role: 'user',
      groups: [],
      reported: false,
      bannedChannels: [],
      pendingGroups: []
    },
    {
      _id: '2',
      username: 'jane123',
      email: 'jane@email.com',
      role: 'user',
      groups: [],
      reported: false,
      bannedChannels: [],
      pendingGroups: []
    }
  ];
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['getAllUsers', 'fetchAllGroups']);

    TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: spy }
      ]
    });

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch users', () => {
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));

    component.fetchUsers();

    expect(component.users).toEqual(mockUsers);
});


it('should handle error while fetching users', () => {
  const errorResponse = new HttpErrorResponse({
    error: 'Error fetching users',
    status: 500, 
    statusText: 'Internal Server Error'
  });

  userServiceSpy.getAllUsers.and.returnValue(throwError(errorResponse));
  
  spyOn(console, 'error');

  component.fetchUsers();

  expect(console.error).toHaveBeenCalledWith('Error fetching users:', errorResponse);
});


  it('should fetch groups', () => {
    const mockGroups = [{ name: 'Group1', _id: 'g1', channels: [], admins: [] }];
    userServiceSpy.fetchAllGroups.and.returnValue(of(mockGroups));

    component.fetchGroups();
    expect(component.groups).toEqual(mockGroups);
  });


});
