<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <div class="inline-flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-2xl">📸</span>
          </div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Smart Photobooth
          </h1>
        </div>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto font-light">
          Professional photo strips with custom frames and filters
        </p>
        <div class="flex justify-center gap-3 mt-6">
          <span class="px-4 py-2 bg-slate-800/60 text-slate-300 rounded-full text-sm border border-slate-700">✨ Professional Quality</span>
          <span class="px-4 py-2 bg-slate-800/60 text-slate-300 rounded-full text-sm border border-slate-700">🎨 Custom Frames</span>
          <span class="px-4 py-2 bg-slate-800/60 text-slate-300 rounded-full text-sm border border-slate-700">📱 Instant Download</span>
        </div>
      </header>

      <!-- Main Content -->
      <div v-if="!finalImage" class="grid lg:grid-cols-2 gap-12 items-start">
        <!-- Camera Section -->
        <div class="space-y-6">
          <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            <h2 class="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <span class="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-sm">📷</span>
              Camera Preview
            </h2>
            <CameraPreview
              :stream="stream"
              :is-initialized="isInitialized"
              :is-loading="isLoading"
              :error="error"
              @retry="initializeCamera"
            />
          </div>
          
          <!-- Capture Status -->
          <div v-if="isCapturing" class="text-center">
            <div class="inline-flex items-center gap-3 px-6 py-4 bg-slate-800/60 backdrop-blur-xl text-white rounded-2xl border border-slate-600/50">
              <div class="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></div>
              <span class="font-medium text-lg">
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
                  i < currentShot ? 'bg-green-500 shadow-lg shadow-green-500/30' : 
                  i === currentShot ? 'bg-slate-400 animate-pulse shadow-lg shadow-slate-400/30' : 
                  'bg-slate-700'
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Controls Section -->
        <div class="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 class="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <span class="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-sm">⚙️</span>
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

      <!-- Editor Section -->
      <div v-else class="w-full">
        <div v-show="!finalImage" class="flex items-center justify-center min-h-96">
          <div class="text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-400 mx-auto mb-6"></div>
            <p class="text-white text-lg">Preparing your photo...</p>
          </div>
        </div>
        
        <div v-if="finalImage" class="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <h2 class="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <span class="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-sm">🎨</span>
            Photo Editor
          </h2>
          <SimplePhotoEditor
            :imageDataURL="finalImage"
            :capturedImages="storedCapturedImages"
            :layout="originalLayout"
            @download="handleEditorDownload"
            @back="resetSession"
            @frameChanged="handleFrameChanged"
            @filterChanged="handleFilterChanged"
          />
        </div>
      </div>

      <!-- Processing Overlay -->
      <div v-if="isProcessing" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40">
        <div class="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 text-center border border-slate-600/50 shadow-2xl">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-400 mx-auto mb-6"></div>
          <p class="text-white font-medium text-lg">Creating your photo strip...</p>
          <p class="text-gray-400 text-sm mt-2">This will just take a moment</p>
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
import SimplePhotoEditor from '@/components/SimplePhotoEditor.vue'
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
    
    // No initial countdown - each photo will have its own countdown
    
    // Capture burst photos with individual countdowns
    const images = await startBurstCapture(captureFrame, settings.shotCount, 1500, startCountdown)
    
    // Store captured images for later use
    storedCapturedImages.value = [...images]
    
    // Adjust canvas dimensions based on layout
    const canvasConfig = originalLayout.value === 'grid' 
      ? { canvasWidth: 800, canvasHeight: 800 } // Square for grid
      : { canvasWidth: 600, canvasHeight: 800 } // Portrait for strip
    
    // Create photo layout with no frame initially
    await createPhotoLayout(images, settings.layout, {
      ...canvasConfig,
      title: settings.title,
      showTimestamp: true,
      frameStyle: 'none', // No frame initially, user can select in editor
      frameColor: '#ffffff'
    })
    
    // Get final image and go directly to editor
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



const handleEditorDownload = async (editData) => {
  try {
    // If it's just a string (old format), download directly
    if (typeof editData === 'string') {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `photobooth-edited-${timestamp}.png`
      downloadDataURL(editData, filename)
      return
    }

    // New format - the current finalImage already has the correct frame and filter applied
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `photobooth-styled-${timestamp}.png`
    downloadDataURL(finalImage.value, filename)
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback download
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `photobooth-fallback-${timestamp}.png`
    downloadDataURL(typeof editData === 'string' ? editData : editData.imageDataURL, filename)
  }
}

const handleFrameChanged = async (frameStyle) => {
  try {
    currentFrameStyle.value = frameStyle
    if (storedCapturedImages.value && storedCapturedImages.value.length > 0) {
      // Adjust canvas dimensions based on original layout
      const canvasConfig = originalLayout.value === 'grid' 
        ? { canvasWidth: 800, canvasHeight: 800 } // Square for grid
        : { canvasWidth: 600, canvasHeight: 800 } // Portrait for strip
      
      // Regenerate photo layout with new frame style and ORIGINAL layout
      await createPhotoLayout(storedCapturedImages.value, originalLayout.value, {
        ...canvasConfig,
        title: '',
        showTimestamp: true,
        frameStyle: frameStyle,
        frameColor: getFrameColor(frameStyle),
        filter: currentFilter.value
      })
      
      // Update the displayed image
      const newImageData = getCanvasDataURL()
      finalImage.value = newImageData
    }
  } catch (error) {
    console.error('Frame change failed:', error)
  }
}

const handleFilterChanged = async (filterType) => {
  try {
    currentFilter.value = filterType
    if (storedCapturedImages.value && storedCapturedImages.value.length > 0) {
      // Adjust canvas dimensions based on original layout
      const canvasConfig = originalLayout.value === 'grid' 
        ? { canvasWidth: 800, canvasHeight: 800 } // Square for grid
        : { canvasWidth: 600, canvasHeight: 800 } // Portrait for strip
      
      // Regenerate photo layout with current frame and new filter using ORIGINAL layout
      await createPhotoLayout(storedCapturedImages.value, originalLayout.value, {
        ...canvasConfig,
        title: '',
        showTimestamp: true,
        frameStyle: currentFrameStyle.value,
        frameColor: getFrameColor(currentFrameStyle.value),
        filter: filterType
      })
      
      // Update the displayed image
      const newImageData = getCanvasDataURL()
      finalImage.value = newImageData
    }
  } catch (error) {
    console.error('Filter change failed:', error)
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
    case 'custom': return '#ff6b6b'
    default: return '#ffffff'
  }
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