import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-info-dialog',
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButton
    ],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.css'
})
export class InfoDialogComponent {
    readonly dialogRef = inject(MatDialogRef<InfoDialogComponent>);
    readonly data = inject(MAT_DIALOG_DATA);

    onClose(): void {
        this.dialogRef.close();
    }
}
