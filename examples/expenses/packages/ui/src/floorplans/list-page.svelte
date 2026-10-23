<script lang="ts">
  import type { Snippet } from "svelte";

  let { title, filters, children }: { title: string; filters?: Snippet; children: Snippet } = $props();
</script>

<main data-floorplan="list-page" data-registry-item="list-page">
  <h1>{title}</h1>
  {#if filters}
    <section aria-label="Filters">{@render filters()}</section>
  {/if}
  <section>{@render children()}</section>
</main>
