<script>
    import "../app.css";
    import Header from "$lib/components/Header.svelte";

    // disable server-side rendering
    export const ssr = false;
</script>

<div id="app">
    <Header />
    <slot />
</div>
