<script>
    // Diese Komponente wird in der Collection-Ansicht zur Bearbeitung der Spieltags verwendet.
    // Hier soll neben den vorhandenen Tags auch das Hinzufügen neuer Tags möglich sein.
    // Daher wird bei der Verwendung der TagSelector-Komponente allowNew auf true gesetzt.
    import { themes } from "$lib/stores/themeStore.js";
    import TagSelector from "$lib/components/TagSelector.svelte";
  
    export let allThemes = [];
    export let bggId;
    export let addTheme;
    export let removeTheme;
  
    // Abonniere den themes-Store für das aktuelle Spiel
    $: currentGameThemes = $themes[bggId] || [];
  </script>
  
  <!-- Nutzung der TagSelector-Komponente für die Spieltags; allowNew=true erlaubt das Hinzufügen neuer Tags -->
  <TagSelector 
    label="Themes" 
    allTags={allThemes} 
    currentTags={currentGameThemes} 
    onAdd={(tag) => addTheme(bggId, tag)} 
    onRemove={(tag) => removeTheme(bggId, tag)} 
    placeholder="Add theme..."
    allowNew={true}
  />
  