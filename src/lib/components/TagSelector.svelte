<!-- src/lib/components/TagSelector.svelte -->
<script>
  // Generic component for entering and managing tags.
  // Used in both the filter panel and the TagEditor.
  //
  // Props:
  // - label: heading text (e.g. "Required Tags")
  // - currentTags: array of currently selected tags
  // - onAdd: callback invoked when a new tag is added
  // - onRemove: callback invoked when a tag is removed
  // - allTags: array of all existing tags for autocomplete
  // - placeholder: input placeholder text
  // - allowNew: boolean, if true allows adding tags not in allTags

  export let label = "Tags";
  export let currentTags = [];
  export let onAdd = (tag) => {};
  export let onRemove = (tag) => {};
  export let allTags = [];
  export let placeholder = "Enter tag...";
  export let allowNew = false;

  // Local state for the input and suggestions
  let newTag = "";
  let filteredSuggestions = [];
  let showDropdown = false;

  // Update suggestions whenever the input changes
  $: {
    const input = newTag.trim().toLowerCase();
    showDropdown = input.length > 0;
    filteredSuggestions = allTags.filter((tag) =>
      tag.toLowerCase().startsWith(input),
    );
  }

  // Add a tag, respecting allowNew if false
  function handleAdd() {
    const tagToAdd = newTag.trim();
    if (!tagToAdd) return;
    if (!allowNew) {
      // Only allow if tag exists in allTags (case-insensitive)
      const exists = allTags.some(
        (tag) => tag.toLowerCase() === tagToAdd.toLowerCase(),
      );
      if (!exists) return;
    }
    onAdd(tagToAdd);
    newTag = "";
  }

  // Add tag on Enter key
  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  // When a suggestion is clicked
  function handleSelectSuggestion(tag) {
    newTag = "";
    showDropdown = false;
    onAdd(tag);
  }
</script>

<!-- Allow click handlers without additional key handling -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="tag-selector">
  <h5>{label}</h5>
  <!-- List of selected tags -->
  <div class="tag-list">
    {#each currentTags as tag}
      <span class="tag-item">
        {tag}
        <button on:click={() => onRemove(tag)}>×</button>
      </span>
    {/each}
  </div>
  <!-- Input and suggestion dropdown -->
  <div class="tag-input-container">
    <input
      type="text"
      bind:value={newTag}
      {placeholder}
      on:keydown={onKeyDown}
    />
    <button on:click={handleAdd}>Add</button>
    {#if showDropdown && filteredSuggestions.length > 0}
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
  h5 {
    margin: 0 0 0.5em 0;
  }
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin-bottom: 0.5em;
  }
  .tag-item {
    background: #333;
    color: #fff;
    padding: 2px 6px;
    border-radius: 12px;
    display: flex;
    align-items: center;
  }
  .tag-item button {
    background: none;
    border: none;
    margin-left: 0.5em;
    cursor: pointer;
    color: #fff;
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
