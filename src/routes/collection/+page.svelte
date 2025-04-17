<script>
  // src/routes/collection/+page.svelte

  // general imports
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  // components
  import TagEditor from "$lib/components/TagEditor.svelte";
  import RefreshModal from "$lib/components/RefreshModal.svelte";
  import Loader from "$lib/components/Loader.svelte";

  // utils
  import {
    formatBestPlayerCounts,
    formatPlayerCountRange,
    decodeEntities,
  } from "$lib/utils.js";
  import { hoveredGameId } from "$lib/stores/generalStore.js";

  // games
  import {
    fetchAndLoadGames,
    sortedGames,
    updateSort,
    loading,
  } from "$lib/stores/gameStore.js";

  // tags
  import {
    tags,
    allTags,
    loadTagsForGames,
    addTagToGame,
    removeTagFromGame,
  } from "$lib/stores/tagStore.js";

  import { API_BASE } from '$lib/api/apibase.js';


  let showRefreshModal = false;
  let status = "loading";
  let refreshMessage = "";

  // on mount, load games and then tags for them
  onMount(async () => {
    await fetchAndLoadGames();
    await loadTagsForGames(get(sortedGames));
  });

  /**
   * Trigger the "stale‑only" refresh (cron‑like)
   * to add new games only
   */
  async function refreshBGGData() {
    showRefreshModal = true;
    status = "loading";
    refreshMessage = "Loading...";
    try {
      const response = await fetch(`${API_BASE}/games/refresh`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Refresh failed");
      const { newGamesCount = 0 } = await response.json();
      status = "done";
      refreshMessage = `Refresh complete. (${newGamesCount} new games)`;
      await fetchAndLoadGames();
      await loadTagsForGames(get(sortedGames));
    } catch (error) {
      console.error(error);
      status = "error";
      refreshMessage = "Refresh failed.";
    }
  }

  /**
   * Manually trigger full import + stale‑games update
   */
  async function manualUpdate() {
    showRefreshModal = true;
    status = "loading";
    refreshMessage = "Checking for new games…";
    try {
      const res = await fetch(`${API_BASE}/games/manual-update`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Manual update failed");
      const { newGamesCount = 0 } = await res.json();
      status = "done";
      refreshMessage = `Manual update complete. ${newGamesCount} new games added.`;
      await fetchAndLoadGames();
      await loadTagsForGames(get(sortedGames));
    } catch (e) {
      console.error(e);
      status = "error";
      refreshMessage = "Manual update failed.";
    }
  }

  function closeModal() {
    showRefreshModal = false;
  }
</script>

<!-- Button to trigger manual update -->
<button on:click={manualUpdate}>&#8635; update collection</button>

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
        <th>Tags</th>
        <th>Thumbnail</th>
      </tr>
    </thead>
    <tbody>
      {#each $sortedGames as game}
        <tr
          on:mouseenter={() => hoveredGameId.set(game.bggId)}
          on:mouseleave={() => hoveredGameId.set(null)}
        >
          <td>{decodeEntities(game.name)}</td>
          <td>{game.yearPublished || "N/A"}</td>
          <td>{formatPlayerCountRange(game)}</td>
          <td>{game.playtime} min</td>
          <td>{game.bggRating ? game.bggRating.toFixed(2) : "N/A"}</td>
          <td>{formatBestPlayerCounts(game)}</td>
          <td>
            <!-- TagEditor shows current tags, allows add/remove -->
            <TagEditor
              bggId={game.bggId}
              tags={$tags}
              allTags={$allTags}
              onAdd={addTagToGame}
              onRemove={removeTagFromGame}
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

<!-- Modal for showing loading/done/error -->
<RefreshModal
  visible={showRefreshModal}
  {status}
  message={refreshMessage}
  onClose={closeModal}
/>
