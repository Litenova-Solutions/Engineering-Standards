<script>
  import { ghostOp } from '@fixture/api';

  async function run() {
    await ghostOp({});
  }
</script>

<button on:click={run}>Ghost</button>
