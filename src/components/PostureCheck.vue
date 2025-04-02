<template>
    <div id="container">
      <video ref="video" autoplay></video>
      <canvas ref="canvas" width="1280" height="960"></canvas>
    </div>
    <div id="info">
      <h3>📊 자세 분석 결과</h3>
      <p>{{ neckResult }}</p>
      <p>{{ shoulderResult }}</p>
      <p>{{ hipResult }}</p>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch } from 'vue'
  
  const props = defineProps({
    cameraActive: Boolean,
    externalVideo: Object // ✅ 외부에서 video DOM을 전달받을 수 있게 추가
  })
  
  let video = ref(null)
  let canvas = ref(null)
  let ctx = null
  
  let neckResult = ref('거북목: 분석 중...')
  let shoulderResult = ref('어깨: 분석 중...')
  let hipResult = ref('골반: 분석 중...')
  
  let camera = null
  let pose = null
  
  onMounted(() => {
    ctx = canvas.value.getContext('2d')
  
    pose = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
    })
  
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
  
    pose.onResults(results => {
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
      ctx.drawImage(results.image, 0, 0, canvas.value.width, canvas.value.height)
      if (!results.poseLandmarks) return
  
      const lm = results.poseLandmarks
      const leftShoulder = lm[11]
      const rightShoulder = lm[12]
      const leftHip = lm[23]
      const rightHip = lm[24]
      const neck = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      }
  
      const leftEar = lm[7], rightEar = lm[8]
      let occiput = null
      if (leftEar && rightEar) {
        const headCenter = {
          x: (leftEar.x + rightEar.x) / 2,
          y: (leftEar.y + rightEar.y) / 2
        }
        occiput = {
          x: headCenter.x - 0.03,
          y: headCenter.y
        }
        const dx = occiput.x - neck.x
        const dy = occiput.y - neck.y
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        const angleFromVertical = Math.abs(90 - Math.abs(angle))
  
        neckResult.value = `거북목 각도: ${angleFromVertical.toFixed(1)}° - ` +
          (angleFromVertical > 20 ? '⚠️ 거북목 의심됨' : '✅ 정상 자세')
      }
  
      const shoulderTilt = getHorizontalTilt(leftShoulder, rightShoulder)
      const hipTilt = getHorizontalTilt(leftHip, rightHip)
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y) * canvas.value.height
      const hipDiff = Math.abs(leftHip.y - rightHip.y) * canvas.value.height
  
      shoulderResult.value = `어깨 기울기: ${shoulderTilt.toFixed(1)}°, 높이차: ${shoulderDiff.toFixed(1)}px`
      hipResult.value = `골반 기울기: ${hipTilt.toFixed(1)}°, 높이차: ${hipDiff.toFixed(1)}px`
    })
  
    const videoEl = props.externalVideo || video.value  // ✅ 외부에서 받은 video DOM을 우선 사용
  
    camera = new window.Camera(videoEl, {
      onFrame: async () => {
        await pose.send({ image: videoEl })
      },
      width: 1280,
      height: 960
    })
  })
  
  const getHorizontalTilt = (p1, p2) => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const rad = Math.atan2(dy, dx)
    const deg = rad * (180 / Math.PI)
    const tilt = Math.abs((deg + 360) % 360)
    const finalTilt = tilt > 90 ? Math.abs(180 - tilt) : tilt
    return finalTilt
  }
  
  watch(() => props.cameraActive, (active) => {
    if (active) {
      camera?.start()
    } else {
      camera?.stop()
    }
  })
  </script>
  
  <style scoped>
  #container {
    position: relative;
    width: 640px;
    height: 480px;
    margin: 40px auto;
    border: 2px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
  }
  video, canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 640px;
    height: 480px;
  }
  #info {
    width: 640px;
    margin: 20px auto;
    text-align: left;
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  #info h3 {
    margin-top: 0;
  }
  </style>
  