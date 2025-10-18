/**
 * Format a timestamp as a relative time string (e.g., "5s ago", "2m ago")
 * @param timestamp Unix timestamp in seconds
 * @returns Relative time string
 */
export function formatTimeAgo(timestamp: number): string {
	const now = Math.floor(Date.now() / 1000);
	const diff = now - timestamp;

	if (diff < 0) return 'just now';
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
	
	// For older timestamps, show the date
	const date = new Date(timestamp * 1000);
	return date.toLocaleDateString();
}

/**
 * Format a Date object as a relative time string
 * @param date Date object
 * @returns Relative time string
 */
export function formatDateTimeAgo(date: Date): string {
	const timestamp = Math.floor(date.getTime() / 1000);
	return formatTimeAgo(timestamp);
}

/**
 * Get the interval (in ms) for updating a timestamp based on how old it is
 * @param timestamp Unix timestamp in seconds
 * @returns Update interval in milliseconds
 */
export function getUpdateInterval(timestamp: number): number {
	const now = Math.floor(Date.now() / 1000);
	const diff = now - timestamp;

	if (diff < 60) return 1000; // Update every second for < 1 minute
	if (diff < 3600) return 60000; // Update every minute for < 1 hour
	if (diff < 86400) return 3600000; // Update every hour for < 1 day
	return 86400000; // Update every day for older
}
