<!-- src/lib/components/GameFilter.svelte -->
<script>
  // Import numeric filter stores
  import {
    playerCount,
    minComplexity,
    maxComplexity,
    minPlaytime,
    maxPlaytime,
    requiredTags,
    desiredTags,
    excludedTags,
  } from "$lib/stores/gameFilterStore.js";

  import { MAX_PLAYTIME } from "$lib/stores/generalStore.js";
  import RangeSlider from "svelte-range-slider-pips";

  // Generic tag selector component
  import TagSelector from "$lib/components/TagSelector.svelte";
  // Store of all existing tags for autocomplete
  import { allTags } from "$lib/stores/tagStore.js";

  // Local slider state
  let complexityRange = [1, 5];
  let playtimeRange = [10, MAX_PLAYTIME];

  /**
   * Update complexity bounds in store
   */
  function updateComplexityRange(event) {
    complexityRange = event.detail.values;
    minComplexity.set(complexityRange[0]);
    maxComplexity.set(complexityRange[1]);
  }

  /**
   * Update playtime bounds in store
   */
  function updatePlaytimeRange(event) {
    playtimeRange = event.detail.values;
    minPlaytime.set(playtimeRange[0]);
    maxPlaytime.set(playtimeRange[1]);
  }

  // Functions to add/remove filter tags
  function addRequiredTag(tag) {
    requiredTags.update((tags) => (tags.includes(tag) ? tags : [...tags, tag]));
  }
  function removeRequiredTag(tag) {
    requiredTags.update((tags) => tags.filter((t) => t !== tag));
  }

  function addDesiredTag(tag) {
    desiredTags.update((tags) => (tags.includes(tag) ? tags : [...tags, tag]));
  }
  function removeDesiredTag(tag) {
    desiredTags.update((tags) => tags.filter((t) => t !== tag));
  }

  function addExcludedTag(tag) {
    excludedTags.update((tags) => (tags.includes(tag) ? tags : [...tags, tag]));
  }
  function removeExcludedTag(tag) {
    excludedTags.update((tags) => tags.filter((t) => t !== tag));
  }
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="filter-panel">
  <div class="filter-tile">
    <!-- Numeric filters: player count, complexity, playtime -->
    <label>
      Player Count:
      <input
        type="number"
        bind:value={$playerCount}
        min="1"
        placeholder="Any"
      />
    </label>

    <label>Complexity: {$minComplexity} - {$maxComplexity}</label>
    <RangeSlider
      bind:values={complexityRange}
      min={1}
      max={5}
      step={0.1}
      float
      pips
      pushy
      range
      on:change={updateComplexityRange}
    />

    <label>Playtime: {$minPlaytime} - {$maxPlaytime} min</label>
    <RangeSlider
      bind:values={playtimeRange}
      min={10}
      max={180}
      step={5}
      pips
      float
      pushy
      range
      on:change={updatePlaytimeRange}
    />
  </div>

  <!-- Tag filters: only existing tags allowed (allowNew=false) -->
  <div class="filter-tile">
    <TagSelector
      label="benötigte Tags"
      allTags={$allTags}
      currentTags={$requiredTags}
      onAdd={addRequiredTag}
      onRemove={removeRequiredTag}
      placeholder="Enter required tag..."
      allowNew={false}
    />
  </div>
  <div class="filter-tile">
    <TagSelector
      label="gewünschte Tags"
      allTags={$allTags}
      currentTags={$desiredTags}
      onAdd={addDesiredTag}
      onRemove={removeDesiredTag}
      placeholder="Enter desired tag..."
      allowNew={false}
    />
  </div>
  <div class="filter-tile">
    <TagSelector
      label="auszuschließende Tags"
      allTags={$allTags}
      currentTags={$excludedTags}
      onAdd={addExcludedTag}
      onRemove={removeExcludedTag}
      placeholder="Enter excluded tag..."
      allowNew={false}
    />
  </div>
</div>

<style>
  .filter-panel {
    display: flex;
    gap: 20px;
  }
  .filter-tile {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border: 1px solid #ccc;
  }
</style>
