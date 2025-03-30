import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { BoatService } from '../../services/boat.service';
import { Boat } from '../../models/boat';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-boat-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './add-boat-dialog.component.html',
  styleUrl: './add-boat-dialog.component.css',
})
export class AddBoatDialogComponent {
  boat: Boat = { name: '', description: '' };

  constructor(
    private boatService: BoatService,
    public dialogRef: MatDialogRef<AddBoatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.boat =
      data && data.boat ? { ...data.boat } : { name: '', description: '' };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.boat.id) {
      // Update existing boat
      this.boatService
        .updateBoat(this.boat.id, this.boat)
        .subscribe((updatedBoat) => {
          this.dialogRef.close(updatedBoat);
        });
    } else {
      // Add new boat
      this.boatService.addBoat(this.boat).subscribe((newBoat) => {
        this.dialogRef.close(newBoat);
      });
    }
  }

  isFormValid(): boolean {
    return (
      !!this.boat.name &&
      this.boat.name.trim() !== '' &&
      !!this.boat.description &&
      this.boat.description.trim() !== ''
    );
  }
}
