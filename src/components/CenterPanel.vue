<template>
  <div class="center-panel">

    <!-- 상단 사진: 초기 회원 사진 + 선택된 사진 -->
    <div class="photo-top-row">
      <div class="photo-box">
        <h3>선택한 사진</h3>
        <img
          v-if="selectedPhoto"
          :src="selectedPhoto"
          class="photo-preview"
          @click="openModal"
        />
        <p v-else>사진을 선택해주세요.</p>
      </div>
    </div>

    <!-- 모달: 선택된 사진 클릭 시 확대 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <span class="close-button" @click="closeModal">✖</span>
        <img :src="selectedPhoto" class="zoomed-photo" />
      </div>
    </div>

    <!-- 카메라 + 캔버스 -->
    <div class="camera-wrapper">
      <video ref="video" autoplay muted playsinline class="camera-video"></video>
      <canvas ref="canvas" width="1280" height="960" class="pose-canvas"></canvas>
    </div>

    <!-- 사진 찍기 버튼 -->
    <button class="photo-button" @click="capturePhoto">📸 사진 찍기</button>

    <!-- 미리보기 + 저장 버튼 -->
    <div v-if="preview" class="preview-wrapper">
      <img :src="preview" alt="미리보기" class="preview-image" />
      <button class="save-button" @click="savePhoto">💾 저장하기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { Pose } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'

// 👉 상위 컴포넌트로부터 선택된 사진 받아오기
const props = defineProps({
  selectedPhoto: String
})
const emit = defineEmits(['photoUploaded'])

const selectedPhoto = ref(null)
const initialPhoto = ref(null)
const video = ref(null)
const canvas = ref(null)
const preview = ref(null)

// 👇 모달 상태
const showModal = ref(false)
const openModal = () => {
  if (selectedPhoto.value) showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}

watch(() => props.selectedPhoto, (newVal) => {
  selectedPhoto.value = newVal
})

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user?.initialPhoto) {
    initialPhoto.value = user.initialPhoto
  }

  const ctx = canvas.value.getContext('2d')

  const pose = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  })

  pose.onResults((results) => {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    ctx.drawImage(results.image, 0, 0, canvas.value.width, canvas.value.height)

    if (!results.poseLandmarks) return
    const lm = results.poseLandmarks

    const drawCircle = (pt, color) => {
      ctx.beginPath()
      ctx.arc(pt.x * canvas.value.width, pt.y * canvas.value.height, 6, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    }

    const connect = (p1, p2, color = 'blue') => {
      ctx.beginPath()
      ctx.moveTo(p1.x * canvas.value.width, p1.y * canvas.value.height)
      ctx.lineTo(p2.x * canvas.value.width, p2.y * canvas.value.height)
      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.stroke()
    }

    const getHorizontalTilt = (p1, p2) => {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const rad = Math.atan2(dy, dx)
      const deg = rad * (180 / Math.PI)
      const tilt = Math.abs((deg + 360) % 360)
      return tilt > 90 ? Math.abs(180 - tilt) : tilt
    }

    const leftShoulder = lm[11]
    const rightShoulder = lm[12]
    const leftHip = lm[23]
    const rightHip = lm[24]
    const leftEar = lm[7]
    const rightEar = lm[8]
    const neck = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    }

    let occiput = null
    if (leftEar && rightEar) {
      const headCenter = {
        x: (leftEar.x + rightEar.x) / 2,
        y: (leftEar.y + rightEar.y) / 2,
      }
      const earDistance = Math.abs(leftEar.x - rightEar.x)
      if (earDistance > 0.05) {
        occiput = {
          x: headCenter.x - 0.03,
          y: headCenter.y,
        }
        const dx = occiput.x - neck.x
        const dy = occiput.y - neck.y
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        const angleFromVertical = Math.abs(90 - Math.abs(angle))

        ctx.fillStyle = angleFromVertical > 20 ? 'red' : 'deepskyblue'
        ctx.font = 'bold 20px Arial'
        ctx.fillText(`거북목 각도: ${angleFromVertical.toFixed(1)}°`, 10, 30)
        ctx.fillText(
          angleFromVertical > 20 ? '⚠️ 거북목 의심됨' : '✅ 정상 자세',
          10, 55
        )

        drawCircle(occiput, 'deepskyblue')
        connect(neck, occiput, 'orange')
      } else {
        occiput = headCenter
        drawCircle(occiput, 'deepskyblue')
      }
    }

    const shoulderTilt = getHorizontalTilt(leftShoulder, rightShoulder)
    const hipTilt = getHorizontalTilt(leftHip, rightHip)

    const shoulderDiff =
      Math.abs(leftShoulder.y - rightShoulder.y) * canvas.value.height
    const hipDiff =
      Math.abs(leftHip.y - rightHip.y) * canvas.value.height

    ctx.fillStyle = shoulderTilt > 10 ? 'red' : 'deepskyblue'
    ctx.fillText(`어깨 기울기: ${shoulderTilt.toFixed(1)}°`, 10, 85)
    ctx.fillText(`어깨 높이차: ${shoulderDiff.toFixed(1)}px`, 10, 110)

    ctx.fillStyle = hipTilt > 10 ? 'red' : 'deepskyblue'
    ctx.fillText(`골반 기울기: ${hipTilt.toFixed(1)}°`, 10, 140)
    ctx.fillText(`골반 높이차: ${hipDiff.toFixed(1)}px`, 10, 165)

    const connectPairs = [
      [occiput, neck],
      [neck, leftShoulder], [leftShoulder, lm[13]], [lm[13], lm[15]],
      [neck, rightShoulder], [rightShoulder, lm[14]], [lm[14], lm[16]],
      [neck, leftHip], [leftHip, lm[25]], [lm[25], lm[27]],
      [neck, rightHip], [rightHip, lm[26]], [lm[26], lm[28]],
    ]

    for (const [p1, p2] of connectPairs) {
      if (p1 && p2) connect(p1, p2)
    }

    const keypoints = [
      occiput, neck,
      leftShoulder, rightShoulder,
      lm[13], lm[14], lm[15], lm[16],
      leftHip, rightHip, lm[25], lm[26], lm[27], lm[28]
    ]

    for (const pt of keypoints) {
      if (pt) drawCircle(pt, 'red')
    }
  })

  const camera = new Camera(video.value, {
    onFrame: async () => {
      await pose.send({ image: video.value })
    },
    width: 1280,
    height: 960,
  })

  camera.start()
})

