export function formatPrismaDate(prismaDate: Date): string {
    const now = new Date(); // Current date and time
    const diffMs = now.getTime() - prismaDate.getTime(); // Difference in milliseconds
    const diffSeconds = Math.floor(diffMs / 1000); // Difference in seconds
    const diffMinutes = Math.floor(diffSeconds / 60); // Difference in minutes
    const diffHours = Math.floor(diffMinutes / 60); // Difference in hours
    const diffDays = Math.floor(diffHours / 24); // Difference in days

    if (diffDays < 1) {
        // If the date is today, show "x hours/minutes/seconds ago"
        if (diffHours > 0) return `${diffHours} hours ago`;
        if (diffMinutes > 0) return `${diffMinutes} minutes ago`;
        return `${diffSeconds} seconds ago`;
    } else if (diffDays <= 3) {
        // If within the last 3 days, show "x days ago"
        return `${diffDays} days ago`;
    } else {
        // More than 3 days old, show as "day/month/year"
        const day = String(prismaDate.getDate()).padStart(2, '0');
        const month = String(prismaDate.getMonth() + 1).padStart(2, '0');
        const year = prismaDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
