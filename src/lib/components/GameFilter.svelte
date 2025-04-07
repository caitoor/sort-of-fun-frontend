<script>
  // Diese Komponente steuert die Filterung der Spielesammlung.
  // Neben den numerischen Filtern (Spieleranzahl, Komplexität, Spielzeit)
  // werden nun auch Filter-Tags unterstützt:
  // - "benötigte Tags": Nur Spiele, die diesen Tag besitzen, werden angezeigt.
  // - "gewünschte Tags": Spiele mit diesem Tag erhalten einen Rating-Multiplikator.
  // - "auszuschließende Tags": Spiele mit diesem Tag werden ausgeschlossen.
  //
  // Die Tag-Eingabe erfolgt über die TagSelector-Komponente.
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
  import { MAX_PLAYTIME } from "$lib/stores/generalStore";
  import RangeSlider from "svelte-range-slider-pips";
  import TagSelector from "$lib/components/TagSelector.svelte";
  import { allThemes } from "$lib/stores/themeStore.js";

  // Lokale Werte für die Range-Slider
  let complexityRange = [1, 5];
  let playtimeRange = [10, MAX_PLAYTIME];

  // Aktualisiert den Complexity-Store anhand des Sliderwerts
  function updateComplexityRange(value) {
    complexityRange = value.detail.values;
    minComplexity.set(complexityRange[0]);
    maxComplexity.set(complexityRange[1]);
  }

  // Aktualisiert den Playtime-Store anhand des Sliderwerts
  function updatePlaytimeRange(value) {
    playtimeRange = value.detail.values;
    minPlaytime.set(playtimeRange[0]);
    maxPlaytime.set(playtimeRange[1]);
  }

  // Funktionen zum Hinzufügen/Entfernen der Filter-Tags
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
    <!-- Numerische Filter: Spieleranzahl, Komplexität und Spielzeit -->
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
  <!-- Tag-Filter: Hier sind nur existierende Tags zulässig (allowNew=false) -->
  <div class="filter-tile">
    <TagSelector
      label="benötigte Tags"
      allTags={$allThemes}
      currentTags={$requiredTags}
      onAdd={addRequiredTag}
      onRemove={removeRequiredTag}
      placeholder="Enter required tag..."
    />
  </div>
  <div class="filter-tile">
    <TagSelector
      label="gewünschte Tags"
      allTags={$allThemes}
      currentTags={$desiredTags}
      onAdd={addDesiredTag}
      onRemove={removeDesiredTag}
      placeholder="Enter desired tag..."
    />
  </div>
  <div class="filter-tile">
    <TagSelector
      label="auszuschließende Tags"
      allTags={$allThemes}
      currentTags={$excludedTags}
      onAdd={addExcludedTag}
      onRemove={removeExcludedTag}
      placeholder="Enter excluded tag..."
    />
  </div>
</div>

<style>
  .filter-panel {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20px;
  }
  .filter-tile {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    margin-bottom: 20px;
  }
</style>
