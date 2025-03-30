import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Boat } from '../../models/boat';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-boat-details-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './boat-details-dialog.component.html',
  styleUrl: './boat-details-dialog.component.css',
})
export class BoatDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Boat,
    public dialogRef: MatDialogRef<BoatDetailsDialogComponent>
  ) {}
}
