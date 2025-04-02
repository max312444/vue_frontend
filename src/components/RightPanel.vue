<template>
    <div class="right-panel">
      <h3>사진 목록</h3>
      <ul>
        <li v-for="(photo, index) in photoList" :key="index" class="photo-item">
          <!-- ✅ 전체 주소로 이미지 표시 -->
          <img :src="photo.fullUrl" @click="selectPhoto(photo.fullUrl)" />
          <button @click="deletePhoto(photo.filename)">삭제</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  // 👉 서버 주소
  const BASE_URL = 'http://210.101.236.158:5001'
  
  const photoList = ref([])
  
  // 👉 CenterPanel에 선택 반영
  const emit = defineEmits(['select'])
  
  // 👉 사진 선택
  const selectPhoto = (url) => {
    emit('select', url)
  }
  
  // ✅ 사진 목록 불러오기 (서버 연동)
  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/photos`)
      photoList.value = res.data.map(photo => ({
        ...photo,
        fullUrl: `${BASE_URL}${photo.url}`,
      }))
    } catch (err) {
      console.error('사진 목록 불러오기 실패:', err)
    }
  }
  
  // ✅ 삭제 요청 (서버 연동 시 여기에 추가 가능)
  const deletePhoto = async (filename) => {
    try {
      await axios.delete(`${BASE_URL}/delete/${filename}`)
      photoList.value = photoList.value.filter(p => p.filename !== filename)
      alert('사진이 삭제되었습니다!')
    } catch (err) {
      console.error('삭제 실패:', err)
      alert('삭제에 실패했습니다.')
    }
  }
  
  onMounted(fetchPhotos)
  
  // ✅ 외부에서 fetchPhotos 접근 가능하게 만듦
  defineExpose({ fetchPhotos })
  </script>
  
  <style scoped>
  .right-panel {
    width: 25%;
    padding: 20px;
    background: #f9f9f9;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  .photo-item {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    cursor: pointer;
    border: 1px solid #ccc;
  }
  </style>
  