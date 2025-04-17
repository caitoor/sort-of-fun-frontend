<!-- src/routes/+page.svelte -->

<script>
    // general imports
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    // games store: load & reactive sorted list + loading flag
    import {
        fetchAndLoadGames,
        loading,
        sortedGames,
    } from "$lib/stores/gameStore.js";

    // tags store: load tags for all games (autocomplete + per‑game tags)
    import { loadTagsForGames } from "$lib/stores/tagStore.js";

    // components
    import GameFilter from "$lib/components/GameFilter.svelte";
    import GameTable from "$lib/components/GameTable.svelte";
    import Loader from "$lib/components/Loader.svelte";

    // on mount: fetch games & then load all their tags
    onMount(async () => {
        await fetchAndLoadGames();
        await loadTagsForGames(get(sortedGames));
    });
</script>

<!-- filter panel above the table -->
<GameFilter />

{#if $loading}
    <div class="loading-container">
        <Loader />
    </div>
{:else}
    <GameTable />
{/if}
