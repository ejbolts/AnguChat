import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Mocking the services
    userServiceMock = jasmine.createSpyObj('UserService', ['registerUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      declarations: [RegisterComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerSpy }
      ]
    });

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login when goToLogin is called', () => {
    component.goToLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should register and navigate to login on successful registration', () => {
    userServiceMock.registerUser.and.returnValue(of({})); // Mocking successful registration
    component.register();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should handle error on registration failure', () => {
    userServiceMock.registerUser.and.returnValue(throwError('Registration error')); // Mocking registration failure
    component.register();
    // Here, you can add any error handling assertions if needed
  });
});
