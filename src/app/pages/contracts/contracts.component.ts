import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockchainService, Contract } from '../../services/blockchain.service';
import { I18nService } from '../../services/i18n.service';
import { CardComponent } from '../../components/ui/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../components/ui/badge/badge.component';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss']
})
export class ContractsComponent implements OnInit {
  contracts: Contract[] = [];

  constructor(
    private blockchainService: BlockchainService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.blockchainService.getContracts().subscribe(contracts => {
      this.contracts = contracts;
    });
  }

  formatAddress(address: string): string {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  getTypeColor(type: string): BadgeVariant {
    const colors: {[key: string]: BadgeVariant} = {
      'ERC20': 'primary',
      'ERC721': 'secondary',
      'DEX': 'success',
      'Staking': 'pending',
      'DAO': 'info',
      'Bridge': 'warning'
    };
    return colors[type] || 'info';
  }
}
