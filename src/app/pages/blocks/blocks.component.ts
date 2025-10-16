import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService, Block } from '../../services/blockchain.service';
import { I18nService } from '../../services/i18n.service';
import { CardComponent } from '../../components/ui/card/card.component';
import { BadgeComponent } from '../../components/ui/badge/badge.component';

@Component({
  selector: 'app-blocks',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnInit {
  blocks: Block[] = [];

  constructor(
    private blockchainService: BlockchainService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.blockchainService.getBlocks().subscribe(blocks => {
      this.blocks = blocks;
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
}
