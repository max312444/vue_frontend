<template>
    <div class="photo-list">
      <h3>사진 목록</h3>
      <div v-for="photo in photos" :key="photo.filename" class="photo-item">
        <img :src="getFullUrl(photo.url)" class="thumbnail" @click="$emit('select', getFullUrl(photo.url))" />
        <button @click="deletePhoto(photo.filename)">삭제</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const photos = ref([])
  
  // 서버 IP
  const SERVER_URL = 'http://210.101.236.158:5001'
  
  // 전체 URL 만들기
  const getFullUrl = (relativePath) => {
    return `${SERVER_URL}${relativePath}`
  }
  
  // 사진 목록 불러오기
  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/photos`)
      photos.value = res.data
    } catch (err) {
      console.error('사진 목록 불러오기 실패:', err)
    }
  }
  
  // 사진 삭제
  const deletePhoto = async (filename) => {
    try {
      await axios.delete(`${SERVER_URL}/delete/${filename}`)
      fetchPhotos() // 삭제 후 새로고침
    } catch (err) {
      console.error('삭제 실패:', err)
    }
  }
  
  onMounted(() => {
    fetchPhotos()
  })
  
  // 외부에서 목록 다시 불러오고 싶을 때
  defineExpose({ fetchPhotos })
  </script>
  
  <style scoped>
  .photo-list {
    padding: 10px;
    background: #f5f5f5;
    border-radius: 10px;
    width: 100%;
  }
  
  .photo-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
    object-fit: cover;
    margin-right: 10px;
    cursor: pointer;
    border: 1px solid #ccc;
  }
  </style>
  