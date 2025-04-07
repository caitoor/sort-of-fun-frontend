import { writable, derived } from "svelte/store";
import { MAX_PLAYTIME } from "./generalStore";
import { getEstimatedPlaytime } from "$lib/utils.js";
import { games } from "$lib/stores/gameStore.js";
import { getPlaytimeCoefficient, getComplexityCoefficient, getPlayerCountCoefficient } from "$lib/gameScorer.js";
// Importiere den Themes-Store, um die Tags pro Spiel abzugleichen
import { themes } from "$lib/stores/themeStore.js";

// Filter-Optionen
export const playerCount = writable(null);
export const minComplexity = writable(1);
export const maxComplexity = writable(5);
export const minPlaytime = writable(10);
export const maxPlaytime = writable(MAX_PLAYTIME);
export const requiredTags = writable([]); // Spiele müssen diese Tags besitzen
export const excludedTags = writable([]); // Spiele mit diesen Tags werden ausgeschlossen
export const desiredTags = writable([]);  // Spiele mit diesen Tags erhalten einen Rating-Multiplikator

// Derived store: Wendet Filter reaktiv an.
// Nun wird zusätzlich anhand der Tags gefiltert:
export const filteredGames = derived(
  [games, playerCount, minComplexity, maxComplexity, minPlaytime, maxPlaytime, requiredTags, desiredTags, excludedTags, themes],
  ([$games, $playerCount, $minComplexity, $maxComplexity, $minPlaytime, $maxPlaytime, $requiredTags, $desiredTags, $excludedTags, $themes]) => {
    if (!$games.length) return [];

    return $games
      // Erstes Filter: Spieleranzahl
      .filter(game => {
        if ($playerCount && (game.minPlayers > $playerCount || game.maxPlayers < $playerCount)) {
          return false;
        }
        // Hole die Tags des Spiels aus dem Spielobjekt oder aus dem globalen themes-Store
        const gameTags = game.themes ? game.themes : ($themes[game.bggId] || []);
        // Filter für "benötigte Tags": Alle in $requiredTags müssen in gameTags vorhanden sein (case-insensitive)
        if ($requiredTags.length > 0) {
          for (const reqTag of $requiredTags) {
            if (!gameTags.some(tag => tag.toLowerCase() === reqTag.toLowerCase())) {
              return false;
            }
          }
        }
        // Filter für "auszuschließende Tags": Falls ein ausgeschlossener Tag in gameTags enthalten ist, Spiel verwerfen
        if ($excludedTags.length > 0) {
          for (const exTag of $excludedTags) {
            if (gameTags.some(tag => tag.toLowerCase() === exTag.toLowerCase())) {
              return false;
            }
          }
        }
        return true;
      })
      // Danach: Score berechnen und "gewünschte" Tags berücksichtigen
      .map(game => {
        let score = game.bggRating || 0;
        let factor = 1;
        const estimatedPlaytime = getEstimatedPlaytime(game, $playerCount);
        const complexityFactor = getComplexityCoefficient(game.complexity, $minComplexity, $maxComplexity);
        const playtimeFactor = getPlaytimeCoefficient(estimatedPlaytime, $minPlaytime, $maxPlaytime);
        const playerCountFactor = getPlayerCountCoefficient(game, game.playerRatings || [], $playerCount);
        factor *= complexityFactor * playtimeFactor * playerCountFactor;
        // Hole die Tags des Spiels
        const gameTags = game.themes ? game.themes : ($themes[game.bggId] || []);
        // Zähle, wie oft ein "gewünschter" Tag vorkommt und multipliziere den Score entsprechend
        let desiredCount = 0;
        if ($desiredTags.length > 0) {
          for (const desTag of $desiredTags) {
            if (gameTags.some(tag => tag.toLowerCase() === desTag.toLowerCase())) {
              desiredCount++;
            }
          }
        }
        if (desiredCount > 0) {
          factor *= Math.pow(1.1, desiredCount);
        }
        score *= Math.max(factor, 0.1); // Score nicht unter 10% des Originals
        return { ...game, score };
      })
      .sort((a, b) => b.score - a.score);
  }
);
