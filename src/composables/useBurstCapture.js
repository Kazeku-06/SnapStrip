import { ref } from 'vue'

export function useBurstCapture() {
  const capturedImages = ref([])
  const isCapturing = ref(false)
  const currentShot = ref(0)

  const startBurstCapture = async (captureFunction, shotCount = 4, delayBetweenShots = 1000, countdownFunction = null) => {
    isCapturing.value = true
    capturedImages.value = []
    currentShot.value = 0

    try {
      for (let i = 0; i < shotCount; i++) {
        currentShot.value = i + 1
        
        // Individual countdown before each photo
        if (countdownFunction) {
          await countdownFunction(3) // 3 second countdown before each photo
        }
        
        // Capture the frame
        const imageData = captureFunction()
        capturedImages.value.push(imageData)
        
        // Wait before next shot (except for the last one)
        if (i < shotCount - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenShots))
        }
      }
    } catch (error) {
      console.error('Burst capture failed:', error)
      throw error
    } finally {
      isCapturing.value = false
      currentShot.value = 0
    }

    return capturedImages.value
  }

  const clearCaptures = () => {
    capturedImages.value = []
    currentShot.value = 0
  }

  return {
    capturedImages,
    isCapturing,
    currentShot,
    startBurstCapture,
    clearCaptures
  }
}