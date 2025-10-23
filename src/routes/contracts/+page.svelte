<script lang="ts">
	import { translate } from '$lib/stores/i18n';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import AccountLink from '$lib/components/ui/AccountLink.svelte';

	$: t = $translate;

	interface SystemContract {
		name: string;
		address: string;
		description: string;
	}

	const systemContracts: SystemContract[] = [
		{
			name: 'Mobile Verifier Root',
			address: '0:2222222222222222222222222222222222222222222222222222222222222222',
			description: 'Root contract for mobile verification'
		},
		{
			name: 'Update Zero Contract',
			address: '0:3333333333333333333333333333333333333333333333333333333333333333',
			description: 'Handles system updates and zero-state management'
		},
		{
			name: 'License Root',
			address: '0:4444444444444444444444444444444444444444444444444444444444444444',
			description: 'Root contract for licensing system'
		},
		{
			name: 'Block Manager Root',
			address: '0:6666666666666666666666666666666666666666666666666666666666666666',
			description: 'Manages block production and validation'
		},
		{
			name: 'Block Keeper Root',
			address: '0:7777777777777777777777777777777777777777777777777777777777777777',
			description: 'Maintains block storage and archival'
		},
		{
			name: 'Currency Collection Config',
			address: '0:8888888888888888888888888888888888888888888888888888888888888888',
			description: 'Configuration for currency collection'
		},
		{
			name: 'Dapp Root Config',
			address: '0:9999999999999999999999999999999999999999999999999999999999999999',
			description: 'Root configuration for decentralized applications'
		}
	];

	function formatAddress(address: string): string {
		return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="page-container">
	<h1 class="page-title">{t('contracts.title')}</h1>

	<Card>
		<div class="table-wrapper">
			<table class="data-table">
				<thead class="table-header">
					<tr>
						<th class="table-th">{t('contracts.headers.name')}</th>
						<th class="table-th">{t('contracts.headers.address')}</th>
						<th class="table-th">{t('contracts.headers.description')}</th>
						<th class="table-th">{t('contracts.headers.type')}</th>
					</tr>
				</thead>
				<tbody class="table-body">
					{#each systemContracts as contract}
						<tr class="table-row">
							<td class="table-td">
								<span class="font-semibold">{contract.name}</span>
							</td>
							<td class="table-td">
								<AccountLink address={contract.address} showFullAddress={true} />
							</td>
							<td class="table-td">
								<span class="text-sm">{contract.description}</span>
							</td>
							<td class="table-td">
								<Badge variant="warning">{t('contracts.type.system')}</Badge>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>
