import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    const userSpy = jasmine.createSpyObj('UserService', ['loginUser']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [LoginComponent],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should successfully log in the user', () => {
    const mockUser = { username: 'test', password: 'test123', email: '', role: '', groups: [] };
    userServiceSpy.loginUser.and.returnValue(of({ message: 'Logged in successfully', user: mockUser }));
    component.user.username = 'test';
    component.user.password = 'test123';
    component.login();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['chat']);
    expect(sessionStorage.getItem('currentUser')).toEqual(JSON.stringify(mockUser));
  });

  it('should display error message on invalid credentials', () => {
    userServiceSpy.loginUser.and.returnValue(throwError({ error: 'Invalid credentials!' }));
    component.login();
    expect(component.errorMessage).toEqual('Invalid credentials!');
  });

  it('should navigate to the registration page', () => {
    component.goToRegister();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/register']);
  });
});
