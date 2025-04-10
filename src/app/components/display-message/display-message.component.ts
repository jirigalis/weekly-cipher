import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Message } from '../../core/data.interface';

@Component({
    selector: 'app-display-message',
    imports: [
        MatCard,
        MatCardContent
    ],
    templateUrl: './display-message.component.html',
    styleUrl: './display-message.component.css'
})
export class DisplayMessageComponent implements OnInit {
    private readonly activatedRoute = inject(ActivatedRoute);
    public messageSig = signal<Message | null>(null);

    public ngOnInit() {
        this.activatedRoute.data.subscribe((res) => {
            this.messageSig.set(res['message']);
        })
    }
}
