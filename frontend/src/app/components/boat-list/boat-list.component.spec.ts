import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BoatListComponent } from './boat-list.component';
import { BoatService } from '../../services/boat.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { Boat } from '../../models/boat';
import { By } from '@angular/platform-browser';
import { AddBoatDialogComponent } from '../add-boat-dialog/add-boat-dialog.component';
import { BoatDetailsDialogComponent } from '../boat-details-dialog/boat-details-dialog.component';

describe('BoatListComponent', () => {
  let component: BoatListComponent;
  let fixture: ComponentFixture<BoatListComponent>;
  let boatServiceSpy: jasmine.SpyObj<BoatService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogOpenSpy: jasmine.Spy;

  const mockBoats: Boat[] = [
    { id: 1, name: 'Boat 1', description: 'Desc 1' },
    { id: 2, name: 'Boat 2', description: 'Desc 2' },
  ];

  beforeEach(async () => {
    boatServiceSpy = jasmine.createSpyObj<BoatService>('BoatService', [
      'getBoats',
      'getBoat',
      'deleteBoat',
    ]);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'logout',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    boatServiceSpy.getBoats.and.returnValue(of(mockBoats));
    boatServiceSpy.getBoat.and.returnValue(of(mockBoats[0]));
    boatServiceSpy.deleteBoat.and.returnValue(of(void 0));
    authServiceSpy.logout.and.callFake(() => {
      localStorage.removeItem('token');
      routerSpy.navigate(['/']);
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatDialogModule,
        OverlayModule,
        BoatListComponent,
      ],
      providers: [
        { provide: BoatService, useValue: boatServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoatListComponent);
    component = fixture.componentInstance;
    dialogOpenSpy = spyOn(component['dialog'], 'open').and.returnValue({
      afterClosed: () => of(true),
    } as MatDialogRef<any>);
    fixture.detectChanges();
  });

  afterEach(() => {
    component['dialog'].closeAll();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load boats on init', () => {
    expect(boatServiceSpy.getBoats).toHaveBeenCalled();
    expect(component.boats).toEqual(mockBoats);
  });

  it('should display boats in the table', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].nativeElement.textContent).toContain('Boat 1');
    expect(rows[0].nativeElement.textContent).toContain('Desc 1');
    expect(rows[1].nativeElement.textContent).toContain('Boat 2');
    expect(rows[1].nativeElement.textContent).toContain('Desc 2');
  });

  it('should open add boat dialog when addBoat is called', fakeAsync(() => {
    component.addBoat();
    tick();

    expect(dialogOpenSpy).toHaveBeenCalledWith(AddBoatDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      backdropClass: 'bg-gray-900/50',
      data: {},
    });
    expect(boatServiceSpy.getBoats).toHaveBeenCalledTimes(2);
  }));

  it('should open edit boat dialog when editBoat is called', fakeAsync(() => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    component.editBoat(1, event);

    tick();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(boatServiceSpy.getBoat).toHaveBeenCalledWith(1);
    expect(dialogOpenSpy).toHaveBeenCalledWith(AddBoatDialogComponent, {
      width: '500px',
      backdropClass: 'bg-gray-900/50',
      data: { boat: mockBoats[0] },
    });
    expect(boatServiceSpy.getBoats).toHaveBeenCalledTimes(2);
  }));

  it('should delete boat when deleteBoat is called', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteBoat(1);
    tick();
    expect(boatServiceSpy.deleteBoat).toHaveBeenCalledWith(1);
    expect(boatServiceSpy.getBoats).toHaveBeenCalledTimes(2);
  }));

  it('should navigate to boat details when viewBoat is called', () => {
    component.viewBoat(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/boats', 1]);
  });

  it('should logout and navigate when logout is called', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should open boat details dialog when row is clicked', fakeAsync(() => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', {
      value: { tagName: 'TD' },
      writable: true,
    });
    spyOn(event, 'stopPropagation');
    row.triggerEventHandler('click', event);

    tick();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(dialogOpenSpy).toHaveBeenCalledWith(BoatDetailsDialogComponent, {
      width: '500px',
      data: mockBoats[0],
      backdropClass: 'bg-gray-900/50',
    });
  }));

  it('should not open boat details dialog when button is clicked', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('button.bg-yellow-500'));
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', {
      value: { tagName: 'BUTTON' },
      writable: true,
    });
    spyOn(event, 'stopPropagation');
    button.triggerEventHandler('click', event);

    tick();
    expect(dialogOpenSpy).not.toHaveBeenCalledWith(
      BoatDetailsDialogComponent,
      jasmine.any(Object)
    );
  }));
});
