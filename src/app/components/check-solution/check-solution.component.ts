import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { Cipher } from '../../core/data.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ImageDetailComponent } from '../image-detail/image-detail.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-check-solution',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatCardActions,
        MatError,
        MatHint,
        MatButton,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        MatSelect,
        MatOption,
        DatePipe,
    ],
  templateUrl: './check-solution.component.html',
  styleUrl: './check-solution.component.css'
})
export class CheckSolutionComponent {
    readonly apiService = inject(ApiService);
    readonly dialog = inject(MatDialog);
    public ciphersSig: WritableSignal<Cipher[]> = signal([]);
    public selectedCipherSig: WritableSignal<Cipher | null> = signal(null);
    private snackBar = inject(MatSnackBar);
    readonly destroyRef = inject(DestroyRef);

    // form
    readonly checkSolutionForm = new FormGroup({
        nameControl: new FormControl<string | null>(null),
        cipherControl: new FormControl<number | null>(null, [Validators.required]),
        solutionControl: new FormControl<string | null>(null, [Validators.required]),
    });

    constructor() {
        this.apiService.getActiveCiphers().pipe(
            takeUntilDestroyed(),
        ).subscribe((ciphers: Cipher[]) => {
            if (ciphers.length > 0) {
                this.ciphersSig.set(ciphers);
                this.selectedCipherSig.set(ciphers[0]);

                this.checkSolutionForm.get('cipherControl')!.setValue(ciphers[0].id!);
            }
        });
    }

    onCipherChange() {
        const selectedCipher = this.ciphersSig().find(cipher => cipher.id === this.checkSolutionForm.get('cipherControl')!.value);
        this.selectedCipherSig.set(selectedCipher || null);
    }

    openDetail(): void {
        const imagePath = 'assets/' + this.selectedCipherSig()?.image;
        this.dialog.open(ImageDetailComponent, {
            width: '95%',
            maxWidth: '1200px',
            data: imagePath,
        });
    }

    openInfoDialog(): void {
        this.dialog.open(InfoDialogComponent, {
            width: '95%',
            maxWidth: '700px',
        });
    }

    checkSolution(): void {
        if (!this.checkSolutionForm.valid) {
            return;
        }

        const solution = this.checkSolutionForm.get('solutionControl')!.value;
        const cipherId = this.checkSolutionForm.get('cipherControl')!.value;
        const name = this.checkSolutionForm.get('nameControl')!.value;

        this.apiService.checkSolution(solution!, cipherId!, name).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((_error) => {
                this.snackBar.open('Došlo k chybě, zkuste to prosím později.', 'OK', { duration: 5000 });
                return [];
            }),
        ).subscribe((result: any) => {
            this.dialog.open(FeedbackDialogComponent, {
                width: '95%',
                maxWidth: '700px',
                data: {
                    correct: result.correct,
                    error: result.error
                }
            });

            if (result.correct) {
                this.apiService.updates.next();
            }
        });
    }
}
