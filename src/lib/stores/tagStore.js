// src/lib/stores/tagStore.js

import { writable } from "svelte/store";
import {
    fetchAllTags,
    fetchTagsForGame,
    addTag,
    removeTag
} from '$lib/api/tagsApi.js';

// store that maps bggId → array of tags for that game
export const tags = writable({});
// store of all distinct tags (for autocomplete)
export const allTags = writable([]);

/**
 * Load tags for all games into the `tags` store,
 * and fetch the global list into `allTags`.
 */
export async function loadTagsForGames(games) {
    if (!Array.isArray(games) || games.length === 0) {
        console.warn("⚠️ No valid games array provided to loadTagsForGames.");
        return;
    }

    const tagMap = {};
    for (let game of games) {
        tagMap[game.bggId] = await fetchTagsForGame(game.bggId);
    }
    tags.set(tagMap);

    const tagList = await fetchAllTags();
    allTags.set(tagList || []); // ensure it's always an array
}

/**
 * Add a tag to a specific game and update both stores.
 */
export async function addTagToGame(bggId, tag) {
    try {
        // perform API call
        await addTag(bggId, tag);

        // update per‐game tags map
        tags.update(current => {
            const updated = { ...current };
            if (!Array.isArray(updated[bggId])) updated[bggId] = [];
            if (!updated[bggId].includes(tag)) {
                updated[bggId].push(tag);
            }
            return updated;
        });

        // ensure the new tag is in the global list
        allTags.update(current => {
            if (!current.includes(tag)) {
                return [...current, tag];
            }
            return current;
        });

    } catch (err) {
        console.error(`❌ Error adding tag to game ${bggId}:`, err);
    }
}

/**
 * Remove a tag from a specific game and update the store.
 */
export async function removeTagFromGame(bggId, tag) {
    try {
        // perform API call
        await removeTag(bggId, tag);
    } catch (err) {
        console.error(`❌ Error removing tag from game ${bggId}:`, err);
    }

    // update per‐game tags map
    tags.update(current => {
        const updated = { ...current };
        if (Array.isArray(updated[bggId])) {
            updated[bggId] = updated[bggId].filter(t => t !== tag);
        }
        return updated;
    });
}
