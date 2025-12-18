<template>
  <div class="relative w-full max-w-2xl mx-auto">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p class="text-gray-600">Initializing camera...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
      <div class="text-center p-4">
        <div class="text-red-500 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-red-700 font-medium mb-2">Camera Error</p>
        <p class="text-red-600 text-sm">{{ error }}</p>
        <button 
          @click="$emit('retry')"
          class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Camera Preview -->
    <div v-else-if="isInitialized" class="relative">
      <video
        ref="videoElement"
        autoplay
        muted
        playsinline
        class="w-full h-auto rounded-lg shadow-lg bg-black"
      ></video>
      
      <!-- Mirror effect for front camera -->
      <style scoped>
        video {
          transform: scaleX(-1);
        }
      </style>
    </div>

    <!-- Placeholder -->
    <div v-else class="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-center">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <p class="text-gray-500">Camera not initialized</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  videoElement: Object,
  isInitialized: Boolean,
  isLoading: Boolean,
  error: String
})

defineEmits(['retry'])
</script>