import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { AuthResponse } from '../../models/auth';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['signup']);
    const routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      {
        events: new Subject(),
        url: '/',
      }
    );

    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    routerSpy.serializeUrl.and.returnValue('/');

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, SignupComponent],
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
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with initial state', () => {
    expect(component).toBeTruthy();
    expect(component.signupRequest).toEqual({ username: '', password: '' });
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(
      fixture.nativeElement.querySelector('#signup-username')
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('#signup-password')
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.text-green-500')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.text-red-500')).toBeFalsy();
  });

  it('should signup successfully with message and redirect', fakeAsync(() => {
    // Arrange
    component.signupRequest.username = 'newuser';
    component.signupRequest.password = 'newpass';
    fixture.detectChanges();
    authService.signup.and.returnValue(
      of({ message: 'User registered successfully! Redirecting to login...' })
    );

    // Act
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    tick(2000);
    fixture.detectChanges();

    // Assert
    expect(authService.signup).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'newpass',
    });
    expect(component.successMessage).toBe(
      'User registered successfully! Redirecting to login...'
    );
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(
      fixture.nativeElement.querySelector('.text-green-500').textContent
    ).toContain('User registered successfully! Redirecting to login...');
    expect(fixture.nativeElement.querySelector('.text-red-500')).toBeFalsy();
  }));

  it('should signup successfully with fallback message', fakeAsync(() => {
    // Arrange
    component.signupRequest.username = 'newuser';
    component.signupRequest.password = 'newpass';
    fixture.detectChanges();
    authService.signup.and.returnValue(of({} as AuthResponse));

    // Act
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    tick(2000);
    fixture.detectChanges();

    // Assert
    expect(authService.signup).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'newpass',
    });
    expect(component.successMessage).toBe(
      'Registration successful! Redirecting to login...'
    );
    expect(component.errorMessage).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(
      fixture.nativeElement.querySelector('.text-green-500').textContent
    ).toContain('Registration successful! Redirecting to login...');
    expect(fixture.nativeElement.querySelector('.text-red-500')).toBeFalsy();
  }));

  it('should handle signup failure with error message', () => {
    // Arrange
    component.signupRequest.username = 'existinguser';
    component.signupRequest.password = 'pass';
    fixture.detectChanges();
    authService.signup.and.returnValue(
      throwError(() => ({ error: { message: 'Username exists' } }))
    );

    // Act
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    // Assert
    expect(authService.signup).toHaveBeenCalledWith({
      username: 'existinguser',
      password: 'pass',
    });
    expect(component.errorMessage).toBe('Username exists');
    expect(component.successMessage).toBe('');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('.text-red-500').textContent
    ).toContain('Username exists');
    expect(fixture.nativeElement.querySelector('.text-green-500')).toBeFalsy();
  });

  it('should handle signup failure with fallback error', () => {
    // Arrange
    component.signupRequest.username = 'existinguser';
    component.signupRequest.password = 'pass';
    fixture.detectChanges();
    authService.signup.and.returnValue(throwError(() => ({})));

    // Act
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    // Assert
    expect(authService.signup).toHaveBeenCalledWith({
      username: 'existinguser',
      password: 'pass',
    });
    expect(component.errorMessage).toBe(
      'Registration failed. Please try again.'
    );
    expect(component.successMessage).toBe('');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('.text-red-500').textContent
    ).toContain('Registration failed. Please try again.');
    expect(fixture.nativeElement.querySelector('.text-green-500')).toBeFalsy();
  });
});
