import { Component, inject, signal } from '@angular/core';
import { Cipher } from '../../../core/data.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatDatepicker, MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';

@Component({
    selector: 'app-cipher-dialog',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        MatInputModule,
        MatHint,
        MatSlideToggle,
        MatLabel,
        MatDatepickerToggle,
        MatDatepickerModule,
        MatDatepicker,
        MatDatepickerInput,
    ],
    templateUrl: './cipher-dialog.component.html',
    styleUrl: './cipher-dialog.component.css'
})
export class CipherDialogComponent {
    private fb = inject(FormBuilder);
    readonly data = inject(MAT_DIALOG_DATA);
    readonly dialogRef = inject(MatDialogRef<CipherDialogComponent>);

    cipherSig = signal<Cipher | null>(null);
    form = this.fb.nonNullable.group({
        number: [this.data.cipher?.number, [Validators.required, Validators.min(1)]],
        name: [this.data.cipher?.name, Validators.required],
        active: [this.data.cipher?.active ? this.data.cipher.active : false, Validators.required],
        created: [this.data.cipher?.created, Validators.required],
        realSolution: [this.data.cipher?.realSolution, Validators.required],
        image: [this.data.cipher?.image, Validators.required],
    })

    constructor() {
        this.cipherSig.set(this.data.cipher);
    }

    public save() {
        if (this.form.invalid) {
            return;
        }

        const result: Cipher = this.form.getRawValue();
        // if there is the ID attribute, add it to the result
        if (this.data.cipher?.id) {
            result.id = this.data.cipher.id
        }

        this.dialogRef.close(result);
    }
}
