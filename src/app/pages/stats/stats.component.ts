import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStatsComponent } from '../../components/network-stats/network-stats.component';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, NetworkStatsComponent],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent {
  constructor(public i18n: I18nService) {}
}

