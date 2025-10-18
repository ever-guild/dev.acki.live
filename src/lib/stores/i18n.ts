import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type Language = 'en' | 'ru';

interface Translations {
	[key: string]: {
		[key: string]: string;
	};
}

const translations: Translations = {
	en: {
		'nav.blocks': 'Blocks',
		'nav.transactions': 'Transactions',
		'nav.messages': 'Messages',
		'nav.contracts': 'Contracts',
		'nav.stats': 'Statistics',
		'nav.showcase': 'Showcase',
		'blocks.title': 'Recent Blocks',
		'blocks.height': 'Height',
		'blocks.hash': 'Hash',
		'blocks.timestamp': 'Timestamp',
		'blocks.txCount': 'Transactions',
		'blocks.miner': 'Miner',
		'transactions.title': 'Recent Transactions',
		'transactions.hash': 'Tx Hash',
		'transactions.from': 'From',
		'transactions.to': 'To',
		'transactions.amount': 'Amount',
		'transactions.status': 'Status',
		'transactions.time': 'Time',
		'messages.title': 'Blockchain Messages',
		'messages.from': 'From',
		'messages.to': 'To',
		'messages.type': 'Type',
		'messages.timestamp': 'Timestamp',
		'messages.data': 'Data',
		'contracts.title': 'Smart Contracts',
		'contracts.address': 'Contract Address',
		'contracts.created': 'Created',
		'contracts.interactions': 'Interactions',
		'contracts.creator': 'Creator',
		'contracts.type': 'Type',
		'stats.title': 'Network Statistics',
		'stats.totalBlocks': 'Total Blocks',
		'stats.totalTransactions': 'Total Transactions',
		'stats.hashrate': 'Network Hashrate',
		'stats.activeAddresses': 'Active Addresses',
		'stats.avgBlockTime': 'Avg Block Time',
		'stats.difficulty': 'Difficulty',
		'stats.marketCap': 'Market Cap',
		'stats.price': 'Price',
		'showcase.title': 'Blockchain Showcase',
		'status.success': 'Success',
		'status.pending': 'Pending',
		'status.failed': 'Failed'
	},
	ru: {
		'nav.blocks': 'Блоки',
		'nav.transactions': 'Транзакции',
		'nav.messages': 'Сообщения',
		'nav.contracts': 'Контракты',
		'nav.stats': 'Статистика',
		'nav.showcase': 'Витрина',
		'blocks.title': 'Последние блоки',
		'blocks.height': 'Высота',
		'blocks.hash': 'Хэш',
		'blocks.timestamp': 'Время',
		'blocks.txCount': 'Транзакций',
		'blocks.miner': 'Майнер',
		'transactions.title': 'Последние транзакции',
		'transactions.hash': 'Хэш транзакции',
		'transactions.from': 'От',
		'transactions.to': 'Кому',
		'transactions.amount': 'Сумма',
		'transactions.status': 'Статус',
		'transactions.time': 'Время',
		'messages.title': 'Сообщения блокчейна',
		'messages.from': 'Отправитель',
		'messages.to': 'Получатель',
		'messages.type': 'Тип',
		'messages.timestamp': 'Время',
		'messages.data': 'Данные',
		'contracts.title': 'Смарт-контракты',
		'contracts.address': 'Адрес контракта',
		'contracts.created': 'Создан',
		'contracts.interactions': 'Взаимодействий',
		'contracts.creator': 'Создатель',
		'contracts.type': 'Тип',
		'stats.title': 'Статистика сети',
		'stats.totalBlocks': 'Всего блоков',
		'stats.totalTransactions': 'Всего транзакций',
		'stats.hashrate': 'Хэшрейт сети',
		'stats.activeAddresses': 'Активных адресов',
		'stats.avgBlockTime': 'Среднее время блока',
		'stats.difficulty': 'Сложность',
		'stats.marketCap': 'Рыночная капитализация',
		'stats.price': 'Цена',
		'showcase.title': 'Витрина блокчейна',
		'status.success': 'Успешно',
		'status.pending': 'В ожидании',
		'status.failed': 'Неудачно'
	}
};

function createI18nStore() {
	const savedLang = browser ? (localStorage.getItem('language') as Language) || 'en' : 'en';
	const { subscribe, set } = writable<Language>(savedLang);

	return {
		subscribe,
		setLanguage: (lang: Language) => {
			if (browser) {
				localStorage.setItem('language', lang);
			}
			set(lang);
		}
	};
}

export const currentLanguage = createI18nStore();

export const translate = derived(currentLanguage, ($lang) => {
	return (key: string): string => {
		return translations[$lang][key] || key;
	};
});
