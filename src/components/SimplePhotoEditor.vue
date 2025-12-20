<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
      Customize Your Photo Strip
    </h2>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Canvas Area -->
      <div class="lg:col-span-2">
        <div 
          class="relative rounded-lg overflow-hidden bg-gray-900 mx-auto"
          :class="selectedFrame !== 'none' ? 'frame-' + selectedFrame : 'no-frame'"
          style="width: 400px; height: 600px;"
        >
          <!-- Base Image with Filter Wrapper -->
          <div class="w-full h-full relative">
            <img 
              v-if="imageDataURL && imageDataURL.startsWith('data:image/')"
              :src="imageDataURL" 
              alt="Photo to edit"
              class="w-full h-full object-cover"
              :class="{ 'filter-vintage': currentFilter === 'vintage', 'filter-bw': currentFilter === 'bw' }"
              @load="onImageLoad"
              @error="onImageError"
            />
          </div>
          
          <!-- Draggable Elements -->
          <div
            v-for="element in overlayElements"
            :key="element.id"
            :style="{
              position: 'absolute',
              left: element.x + 'px',
              top: element.y + 'px',
              transform: `scale(${element.scale}) rotate(${element.rotation}deg)`,
              zIndex: element.zIndex,
              cursor: 'move'
            }"
            @mousedown="startDrag(element, $event)"
            class="select-none"
          >
            <!-- Text Element -->
            <div
              v-if="element.type === 'text'"
              :style="{
                fontSize: element.fontSize + 'px',
                color: element.color,
                fontFamily: element.fontFamily,
                textShadow: element.shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
              }"
              class="whitespace-nowrap font-bold"
            >
              {{ element.content }}
            </div>
            
            <!-- Sticker Element -->
            <div
              v-else-if="element.type === 'sticker'"
              :style="{ fontSize: element.size + 'px' }"
            >
              {{ element.content }}
            </div>
            
            <!-- Shape Element -->
            <div
              v-else-if="element.type === 'shape'"
              :style="{
                width: element.width + 'px',
                height: element.height + 'px',
                backgroundColor: element.color,
                borderRadius: element.shape === 'circle' ? '50%' : '0'
              }"
            ></div>
          </div>
        </div>
        
        <!-- Canvas Controls -->
        <div class="mt-4 flex justify-between items-center">
          <div class="flex gap-2">
            <button
              @click="clearOverlays"
              class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Clear All
            </button>
            <button
              @click="undoLast"
              class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Undo
            </button>
          </div>
          
          <div class="flex gap-2">
            <button
              @click="applyFilter('none')"
              :class="['px-3 py-1 text-sm rounded', currentFilter === 'none' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              Original
            </button>
            <button
              @click="applyFilter('vintage')"
              :class="['px-3 py-1 text-sm rounded', currentFilter === 'vintage' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              Vintage
            </button>
            <button
              @click="applyFilter('bw')"
              :class="['px-3 py-1 text-sm rounded', currentFilter === 'bw' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              B&W
            </button>
          </div>
        </div>
      </div>

      <!-- Tools Panel -->
      <div class="space-y-6">
        <!-- Frames -->
        <div>
          <h3 class="font-medium text-gray-800 mb-3">Photo Frames</h3>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="frame in frames"
              :key="frame.id"
              @click="selectFrame(frame.id)"
              :class="['p-3 border rounded-lg text-sm text-left transition-all flex items-center gap-3', selectedFrame === frame.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400']"
            >
              <div class="text-2xl">{{ frame.emoji }}</div>
              <div class="flex-1">
                <div class="font-medium">{{ frame.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ frame.description }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Stickers -->
        <div>
          <h3 class="font-medium text-gray-800 mb-3">Stickers</h3>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="sticker in stickers"
              :key="sticker"
              @click="addSticker(sticker)"
              class="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
            >
              {{ sticker }}
            </button>
          </div>
        </div>

        <!-- Text -->
        <div>
          <h3 class="font-medium text-gray-800 mb-3">Add Text</h3>
          <div class="space-y-2">
            <input
              v-model="newText"
              type="text"
              placeholder="Enter text..."
              class="w-full p-2 border border-gray-300 rounded text-sm"
              @keyup.enter="addText"
            />
            <div class="flex gap-2">
              <select v-model="textColor" class="flex-1 p-1 border border-gray-300 rounded text-sm">
                <option value="#000000">Black</option>
                <option value="#ffffff">White</option>
                <option value="#ff0000">Red</option>
                <option value="#00ff00">Green</option>
                <option value="#0000ff">Blue</option>
                <option value="#ffff00">Yellow</option>
                <option value="#ff00ff">Pink</option>
              </select>
              <select v-model="fontSize" class="flex-1 p-1 border border-gray-300 rounded text-sm">
                <option value="16">Small</option>
                <option value="24">Medium</option>
                <option value="32">Large</option>
                <option value="48">XL</option>
              </select>
            </div>
            <button
              @click="addText"
              class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Add Text
            </button>
          </div>
        </div>

        <!-- Shapes -->
        <div>
          <h3 class="font-medium text-gray-800 mb-3">Shapes</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="addShape('rectangle')"
              class="p-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Rectangle
            </button>
            <button
              @click="addShape('circle')"
              class="p-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Circle
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 pt-4 border-t">
          <button
            @click="downloadImage"
            class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
          >
            Download Photo
          </button>
          
          <button
            @click="emit('back')"
            class="w-full py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Take New Photos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  imageDataURL: {
    type: String,
    required: true
  },
  capturedImages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['download', 'back', 'frameChanged', 'filterChanged'])

