import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';
import { Result } from '../../core/data.interface';
import { ApiService } from '../../core/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { first } from 'rxjs';

@Component({
  selector: 'app-results',
    imports: [
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatTable,
        MatHeaderCell,
        MatCellDef,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatRowDef,
        MatColumnDef,
        MatCell,
        MatHeaderRow,
        MatRow
    ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent {
    dataSource: Result[] = [];
    readonly displayedColumns: string[] = ['position', 'name', 'correct'];
    readonly apiService = inject(ApiService);

    constructor() {
        this.reloadResults();

        this.apiService.updates.pipe(takeUntilDestroyed()).subscribe(() => {
            this.reloadResults();
        });
    }

    reloadResults() {
        this.apiService.getResults().pipe(
            first(),
            // map((res, index) => ({ ...res, position: index + 1 })),
        ).subscribe((results: Result[]) => {
            // add position to results
            results.forEach((result, index) => {
                result.position = index + 1;
            });
            this.dataSource = results
        });
    }
}
