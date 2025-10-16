import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead class="table-head">
            <tr>
              <ng-content select="[slot=header]"></ng-content>
            </tr>
          </thead>
          <tbody class="table-body">
            <ng-content></ng-content>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() minWidth: string = '800px';
}
