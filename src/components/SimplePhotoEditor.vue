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
          <!-- Base Image -->
          <img 
            v-if="imageDataURL && imageDataURL.startsWith('data:image/')"
            :src="imageDataURL" 
            alt="Photo to edit"
            class="w-full h-full object-cover"
            :class="{ 'filter-vintage': currentFilter === 'vintage', 'filter-bw': currentFilter === 'bw' }"
            @load="onImageLoad"
            @error="onImageError"
          />
          
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

const emit = defineEmits(['download', 'back', 'frameChanged'])

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
  { id: 'love', name: 'Love Story', description: '💖 Romance', emoji: '💖' }
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
  // Emit download with frame and filter information
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

/* Cute Pink Frame */
.frame-cute {
  border: none !important;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  box-shadow: 0 0 30px rgba(255, 182, 193, 0.6);
  padding: 12px;
  position: relative;
}

.frame-cute img {
  border-radius: 12px;
}

.frame-cute::before {
  content: '💕 💖 💕 💖 💕 💖 💕 💖 💕 💖 💕 💖';
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  line-height: 1;
  z-index: 10;
}

.frame-cute::after {
  content: '💕 💖 💕 💖 💕 💖 💕 💖 💕 💖 💕 💖';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  line-height: 1;
  z-index: 10;
}

/* Elegant Gold Frame */
.frame-elegant {
  border: none !important;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3);
  padding: 15px;
  position: relative;
  animation: elegantShimmer 4s ease-in-out infinite;
}

.frame-elegant img {
  border-radius: 8px;
}

.frame-elegant::before {
  content: '✨ 👑 ✨ 💎 ✨ 👑 ✨ 💎 ✨ 👑 ✨';
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 16px;
  line-height: 1;
  z-index: 10;
}

.frame-elegant::after {
  content: '✨ 👑 ✨ 💎 ✨ 👑 ✨ 💎 ✨ 👑 ✨';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 16px;
  line-height: 1;
  z-index: 10;
}

/* Party Time Frame */
.frame-party {
  border: none !important;
  background: linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #ffeaa7 100%);
  box-shadow: 0 0 35px rgba(255, 107, 107, 0.6);
  padding: 10px;
  position: relative;
  animation: partyPulse 2s ease-in-out infinite;
}

.frame-party img {
  border-radius: 10px;
}

.frame-party::before {
  content: '🎉 🎊 🎈 🎁 🎉 🎊 🎈 🎁 🎉 🎊';
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 15px;
  line-height: 1;
  z-index: 10;
}

.frame-party::after {
  content: '🎉 🎊 🎈 🎁 🎉 🎊 🎈 🎁 🎉 🎊';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 15px;
  line-height: 1;
  z-index: 10;
}

/* Vintage Film Frame */
.frame-vintage {
  border: none !important;
  background: linear-gradient(90deg, #654321 0%, #8B4513 50%, #654321 100%);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4), 0 8px 25px rgba(0, 0, 0, 0.5);
  padding: 15px;
  position: relative;
}

.frame-vintage img {
  border-radius: 6px;
  filter: sepia(0.3);
}

.frame-vintage::before {
  content: '📸 🎞️ 📷 🎬 📸 🎞️ 📷 🎬 📸';
  position: absolute;
  top: 3px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 16px;
  line-height: 1;
  z-index: 10;
}

.frame-vintage::after {
  content: '📸 🎞️ 📷 🎬 📸 🎞️ 📷 🎬 📸';
  position: absolute;
  bottom: 3px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 16px;
  line-height: 1;
  z-index: 10;
}

/* Galaxy Dream Frame */
.frame-galaxy {
  border: none !important;
  background: linear-gradient(135deg, #000428 0%, #004e92 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%);
  box-shadow: 0 0 50px rgba(0, 100, 255, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.1);
  padding: 12px;
  position: relative;
  animation: galaxyGlow 4s ease-in-out infinite;
}

.frame-galaxy img {
  border-radius: 8px;
}

.frame-galaxy::before {
  content: '🌌 ⭐ 🌟 🚀 🌌 ⭐ 🌟 🚀 🌌';
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 15px;
  line-height: 1;
  z-index: 10;
}

.frame-galaxy::after {
  content: '🌌 ⭐ 🌟 🚀 🌌 ⭐ 🌟 🚀 🌌';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 15px;
  line-height: 1;
  z-index: 10;
}

/* Love Story Frame */
.frame-love {
  border: none !important;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%);
  box-shadow: 0 0 35px rgba(255, 154, 158, 0.7);
  padding: 12px;
  position: relative;
  animation: loveGlow 3s ease-in-out infinite;
}

.frame-love img {
  border-radius: 12px;
}

.frame-love::before {
  content: '💖 💕 💗 💓 💖 💕 💗 💓 💖 💕';
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  line-height: 1;
  z-index: 10;
}

.frame-love::after {
  content: '💖 💕 💗 💓 💖 💕 💗 💓 💖 💕';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  line-height: 1;
  z-index: 10;
}

/* Animation for frame selection */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

/* Elegant shimmer animation */
@keyframes elegantShimmer {
  0%, 100% { 
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% { 
    box-shadow: 0 0 60px rgba(255, 165, 0, 0.9), inset 0 0 30px rgba(255, 255, 255, 0.4);
  }
}

/* Party pulse animation */
@keyframes partyPulse {
  0%, 100% { 
    box-shadow: 0 0 35px rgba(255, 107, 107, 0.6);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(76, 205, 196, 0.8);
    transform: scale(1.02);
  }
}

/* Galaxy glow animation */
@keyframes galaxyGlow {
  0%, 100% { 
    box-shadow: 0 0 50px rgba(0, 100, 255, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.1);
  }
  33% { 
    box-shadow: 0 0 60px rgba(138, 43, 226, 0.9), inset 0 0 40px rgba(255, 255, 255, 0.2);
  }
  66% { 
    box-shadow: 0 0 55px rgba(255, 20, 147, 0.7), inset 0 0 35px rgba(255, 255, 255, 0.15);
  }
}

/* Love glow animation */
@keyframes loveGlow {
  0%, 100% { 
    box-shadow: 0 0 35px rgba(255, 154, 158, 0.7);
  }
  50% { 
    box-shadow: 0 0 50px rgba(250, 208, 196, 0.9);
  }
}
</style>