<script>
  // IMPORTS
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  // Komponenten
  import ThemeEditor from "$lib/components/ThemeEditor.svelte";
  import RefreshModal from "$lib/components/RefreshModal.svelte";
  import Loader from "$lib/components/Loader.svelte";

  // Utils
  import {
    formatBestPlayerCounts,
    formatPlayerCountRange,
    decodeEntities,
  } from "$lib/utils.js";
  import { hoveredGameId } from "$lib/stores/generalStore.js";

  // Spiele
  import {
    fetchAndLoadGames,
    sortedGames,
    updateSort,
    loading,
  } from "$lib/stores/gameStore.js";

  // Themes
  import {
    themes,
    allThemes,
    loadThemesForGames,
    addThemeToGame,
    removeThemeFromGame,
  } from "$lib/stores/themeStore.js";

  import { API_BASE } from "$lib/api.js";

  let showRefreshModal = false;
  let status = "loading";
  let refreshMessage = "";

  async function refreshBGGData() {
    showRefreshModal = true;
    status = "loading";
    refreshMessage = "Loading...";
    try {
      // Verwende die absolute URL basierend auf API_BASE
      const response = await fetch(`${API_BASE}/games/refresh`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Refresh failed");
      }
      const data = await response.json();
      status = "done";
      refreshMessage = `Refresh complete. (${data.newGamesCount} new games)`;
      // Lade Spiele im Anschluss neu
      await fetchAndLoadGames();
    } catch (error) {
      console.error(error);
      status = "error";
      refreshMessage = "Refresh failed.";
    }
  }

  function closeModal() {
    showRefreshModal = false;
  }
</script>

<button on:click={refreshBGGData}>Refresh Collection</button>

{#if $loading}
  <div class="loading-container">
    <Loader />
  </div>
{:else if !$sortedGames.length}
  <p class="empty">No games found.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th on:click={() => updateSort("name")}>Game</th>
        <th on:click={() => updateSort("yearPublished")}>Year</th>
        <th>Players</th>
        <th on:click={() => updateSort("playtime")}>Playtime</th>
        <th on:click={() => updateSort("bggRating")}>Rating</th>
        <th>Best at</th>
        <th>Themes</th>
        <th>Thumbnail</th>
      </tr>
    </thead>
    <tbody>
      {#each $sortedGames as game}
        <tr
          on:mouseenter={() => {
            hoveredGameId.set(game.bggId);
          }}
          on:mouseleave={() => hoveredGameId.set(null)}
        >
          <td>{decodeEntities(game.name)}</td>
          <td>{game.yearPublished || "N/A"}</td>
          <td>{formatPlayerCountRange(game)}</td>
          <td>{game.playtime} min</td>
          <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td>
          <td>{formatBestPlayerCounts(game)}</td>
          <td>
            <ThemeEditor
              bggId={game.bggId}
              themes={$themes}
              allThemes={$allThemes}
              addTheme={addThemeToGame}
              removeTheme={removeThemeFromGame}
            />
          </td>
          <td>
            {#if game.thumbnail}
              <img
                src={game.thumbnail}
                alt="{game.name} thumbnail"
                class="thumbnail"
              />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<RefreshModal
  visible={showRefreshModal}
  {status}
  message={refreshMessage}
  onClose={closeModal}
/>
