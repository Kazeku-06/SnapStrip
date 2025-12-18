import { ref, onUnmounted } from 'vue'

export function useCamera() {
  const stream = ref(null)
  const videoElement = ref(null)
  const isInitialized = ref(false)
  const error = ref(null)
  const isLoading = ref(false)

  const initializeCamera = async () => {
    isLoading.value = true
    error.value = null

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      stream.value = mediaStream
      
      if (videoElement.value) {
        videoElement.value.srcObject = mediaStream
        await videoElement.value.play()
      }
      
      isInitialized.value = true
    } catch (err) {
      console.error('Camera initialization failed:', err)
      error.value = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access and refresh the page.'
        : 'Failed to access camera. Please check your camera connection.'
    } finally {
      isLoading.value = false
    }
  }

  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    isInitialized.value = false
  }

  const captureFrame = () => {
    if (!videoElement.value || !isInitialized.value) {
      throw new Error('Camera not initialized')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    
    ctx.drawImage(videoElement.value, 0, 0)
    
    return canvas.toDataURL('image/png')
  }

  onUnmounted(() => {
    stopCamera()
  })

  return {
    stream,
    videoElement,
    isInitialized,
    error,
    isLoading,
    initializeCamera,
    stopCamera,
    captureFrame
  }
}