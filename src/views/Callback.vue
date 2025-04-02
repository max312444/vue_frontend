<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const profile = ref(null)

onMounted(async () => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')

  if (accessToken) {
    const res = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    localStorage.setItem('user', JSON.stringify(data))
    router.push('/main')
  }
})
</script>
