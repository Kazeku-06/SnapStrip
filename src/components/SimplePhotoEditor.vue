<template>
  <div class="space-y-8">
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Canvas Area -->
      <div class="lg:col-span-2">
        <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
          <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">🖼️</span>
            Your Photo Strip
          </h3>
          <div 
            class="relative rounded-2xl overflow-hidden bg-gray-900 mx-auto shadow-2xl"
            :class="selectedFrame !== 'none' ? 'frame-' + selectedFrame : 'no-frame'"
            :style="props.layout === 'grid' ? 'width: 400px; height: 400px;' : 'width: 400px; height: 600px;'"
          >
            <!-- Base Image with Filter Wrapper -->
            <div class="w-full h-full relative">
              <img 
                v-if="imageDataURL && imageDataURL.startsWith('data:image/')"
                :src="imageDataURL" 
                alt="Photo to edit"
                class="w-full h-full object-cover"
                @load="onImageLoad"
                @error="onImageError"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Frame Selection Panel -->
      <div class="space-y-8">
        <!-- Frames -->
        <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
          <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">🖼️</span>
            Choose Frame
          </h3>
          <div class="space-y-3">
            <button
              v-for="frame in frames"
              :key="frame.id"
              @click="selectFrame(frame.id)"
              :class="['p-4 border-2 rounded-xl text-left transition-all duration-300 flex items-center gap-4 w-full', selectedFrame === frame.id ? 'border-slate-400 bg-slate-700/50 text-white shadow-lg' : 'border-slate-600/50 bg-slate-800/30 text-gray-300 hover:border-slate-500 hover:bg-slate-700/30']"
            >
              <div class="text-3xl">{{ frame.emoji }}</div>
              <div class="flex-1">
                <div class="font-semibold text-lg">{{ frame.name }}</div>
                <div class="text-sm opacity-75">{{ frame.description }}</div>
              </div>
              <div v-if="selectedFrame === frame.id" class="text-2xl">✓</div>
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4">
          <button
            @click="downloadImage"
            class="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span class="text-2xl">💾</span>
            Download Photo
          </button>
          
          <button
            @click="emit('retake')"
            class="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
          >
            <span class="text-xl">📸</span>
            Take Photos Again
          </button>
          
          <button
            @click="emit('back')"
            class="w-full py-3 border-2 border-slate-600/50 text-white rounded-2xl hover:bg-slate-700/30 transition-all duration-300 font-medium"
          >
            🔄 New Session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  imageDataURL: {
    type: String,
    required: true
  },
  capturedImages: {
    type: Array,
    default: () => []
  },
  layout: {
    type: String,
    default: 'vertical'
  }
})

const emit = defineEmits(['download', 'back', 'frameChanged', 'retake'])

// State
const imageLoaded = ref(false)
const selectedFrame = ref('none')

// Frame definitions - curated selection with emojis
const frames = [
  { id: 'none', name: 'No Frame', description: 'Original', emoji: '📷' },
  { id: 'cute', name: 'Cute Pink', description: '💕 Sweet & Fun', emoji: '💕' },
  { id: 'elegant', name: 'Elegant Gold', description: '✨ Luxury Style', emoji: '✨' },
  { id: 'party', name: 'Party Time', description: '🎉 Celebration', emoji: '🎉' },
  { id: 'vintage', name: 'Vintage Film', description: '📸 Retro Vibes', emoji: '📸' },
  { id: 'galaxy', name: 'Galaxy Dream', description: '🌌 Space Magic', emoji: '🌌' },
  { id: 'love', name: 'Love Story', description: '💖 Romance', emoji: '💖' },
  { id: 'music', name: 'Music Player', description: '🎵 Retro Vibes', emoji: '🎵' }
]

// Event handlers
const onImageLoad = () => {
  console.log('Image loaded successfully')
  imageLoaded.value = true
}

const onImageError = (error) => {
  console.error('Image load error:', error)
  imageLoaded.value = false
}

// Frame selection
const selectFrame = (frameType) => {
  selectedFrame.value = frameType
  // Emit frame change to regenerate layout with new frame colors
  emit('frameChanged', frameType)
}

// Download
const downloadImage = () => {
  // Emit download with frame information for final generation
  console.log('Download clicked with frame:', selectedFrame.value)
  emit('download', {
    imageDataURL: props.imageDataURL,
    frameStyle: selectedFrame.value
  })
}
</script>
<style scoped>
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* No Frame Style */
.no-frame {
  border: 2px solid #e5e7eb;
  background: #f9fafb;
}

/* Cute Pink Frame - Using your custom design */
.frame-cute {
  border: none !important;
  background: url('/frames/cute-frame.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 12px;
  position: relative;
}

/* Elegant Gold Frame - Using your custom design */
.frame-elegant {
  border: none !important;
  background: url('/frames/elegant-frame.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 15px;
  position: relative;
}

/* Party Time Frame - Using your custom design */
.frame-party {
  border: none !important;
  background: url('/frames/party-frame.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 10px;
  position: relative;
}

/* Vintage Film Frame - Using your custom design */
.frame-vintage {
  border: none !important;
  background: url('/frames/vintage-frame.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 15px;
  position: relative;
}

/* Galaxy Dream Frame - Using your custom design */
.frame-galaxy {
  border: none !important;
  background: url('/frames/galaxy-frame.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 12px;
  position: relative;
}

/* Love Story Frame - Using your custom design */
.frame-love {
  border: none !important;
  background: url('/frames/love-frame.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 12px;
  position: relative;
}

/* Music Player Frame - Using your custom design */
.frame-music {
  border: none !important;
  background: url('/frames/Frame-2.png') no-repeat center center;
  background-size: 100% 100%;
  padding: 0px;
  position: relative;
}

/* Simplified frame styles - all using your custom designs */
.frame-cute img,
.frame-elegant img,
.frame-party img,
.frame-vintage img,
.frame-galaxy img,
.frame-love img,
.frame-music img {
  border-radius: 8px;
}
</style>