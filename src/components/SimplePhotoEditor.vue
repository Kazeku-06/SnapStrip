<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
      Customize Your Photo Strip
    </h2>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Canvas Area -->
      <div class="lg:col-span-2">
        <div class="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <!-- Base Image -->
          <img 
            v-if="imageDataURL && imageDataURL.startsWith('data:image/')"
            :src="imageDataURL" 
            alt="Photo to edit"
            class="max-w-full h-auto"
            :class="{ 'filter-vintage': currentFilter === 'vintage', 'filter-bw': currentFilter === 'bw' }"
            @load="onImageLoad"
            @error="onImageError"
          />
          
          <!-- Frame Overlay -->
          <div 
            v-if="selectedFrame && imageLoaded"
            class="absolute inset-0 pointer-events-none"
            :class="frameClasses[selectedFrame]"
          ></div>
          
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
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="selectFrame('none')"
              :class="['p-2 border rounded text-sm', selectedFrame === 'none' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50']"
            >
              No Frame
            </button>
            <button
              @click="selectFrame('vintage')"
              :class="['p-2 border rounded text-sm', selectedFrame === 'vintage' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50']"
            >
              Vintage
            </button>
            <button
              @click="selectFrame('modern')"
              :class="['p-2 border rounded text-sm', selectedFrame === 'modern' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50']"
            >
              Modern
            </button>
            <button
              @click="selectFrame('polaroid')"
              :class="['p-2 border rounded text-sm', selectedFrame === 'polaroid' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50']"
            >
              Polaroid
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
            @click="$emit('back')"
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
  }
})

const emit = defineEmits(['download', 'back'])

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

// Frame classes
const frameClasses = {
  vintage: 'border-8 border-yellow-800 shadow-2xl',
  modern: 'border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-xl',
  polaroid: 'border-white border-8 shadow-2xl bg-white'
}

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
const startDrag = (element, event) => {
  event.preventDefault()
  selectedElement.value = element
  isDragging.value = true
  
  const rect = event.currentTarget.parentElement.getBoundingClientRect()
  dragOffset.x = event.clientX - rect.left - element.x
  dragOffset.y = event.clientY - rect.top - element.y
  
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', endDrag)
}

const drag = (event) => {
  if (!isDragging.value || !selectedElement.value) return
  
  const rect = event.currentTarget?.parentElement?.getBoundingClientRect()
  if (rect) {
    selectedElement.value.x = event.clientX - rect.left - dragOffset.x
    selectedElement.value.y = event.clientY - rect.top - dragOffset.y
  }
}

const endDrag = () => {
  isDragging.value = false
  selectedElement.value = null
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', endDrag)
}

// Filters and frames
const applyFilter = (filterType) => {
  currentFilter.value = filterType
}

const selectFrame = (frameType) => {
  selectedFrame.value = frameType
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
  // For now, just emit the original image
  // In a full implementation, we'd render everything to canvas first
  console.log('Download clicked with filter:', currentFilter.value, 'frame:', selectedFrame.value)
  emit('download', props.imageDataURL)
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

/* Frame styles */
.border-gradient-to-r {
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  padding: 4px;
}
</style>