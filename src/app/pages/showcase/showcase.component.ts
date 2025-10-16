import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService } from '../../services/blockchain.service';
import { I18nService } from '../../services/i18n.service';
import { CardComponent } from '../../components/ui/card/card.component';
import { BadgeComponent } from '../../components/ui/badge/badge.component';
import { forkJoin } from 'rxjs';

interface Activity {
  type: 'block' | 'transaction';
  title: string;
  subtitle: string;
  time: Date;
  icon: string;
  status?: string;
}

interface NetworkHealth {
  status: string;
  percentage: number;
}

interface TopAccount {
  address: string;
  activity: number;
}

interface BlockProductionData {
  hour: string;
  count: number;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss']
})
export class ShowcaseComponent implements OnInit {
  // Only data that changes and is displayed in template should be signals
  recentActivity = signal<Activity[]>([]);
  networkHealth = signal<NetworkHealth>({ status: 'Excellent', percentage: 98 });
  topAccounts = signal<TopAccount[]>([]);
  blockProductionRate = signal<BlockProductionData[]>([]);
  messageTypeDistribution = signal<Record<string, number>>({});
  
  // Computed signal for health color (derives from networkHealth signal)
  healthColor = computed(() => {
    const health = this.networkHealth();
    if (health.percentage >= 90) return 'text-green-500';
    if (health.percentage >= 75) return 'text-blue-500';
    if (health.percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  });
  
  constructor(
    private blockchainService: BlockchainService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.loadShowcaseData();
  }

  private loadShowcaseData() {
    forkJoin({
      blocks: this.blockchainService.getBlocks(),
      transactions: this.blockchainService.getTransactions(),
      messages: this.blockchainService.getMessages()
    }).subscribe(data => {
      this.processRecentActivity(data.blocks, data.transactions);
      this.calculateNetworkHealth(data.blocks, data.transactions);
      this.analyzeTopAccounts(data.transactions);
      this.calculateBlockProductionRate(data.blocks);
      this.analyzeMessageTypes(data.messages);
    });
  }

  private processRecentActivity(blocks: any[], transactions: any[]) {
    const activity: Activity[] = [
      ...blocks.slice(0, 5).map(b => ({
        type: 'block' as const,
        title: `Block #${b.height}`,
        subtitle: `${b.txCount} transactions`,
        time: b.timestamp,
        icon: 'block'
      })),
      ...transactions.slice(0, 10).map(t => ({
        type: 'transaction' as const,
        title: t.status === 'success' ? 'Transaction Success' : 'Transaction ' + t.status,
        subtitle: `${t.amount.toFixed(4)} tokens`,
        time: t.timestamp,
        icon: 'transaction',
        status: t.status
      }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 15);
    
    this.recentActivity.set(activity);
  }

  private calculateNetworkHealth(blocks: any[], transactions: any[]) {
    const recentBlocks = blocks.slice(0, 10);
    const avgTxPerBlock = recentBlocks.reduce((sum, b) => sum + b.txCount, 0) / recentBlocks.length;
    const successRate = transactions.filter(t => t.status === 'success').length / transactions.length * 100;
    
    const percentage = Math.round((avgTxPerBlock / 100 * 40) + (successRate * 0.6));
    let status = 'Poor';
    
    if (percentage >= 90) status = 'Excellent';
    else if (percentage >= 75) status = 'Good';
    else if (percentage >= 60) status = 'Fair';
    
    this.networkHealth.set({ status, percentage });
  }

  private analyzeTopAccounts(transactions: any[]) {
    const accountActivity: Record<string, number> = {};
    
    transactions.forEach(tx => {
      accountActivity[tx.from] = (accountActivity[tx.from] || 0) + tx.amount;
      accountActivity[tx.to] = (accountActivity[tx.to] || 0) + 1;
    });

    const accounts: TopAccount[] = Object.entries(accountActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([address, activity]) => ({
        address: this.formatAddress(address),
        activity
      }));
    
    this.topAccounts.set(accounts);
  }

  private calculateBlockProductionRate(blocks: any[]) {
    const hourly = new Array(24).fill(0);
    blocks.forEach(block => {
      const hour = block.timestamp.getHours();
      hourly[hour]++;
    });
    
    const rate: BlockProductionData[] = hourly.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    })).slice(-12);
    
    this.blockProductionRate.set(rate);
  }

  private analyzeMessageTypes(messages: any[]) {
    const distribution: Record<string, number> = {};
    messages.forEach(msg => {
      const type = msg.type || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    this.messageTypeDistribution.set(distribution);
  }

  formatAddress(address: string): string {
    if (address.length > 20) {
      return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
    }
    return address;
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }

  getActivityIcon(): string {
    return `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>`;
  }
}
