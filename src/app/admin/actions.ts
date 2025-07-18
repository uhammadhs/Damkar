
'use server';

// Store seen notification IDs in-memory on the server.
// In a real-world scenario, you might use a more persistent cache like Redis.
const seenNotifications = new Set<number>();

export async function markAdminNotificationsAsSeen(ids: number[]) {
    ids.forEach(id => seenNotifications.add(id));
}
