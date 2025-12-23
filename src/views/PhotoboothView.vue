<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-2xl">📸</span>
          </div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-white via-yellow-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg">
            Smart Photobooth
          </h1>
        </div>
        <p class="text-xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-md">
          Professional photo strips with custom frames and filters
        </p>
        <div class="flex justify-center gap-3 mt-6">
          <span class="px-4 py-2 bg-white/20 text-white rounded-full text-sm border border-white/30 backdrop-blur-sm">✨ Professional Quality</span>
          <span class="px-4 py-2 bg-white/20 text-white rounded-full text-sm border border-white/30 backdrop-blur-sm">🎨 Custom Frames</span>
          <span class="px-4 py-2 bg-white/20 text-white rounded-full text-sm border border-white/30 backdrop-blur-sm">📱 Instant Download</span>
        </div>
      </header>

      <!-- Main Content -->
      <div v-if="!finalImage" class="space-y-8">
        <!-- Camera Section - Full Width Center -->
        <div class="flex justify-center">
          <div class="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl max-w-6xl w-full">
            <h2 class="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3 drop-shadow-md">
              <span class="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-sm shadow-lg">📷</span>
              Camera Preview
            </h2>
            <div class="flex justify-center">
              <div class="w-full">
                <CameraPreview
                  :stream="stream"
                  :is-initialized="isInitialized"
                  :is-loading="isLoading"
                  :error="error"
                  @retry="initializeCamera"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Capture Status -->
        <div v-if="isCapturing" class="text-center">
          <div class="inline-flex items-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl border border-white/30 shadow-lg">
            <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
            <span class="font-medium text-lg drop-shadow-md">
              {{ isActive ? `Get ready for photo ${currentShot}!` : `Processing photo ${currentShot} of ${totalShots}...` }}
            </span>
          </div>
          
          <!-- Photo Progress -->
          <div class="flex justify-center gap-2 mt-4">
            <div 
              v-for="i in totalShots" 
              :key="i"
              :class="[
                'w-4 h-4 rounded-full transition-all duration-300',
                i < currentShot ? 'bg-green-400 shadow-lg shadow-green-400/50' : 
                i === currentShot ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50' : 
                'bg-white/30'
              ]"
            ></div>
          </div>
        </div>

        <!-- Photo Settings Section - Below Camera -->
        <div class="flex justify-center">
          <div class="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl max-w-6xl w-full">
            <h2 class="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3 drop-shadow-md">
              <span class="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl flex items-center justify-center text-sm shadow-lg">⚙️</span>
              Photo Settings
            </h2>
            <ControlPanel
              :can-start="isInitialized && !isCapturing && !isProcessing"
              :is-capturing="isCapturing"
              :current-shot="currentShot"
              :has-results="!!finalImage"
              @start-photoshoot="handleStartPhotoshoot"
              @new-session="resetSession"
            />
          </div>
        </div>
      </div>

      <!-- Result Section -->
      <div v-else class="w-full">
        <div v-show="!finalImage" class="flex items-center justify-center min-h-96">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-400 mx-auto mb-6"></div>
            <p class="text-white text-lg">Preparing your photo...</p>
          </div>
        </div>
        
        <div v-if="finalImage">
          <PhotoResult
            :imageDataURL="finalImage"
            :layout="originalLayout"
            :isDownloading="isDownloading"
            @download="handleResultDownload"
            @retake="handleRetakePhotos"
            @new-session="resetSession"
          />
        </div>
      </div>

      <!-- Processing Overlay -->
      <div v-if="isProcessing" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
        <div class="bg-white/20 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 shadow-2xl">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto mb-6"></div>
          <p class="text-white font-medium text-lg drop-shadow-md">Creating your photo strip...</p>
          <p class="text-white/80 text-sm mt-2">This will just take a moment</p>
        </div>
      </div>

      <!-- Countdown Overlay -->
      <CountdownOverlay
        :count="count"
        :is-active="isActive"
        :total-count="3"
        :current-photo="currentShot"
        :total-photos="totalShots"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CameraPreview from '@/components/CameraPreview.vue'
