<!-- src/routes/collection/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  // Komponenten
  import TagEditor from "$lib/components/TagEditor.svelte";
  import RefreshModal from "$lib/components/RefreshModal.svelte";
  import Loader from "$lib/components/Loader.svelte";

  // Utils
  import {
    formatBestPlayerCounts,
    formatPlayerCountRange,
    decodeEntities,
  } from "$lib/utils.js";
  import { hoveredGameId } from "$lib/stores/generalStore.js";

  // Stores
  import {
    fetchAndLoadGames,
    sortedGames,
    loading,
  } from "$lib/stores/gameStore.js";
  import {
    tags,
    allTags,
    loadTagsForGames,
    addTagToGame,
    removeTagFromGame,
  } from "$lib/stores/tagStore.js";

  import { API_BASE } from "$lib/api/apibase.js";
  import { writable } from "svelte/store";

  let showRefreshModal = false;
  let status = "loading";
  let refreshMessage = "";

  // Akkordeon-State
  const expanded = writable(new Set());

  // onMount: Spiele + Tags laden
  onMount(async () => {
    await fetchAndLoadGames();
    await loadTagsForGames(get(sortedGames));
  });

  // Hilfen
  $: baseGames = $sortedGames.filter((g) => g.baseGameId == null);
  $: expansionsByBase = $sortedGames
    .filter((g) => g.baseGameId != null)
    .reduce((map, exp) => {
      (map[exp.baseGameId] ||= []).push(exp);
      return map;
    }, {});

  function toggle(bggId) {
    expanded.update((set) => {
      if (set.has(bggId)) set.delete(bggId);
      else set.add(bggId);
      return set;
    });
  }

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

<button on:click={manualUpdate}>&#8635; update collection</button>

{#if $loading}
  <div class="loading-container">
    <Loader />
  </div>
{:else if !baseGames.length}
  <p class="empty">No games found.</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Game</th>
        <th>Year</th>
        <th>Players</th>
        <th>Playtime</th>
        <th>Rating</th>
        <th>Best at</th>
        <th>Tags</th>
        <th>Thumbnail</th>
      </tr>
    </thead>
    <tbody>
      {#each baseGames as game}
        <!-- Basis-Spiel -->
        <tr
          class="base-row"
          on:click={() => toggle(game.bggId)}
          on:mouseenter={() => hoveredGameId.set(game.bggId)}
          on:mouseleave={() => hoveredGameId.set(null)}
        >
          <td>
            {decodeEntities(game.name)}
            <span class="year-published">({game.yearPublished || "N/A"})</span>
            {#if expansionsByBase[game.bggId]}
              <span class="exp-count">
                ({expansionsByBase[game.bggId].length} Erweiterung
                {expansionsByBase[game.bggId].length > 1 ? "en" : ""})
              </span>
            {/if}
          </td>
          <td>{game.yearPublished || "N/A"}</td>
          <td>{formatPlayerCountRange(game)}</td>
          <td>{game.playtime} min</td>
          <td>{game.bggRating?.toFixed(2) ?? "N/A"}</td>
          <td>{formatBestPlayerCounts(game)}</td>
          <td>
            <TagEditor
              bggId={game.bggId}
              allTags={$allTags}
              addTag={addTagToGame}
              removeTag={removeTagFromGame}
            />
          </td>
          <td>
            {#if game.thumbnail}
              <img src={game.thumbnail} alt="thumb" class="thumbnail" />
            {/if}
          </td>
        </tr>

        <!-- extensions when expanded -->
        {#if $expanded.has(game.bggId) && expansionsByBase[game.bggId]}
          {#each expansionsByBase[game.bggId] as exp}
            <tr class="expansion-row">
              <td colspan="1" class="expansion-name">
                — {decodeEntities(exp.name)}
              </td>
              <td>{exp.yearPublished || "N/A"}</td>
              <td>{formatPlayerCountRange(exp)}</td>
              <td>{exp.playtime} min</td>
              <td>{exp.bggRating?.toFixed(2) ?? "N/A"}</td>
              <td>{formatBestPlayerCounts(exp)}</td>
              <td>
                <TagEditor
                  bggId={exp.bggId}
                  allTags={$allTags}
                  addTag={addTagToGame}
                  removeTag={removeTagFromGame}
                />
              </td>
              <td>
                {#if exp.thumbnail}
                  <img src={exp.thumbnail} alt="thumb" class="thumbnail" />
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
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

<style>
  button {
    margin-bottom: 0.5em;
  }
  .year-published,
  .exp-count {
    font-size: 0.8em;
    color: #888;
    margin-left: 0.3em;
  }

  .expansion-row td {
    padding-left: .5em;
    font-style: italic;
  }
  .expansion-name {
    font-weight: 500;
  }

  
</style>
