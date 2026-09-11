<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { socket } from '@/services/socket'

interface JobProgress {
  jobId: string
  progress: number
  stage: string
}

const latestProgress = ref<JobProgress | null>(null)
const progressEvents = ref<JobProgress[]>([])
const connectionStatus = ref('Disconnected')
const testRequestStatus = ref('')

const handleConnect = () => {
  connectionStatus.value = 'Connected'
}

const handleDisconnect = () => {
  connectionStatus.value = 'Disconnected'
}

const handleConnectError = () => {
  connectionStatus.value = 'Connection error'
}

const handleProgress = (data: JobProgress) => {
  latestProgress.value = data
  progressEvents.value = [data, ...progressEvents.value].slice(0, 20)
}

onMounted(() => {
  socket.on('connect', handleConnect)
  socket.on('disconnect', handleDisconnect)
  socket.on('connect_error', handleConnectError)
  socket.on('job-progress', handleProgress)
  socket.connect()
})

onUnmounted(() => {
  socket.off('connect', handleConnect)
  socket.off('disconnect', handleDisconnect)
  socket.off('connect_error', handleConnectError)
  socket.off('job-progress', handleProgress)
  socket.disconnect()
})

const sendTestProgress = async () => {
  testRequestStatus.value = 'Starting test progress...'

  try {
    const response = await fetch(`http://${window.location.hostname}:3000/job/test-progress`)
    if (!response.ok) throw new Error('Request failed')
    testRequestStatus.value = 'Test progress started'
  } catch {
    testRequestStatus.value = 'Could not start test progress'
  }
}
</script>

<template>
  <main class="container">
    <h1>Job Progress Socket Test</h1>
    <p>Socket: {{ connectionStatus }}</p>
    <button type="button" @click="sendTestProgress">Send test progress</button>
    <p v-if="testRequestStatus">{{ testRequestStatus }}</p>

    <section v-if="latestProgress">
      <h2>Latest video processing progress</h2>
      <p>{{ latestProgress.jobId }}: {{ latestProgress.progress }}%</p>
      <progress :value="latestProgress.progress" max="100" />
      <p>{{ latestProgress.stage }}</p>
    </section>

    <section v-if="progressEvents.length">
      <h2>Progress events</h2>
      <ul>
        <li v-for="event in progressEvents" :key="`${event.jobId}-${event.progress}-${event.stage}`">
          {{ event.jobId }} - {{ event.progress }}% - {{ event.stage }}
        </li>
      </ul>
    </section>
  </main>
</template>


<style scoped>

.container{
    padding: 12px;
}
</style>