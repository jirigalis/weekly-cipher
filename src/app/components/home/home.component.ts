import { Component } from '@angular/core';
import { CheckSolutionComponent } from '../check-solution/check-solution.component';
import { ResultsComponent } from '../results/results.component';

@Component({
  selector: 'app-home',
    imports: [
        CheckSolutionComponent,
        ResultsComponent
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
