<script>
    // src/routes/+layout.svelte

    import "../app.css";
    import Header from "$lib/components/Header.svelte";

</script>

<div id="app">
    <Header />
    <slot />
</div>
