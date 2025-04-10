import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { ApiService } from '../../../core/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '../../../core/data.interface';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-messages',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardActions,
        MatButton,
        MatCardContent,
        MatTable,
        MatSort,
        MatSortHeader,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatCellDef,
        MatCell,
        MatIconButton,
        MatTooltip,
        MatIcon,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatHeaderRowDef
    ],
  templateUrl: './admin-messages.component.html',
  styleUrl: './admin-messages.component.css'
})
export class AdminMessagesComponent implements AfterViewInit {
    readonly apiService = inject(ApiService);
    readonly snack = inject(MatSnackBar);
    readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);

    public messagesDataSource: MatTableDataSource<Message>;
    public displayedColumns: string[] = ['id', 'number', 'text', 'actions'];

    @ViewChild(MatSort) sort!: MatSort;

    public ngAfterViewInit(): void {
        this.refreshData();
    }

    public addMessage(): void {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            width: '95%',
            maxWidth: '800px',
            data: {
                message: null
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.apiService.addMessage(result).subscribe(() => {
                    this.snack.open('Zpráva byla přidána', 'OK', { duration: 3000 });
                    this.refreshData();
                });
            }
        });
    }

    public editMessage(message: Message): void {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            width: '95%',
            maxWidth: '800px',
            data: { message },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.apiService.editMessage(result).subscribe(() => {
                    this.snack.open('Zpráva byla upravena', 'OK', { duration: 3000 });
                    this.refreshData();
                });
            }
        });
    }

    public deleteMessage(messageId: number): void {
        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

        dialogRef.afterClosed().pipe(
            switchMap(res => res ? this.apiService.deleteMessage(messageId) : []),
        ).subscribe(_res => {
            this.snack.open('Zpráva byla smazána', 'OK', { duration: 3000 });
            this.refreshData();
        });
    }

    public refreshData(): void {
        this.apiService.getMessages().subscribe((messages: Message[]) => {
            this.messagesDataSource = new MatTableDataSource(messages);
            this.messagesDataSource.sort = this.sort;
        });
    }

    public viewMessage(messageId: number): void {
        this.router.navigate(['/message', messageId]);
    }
}
