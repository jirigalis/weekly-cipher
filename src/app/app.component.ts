import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from './core/auth.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatIcon, MatMiniFabButton, MatTooltip],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    private router = inject(Router);
    public auth = inject(AuthService);
    title = 'Zálesák - Šifry';

    goToLogin() {
        this.router.navigate(['/login']);
    }

    goToAdmin() {
        this.router.navigate(['/admin']);
    }

    goHome() {
        this.router.navigate(['/']);
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/']);
    }
}
