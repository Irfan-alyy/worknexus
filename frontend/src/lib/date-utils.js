/**
 * Format date as relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date) {
	const now = new Date()
	const diffMs = now - new Date(date)
	const diffSeconds = Math.floor(diffMs / 1000)
	const diffMinutes = Math.floor(diffSeconds / 60)
	const diffHours = Math.floor(diffMinutes / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffSeconds < 60) return "just now"
	if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7)
		return `${weeks} week${weeks > 1 ? "s" : ""} ago`
	}

	return new Date(date).toLocaleDateString()
}
