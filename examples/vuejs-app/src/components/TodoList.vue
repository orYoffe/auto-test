<template>
  <div class="todo-list">
    <h1>{{ title }}</h1>
    
    <form @submit.prevent="addTodo">
      <input 
        type="text" 
        v-model="newTodoText"
        placeholder="Add a new todo"
        required
      />
      <button type="submit">Add</button>
    </form>
    
    <ul>
      <li 
        v-for="todo in todos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
        @click="toggleTodo(todo.id)"
      >
        {{ todo.text }}
      </li>
    </ul>

    <div class="stats">
      <p>{{ completedCount }} completed / {{ todos.length }} total</p>
      <button v-if="completedCount > 0" @click="clearCompleted">
        Clear completed
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  
  props: {
    title: {
      type: String,
      default: 'Todo List'
    },
    todos: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      newTodoText: ''
    }
  },
  
  computed: {
    completedCount() {
      return this.todos.filter(todo => todo.completed).length
    }
  },
  
  methods: {
    addTodo() {
      if (this.newTodoText.trim()) {
        this.$emit('add-todo', this.newTodoText.trim())
        this.newTodoText = ''
      }
    },
    
    toggleTodo(id) {
      this.$emit('toggle-todo', id)
    },
    
    clearCompleted() {
      this.$emit('clear-completed')
    }
  }
}
</script>

<style scoped>
.todo-list {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #42b983;
}

form {
  display: flex;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.3s;
}

li:hover {
  background-color: #f9f9f9;
}

.completed {
  color: #aaa;
  text-decoration: line-through;
}

.stats {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats button {
  background-color: #ff7875;
  border-radius: 4px;
}
</style>
