<template>
  <div class="main-container">
    <div class="left">
      <LeftPanel :user="user" @logout="handleLogout" />
    </div>
    <div class="center">
      <CenterPanel
        :selectedPhoto="selectedPhoto"
        @photoUploaded="handlePhotoUploaded"  
      />
    </div>
    <div class="right">
      <RightPanel
        ref="rightPanelRef"                   
        @select="selectedPhoto = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LeftPanel from '../components/LeftPanel.vue'
import CenterPanel from '../components/CenterPanel.vue'
import RightPanel from '../components/RightPanel.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user')) || null)
const selectedPhoto = ref(null)

// ✅ ref를 통해 RightPanel 안의 메서드 호출하기 위함
const rightPanelRef = ref(null)

const handleLogout = () => {
localStorage.removeItem('user')
router.push('/')
}

// ✅ 사진 저장 후 → 목록 새로고침 호출
const handlePhotoUploaded = () => {
if (rightPanelRef.value) {
  rightPanelRef.value.fetchPhotos()  // 사진이 업로드된 후 RightPanel에서 fetchPhotos 호출
}
}
</script>

<style scoped>
.main-container {
display: flex;
flex-direction: row;
justify-content: center;
align-items: flex-start;
gap: 40px; /* ✅ 패널 사이 여백 늘림 */
max-width: 1400px; /* ✅ 전체 너비 살짝 여유있게 */
margin: 0 auto;
padding: 20px;
box-sizing: border-box;
}

.left {
flex: 1;
max-width: 320px; /* ✅ 폭 넓힘 */
background-color: #f2f2f2;
padding: 20px;
border-radius: 8px;
box-sizing: border-box;
}

.center {
flex: 2;
min-width: 500px;
padding: 20px;
border-radius: 8px;
background: #fff;
box-shadow: 0 0 5px rgba(0,0,0,0.1);
box-sizing: border-box;
}

.right {
flex: 1;
max-width: 250px;
background-color: #f9f9f9;
padding: 20px;
border-radius: 8px;
box-sizing: border-box;
}
</style>
