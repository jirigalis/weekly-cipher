import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoggedUser } from './data.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl
    currentUserSig = signal<LoggedUser | undefined | null>(undefined)

    constructor() {
        const userLS = this.getUserFromLS();
        this.currentUserSig.set(userLS);
    }

    login(name: string, password: string): Observable<string> {
        return this.http.post<string>(this.apiUrl + '/login', { name, password })
    }

    logout(): void {
        this.currentUserSig.set(null);
        localStorage.removeItem('token');
    }

    setCurrentUser(user: LoggedUser) {
        this.currentUserSig.set(user);
        localStorage.setItem('token', user.token);
    }

    isLoggedIn(): boolean {
        return this.currentUserSig() != null;
    }

    private getUserFromLS(): any {
        const token = localStorage.getItem('token') ?? '';

        if (!token) {
            return null;
        }

        const decodedToken: any = jwtDecode(token);
        return {
            username: decodedToken.context.user.username,
            id: decodedToken.context.user.id,
            token: token
        }
    }
}
