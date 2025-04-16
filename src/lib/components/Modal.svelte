<!-- src/lib/components/Modal.svelte -->
<script>
    // The generic modal component.
    // Props:
    // - visible: Boolean flag to control modal visibility.
    // - onClose: Function to be called when the backdrop is clicked.
    export let visible = false;
    export let onClose = () => {};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if visible}
    <div class="modal-backdrop" on:click={onClose}>
        <div class="modal-content" on:click|stopPropagation>
            <slot />
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background: #222;
        padding: 20px;
        border-radius: 8px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        color: white;
    }
</style>
