// src/lib/api/gamesApi.js
// Handles API requests related to games and ratings

import { API_BASE } from './apibase.js';

/**
 * Fetch all games with merged playerRatings.
 */
export async function fetchGames() {
    const res = await fetch(`${API_BASE}/games`);
    if (!res.ok) throw new Error(`Failed to fetch games: ${res.status}`);
    return await res.json();
}

/**
 * Fetch playerRatings for one game (legacy support).
 */
export async function fetchPlayerRatings(bggId) {
    const res = await fetch(`${API_BASE}/games/${bggId}/player-ratings`);
    if (!res.ok) return [];
    return await res.json();
}

/**
 * Trigger stale‑only refresh (cron‑only).
 */
export async function refreshStaleCollection() {
    const res = await fetch(`${API_BASE}/games/refresh`, { method: 'POST' });
    if (!res.ok) throw new Error('Stale refresh failed');
    return await res.json();
}

/**
 * Force manual full‑update + stale details.
 */
export async function manualUpdateCollection() {
    const res = await fetch(`${API_BASE}/games/manual-update`, { method: 'POST' });
    if (!res.ok) throw new Error('Manual update failed');
    return await res.json();
}
