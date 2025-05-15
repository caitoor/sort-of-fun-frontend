// src/lib/stores/gameFilterStore.js

import { writable, derived } from "svelte/store";
import { MAX_PLAYTIME } from "./generalStore";
import { getEstimatedPlaytime } from "$lib/utils.js";
import { games } from "$lib/stores/gameStore.js";
import {
  getPlaytimeCoefficient,
  getComplexityCoefficient,
  getPlayerCountCoefficient
} from "$lib/gameScorer.js";
// Import the tags store for per‐game tags lookup
import { tags } from "$lib/stores/tagStore.js";

// Filter options
export const playerCount = writable(null);
export const minComplexity = writable(1);
export const maxComplexity = writable(5);
export const minPlaytime = writable(10);
export const maxPlaytime = writable(MAX_PLAYTIME);
export const requiredTags = writable([]);  // games must have all of these tags
export const excludedTags = writable([]);  // games with any of these tags are excluded
export const desiredTags = writable([]);   // games with these tags get a score boost

/**
 * Derived store: applies all filters reactively,
 * including tag‐based inclusion/exclusion and score boost for desired tags.
 */
export const filteredGames = derived(
  [
    games,
    playerCount,
    minComplexity,
    maxComplexity,
    minPlaytime,
    maxPlaytime,
    requiredTags,
    desiredTags,
    excludedTags,
    tags
  ],
  (
    [
      $games,
      $playerCount,
      $minComplexity,
      $maxComplexity,
      $minPlaytime,
      $maxPlaytime,
      $requiredTags,
      $desiredTags,
      $excludedTags,
      $tags
    ]
  ) => {
    if (!$games.length) return [];

    return $games
      // 1) Filter out games by player count and tag inclusion/exclusion
      .filter(game => {
        // check player count range
        if (
          $playerCount &&
          (game.minPlayers > $playerCount || game.maxPlayers < $playerCount)
        ) {
          return false;
        }

        // get tags for this game (from the tags store)
        const gameTags = $tags[game.bggId] || [];

        // requiredTags: every tag in $requiredTags must appear in gameTags
        if ($requiredTags.length > 0) {
          for (const req of $requiredTags) {
            if (!gameTags.some(t => t.toLowerCase() === req.toLowerCase())) {
              return false;
            }
          }
        }

        // excludedTags: if any excluded tag is in gameTags, drop the game
        if ($excludedTags.length > 0) {
          for (const ex of $excludedTags) {
            if (gameTags.some(t => t.toLowerCase() === ex.toLowerCase())) {
              return false;
            }
          }
        }

        return true;
      })
      // 2) Compute score including complexity, playtime, playerCount, and desiredTags boost
      .map(game => {
        let score = game.bggRating || 0;
        let factor = 1;

        // base coefficients
        const estimated = getEstimatedPlaytime(game, $playerCount);
        const complexityFactor = getComplexityCoefficient(
          game.averageWeight,
          $minComplexity,
          $maxComplexity
        );
        const playtimeFactor = getPlaytimeCoefficient(
          estimated,
          $minPlaytime,
          $maxPlaytime
        );
        const playerCountFactor = getPlayerCountCoefficient(
          game,
          game.playerRatings || [],
          $playerCount
        );
        factor *= complexityFactor * playtimeFactor * playerCountFactor;

        // tag‐based boost for desiredTags
        const gameTags = $tags[game.bggId] || [];
        let boostCount = 0;
        if ($desiredTags.length > 0) {
          for (const des of $desiredTags) {
            if (gameTags.some(t => t.toLowerCase() === des.toLowerCase())) {
              boostCount++;
            }
          }
        }
        if (boostCount > 0) {
          // multiply factor by 1.25 for each desired tag found
          factor *= Math.pow(1.25, boostCount);
        }

        score *= Math.max(factor, 0.1); // ensure at least 10% of original rating

        return { ...game, score };
      })
      // 3) sort descending by score
      .sort((a, b) => b.score - a.score);
  }
);
