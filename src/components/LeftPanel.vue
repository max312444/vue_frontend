<template>
  <div class="left-panel">
    <h2 v-if="user && user.name"><strong>{{ user.name }}</strong>님 환영합니다.</h2>
    <h2 v-else>로그인이 필요합니다</h2>

    <img v-if="user?.picture" :src="user.picture" alt="Profile" width="80" />
    <p v-if="user?.email">{{ user.email }}</p>

    <button @click="$emit('logout')">로그아웃</button>
  </div>
</template>

<script setup>
defineProps(['user'])
</script>

<style scoped>
.left-panel {
  text-align: center;
  word-break: keep-all;
  min-height: 200px;
}

h2 {
  font-size: 18px;
  margin-bottom: 10px;
}
</style>
