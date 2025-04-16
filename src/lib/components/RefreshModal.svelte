<!-- src/lib/components/RefreshModal.svelte -->
<script>
    // This component provides a refresh modal that uses the generic Modal and shows a loader.
    // It is used to indicate a background refresh process.
    import Modal from "./Modal.svelte";
    import Loader from "./Loader.svelte"; // Ensure Loader.svelte exists and shows a loading animation

    // Props:
    // - visible: controls modal visibility.
    // - status: 'loading' | 'done' | 'error'
    // - message: an optional custom message
    // - onClose: function to be called when closing the modal.
    export let visible = false;
    export let status = "loading";
    export let message = "";
    export let onClose = () => {};
</script>

<Modal {visible} {onClose}>
    {#if status === "loading"}
        <div class="refresh-modal">
            <Loader />
            <p>{message || "Loading..."}</p>
        </div>
    {:else if status === "done"}
        <div class="refresh-modal">
            <p>{message || "Refresh complete"}</p>
            <button on:click={onClose}>OK</button>
        </div>
    {:else if status === "error"}
        <div class="refresh-modal">
            <p>{message || "Refresh failed"}</p>
            <button on:click={onClose}>OK</button>
        </div>
    {/if}
</Modal>

<style>
    .refresh-modal {
        text-align: center;
    }
    .refresh-modal p {
        margin: 10px 0;
    }
    .refresh-modal button {
        padding: 8px 16px;
        font-size: 1rem;
        cursor: pointer;
    }
</style>
