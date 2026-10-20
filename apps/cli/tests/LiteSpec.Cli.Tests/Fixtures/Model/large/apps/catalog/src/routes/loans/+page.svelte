<script>
  import { borrowCopy } from '@fixture/api';

  async function borrow() {
    await borrowCopy({ copyId: 'copy-1' });
  }
</script>

<button on:click={borrow}>Borrow</button>
