<script lang="ts">
  let { children, ...rest } = $props();
</script>

<button {...rest}>{@render children?.()}</button>