const capturePhoto = () => {
  const canvasEl = document.createElement('canvas')
  canvasEl.width = canvas.value.width
  canvasEl.height = canvas.value.height
  const ctx = canvasEl.getContext('2d')
  ctx.drawImage(canvas.value, 0, 0)
  preview.value = canvasEl.toDataURL('image/png')
}

const savePhoto = async () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user?.email || !preview.value) return

  try {
    const res = await axios.post('http://210.101.236.158:5001/upload', {
      imageBase64: preview.value,
      userEmail: user.email,
    })
    emit('photoUploaded') // 사진 목록 갱신 트리거
    preview.value = null  // 미리보기 초기화

    if (!user.initialPhoto) {
      user.initialPhoto = res.data.url
      localStorage.setItem('user', JSON.stringify(user))
    }

  } catch (err) {
    console.error('사진 저장 실패:', err)
  }
}
</script>

<style scoped>
.center-panel {
  width: 100%;
  padding: 20px;
  text-align: center;
}

.photo-top-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.photo-box {
  width: 45%;
}

.photo-preview {
  width: 100%;
  max-width: 250px;
  border: 2px solid #aaa;
  border-radius: 10px;
  margin-top: 8px;
  cursor: pointer;
}

.camera-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
.camera-video, .pose-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 500px;
  max-height: 400px;
  border-radius: 10px;
}
.photo-button {
  margin-top: 420px;
  padding: 10px 20px;
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.photo-button:hover {
  background-color: #0056b3;
}
.preview-wrapper {
  margin-top: 20px;
}
.preview-image {
  width: 100%;
  max-width: 500px;
  border: 2px solid #ccc;
  border-radius: 10px;
  margin-bottom: 10px;
}
.save-button {
  padding: 8px 20px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.save-button:hover {
  background-color: #218838;
}

/* 추가된 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 90%;
  max-height: 90%;
  position: relative;
}
.zoomed-photo {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 10px;
}
.close-button {
  position: absolute;
  top: 5px;
  right: 15px;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
}
</style>
