import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-label">{{ label }}</span>
        <div class="stat-card-icon" [innerHTML]="icon"></div>
      </div>
      <p class="stat-card-value">{{ value }}</p>
    </div>
  `,
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() icon: string = '';
}
