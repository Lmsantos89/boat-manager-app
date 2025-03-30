import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { AuthResponse } from '../../models/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      {
        events: new Subject(), // For RouterLink
        url: '/',
      }
    );

    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    routerSpy.serializeUrl.and.returnValue('/signup');

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map() } },
        },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with initial state', () => {
    expect(component).toBeTruthy();
    expect(component.loginRequest).toEqual({ username: '', password: '' });
    expect(component.errorMessage).toBe('');
    expect(
      fixture.nativeElement.querySelector('input[name="username"]')
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('input[name="password"]')
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.text-red-500')).toBeFalsy();
  });

  it('should login successfully and redirect', fakeAsync(() => {
    // Arrange
    component.loginRequest.username = 'user';
    component.loginRequest.password = 'pass';
    fixture.detectChanges();
    authService.login.and.returnValue(of({} as AuthResponse)); // Mock AuthResponse

    // Act
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    tick(); // For async navigation

    // Assert
    expect(authService.login).toHaveBeenCalledWith({
      username: 'user',
      password: 'pass',
    });
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/boats']);
    expect(fixture.nativeElement.querySelector('.text-red-500')).toBeFalsy();
  }));

  it('should handle login failure with error message', () => {
    // Arrange
    component.loginRequest.username = 'wronguser';
    component.loginRequest.password = 'wrongpass';
    fixture.detectChanges();
    authService.login.and.returnValue(throwError(() => ({})));

    // Act
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    // Assert
    expect(authService.login).toHaveBeenCalledWith({
      username: 'wronguser',
      password: 'wrongpass',
    });
    expect(component.errorMessage).toBe('Invalid username or password');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('.text-red-500').textContent
    ).toContain('Invalid username or password');
  });
});
