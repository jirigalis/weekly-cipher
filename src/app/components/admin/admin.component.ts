import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
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
import { Cipher } from '../../core/data.interface';
import { ApiService } from '../../core/api.service';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CipherDialogComponent } from './cipher-dialog/cipher-dialog.component';
import { map, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-admin',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatTable,
        MatSort,
        MatColumnDef,
        MatHeaderCell,
        MatCell,
        MatHeaderCellDef,
        MatCellDef,
        MatHeaderRow,
        MatRow,
        MatRowDef,
        MatHeaderRowDef,
        MatCardActions,
        MatIcon,
        MatButton,
        MatSortHeader,
        MatIconButton,
        MatTooltip
    ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements AfterViewInit {
    readonly apiService = inject(ApiService);
    readonly snack = inject(MatSnackBar);
    private dialog = inject(MatDialog);


    public ciphersDataSource: MatTableDataSource<Cipher>;
    columns: { key: string, header: string }[] = [
        {
            key: 'id',
            header: 'ID',
        },
        {
            key: 'number',
            header: '#',
        },
        {
            key: 'name',
            header: 'Jméno',
        },
        {
            key: 'active',
            header: 'Aktivní',
        },
        {
            key: 'created',
            header: 'Vytvořeno',
        },
        {
            key: 'realSolution',
            header: 'Řešení',
        },
        {
            key: 'image',
            header: 'Obrázek',
        },
        {
            key: 'actions',
            header: 'Akce',
        },
    ];
    displayedColumns = this.columns.map((column) => column.key);

    @ViewChild(MatSort) sort: MatSort;

    public ngAfterViewInit() {
       this.refreshData();
    }

    public addCipher() {
        const dialogRef = this.dialog.open(CipherDialogComponent, {
            width: '95%',
            maxWidth: '800px',
            data: {
                cipher: null
            }
        })

        dialogRef.afterClosed().pipe(
            map((res) => {
                const date = new Date(res.created);
                const created = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
                return {
                    ...res,
                    created: created
                }
            }),
            switchMap((res) => this.apiService.addCipher(res))
        ).subscribe((_res) => {
            this.refreshData();
            this.snack.open('Šifra byla úspěšně přidána', 'Zavřít', { duration: 2000 });
        })
    }

    public editCipher(cipher: Cipher) {
        const dialogRef = this.dialog.open(CipherDialogComponent, {
            width: '95%',
            maxWidth: '800px',
            data: { cipher }
        });

        dialogRef.afterClosed().pipe(
            map((res) => {
                const date = new Date(res.created);
                const created = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
                return {
                    ...res,
                    created: created
                }
            }),
            switchMap((res) => this.apiService.editCipher(res))
        ).subscribe((_res) => {
            this.refreshData();
            this.snack.open('Šifra byla úspěšně upravena', 'Zavřít', { duration: 2000 });
        })
    }

    public deleteCipher(cipherId: number) {
        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

        dialogRef.afterClosed().pipe(
            switchMap((res) => {
                if (res) {
                    return this.apiService.deleteCipher(cipherId);
                }
                return [];
            })
        ).subscribe((_res) => {
            this.refreshData();
            this.snack.open('Šifra byla úspěšně smazána', 'Zavřít', { duration: 2000 });
        });
    }

    private refreshData() {
        this.apiService.getCiphers().subscribe((ciphers: Cipher[]) => {
            this.ciphersDataSource = new MatTableDataSource(ciphers);
            this.ciphersDataSource.sort = this.sort;
        });
    }
}
