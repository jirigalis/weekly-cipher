import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Message } from '../../../core/data.interface';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-message-dialog',
    imports: [
        MatDialogTitle,
        ReactiveFormsModule,
        MatDialogContent,
        MatFormField,
        MatInput,
        MatLabel,
        MatDialogActions,
        MatButton,
        MatDialogClose,

    ],
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.css'
})
export class MessageDialogComponent {
    private fb = inject(FormBuilder);
    readonly data = inject(MAT_DIALOG_DATA);
    readonly dialogRef = inject(MatDialogRef<MessageDialogComponent>);

    messageSig = signal<Message | null>(null);
    form = this.fb.nonNullable.group({
        number: [this.data.message?.number, [Validators.required, Validators.min(1)]],
        text: [this.data.message?.text, Validators.required],
    })

    constructor() {
        this.messageSig.set(this.data.message);
    }

    public save() {
        if (this.form.invalid) {
            return;
        }

        const result: Message = this.form.getRawValue();
        // if there is the ID attribute, add it to the result
        if (this.data.message?.id) {
            result.id = this.data.message.id;
        }
        this.dialogRef.close(result);
    }
}
