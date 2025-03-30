import { Component, OnInit } from '@angular/core';
import { BoatService } from '../../services/boat.service';
import { Router } from '@angular/router';
import { Boat } from '../../models/boat';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddBoatDialogComponent } from '../add-boat-dialog/add-boat-dialog.component';
import { AuthService } from '../../services/auth.service';
import { BoatDetailsDialogComponent } from '../boat-details-dialog/boat-details-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-boat-list',
  imports: [CommonModule, MatDialogModule, MatTooltipModule],
  templateUrl: './boat-list.component.html',
  styleUrl: './boat-list.component.css',
})
export class BoatListComponent implements OnInit {
  boats: Boat[] = [];

  constructor(
    private boatService: BoatService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBoats();
  }

  loadBoats() {
    this.boatService.getBoats().subscribe({
      next: (boats) => (this.boats = boats),
      error: (err) => console.error('Failed to load boats:', err),
    });
  }

  addBoat() {
    const dialogRef = this.dialog.open(AddBoatDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      backdropClass: 'bg-gray-900/50',
      data: {}, // Empty data for adding
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadBoats();
      }
    });
  }

  editBoat(id: number, event: Event) {
    event.stopPropagation(); // Prevent click from bubbling to the row
    this.boatService.getBoat(id).subscribe({
      next: (boat) => {
        const dialogRef = this.dialog.open(AddBoatDialogComponent, {
          width: '500px',
          backdropClass: 'bg-gray-900/50',
          data: { boat },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loadBoats();
          }
        });
      },
      error: (err) => console.error('Failed to fetch boat:', err),
    });
  }

  deleteBoat(id: number) {
    if (confirm('Are you sure you want to delete this boat?')) {
      this.boatService.deleteBoat(id).subscribe({
        next: () => this.loadBoats(),
        error: (err) => console.error('Failed to delete boat:', err),
      });
    }
  }
  viewBoat(id: number) {
    this.router.navigate(['/boats', id]);
  }

  logout() {
    this.authService.logout();
  }

  openBoatDetailsDialog(boat: Boat, event: Event) {
    event.stopPropagation(); // Prevent parent click from triggering

    // Check if the click target is not a button or link
    const target = event.target as HTMLElement;
    if (target.tagName !== 'BUTTON' && target.tagName !== 'A') {
      this.dialog.open(BoatDetailsDialogComponent, {
        width: '500px',
        data: boat,
        backdropClass: 'bg-gray-900/50',
      });
    }
  }
}