// State
const imageLoaded = ref(false)
const overlayElements = ref([])
const selectedElement = ref(null)
const isDragging = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
const currentFilter = ref('none')
const selectedFrame = ref('none')

// Tool state
const newText = ref('')
const textColor = ref('#000000')
const fontSize = ref(24)

// Assets
const stickers = ['😀', '😍', '🎉', '❤️', '⭐', '🌟', '🎈', '🎊', '🔥', '💯', '👍', '✨', '🌈', '🦄', '🎭', '🎪', '🎨', '📸']

// Frame definitions - curated selection with emojis
const frames = [
  { id: 'none', name: 'No Frame', description: 'Original', emoji: '' },
  { id: 'cute', name: 'Cute Pink', description: '💕 Sweet & Fun', emoji: '💕' },
  { id: 'elegant', name: 'Elegant Gold', description: '✨ Luxury Style', emoji: '✨' },
  { id: 'party', name: 'Party Time', description: '🎉 Celebration', emoji: '🎉' },
  { id: 'vintage', name: 'Vintage Film', description: '📸 Retro Vibes', emoji: '📸' },
  { id: 'galaxy', name: 'Galaxy Dream', description: '🌌 Space Magic', emoji: '🌌' },
  { id: 'love', name: 'Love Story', description: '💖 Romance', emoji: '💖' },
  { id: 'custom', name: 'Custom Design', description: '🎨 Your Design', emoji: '🎨' }
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

// Element management
const addSticker = (sticker) => {
  const element = {
    id: Date.now(),
    type: 'sticker',
    content: sticker,
    x: 50,
    y: 50,
    size: 32,
    scale: 1,
    rotation: 0,
    zIndex: overlayElements.value.length + 1
  }
  overlayElements.value.push(element)
}

const addText = () => {
  if (!newText.value.trim()) return
  
  const element = {
    id: Date.now(),
    type: 'text',
    content: newText.value,
    x: 50,
    y: 100,
    fontSize: parseInt(fontSize.value),
    color: textColor.value,
    fontFamily: 'Arial, sans-serif',
    shadow: true,
    scale: 1,
    rotation: 0,
    zIndex: overlayElements.value.length + 1
  }
  overlayElements.value.push(element)
  newText.value = ''
}

const addShape = (shape) => {
  const element = {
    id: Date.now(),
    type: 'shape',
    shape: shape,
    x: 100,
    y: 100,
    width: 60,
    height: 60,
    color: '#ff6b6b',
    scale: 1,
    rotation: 0,
    zIndex: overlayElements.value.length + 1
  }
  overlayElements.value.push(element)
}

// Drag and drop
let containerRect = null

const startDrag = (element, event) => {
  event.preventDefault()
  selectedElement.value = element
  isDragging.value = true
  
  // Get container bounds
  const container = event.currentTarget.closest('.relative')
  containerRect = container.getBoundingClientRect()
  
  dragOffset.x = event.clientX - containerRect.left - element.x
  dragOffset.y = event.clientY - containerRect.top - element.y
  
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', endDrag)
}

const drag = (event) => {
  if (!isDragging.value || !selectedElement.value || !containerRect) return
  
  const newX = event.clientX - containerRect.left - dragOffset.x
  const newY = event.clientY - containerRect.top - dragOffset.y
  
  // Keep element within bounds
  selectedElement.value.x = Math.max(0, Math.min(newX, containerRect.width - 50))
  selectedElement.value.y = Math.max(0, Math.min(newY, containerRect.height - 50))
}

const endDrag = () => {
  isDragging.value = false
  selectedElement.value = null
  containerRect = null
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', endDrag)
}

// Filters and frames
const applyFilter = (filterType) => {
  currentFilter.value = filterType
  // Emit filter change to regenerate layout with new filter
  emit('filterChanged', filterType)
}

const selectFrame = (frameType) => {
  selectedFrame.value = frameType
  // Emit frame change to regenerate layout with new frame colors
  emit('frameChanged', frameType)
}

// Utility functions
const clearOverlays = () => {
  overlayElements.value = []
  selectedElement.value = null
}

const undoLast = () => {
  if (overlayElements.value.length > 0) {
    overlayElements.value.pop()
  }
}

// Download
const downloadImage = () => {
  // Emit download with frame and filter information for final generation
  console.log('Download clicked with filter:', currentFilter.value, 'frame:', selectedFrame.value)
  emit('download', {
    imageDataURL: props.imageDataURL,
    frameStyle: selectedFrame.value,
    filter: currentFilter.value,
    overlayElements: overlayElements.value
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

.filter-vintage {
  filter: sepia(0.8) contrast(1.2) brightness(1.1) saturate(1.3);
}

.filter-bw {
  filter: grayscale(1) contrast(1.1);
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

/* Simplified frame styles - all using your custom designs */
.frame-cute img,
.frame-elegant img,
.frame-party img,
.frame-vintage img,
.frame-galaxy img,
.frame-love img {
  border-radius: 8px;
}
</style>