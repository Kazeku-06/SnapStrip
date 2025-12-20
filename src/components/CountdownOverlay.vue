<template>
  <div 
    v-if="isActive" 
    class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div class="text-center">
      <!-- Photo Number Indicator -->
      <div class="mb-6">
        <div class="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
          <span class="text-2xl">📸</span>
          <span class="text-white font-semibold text-lg">
            Photo {{ currentPhoto }} of {{ totalPhotos }}
          </span>
        </div>
      </div>
      
      <!-- Countdown Number -->
      <div class="text-9xl font-bold text-white mb-6 animate-pulse drop-shadow-2xl">
        {{ count }}
      </div>
      
      <!-- Progress Ring -->
      <div class="relative w-36 h-36 mx-auto mb-6">
        <svg class="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
          <!-- Background circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="6"
            fill="none"
          />
          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            stroke-width="6"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-1000 ease-linear drop-shadow-lg"
          />
          <!-- Gradient definition -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
        
        <!-- Center emoji -->
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-4xl">{{ count === 0 ? '📸' : '⏰' }}</span>
        </div>
      </div>
      
      <!-- Status Text -->
      <p class="text-white text-xl font-medium">
        {{ count === 0 ? 'Say Cheese! 📸' : 'Get ready...' }}
      </p>
      
      <!-- Photo Progress Dots -->
      <div class="flex justify-center gap-2 mt-4">
        <div 
          v-for="i in totalPhotos" 
          :key="i"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300',
            i < currentPhoto ? 'bg-green-400' : i === currentPhoto ? 'bg-pink-400 animate-pulse' : 'bg-white/30'
          ]"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 3
  },
  currentPhoto: {
    type: Number,
    default: 1
  },
  totalPhotos: {
    type: Number,
    default: 1
  }
})

const circumference = 2 * Math.PI * 45 // radius = 45

const strokeDashoffset = computed(() => {
  const progress = (props.totalCount - props.count) / props.totalCount
  return circumference * (1 - progress)
})
</script>