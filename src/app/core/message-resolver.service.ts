import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { Message } from './data.interface';

@Injectable({
    providedIn: 'root'
})
export class MessageResolverService implements Resolve<Message> {
    private apiService = inject(ApiService);

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return this.apiService.getMessage(route.params['messageId']).pipe(
            catchError(_error => of([]))
        )
    }
}
