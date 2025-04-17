<!-- src/lib/components/TagEditor.svelte -->
<script>
  // This component is used in the Collection view to edit a game's tags.
  // It allows adding new tags, so we set allowNew=true on the TagSelector.
  import { tags } from "$lib/stores/tagStore.js";
  import TagSelector from "$lib/components/TagSelector.svelte";

  // List of all tags for autocomplete
  export let allTags = [];
  // BoardGameGeek ID of the current game
  export let bggId;
  // Function to add a tag to a game
  export let addTag;
  // Function to remove a tag from a game
  export let removeTag;

  // Reactive: get the tags currently assigned to this game
  $: currentGameTags = $tags[bggId] || [];
</script>

<!-- Use TagSelector to display and edit the game's tags -->
<TagSelector
  label="Tags"
  {allTags}
  currentTags={currentGameTags}
  onAdd={(tag) => addTag(bggId, tag)}
  onRemove={(tag) => removeTag(bggId, tag)}
  placeholder="Add tag..."
  allowNew={true}
/>
