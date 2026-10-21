<script>
  import { submitExpense } from '@expenses/api';

  async function submit() {
    await submitExpense({ amount: '42.50' });
  }
</script>

<button on:click={submit}>Submit</button>
