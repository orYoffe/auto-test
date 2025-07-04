<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // TypeScript interface for a task
  interface Task {
    id: number;
    text: string;
    completed: boolean;
  }
  
  // Props
  export let tasks: Task[] = [];
  export let title = "Task Manager";
  
  // Local state
  let taskText = "";
  let filter: 'all' | 'active' | 'completed' = 'all';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Computed values
  $: filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  
  $: completedCount = tasks.filter(task => task.completed).length;
  $: remainingCount = tasks.length - completedCount;
  
  // Methods
  function addTask() {
    if (taskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: taskText.trim(),
        completed: false
      };
      
      tasks = [...tasks, newTask];
      dispatch('task-added', newTask);
      taskText = "";
    }
  }
  
  function toggleTask(id: number) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };
        dispatch('task-updated', updatedTask);
        return updatedTask;
      }
      return task;
    });
  }
  
  function removeTask(id: number) {
    tasks = tasks.filter(task => task.id !== id);
    dispatch('task-removed', id);
  }
  
  function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    dispatch('clear-completed');
  }
</script>

<main>
  <h1>{title}</h1>
  
  <form on:submit|preventDefault={addTask}>
    <input 
      type="text" 
      bind:value={taskText} 
      placeholder="Add new task..." 
      data-testid="new-task-input"
    />
    <button type="submit">Add</button>
  </form>
  
  <div class="filters">
    <button class:active={filter === 'all'} on:click={() => filter = 'all'}>All</button>
    <button class:active={filter === 'active'} on:click={() => filter = 'active'}>Active</button>
    <button class:active={filter === 'completed'} on:click={() => filter = 'completed'}>Completed</button>
  </div>
  
  <ul class="task-list">
    {#each filteredTasks as task (task.id)}
      <li class:completed={task.completed}>
        <input 
          type="checkbox" 
          checked={task.completed} 
          on:change={() => toggleTask(task.id)}
        />
        <span>{task.text}</span>
        <button class="delete" on:click={() => removeTask(task.id)}>×</button>
      </li>
    {/each}
  </ul>
  
  <div class="task-info">
    <span>{remainingCount} item{remainingCount !== 1 ? 's' : ''} left</span>
    {#if completedCount > 0}
      <button on:click={clearCompleted}>Clear completed</button>
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
  }
  
  h1 {
    color: #4a5568;
    text-align: center;
  }
  
  form {
    display: flex;
    margin-bottom: 20px;
  }
  
  input[type="text"] {
    flex: 1;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
  }
  
  form button {
    background: #4299e1;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 16px;
  }
  
  form button:hover {
    background: #3182ce;
  }
  
  .filters {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }
  
  .filters button {
    background: none;
    border: 1px solid #e2e8f0;
    padding: 6px 12px;
    margin: 0 5px;
    cursor: pointer;
    border-radius: 4px;
    color: #4a5568;
  }
  
  .filters button.active {
    background: #4299e1;
    color: white;
    border-color: #4299e1;
  }
  
  .task-list {
    list-style: none;
    padding: 0;
  }
  
  .task-list li {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: white;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .task-list li.completed span {
    color: #a0aec0;
    text-decoration: line-through;
  }
  
  .task-list input[type="checkbox"] {
    margin-right: 10px;
  }
  
  .task-list span {
    flex: 1;
  }
  
  .delete {
    background: none;
    border: none;
    color: #e53e3e;
    font-size: 20px;
    cursor: pointer;
    padding: 0 8px;
  }
  
  .task-info {
    display: flex;
    justify-content: space-between;
    color: #718096;
    font-size: 14px;
    margin-top: 20px;
  }
  
  .task-info button {
    background: none;
    border: none;
    color: #4299e1;
    cursor: pointer;
    text-decoration: underline;
  }
</style>
