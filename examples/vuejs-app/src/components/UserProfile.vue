<template>
  <div class="user-profile">
    <div class="avatar" v-if="user.avatarUrl">
      <img :src="user.avatarUrl" :alt="`${user.name}'s avatar`" />
    </div>
    <div class="user-details">
      <h2>{{ user.name }}</h2>
      <p class="email">{{ user.email }}</p>
      
      <div v-if="showDetails" class="additional-info">
        <p><strong>Joined:</strong> {{ formatDate(user.joinDate) }}</p>
        <p><strong>Last login:</strong> {{ formatDate(user.lastLogin) }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      </div>
      
      <button @click="toggleDetails" class="toggle-button">
        {{ showDetails ? 'Hide Details' : 'Show Details' }}
      </button>
      
      <button v-if="isEditable" @click="$emit('edit-user', user.id)" class="edit-button">
        Edit Profile
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  
  props: {
    user: {
      type: Object,
      required: true,
      validator: (user) => {
        return user.id && user.name && user.email;
      }
    },
    isEditable: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      showDetails: false
    }
  },
  
  methods: {
    toggleDetails() {
      this.showDetails = !this.showDetails;
      this.$emit('toggle-details', this.showDetails);
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  }
}
</script>

<style scoped>
.user-profile {
  display: flex;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

h2 {
  margin-top: 0;
  color: #333;
}

.email {
  color: #666;
  margin-bottom: 20px;
}

.additional-info {
  margin: 15px 0;
  padding: 10px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

button {
  padding: 8px 12px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toggle-button {
  background-color: #42b983;
  color: white;
}

.edit-button {
  background-color: #3498db;
  color: white;
}
</style>
