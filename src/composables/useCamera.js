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

      console.log('Got media stream:', mediaStream)
      stream.value = mediaStream
      
      // Create a hidden video element for capture
      if (!videoElement.value) {
        videoElement.value = document.createElement('video')
        videoElement.value.autoplay = true
        videoElement.value.muted = true
        videoElement.value.playsInline = true
      }
      
      videoElement.value.srcObject = mediaStream
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        videoElement.value.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoElement.value.play()
            .then(() => {
              console.log('Hidden video playing')
              resolve()
            })
            .catch(reject)
        }
        videoElement.value.onerror = reject
      })
      
      console.log('Camera initialized successfully')
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
    if (videoElement.value) {
      videoElement.value.srcObject = null
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
    
    // Flip the image horizontally to match the preview
    ctx.scale(-1, 1)
    ctx.drawImage(videoElement.value, -canvas.width, 0)
    
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