import { DashboardStats } from '../types';

const BASE_URL = '/api/stats';

export async function getStats(): Promise<DashboardStats> {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to fetch stats');
    }
    return res.json();
}
