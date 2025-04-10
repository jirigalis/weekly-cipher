import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { Message } from './data.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class MessageResolverService implements Resolve<Message> {
    private apiService = inject(ApiService);
    private snack= inject(MatSnackBar);

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this.apiService.getMessageByNumber(route.params['messageNumber']).pipe(
            catchError(_error => {
                this.snack.open('Zpráva nenalezena', 'Zavřít', { duration: 3000 });
                return of([])
            })
        )
    }
}
