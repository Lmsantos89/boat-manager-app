import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoatDetailsDialogComponent } from './boat-details-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Boat } from '../../models/boat';

describe('BoatDetailsDialogComponent', () => {
  let component: BoatDetailsDialogComponent;
  let fixture: ComponentFixture<BoatDetailsDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<BoatDetailsDialogComponent>>;

  const mockBoat: Boat = {
    id: 1,
    name: 'Test Boat',
    description: 'This is a test boat description',
  };

  beforeEach(async () => {
    // Create a spy object for MatDialogRef
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatButtonModule, BoatDetailsDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockBoat },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoatDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the boat name in the title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
    expect(titleElement.textContent).toContain(mockBoat.name);
  });

  it('should display the boat description', () => {
    const descriptionElement = fixture.debugElement.query(
      By.css('mat-dialog-content p')
    ).nativeElement;
    expect(descriptionElement.textContent).toContain(mockBoat.description);
  });

  it('should close the dialog when the close button is clicked', () => {
    const closeButton = fixture.debugElement.query(
      By.css('button')
    ).nativeElement;
    closeButton.click();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should apply correct styles to the title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
    const classes = Array.from(titleElement.classList);
    expect(classes).toContain('font-bold');
    expect(classes).toContain('text-indigo-900');
    expect(classes).toContain('tracking-wide');
    expect(classes).toContain('text-3xl');
    expect(classes).toContain('mb-6');
    expect(classes).toContain('bg-gradient-to-r');
    expect(classes).toContain('from-indigo-600');
    expect(classes).toContain('via-purple-500');
    expect(classes).toContain('to-pink-500');
  });

  it('should apply correct styles to the description', () => {
    const descElement = fixture.debugElement.query(By.css('p')).nativeElement;
    const classes = Array.from(descElement.classList);
    expect(classes).toContain('text-gray-800');
    expect(classes).toContain('text-lg');
    expect(classes).toContain('leading-relaxed');
    expect(classes).toContain('bg-white');
    expect(classes).toContain('bg-opacity-75');
    expect(classes).toContain('p-4');
    expect(classes).toContain('rounded-lg');
    expect(classes).toContain('border-l-4');
    expect(classes).toContain('border-indigo-500');
  });

  it('should apply correct styles to the close button', () => {
    const buttonElement = fixture.debugElement.query(
      By.css('button')
    ).nativeElement;
    const classes = Array.from(buttonElement.classList);
    expect(classes).toContain('bg-gray-200');
    expect(classes).toContain('text-gray-700');
    expect(classes).toContain('px-4');
    expect(classes).toContain('py-2');
    expect(classes).toContain('rounded-lg');
    expect(classes).toContain('hover:bg-gray-300');
    expect(classes).toContain('focus:ring-2');
    expect(classes).toContain('focus:ring-gray-400');
    expect(classes).toContain('transition');
    expect(classes).toContain('duration-300');
    expect(classes).toContain('transform');
    expect(classes).toContain('hover:scale-105');
  });
});
