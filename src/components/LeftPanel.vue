<template>
  <div class="left-panel">
    <div class="card">
      <h2 v-if="user && user.name">
        <strong>{{ user.name }}</strong>님 환영합니다.
      </h2>
      <h2 v-else>로그인이 필요합니다</h2>

      <img
        v-if="user?.picture"
        :src="user.picture"
        alt="Profile"
        class="profile-img"
      />
      <p v-if="user?.email" class="email">{{ user.email }}</p>

      <button class="logout-btn" @click="$emit('logout')">로그아웃</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['user'])
</script>

<style scoped>
.left-panel {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  background-color: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 240px;
  text-align: center;
}

.profile-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 12px 0;
  object-fit: cover;
  border: 2px solid #ccc;
}

.email {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  word-break: break-all;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #c82333;
}

h2 {
  font-size: 18px;
  margin-bottom: 8px;
}
</style>
