<!-- src/lib/components/TagSelector.svelte -->
<script>
  import TagList from "$lib/components/TagList.svelte";

  export let currentTags = [];
  export let onAdd = (tag) => {};
  export let onRemove = (tag) => {};
  export let allTags = [];
  export let placeholder = "Enter tag...";
  export let allowNew = false;

  let newTag = "";
  let filteredSuggestions = [];
  let showDropdown = false;

  $: {
    const input = newTag.trim().toLowerCase();
    showDropdown = input.length > 0;
    filteredSuggestions = allTags.filter((t) =>
      t.toLowerCase().startsWith(input),
    );
  }

  function handleAdd() {
    const tagToAdd = newTag.trim();
    if (!tagToAdd) return;
    if (!allowNew) {
      const exists = allTags.some(
        (t) => t.toLowerCase() === tagToAdd.toLowerCase(),
      );
      if (!exists) return;
    }
    onAdd(tagToAdd);
    newTag = "";
  }
  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }
  function handleSelectSuggestion(tag) {
    newTag = "";
    showDropdown = false;
    onAdd(tag);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->

<div class="tag-selector">
  <!-- Hier nutzen wir TagList mit removable=true -->
  <TagList tags={currentTags} removable={true} {onRemove} />

  <div class="tag-input-container">
    <input
      type="text"
      bind:value={newTag}
      {placeholder}
      on:keydown={onKeyDown}
    />
    <button on:click={handleAdd}>Add</button>
    {#if showDropdown && filteredSuggestions.length}
      <ul class="dropdown">
        {#each filteredSuggestions as suggestion}
          <li on:click={() => handleSelectSuggestion(suggestion)}>
            {suggestion}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .tag-selector {
    margin-bottom: 1em;
  }
  .tag-input-container {
    position: relative;
    display: flex;
    gap: 0.5em;
  }
  .tag-input-container input {
    flex: 1;
    padding: 0.5em;
  }
  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #333;
    border: 1px solid #555;
    max-height: 150px;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 10;
  }
  .dropdown li {
    padding: 0.5em;
    cursor: pointer;
    color: #fff;
  }
  .dropdown li:hover {
    background: #444;
  }
</style>
