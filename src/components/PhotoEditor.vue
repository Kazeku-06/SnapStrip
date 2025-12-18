<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
      Customize Your Photo Strip
    </h2>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Canvas Area -->
      <div class="lg:col-span-2">
        <div class="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <canvas
            ref="editorCanvas"
            @mousedown="startDrag"
            @mousemove="drag"
            @mouseup="endDrag"
            @mouseleave="endDrag"
            class="cursor-crosshair max-w-full h-auto"
          ></canvas>
          
          <!-- Overlay elements -->
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
            @mousedown="selectElement(element, $event)"
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
              class="whitespace-nowrap"
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
            <button
              @click="applyFilter('none')"
              :class="['px-3 py-1 text-sm rounded', currentFilter === 'none' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
            >
              Original
            </button>
          </div>
        </div>
      </div>

      <!-- Tools Panel -->
      <div class="space-y-6">
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

        <!-- Frames -->
        <div>
          <h3 class="font-medium text-gray-800 mb-3">Frames</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="applyFrame('vintage')"
              class="p-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Vintage
            </button>
            <button
              @click="applyFrame('modern')"
              class="p-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
            >
              Modern
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 pt-4 border-t">
          <button
            @click="saveAndDownload"
            :disabled="isProcessing"
            class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors disabled:bg-gray-400"
          >
            {{ isProcessing ? 'Processing...' : 'Download Photo' }}
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
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  imageDataURL: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['download', 'back'])

// Canvas and editing state
const editorCanvas = ref(null)
const overlayElements = ref([])
const selectedElement = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const currentFilter = ref('none')
const isProcessing = ref(false)

// Tool state
const newText = ref('')
const textColor = ref('#000000')
const fontSize = ref(24)

// Assets
const stickers = ['😀', '😍', '🎉', '❤️', '⭐', '🌟', '🎈', '🎊', '🔥', '💯', '👍', '✨', '🌈', '🦄', '🎭', '🎪', '🎨', '📸']

let originalImageData = null
let canvasContext = null

// Initialize canvas
onMounted(async () => {
  await nextTick()
  if (editorCanvas.value) {
    setupCanvas()
  }
})

const setupCanvas = () => {
  const canvas = editorCanvas.value
  canvasContext = canvas.getContext('2d')
  
  // Load original image
  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    canvasContext.drawImage(img, 0, 0)
    
    // Store original image data
    originalImageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height)
  }
  img.src = props.imageDataURL
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

// Drag and drop functionality
const selectElement = (element, event) => {
  event.preventDefault()
  selectedElement.value = element
  isDragging.value = true
  
  const rect = editorCanvas.value.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left - element.x,
    y: event.clientY - rect.top - element.y
  }
}

const startDrag = (event) => {
  // Handle canvas click (deselect elements)
  if (!selectedElement.value) {
    selectedElement.value = null
  }
}

const drag = (event) => {
  if (!isDragging.value || !selectedElement.value) return
  
  const rect = editorCanvas.value.getBoundingClientRect()
  selectedElement.value.x = event.clientX - rect.left - dragOffset.value.x
  selectedElement.value.y = event.clientY - rect.top - dragOffset.value.y
}

const endDrag = () => {
  isDragging.value = false
}

// Filters
const applyFilter = (filterType) => {
  if (!originalImageData || !canvasContext) return
  
  currentFilter.value = filterType
  
  // Restore original image
  canvasContext.putImageData(originalImageData, 0, 0)
  
  if (filterType === 'vintage') {
    applyVintageFilter()
  } else if (filterType === 'bw') {
    applyBlackWhiteFilter()
  }
}

const applyVintageFilter = () => {
  const imageData = canvasContext.getImageData(0, 0, editorCanvas.value.width, editorCanvas.value.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // Sepia effect
    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))
  }
  
  canvasContext.putImageData(imageData, 0, 0)
}

const applyBlackWhiteFilter = () => {
  const imageData = canvasContext.getImageData(0, 0, editorCanvas.value.width, editorCanvas.value.height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
  
  canvasContext.putImageData(imageData, 0, 0)
}

// Frame effects
const applyFrame = (frameType) => {
  const canvas = editorCanvas.value
  const ctx = canvasContext
  
  if (frameType === 'vintage') {
    // Vintage border
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 20
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
  } else if (frameType === 'modern') {
    // Modern gradient border
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = 15
    ctx.strokeRect(7.5, 7.5, canvas.width - 15, canvas.height - 15)
  }
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

// Save and export
const saveAndDownload = async () => {
  isProcessing.value = true
  
  try {
    // Create final canvas with overlays
    const finalCanvas = document.createElement('canvas')
    const finalCtx = finalCanvas.getContext('2d')
    
    finalCanvas.width = editorCanvas.value.width
    finalCanvas.height = editorCanvas.value.height
    
    // Draw base image
    finalCtx.drawImage(editorCanvas.value, 0, 0)
    
    // Draw overlay elements
    for (const element of overlayElements.value) {
      finalCtx.save()
      finalCtx.translate(element.x, element.y)
      finalCtx.scale(element.scale, element.scale)
      finalCtx.rotate((element.rotation * Math.PI) / 180)
      
      if (element.type === 'text') {
        finalCtx.font = `${element.fontSize}px ${element.fontFamily}`
        finalCtx.fillStyle = element.color
        if (element.shadow) {
          finalCtx.shadowColor = 'rgba(0,0,0,0.5)'
          finalCtx.shadowBlur = 4
          finalCtx.shadowOffsetX = 2
          finalCtx.shadowOffsetY = 2
        }
        finalCtx.fillText(element.content, 0, 0)
      } else if (element.type === 'sticker') {
        finalCtx.font = `${element.size}px Arial`
        finalCtx.fillText(element.content, 0, 0)
      } else if (element.type === 'shape') {
        finalCtx.fillStyle = element.color
        if (element.shape === 'circle') {
          finalCtx.beginPath()
          finalCtx.arc(element.width/2, element.height/2, element.width/2, 0, 2 * Math.PI)
          finalCtx.fill()
        } else {
          finalCtx.fillRect(0, 0, element.width, element.height)
        }
      }
      
      finalCtx.restore()
    }
    
    // Export final image
    const finalDataURL = finalCanvas.toDataURL('image/png', 0.9)
    emit('download', finalDataURL)
    
  } catch (error) {
    console.error('Error saving photo:', error)
    alert('Failed to save photo. Please try again.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>