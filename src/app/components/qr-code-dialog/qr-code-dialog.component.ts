import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-qr-code-dialog',
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose
    ],
  templateUrl: './qr-code-dialog.component.html',
  styleUrl: './qr-code-dialog.component.css'
})
export class QrCodeDialogComponent {
    qrCodeUrl = signal('');
    readonly data = inject(MAT_DIALOG_DATA);

    constructor() {
        const url = window.location.origin + '/assets/qr-codes/message-'+ this.data.messageNumber + '.png';
        this.qrCodeUrl.set(url);
    }
}
