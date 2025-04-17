// src/lib/api/tagsApi.js
// Handles API requests related to tags

import { API_BASE } from './apibase.js';

/**
 * Fetch all distinct tags for autocomplete.
 */
export async function fetchAllTags() {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw new Error(`Failed to fetch tags: ${res.status}`);
    return await res.json();
}

/**
 * Fetch tags for a specific game.
 */
export async function fetchTagsForGame(bggId) {
    const res = await fetch(`${API_BASE}/tags/${bggId}`);
    if (!res.ok) return [];
    return await res.json();
}

/**
 * Add a tag to a game.
 */
export async function addTag(bggId, tag) {
    const res = await fetch(`${API_BASE}/tags/${bggId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag })
    });
    if (!res.ok) throw new Error(`Failed to add tag: ${res.status}`);
}

/**
 * Remove a tag from a game.
 */
export async function removeTag(bggId, tag) {
    const res = await fetch(`${API_BASE}/tags/${bggId}/${encodeURIComponent(tag)}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Failed to delete tag: ${res.status}`);
}
