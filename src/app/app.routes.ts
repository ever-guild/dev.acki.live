import { Routes } from '@angular/router';
import { BlocksComponent } from './pages/blocks/blocks.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { StatsComponent } from './pages/stats/stats.component';
import { ShowcaseComponent } from './pages/showcase/showcase.component';

export const routes: Routes = [
  { path: '', redirectTo: '/blocks', pathMatch: 'full' },
  { path: 'blocks', component: BlocksComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'contracts', component: ContractsComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'showcase', component: ShowcaseComponent }
];
