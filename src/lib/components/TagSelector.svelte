<script>
  // Diese generische Komponente dient zur Eingabe und Verwaltung von Tags.
  // Sie wird sowohl im Filter-Panel als auch im ThemeEditor verwendet.
  //
  // Props:
  // - label: Überschrift (z. B. "benötigte Tags")
  // - currentTags: Liste der aktuell ausgewählten Tags (Array)
  // - onAdd: Callback, der aufgerufen wird, wenn ein Tag hinzugefügt wird
  // - onRemove: Callback, der aufgerufen wird, wenn ein Tag entfernt wird
  // - allTags: Liste aller Tags, die in der Collection existieren (für Autocomplete)
  // - placeholder: Platzhaltertext im Eingabefeld
  // - allowNew: Wenn true, dürfen auch noch nicht existierende Tags hinzugefügt werden.
  export let label = "Tags";
  export let currentTags = [];
  export let onAdd = (tag) => {};
  export let onRemove = (tag) => {};
  export let allTags = [];
  export let placeholder = "Enter tag...";
  export let allowNew = false; // Default: im Filter dürfen nur existierende Tags gewählt werden

  let newTag = ""; // Bindet den aktuellen Eingabewert
  let filteredSuggestions = []; // Gefilterte Vorschläge basierend auf newTag
  let showDropdown = false;

  // Aktualisiere die Vorschläge dynamisch anhand des aktuellen Eingabetextes.
  $: {
    const input = newTag.trim().toLowerCase();
    showDropdown = input.length > 0;
    filteredSuggestions = allTags.filter((tag) =>
      tag.toLowerCase().startsWith(input),
    );
  }

  // Fügt einen Tag hinzu – je nach allowNew nur, wenn der Tag in allTags existiert.
  function handleAdd() {
    const tagToAdd = newTag.trim();
    if (!tagToAdd) return;
    if (!allowNew) {
      // Nur zulassen, wenn der Tag bereits existiert (case-insensitive)
      const exists = allTags.some(
        (tag) => tag.toLowerCase() === tagToAdd.toLowerCase(),
      );
      if (!exists) return;
    }
    onAdd(tagToAdd);
    newTag = "";
  }

  // Bei Enter-Taste wird der Tag hinzugefügt.
  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  // Wird aufgerufen, wenn ein Vorschlag aus der Dropdown-Liste ausgewählt wird.
  function handleSelectSuggestion(tag) {
    newTag = "";
    showDropdown = false;
    onAdd(tag);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="tag-selector">
  <h5>{label}</h5>
  <!-- Anzeige der bereits ausgewählten Tags -->
  <div class="tag-list">
    {#each currentTags as tag}
      <span class="tag-item">
        {tag}
        <button on:click={() => onRemove(tag)}>X</button>
      </span>
    {/each}
  </div>
  <!-- Eingabefeld zur Tag-Eingabe -->
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
