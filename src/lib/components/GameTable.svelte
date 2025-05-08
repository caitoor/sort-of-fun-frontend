<!-- src/lib/components/GameTable.svelte -->
<script>
    import TagList from "$lib/components/TagList.svelte";
    import { filteredGames } from "$lib/stores/gameFilterStore.js";
    import { tags } from "$lib/stores/tagStore.js";
    import {
        formatBestPlayerCounts,
        formatPlayerCountRange,
        decodeEntities,
    } from "$lib/utils.js";
    import { writable } from "svelte/store";

    // Akkordeon-State: Set mit aufgeklappten baseGameIds
    const expanded = writable(new Set());

    // Helper: nur Basisspiele
    $: baseGames = $filteredGames.filter((g) => g.baseGameId == null);

    // Helper: gruppiere Expansionen nach baseGameId
    $: expansionsByBase = $filteredGames
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
</script>

<table>
    <thead>
        <tr>
            <th>Game</th>
            <th class="centered">Players</th>
            <th class="centered">Playtime</th>
            <th class="centered">Complexity</th>
            <th class="centered">Score</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each baseGames as game}
            <!-- Basis-Spiel Zeile -->
            <tr class="base-row" on:click={() => toggle(game.bggId)}>
                <td>
                    <a
                        href={"https://boardgamegeek.com/boardgame/" +
                            game.bggId}
                        target="_blank"
                    >
                        {decodeEntities(game.name)}
                    </a>
                    <span class="year-published"
                        >({game.yearPublished || ""})</span
                    >
                    {#if expansionsByBase[game.bggId]}
                        <span class="exp-count">
                            ({expansionsByBase[game.bggId].length} Erweiterung
                            {expansionsByBase[game.bggId].length > 1
                                ? "en"
                                : ""})
                        </span>
                    {/if}
                    {#if $tags[game.bggId]?.length}
                        <div class="game-tags">
                            <TagList tags={$tags[game.bggId] || []} />
                        </div>
                    {/if}
                </td>
                <td>
                    <div class="cell-container">
                        <div>{formatPlayerCountRange(game)}</div>
                        <div class="cell-sub">
                            (Best: {formatBestPlayerCounts(game)})
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cell-container">
                        <div>{game.playtime} min</div>
                        {#if game.minPlaytime !== game.maxPlaytime}
                            <div class="cell-sub">
                                ({game.minPlaytime}–{game.maxPlaytime})
                            </div>
                        {/if}
                    </div>
                </td>
                <td>{game.complexity ? game.complexity.toFixed(2) : ""}</td>
                <td>
                    <div class="cell-container">
                        <div>{game.score?.toFixed(2) ?? "N/A"}</div>
                        {#if game.bggRating && game.bggRating.toFixed(2) !== game.score?.toFixed(2)}
                            <div class="cell-sub">
                                ({game.bggRating.toFixed(2)})
                            </div>
                        {/if}
                    </div>
                </td>
                <td>
                    {#if game.thumbnail}
                        <img
                            src={game.thumbnail}
                            alt="thumb"
                            class="thumbnail"
                        />
                    {/if}
                </td>
            </tr>

            <!-- Erweiterungs-Zeilen, nur wenn aufgeklappt -->
            {#if $expanded.has(game.bggId) && expansionsByBase[game.bggId]}
                {#each expansionsByBase[game.bggId] as exp}
                    <tr class="expansion-row">
                        <td class="expansion-name"
                            >— {decodeEntities(exp.name)}</td
                        >
                        <td>
                            <div class="cell-container">
                                <div>{formatPlayerCountRange(exp)}</div>
                                <div class="cell-sub">
                                    (Best: {formatBestPlayerCounts(exp)})
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="cell-container">
                                <div>{exp.playtime} min</div>
                                {#if exp.minPlaytime !== exp.maxPlaytime}
                                    <div class="cell-sub">
                                        ({exp.minPlaytime}–{exp.maxPlaytime})
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td
                            >{exp.complexity
                                ? exp.complexity.toFixed(2)
                                : ""}</td
                        >
                        <td>
                            <div class="cell-container">
                                <div>{exp.score?.toFixed(2) ?? "N/A"}</div>
                                {#if exp.bggRating && exp.bggRating.toFixed(2) !== exp.score?.toFixed(2)}
                                    <div class="cell-sub">
                                        ({exp.bggRating.toFixed(2)})
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td>
                            {#if exp.thumbnail}
                                <img
                                    src={exp.thumbnail}
                                    alt="thumb"
                                    class="thumbnail"
                                />
                            {/if}
                        </td>
                    </tr>
                {/each}
            {/if}
        {/each}
    </tbody>
</table>

<style>
    tr.base-row {
        cursor: pointer;
    }
    .year-published,
    .exp-count {
        font-size: 0.8em;
        color: #888;
        margin-left: 0.3em;
    }

    .cell-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .cell-sub {
        font-size: 0.8em;
        color: #888;
    }

    .expansion-row td {
        padding-left: 1.5em;
        font-style: italic;
    }
    .expansion-name {
        font-weight: 500;
    }
</style>
