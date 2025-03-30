import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { routes } from '../../app.routes'; // Adjust path to your app.routes.ts

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes), // Use app routes for realistic routing
      ],
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 404 message', () => {
    const heading = fixture.debugElement.query(By.css('h1')).nativeElement;
    const paragraph = fixture.debugElement.query(By.css('p')).nativeElement;

    expect(heading.textContent).toContain('404 - Page Not Found');
    expect(paragraph.textContent).toContain(
      "The page you're looking for doesn't exist."
    );
  });

  it('should have a link to homepage', () => {
    const link = fixture.debugElement.query(By.css('a')).nativeElement;

    expect(link.textContent).toContain('Go to Homepage');
    expect(link.getAttribute('routerLink')).toBe('/');
  });

  it('should navigate to homepage when link is clicked', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigateByUrl').and.returnValue(
      Promise.resolve(true)
    );
    const link = fixture.debugElement.query(By.css('a'));

    expect(link).toBeTruthy(); // Verify link exists

    // Simulate a proper click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0, // Left-click
    });
    link.triggerEventHandler('click', clickEvent);

    tick(); // Wait for async navigation
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.any(Object)
    );

    // Optional: Verify the UrlTree represents '/'
    const calls = navigateSpy.calls.mostRecent().args;
    expect(calls[0].toString()).toBe('/');
  }));
});
