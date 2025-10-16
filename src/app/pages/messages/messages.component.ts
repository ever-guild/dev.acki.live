import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService, Message } from '../../services/blockchain.service';
import { I18nService } from '../../services/i18n.service';
import { CardComponent } from '../../components/ui/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../components/ui/badge/badge.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];

  constructor(
    private blockchainService: BlockchainService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.blockchainService.getMessages().subscribe(msgs => {
      this.messages = msgs;
    });
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

  formatData(data: string): string {
    if (data.length > 50) {
      return data.substring(0, 50) + '...';
    }
    return data;
  }

  getTypeColor(type: string): BadgeVariant {
    const colors: {[key: string]: BadgeVariant} = {
      'Transfer': 'primary',
      'Stake': 'success',
      'Unstake': 'warning',
      'Vote': 'secondary',
      'Delegate': 'info',
      'Claim': 'pending'
    };
    return colors[type] || 'info';
  }
}
