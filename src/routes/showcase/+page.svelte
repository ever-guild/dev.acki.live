<script lang="ts">
	import { onMount } from 'svelte';
	import { translate } from '$lib/stores/i18n';
	import graphql from '$lib/services/graphql';
	import type { Block, Transaction, Message } from '$lib/services/graphql';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorCard from '$lib/components/ui/ErrorCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import SkeletonLoader from '$lib/components/ui/SkeletonLoader.svelte';

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

	$: t = $translate;

	let recentActivity: Activity[] = [];
	let networkHealth: NetworkHealth = { status: 'Loading...', percentage: 0 };
	let topAccounts: TopAccount[] = [];
	let blockProductionRate: BlockProductionData[] = [];
	let messageTypeDistribution: Record<string, number> = {};
	let loading = true;
	let error: string | null = null;

	$: healthColor =
		networkHealth.percentage >= 90
			? 'text-green-500'
			: networkHealth.percentage >= 75
				? 'text-blue-500'
				: networkHealth.percentage >= 60
					? 'text-yellow-500'
					: 'text-red-500';

	onMount(async () => {
		await loadShowcaseData();
	});

	async function loadShowcaseData() {
		try {
			const [blocks, transactions, messages] = await Promise.all([
				graphql.getLatestBlocks(),
				graphql.getLatestTransactions(),
				graphql.getMessages()
			]);

			processRecentActivity(blocks, transactions);
			calculateNetworkHealth(blocks, transactions);
			analyzeTopAccounts(transactions);
			calculateBlockProductionRate(blocks);
			analyzeMessageTypes(messages);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load showcase data';
		} finally {
			loading = false;
		}
	}

	function processRecentActivity(blocks: Block[], transactions: Transaction[]) {
		const activity: Activity[] = [
			...blocks.slice(0, 5).map((b) => ({
				type: 'block' as const,
				title: `Block #${b.height}`,
				subtitle: `${b.txCount} transactions`,
				time: b.timestamp,
				icon: 'block'
			})),
			...transactions.slice(0, 10).map((t) => ({
				type: 'transaction' as const,
				title: t.status === 'success' ? 'Transaction Success' : 'Transaction ' + t.status,
				subtitle: `${t.amount.toFixed(4)} tokens`,
				time: t.timestamp,
				icon: 'transaction',
				status: t.status
			}))
		]
			.sort((a, b) => b.time.getTime() - a.time.getTime())
			.slice(0, 15);

		recentActivity = activity;
	}

	function calculateNetworkHealth(blocks: Block[], transactions: Transaction[]) {
		const recentBlocks = blocks.slice(0, 10);
		const avgTxPerBlock =
			recentBlocks.reduce((sum, b) => sum + b.txCount, 0) / recentBlocks.length;
		const successRate =
			(transactions.filter((t) => t.status === 'success').length / transactions.length) * 100;

		const percentage = Math.round(avgTxPerBlock / 100 * 40 + successRate * 0.6);
		let status = 'Poor';

		if (percentage >= 90) status = 'Excellent';
		else if (percentage >= 75) status = 'Good';
		else if (percentage >= 60) status = 'Fair';

		networkHealth = { status, percentage };
	}

	function analyzeTopAccounts(transactions: Transaction[]) {
		const accountActivity: Record<string, number> = {};

		transactions.forEach((tx) => {
			accountActivity[tx.from] = (accountActivity[tx.from] || 0) + tx.amount;
			accountActivity[tx.to] = (accountActivity[tx.to] || 0) + 1;
		});

		const accounts: TopAccount[] = Object.entries(accountActivity)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([address, activity]) => ({
				address: formatAddress(address),
				activity
			}));

		topAccounts = accounts;
	}

	function calculateBlockProductionRate(blocks: Block[]) {
		const hourly = new Array(24).fill(0);
		blocks.forEach((block) => {
			const hour = block.timestamp.getHours();
			hourly[hour]++;
		});

		const rate: BlockProductionData[] = hourly
			.map((count, hour) => ({
				hour: `${hour}:00`,
				count
			}))
			.slice(-12);

		blockProductionRate = rate;
	}

	function analyzeMessageTypes(messages: Message[]) {
		const distribution: Record<string, number> = {};
		messages.forEach((msg) => {
			const type = msg.type || 'Unknown';
			distribution[type] = (distribution[type] || 0) + 1;
		});

		messageTypeDistribution = distribution;
	}

	function formatAddress(address: string): string {
		if (address.length > 20) {
			return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
		}
		return address;
	}

	function formatTime(date: Date): string {
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
</script>

<div class="page-container">
	<h1 class="page-title">{t('showcase.title')}</h1>

	{#if loading}
		<SkeletonLoader>
			<!-- Network Health Skeleton -->
			<div class="mb-8">
				<div class="skeleton skeleton-title w-48 mb-4"></div>
				<div class="skeleton skeleton-rect h-48"></div>
			</div>

			<!-- Activity and Accounts Skeleton -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				<div>
					<div class="skeleton skeleton-title w-48 mb-4"></div>
					<div class="skeleton skeleton-rect h-96"></div>
				</div>
				<div>
					<div class="skeleton skeleton-title w-48 mb-4"></div>
					<div class="skeleton skeleton-rect h-96"></div>
				</div>
			</div>

			<!-- Charts Skeleton -->
			<div class="mb-8">
				<div class="skeleton skeleton-title w-64 mb-4"></div>
				<div class="skeleton skeleton-rect h-64"></div>
			</div>
			<div class="mb-8">
				<div class="skeleton skeleton-title w-56 mb-4"></div>
				<div class="skeleton skeleton-rect h-48"></div>
			</div>
		</SkeletonLoader>
	{:else if error}
		<ErrorCard title={t('showcase.loadErrorTitle')} message={error} onRetry={() => window.location.reload()} />
	{:else}
		<!-- Network Health Section -->
		<div class="mb-8">
			<h2 class="section-title">{t('showcase.networkHealth')}</h2>
			<Card>
			<div class="health-container">
				<div class="health-meter">
					<div class="health-circle {healthColor}">
						<span class="health-percentage">{networkHealth.percentage}%</span>
						<span class="health-label">{networkHealth.status}</span>
					</div>
				</div>
				<div class="health-details">
					<div class="health-stat">
						<svg
							class="w-8 h-8 text-green-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<div>
							<div class="stat-label">{t('showcase.stat.blockProduction')}</div>
							<div class="stat-value">{t('showcase.stat.normal')}</div>
						</div>
					</div>
					<div class="health-stat">
						<svg
							class="w-8 h-8 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							></path>
						</svg>
						<div>
							<div class="stat-label">{t('showcase.stat.transactionThroughput')}</div>
							<div class="stat-value">{t('showcase.stat.high')}</div>
						</div>
					</div>
					<div class="health-stat">
						<svg
							class="w-8 h-8 text-purple-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
							></path>
						</svg>
						<div>
							<div class="stat-label">{t('showcase.stat.networkLatency')}</div>
							<div class="stat-value">{t('showcase.stat.low')}</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
		<!-- Recent Activity Feed -->
		<div>
			<h2 class="section-title">{t('showcase.recentActivity')}</h2>
			<Card>
				<div class="activity-feed">
					{#each recentActivity as activity}
						<div class="activity-item">
							<div
								class="activity-icon"
								class:icon-block={activity.type === 'block'}
								class:icon-transaction={activity.type === 'transaction'}
							>
								{#if activity.type === 'block'}
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
										></path>
									</svg>
								{:else}
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
										></path>
									</svg>
								{/if}
							</div>
							<div class="activity-content">
								<div class="activity-title">
									{activity.title}
									{#if activity.status}
										<Badge
											variant={activity.status === 'success'
												? 'success'
												: activity.status === 'pending'
													? 'warning'
													: 'error'}
										>
											{activity.status}
										</Badge>
									{/if}
								</div>
								<div class="activity-subtitle">{activity.subtitle}</div>
							</div>
							<div class="activity-time">{formatTime(activity.time)}</div>
						</div>
					{/each}
				</div>
			</Card>
		</div>

		<!-- Top Active Accounts -->
		<div>
			<h2 class="section-title">{t('showcase.topActiveAccounts')}</h2>
			<Card>
				<div class="top-accounts">
					{#each topAccounts as account, i}
						<div class="account-item">
							<div class="account-rank">
								<span
									class="rank-badge"
									class:rank-gold={i === 0}
									class:rank-silver={i === 1}
									class:rank-bronze={i === 2}
								>
									#{i + 1}
								</span>
							</div>
							<div class="account-address">{account.address}</div>
							<div class="account-activity">
								<Badge variant="info">{account.activity} interactions</Badge>
							</div>
						</div>
					{/each}
					{#if topAccounts.length === 0}
						<div class="empty-state">{t('showcase.loadingAccountData')}</div>
					{/if}
				</div>
			</Card>
		</div>
	</div>

	<!-- Block Production Rate -->
	<div class="mb-8">
	<h2 class="section-title">{t('showcase.blockProductionRate')}</h2>
		<Card>
			<div class="production-chart">
				{#each blockProductionRate as data}
					<div class="chart-bar">
						<div class="bar-container">
							<div class="bar" style="height: {(data.count / 3) * 100}%"></div>
						</div>
						<div class="bar-label">{data.hour}</div>
					</div>
				{/each}
			</div>
		</Card>
	</div>

	<!-- Message Type Distribution -->
	<div class="mb-8">
	<h2 class="section-title">{t('showcase.messageTypeDistribution')}</h2>
		<Card>
			<div class="message-types">
				{#each Object.entries(messageTypeDistribution) as [type, count]}
					<div class="message-type-item">
						<div class="type-label">{type}</div>
						<div class="type-bar-container">
							<div class="type-bar" style="width: {(count / 20) * 100}%"></div>
						</div>
						<div class="type-count">{count}</div>
					</div>
				{/each}
				{#if Object.keys(messageTypeDistribution).length === 0}
					<div class="empty-state">{t('showcase.loadingMessageData')}</div>
				{/if}
		</Card>
	</div>
	{/if}
</div>

<style>
	.health-container {
		@apply flex flex-col md:flex-row items-center gap-8 p-6;
	}

	.health-meter {
		@apply flex-shrink-0;
	}

	.health-circle {
		@apply w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center;
		border-color: currentColor;
	}

	.health-percentage {
		@apply text-2xl font-bold;
	}

	.health-label {
		@apply text-sm uppercase tracking-wide;
	}

	.health-details {
		@apply flex-1 grid grid-cols-1 md:grid-cols-3 gap-6;
	}

	.health-stat {
		@apply flex items-center gap-3;
	}

	.stat-label {
		@apply text-xs uppercase tracking-wide;
		color: var(--text-muted);
	}

	.stat-value {
		@apply text-lg font-semibold;
	}

	.activity-feed {
		@apply p-4 space-y-3 max-h-96 overflow-y-auto;
	}

	.activity-item {
		@apply flex items-center gap-3 p-3 rounded-lg transition-colors;
	}

	.activity-item:hover {
		background-color: var(--bg-tertiary);
	}

	.activity-icon {
		@apply w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0;
	}

	.icon-block {
		@apply bg-blue-100 text-blue-600;
	}

	:global(body.dark) .icon-block {
		@apply bg-blue-900/30 text-blue-400;
	}

	.icon-transaction {
		@apply bg-purple-100 text-purple-600;
	}

	:global(body.dark) .icon-transaction {
		@apply bg-purple-900/30 text-purple-400;
	}

	.activity-content {
		@apply flex-1 min-w-0;
	}

	.activity-title {
		@apply font-medium flex items-center gap-2;
	}

	.activity-subtitle {
		@apply text-sm;
		color: var(--text-muted);
	}

	.activity-time {
		@apply text-xs whitespace-nowrap;
		color: var(--text-muted);
	}

	.top-accounts {
		@apply p-4 space-y-3;
	}

	.account-item {
		@apply flex items-center gap-3 p-3 rounded-lg transition-colors;
	}

	.account-item:hover {
		background-color: var(--bg-tertiary);
	}

	.account-rank {
		@apply flex-shrink-0;
	}

	.rank-badge {
		@apply inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold;
	}

	.rank-gold {
		@apply bg-yellow-100 text-yellow-700;
	}

	:global(body.dark) .rank-gold {
		@apply bg-yellow-900/30 text-yellow-400;
	}

	.rank-silver {
		@apply bg-gray-100 text-gray-700;
	}

	:global(body.dark) .rank-silver {
		@apply bg-gray-700/30 text-gray-300;
	}

	.rank-bronze {
		@apply bg-orange-100 text-orange-700;
	}

	:global(body.dark) .rank-bronze {
		@apply bg-orange-900/30 text-orange-400;
	}

	.account-address {
		@apply flex-1 font-mono text-sm;
	}

	.account-activity {
		@apply flex-shrink-0;
	}

	.production-chart {
		@apply flex items-end gap-2 p-6 h-48;
	}

	.chart-bar {
		@apply flex-1 flex flex-col items-center gap-2;
	}

	.bar-container {
		@apply w-full flex items-end justify-center;
		height: 120px;
	}

	.bar {
		@apply w-full bg-sky-500 rounded-t transition-all duration-300;
		min-height: 4px;
	}

	.bar-label {
		@apply text-xs;
		color: var(--text-muted);
	}

	.message-types {
		@apply p-6 space-y-4;
	}

	.message-type-item {
		@apply flex items-center gap-4;
	}

	.type-label {
		@apply w-32 text-sm font-medium;
	}

	.type-bar-container {
		@apply flex-1 rounded-full h-6;
		background-color: var(--bg-tertiary);
	}

	.type-bar {
		@apply h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-300;
		min-width: 2%;
	}

	.type-count {
		@apply w-16 text-right text-sm font-semibold;
	}

	.empty-state {
		@apply text-center py-8;
		color: var(--text-muted);
	}
</style>