import CountdownOverlay from '@/components/CountdownOverlay.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import PhotoResult from '@/components/PhotoResult.vue'
import { useCamera } from '@/composables/useCamera'
import { useCountdown } from '@/composables/useCountdown'
import { useBurstCapture } from '@/composables/useBurstCapture'
import { usePhotoLayout } from '@/composables/usePhotoLayout'
import { useDownload } from '@/composables/useDownload'

// Composables
const { 
  stream,
  videoElement, 
  isInitialized, 
  isLoading, 
  error, 
  initializeCamera, 
  captureFrame 
} = useCamera()

const { count, isActive, startCountdown } = useCountdown()

const { 
  capturedImages, 
  isCapturing, 
  currentShot, 
  startBurstCapture, 
  clearCaptures 
} = useBurstCapture()

const { 
  finalCanvas, 
  isProcessing, 
  createPhotoLayout, 
  getCanvasDataURL 
} = usePhotoLayout()

const { isDownloading, downloadDataURL } = useDownload()

// State
const finalImage = ref(null)
const totalShots = ref(4)
const storedCapturedImages = ref([])
const currentFrameStyle = ref('none')
const currentFilter = ref('none')
const originalLayout = ref('vertical') // Store the original layout choice



// Methods
const handleStartPhotoshoot = async (settings) => {
  try {
    totalShots.value = settings.shotCount
    originalLayout.value = settings.layout // Store the original layout
    currentFilter.value = settings.filter // Store the selected filter
    currentFrameStyle.value = settings.frame // Store the selected frame
    
    // Capture burst photos with individual countdowns
    const images = await startBurstCapture(captureFrame, settings.shotCount, 1500, startCountdown)
    
    // Store captured images for later use
    storedCapturedImages.value = [...images]
    
    // Adjust canvas dimensions based on layout
    const canvasConfig = originalLayout.value === 'grid' 
      ? { canvasWidth: 800, canvasHeight: 800 } // Square for grid
      : { canvasWidth: 600, canvasHeight: 800 } // Portrait for strip
    
    // Create photo layout with all selected settings applied
    await createPhotoLayout(images, settings.layout, {
      ...canvasConfig,
      title: settings.title,
      showTimestamp: true,
      frameStyle: settings.frame, // Apply the pre-selected frame
      frameColor: getFrameColor(settings.frame),
      filter: settings.filter // Apply the pre-selected filter
    })
    
    // Get final image and show result
    const imageData = getCanvasDataURL()
    console.log('Canvas data URL:', imageData ? 'Generated' : 'Failed')
    console.log('Image data length:', imageData ? imageData.length : 0)
    
    // Set final image directly
    finalImage.value = imageData
    console.log('Final image set:', finalImage.value ? 'Success' : 'Failed')
    
  } catch (err) {
    console.error('Photoshoot failed:', err)
    alert('Failed to create photo strip. Please try again.')
  }
}



const handleResultDownload = async () => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `photobooth-${timestamp}.png`
    downloadDataURL(finalImage.value, filename)
  } catch (error) {
    console.error('Download failed:', error)
    alert('Download failed. Please try again.')
  }
}

const getFrameColor = (frameStyle) => {
  switch (frameStyle) {
    case 'cute': return '#ff9a9e'
    case 'elegant': return '#FFD700'
    case 'party': return '#ff6b6b'
    case 'vintage': return '#8B4513'
    case 'galaxy': return '#000428'
    case 'love': return '#ff9a9e'
    case 'music': return '#1a1a1a'
    case 'custom': return '#ff6b6b'
    default: return '#ffffff'
  }
}

const handleRetakePhotos = () => {
  // Keep the same settings but clear the final image to go back to camera
  finalImage.value = null
  storedCapturedImages.value = []
  currentFrameStyle.value = 'none'
  clearCaptures()
}

const resetSession = () => {
  finalImage.value = null
  storedCapturedImages.value = []
  currentFrameStyle.value = 'none'
  currentFilter.value = 'none'
  originalLayout.value = 'vertical' // Reset to default
  clearCaptures()
}

// Initialize camera on mount
onMounted(() => {
  initializeCamera()
})
</script>