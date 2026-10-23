<script lang="ts">
  import { listExpenses } from "@expenses/api";
  import { DataTable, ListPage } from "@expenses/ui/floorplans";

  const columns = [
    { key: "submittedAt", label: "Submitted" },
    { key: "amount", label: "Amount", numeric: true },
    { key: "state", label: "State" },
  ];

  const request = listExpenses({ throwOnError: true });
</script>

<ListPage title="Expenses">
  {#await request}
    <p role="status">Loading expenses.</p>
  {:then result}
    <DataTable
      caption="Your expenses, newest first"
      {columns}
      rows={result.expenses.map((expense) => ({
        submittedAt: expense.submittedAt,
        amount: `${expense.amount} ${expense.currency}`,
        state: expense.state,
      }))}
    />
  {:catch}
    <p role="alert">The expenses could not be loaded. Try again in a moment.</p>
  {/await}
</ListPage>
