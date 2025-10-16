import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService } from '../../services/blockchain.service';
import { I18nService } from '../../services/i18n.service';
import { CardComponent } from '../../components/ui/card/card.component';
import { StatCardComponent } from '../../components/ui/stat-card/stat-card.component';
import { BadgeComponent } from '../../components/ui/badge/badge.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule, CardComponent, StatCardComponent, BadgeComponent],
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss']
})
export class ShowcaseComponent implements OnInit {
  recentActivity: any[] = [];
  networkHealth = { status: 'Excellent', percentage: 98 };
  topAccounts: any[] = [];
  blockProductionRate: any[] = [];
  messageTypeDistribution: any = {};
  
  constructor(
    private blockchainService: BlockchainService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.loadShowcaseData();
  }

  loadShowcaseData() {
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

  processRecentActivity(blocks: any[], transactions: any[]) {
    this.recentActivity = [
      ...blocks.slice(0, 5).map(b => ({
        type: 'block',
        title: `Block #${b.height}`,
        subtitle: `${b.txCount} transactions`,
        time: b.timestamp,
        icon: 'block'
      })),
      ...transactions.slice(0, 10).map(t => ({
        type: 'transaction',
        title: t.status === 'success' ? 'Transaction Success' : 'Transaction ' + t.status,
        subtitle: `${t.amount.toFixed(4)} tokens`,
        time: t.timestamp,
        icon: 'transaction',
        status: t.status
      }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 15);
  }

  calculateNetworkHealth(blocks: any[], transactions: any[]) {
    const recentBlocks = blocks.slice(0, 10);
    const avgTxPerBlock = recentBlocks.reduce((sum, b) => sum + b.txCount, 0) / recentBlocks.length;
    const successRate = transactions.filter(t => t.status === 'success').length / transactions.length * 100;
    
    this.networkHealth.percentage = Math.round((avgTxPerBlock / 100 * 40) + (successRate * 0.6));
    
    if (this.networkHealth.percentage >= 90) this.networkHealth.status = 'Excellent';
    else if (this.networkHealth.percentage >= 75) this.networkHealth.status = 'Good';
    else if (this.networkHealth.percentage >= 60) this.networkHealth.status = 'Fair';
    else this.networkHealth.status = 'Poor';
  }

  analyzeTopAccounts(transactions: any[]) {
    const accountActivity: any = {};
    
    transactions.forEach(tx => {
      accountActivity[tx.from] = (accountActivity[tx.from] || 0) + tx.amount;
      accountActivity[tx.to] = (accountActivity[tx.to] || 0) + 1;
    });

    this.topAccounts = Object.entries(accountActivity)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([address, activity]) => ({
        address: this.formatAddress(address as string),
        activity: activity as number
      }));
  }

  calculateBlockProductionRate(blocks: any[]) {
    const hourly = new Array(24).fill(0);
    blocks.forEach(block => {
      const hour = block.timestamp.getHours();
      hourly[hour]++;
    });
    
    this.blockProductionRate = hourly.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    })).slice(-12);
  }

  analyzeMessageTypes(messages: any[]) {
    this.messageTypeDistribution = {};
    messages.forEach(msg => {
      const type = msg.type || 'Unknown';
      this.messageTypeDistribution[type] = (this.messageTypeDistribution[type] || 0) + 1;
    });
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

  getHealthColor(): string {
    if (this.networkHealth.percentage >= 90) return 'text-green-500';
    if (this.networkHealth.percentage >= 75) return 'text-blue-500';
    if (this.networkHealth.percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  }
}
