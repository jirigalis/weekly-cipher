import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-image-detail',
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButton,
    ],
  templateUrl: './image-detail.component.html',
  styleUrl: './image-detail.component.css'
})
export class ImageDetailComponent {
    readonly dialogRef = inject(MatDialogRef<ImageDetailComponent>);
    readonly data = inject(MAT_DIALOG_DATA);

    onClose(): void {
        this.dialogRef.close();
    }
}
