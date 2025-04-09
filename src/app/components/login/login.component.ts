import { Component, DestroyRef, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggedUser } from '../../core/data.interface';
import { catchError } from 'rxjs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
    imports: [
        MatCardTitle,
        MatCard,
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        MatButton,
        MatCardContent,
        MatCardHeader,
        MatCardActions,
        MatIcon,
        MatLabel,
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    readonly authService = inject(AuthService);
    readonly snack = inject(MatSnackBar);
    private destroyRef = inject(DestroyRef);
    private fb = inject(FormBuilder);
    private router = inject(Router);

    form = this.fb.nonNullable.group({
        name: ['', Validators.required],
        password: ['', Validators.required],
    })

    onSubmit() {
        const name = this.form.value.name;
        const password = this.form.value.password;

        if (this.form.invalid) {
            return;
        }

        this.authService.login(name!, password!).pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError((error) => {
                this.snack.open('Špatné přihlašovací údaje', 'OK', {
                    duration: 3000,
                });
                throw error;
            })
        ).subscribe((token: string) => {
            const user: LoggedUser = {
                name: name!,
                token: token,
            }

            this.authService.setCurrentUser(user);
            this.router.navigate(['/admin']);
        })
    }
}
