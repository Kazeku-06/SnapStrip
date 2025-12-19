<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Smart Photobooth</h1>
        <p class="text-gray-600">Create instant photo strips with your camera</p>
      </header>

      <!-- Main Content -->
      <div v-if="!finalImage" class="grid lg:grid-cols-2 gap-8 items-start">
        <!-- Camera Section -->
        <div class="space-y-4">
          <CameraPreview
            :stream="stream"
            :is-initialized="isInitialized"
            :is-loading="isLoading"
            :error="error"
            @retry="initializeCamera"
          />
          
          <!-- Capture Status -->
          <div v-if="isCapturing" class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span class="font-medium">Taking photo {{ currentShot }} of {{ totalShots }}</span>
            </div>
          </div>
        </div>

        <!-- Controls Section -->
        <div>
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
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Preparing editor...</p>
          </div>
        </div>
        
        <SimplePhotoEditor
          v-if="finalImage"
          :imageDataURL="finalImage"
          @download="handleEditorDownload"
          @back="resetSession"
        />
      </div>

      <!-- Processing Overlay -->
      <div v-if="isProcessing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div class="bg-white rounded-lg p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-700 font-medium">Creating your photo strip...</p>
        </div>
      </div>

      <!-- Countdown Overlay -->
      <CountdownOverlay
        :count="count"
        :is-active="isActive"
        :total-count="3"
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



// Methods
const handleStartPhotoshoot = async (settings) => {
  try {
    totalShots.value = settings.shotCount
    
    // Start countdown
    await startCountdown(3)
    
    // Capture burst photos
    const images = await startBurstCapture(captureFrame, settings.shotCount, 1200)
    
    // Store captured images for later use
    storedCapturedImages.value = [...images]
    
    // Create photo layout
    await createPhotoLayout(images, settings.layout, {
      canvasWidth: 600,
      canvasHeight: 800,
      title: settings.title,
      showTimestamp: true
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

    // New format with frame styling - regenerate the layout
    const { frameStyle, filter, overlayElements } = editData
    
    // Get the original captured images (we need to store these)
    if (storedCapturedImages.value && storedCapturedImages.value.length > 0) {
      // Recreate photo layout with frame styling
      await createPhotoLayout(storedCapturedImages.value, 'vertical', {
        canvasWidth: 600,
        canvasHeight: 800,
        title: '',
        showTimestamp: true,
        frameStyle: frameStyle,
        frameColor: getFrameColor(frameStyle)
      })
      
      // Get the new styled image
      const styledImageData = getCanvasDataURL()
      
      // Download the styled image
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `photobooth-styled-${timestamp}.png`
      downloadDataURL(styledImageData, filename)
    } else {
      // Fallback to original image
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `photobooth-edited-${timestamp}.png`
      downloadDataURL(editData.imageDataURL, filename)
    }
  } catch (error) {
    console.error('Download failed:', error)
    // Fallback download
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `photobooth-fallback-${timestamp}.png`
    downloadDataURL(typeof editData === 'string' ? editData : editData.imageDataURL, filename)
  }
}

const getFrameColor = (frameStyle) => {
  switch (frameStyle) {
    case 'classic': return '#333333'
    case 'vintage': return '#8B4513'
    case 'modern': return '#667eea'
    case 'polaroid': return '#ffffff'
    case 'neon': return '#001122'
    case 'gold': return '#FFD700'
    case 'film': return '#1a1a1a'
    default: return '#ffffff'
  }
}

const resetSession = () => {
  finalImage.value = null
  storedCapturedImages.value = []
  clearCaptures()
}

// Initialize camera on mount
onMounted(() => {
  initializeCamera()
})
</script>