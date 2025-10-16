import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService, Transaction } from '../../services/blockchain.service';
import { I18nService } from '../../services/i18n.service';
import { CardComponent } from '../../components/ui/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../components/ui/badge/badge.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];

  constructor(
    private blockchainService: BlockchainService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.blockchainService.getTransactions().subscribe(txs => {
      this.transactions = txs;
    });
  }

  formatHash(hash: string): string {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  }

  formatAddress(address: string): string {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  getStatusClass(status: string): BadgeVariant {
    switch (status) {
      case 'success': return 'success';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      default: return 'info';
    }
  }
}
