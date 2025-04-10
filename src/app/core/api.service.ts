import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Cipher, Message, Result } from './data.interface';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl

    public updates = new Subject<void>();

    getUsers() {
        return this.http.get(this.apiUrl + '/users');
    }

    getResults(): Observable<Result[]> {
        return this.http.get<Result[]>(this.apiUrl + '/results');
    }

    getSolutions() {
        return this.http.get(this.apiUrl + '/solutions');
    }

    getCiphers(): Observable<Cipher[]> {
        return this.http.get<Cipher[]>(this.apiUrl + '/ciphers');
    }

    getActiveCiphers(): Observable<Cipher[]> {
        return this.http.get<Cipher[]>(this.apiUrl + '/ciphers/active');
    }

    checkSolution(solution: string, cipherId: number, name: string | null) {
        return this.http.post(this.apiUrl + '/check', { solution, cipherId, name });
    }

    addCipher(cipher: Cipher) {
        return this.http.post(this.apiUrl + '/ciphers', cipher);
    }

    editCipher(cipher: Cipher) {
        return this.http.put(this.apiUrl + '/ciphers', cipher);
    }

    deleteCipher(cipherId: number) {
        return this.http.delete(this.apiUrl + '/ciphers/' + cipherId);
    }

    // MESSAGES
    getMessages(): Observable<Message[]> {
        return this.http.get<Message[]>(this.apiUrl + '/messages');
    }

    getMessageByNumber(messageNumber: number): Observable<Message> {
        return this.http.get<Message>(this.apiUrl + '/messages/number/' + messageNumber);
    }

    getMessage(messageId: number): Observable<Message> {
        return this.http.get<Message>(this.apiUrl + '/messages/' + messageId);
    }

    addMessage(message: Message) {
        return this.http.post(this.apiUrl + '/messages', message);
    }

    editMessage(message: Message) {
        return this.http.put(this.apiUrl + '/messages', message);
    }

    deleteMessage(messageId: number) {
        return this.http.delete(this.apiUrl + '/messages/' + messageId);
    }
}
