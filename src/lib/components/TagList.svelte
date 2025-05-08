<!-- src/lib/components/TagList.svelte -->
<script>
    /**
     * tags: Array<String>
     * removable: boolean — zeigt den „×“ Button
     * onRemove: function(tag) — Callback, wenn „×“ geklickt wird
     */
    export let tags = [];
    export let removable = false;
    export let onRemove = (_tag) => {};
</script>

{#if tags.length}
    <div class="game-tags">
        {#each tags as tag}
            <span class="tag-item">
                {tag}
                {#if removable}
                    <button
                        class="remove-btn"
                        on:click={() => onRemove(tag)}
                        aria-label="Remove {tag}">×</button
                    >
                {/if}
            </span>
        {/each}
    </div>
{/if}

<style>
    .game-tags {
        margin-top: 4px;
        font-size: 0.75em;
    }
    .tag-item {
        background: #444;
        color: #fff;
        padding: 2px 6px;
        border-radius: 1em;
        margin-right: 4px;
        border: 1px solid #aaa;
        display: inline-flex;
        align-items: center;
    }
    .remove-btn {
        background: none;
        border: none;
        color: #fff;
        margin-left: 0.5em;
        cursor: pointer;
        font-size: 0.9em;
        line-height: 1;
    }
</style>
