import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AddBoatDialogComponent } from './add-boat-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BoatService } from '../../services/boat.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('AddBoatDialogComponent', () => {
  let component: AddBoatDialogComponent;
  let fixture: ComponentFixture<AddBoatDialogComponent>;
  let boatService: jasmine.SpyObj<BoatService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AddBoatDialogComponent>>;
  let imports: any[] = [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    BrowserAnimationsModule,
    AddBoatDialogComponent,
  ];

  beforeEach(async () => {
    const boatServiceSpy = jasmine.createSpyObj('BoatService', [
      'addBoat',
      'updateBoat',
    ]);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: imports,
      providers: [
        { provide: BoatService, useValue: boatServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }, // Default empty data
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    boatService = TestBed.inject(BoatService) as jasmine.SpyObj<BoatService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<AddBoatDialogComponent>
    >;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBoatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with empty boat for adding', () => {
    expect(component).toBeTruthy();
    expect(component.boat).toEqual({ name: '', description: '' });
    expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe(
      'Add New Boat'
    );
  });

  it('should create with provided boat for editing', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: imports,
      providers: [
        { provide: BoatService, useValue: boatService },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            boat: { id: 1, name: 'Test Boat', description: 'Test Desc' },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBoatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    expect(component.boat).toEqual({
      id: 1,
      name: 'Test Boat',
      description: 'Test Desc',
    });
    expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe(
      'Edit Boat'
    );
  }));

  it('should disable Save button when form is invalid', fakeAsync(() => {
    component.boat = { name: '', description: '' };
    fixture.detectChanges();
    tick();
    const saveButton = fixture.debugElement.query(
      By.css('button[mat-raised-button]')
    ).nativeElement;
    expect(saveButton.disabled).toBeTrue();

    component.boat = { name: 'Test', description: '' };
    fixture.detectChanges();
    tick();
    expect(saveButton.disabled).toBeTrue();

    component.boat = { name: '', description: 'Test' };
    fixture.detectChanges();
    tick();
    expect(saveButton.disabled).toBeTrue();
  }));

  it('should enable Save button when form is valid', fakeAsync(() => {
    component.boat = { name: 'Test Boat', description: 'Test Description' };
    fixture.detectChanges();
    tick();
    const saveButton = fixture.debugElement.query(
      By.css('button[mat-raised-button]')
    ).nativeElement;
    expect(saveButton.disabled).toBeFalse();
  }));

  it('should close dialog on Cancel', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const cancelButton = fixture.debugElement.query(
      By.css('button[mat-button]')
    ).nativeElement;
    cancelButton.click();
    expect(dialogRef.close).toHaveBeenCalled();
  }));

  it('should add new boat and close dialog on Save', fakeAsync(() => {
    component.boat = { name: 'New Boat', description: 'New Desc' };
    fixture.detectChanges();
    tick();

    const newBoat = { id: 2, name: 'New Boat', description: 'New Desc' };
    boatService.addBoat.and.returnValue(of(newBoat));

    const saveButton = fixture.debugElement.query(
      By.css('button[mat-raised-button]')
    ).nativeElement;
    saveButton.click();
    tick();

    expect(boatService.addBoat).toHaveBeenCalledWith({
      name: 'New Boat',
      description: 'New Desc',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(newBoat);
  }));

  it('should update existing boat and close dialog on Save', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: imports,
      providers: [
        { provide: BoatService, useValue: boatService },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            boat: { id: 1, name: 'Updated Boat', description: 'Updated Desc' },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBoatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    const updatedBoat = {
      id: 1,
      name: 'Updated Boat',
      description: 'Updated Desc',
    };
    boatService.updateBoat.and.returnValue(of(updatedBoat));

    const saveButton = fixture.debugElement.query(
      By.css('button[mat-raised-button]')
    ).nativeElement;
    saveButton.click();
    tick();

    expect(boatService.updateBoat).toHaveBeenCalledWith(1, {
      id: 1,
      name: 'Updated Boat',
      description: 'Updated Desc',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(updatedBoat);
  }));

  it('should display initial values in inputs for editing', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: imports,
      providers: [
        { provide: BoatService, useValue: boatService },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            boat: { id: 1, name: 'Test Boat', description: 'Test Desc' },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBoatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();

    const nameInput = fixture.debugElement.query(
      By.css('input[placeholder="Enter boat name"]')
    ).nativeElement;
    const descInput = fixture.debugElement.query(
      By.css('input[placeholder="Enter boat description"]')
    ).nativeElement;

    expect(nameInput.value).toBe('Test Boat');
    expect(descInput.value).toBe('Test Desc');
  }));
});
