<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let items = [];
  export let title = "Counter App";
  export let initialCount = 0;
  
  let count = initialCount;
  
  const dispatch = createEventDispatcher();
  
  function increment() {
    count += 1;
    dispatch('count', { count });
  }
  
  function decrement() {
    if (count > 0) {
      count -= 1;
      dispatch('count', { count });
    }
  }
  
  function reset() {
    count = initialCount;
    dispatch('reset');
  }
  
  function addItem() {
    const newItem = {
      id: Date.now(),
      value: `Item ${items.length + 1}`
    };
    
    items = [...items, newItem];
    dispatch('item-added', newItem);
  }
</script>

<main>
  <h1>{title}</h1>
  
  <div class="counter">
    <button on:click={decrement}>-</button>
    <span data-testid="count-value">{count}</span>
    <button on:click={increment}>+</button>
    <button on:click={reset}>Reset</button>
  </div>
  
  <div class="items">
    <h2>Items ({items.length})</h2>
    <ul>
      {#each items as item (item.id)}
        <li>{item.value}</li>
      {/each}
    </ul>
    <button on:click={addItem}>Add Item</button>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  
  .counter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2em 0;
  }
  
  .counter span {
    min-width: 2em;
    color: #ff3e00;
    font-size: 2em;
    font-weight: bold;
  }
  
  button {
    background: #ff3e00;
    color: white;
    border: none;
    padding: 0.5em 1em;
    border-radius: 4px;
    cursor: pointer;
    margin: 0 0.5em;
  }
  
  button:hover {
    background-color: #ff6340;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  li {
    padding: 0.5em;
    margin: 0.5em 0;
    background-color: #f6f6f6;
    border-radius: 4px;
  }
</style>
