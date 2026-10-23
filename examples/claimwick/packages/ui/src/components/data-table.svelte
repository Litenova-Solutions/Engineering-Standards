<script lang="ts">
  type Column = { key: string; label: string; numeric?: boolean };

  let { caption, columns, rows }: { caption: string; columns: Column[]; rows: Record<string, string>[] } = $props();
</script>

<div class="data-table" role="region" aria-label={caption} tabindex="0">
  <table>
    <caption>{caption}</caption>
    <thead>
      <tr>
        {#each columns as column (column.key)}
          <th scope="col" class:numeric={column.numeric}>{column.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, index (index)}
        <tr>
          {#each columns as column (column.key)}
            <td class:numeric={column.numeric}>{row[column.key]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
