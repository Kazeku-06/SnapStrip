<template>
  <div 
    v-if="isActive" 
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
  >
    <div class="text-center">
      <!-- Countdown Number -->
      <div class="text-8xl font-bold text-white mb-4 animate-pulse">
        {{ count }}
      </div>
      
      <!-- Progress Ring -->
      <div class="relative w-32 h-32 mx-auto">
        <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <!-- Background circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="8"
            fill="none"
          />
          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="white"
            stroke-width="8"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-1000 ease-linear"
          />
        </svg>
      </div>
      
      <!-- Status Text -->
      <p class="text-white text-xl mt-4">
        Get ready...
      </p>
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
  }
})

const circumference = 2 * Math.PI * 45 // radius = 45

const strokeDashoffset = computed(() => {
  const progress = (props.totalCount - props.count) / props.totalCount
  return circumference * (1 - progress)
})
</script>