import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-feedback-dialog',
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButton,
    ],
  templateUrl: './feedback-dialog.component.html',
  styleUrl: './feedback-dialog.component.css'
})
export class FeedbackDialogComponent {
    readonly dialogRef = inject(MatDialogRef<FeedbackDialogComponent>);
    readonly data = inject(MAT_DIALOG_DATA);
    resultSig = signal('');

    constructor() {
        if (this.data.correct) {
            this.resultSig.set('CORRECT');
        } else if (this.data.error === 'SOLUTION_EXISTS') {
            this.resultSig.set('SOLUTION_EXISTS');
        } else {
            this.resultSig.set('WRONG');
        }
    }

    public onClose() {
        this.dialogRef.close();
    }
}
