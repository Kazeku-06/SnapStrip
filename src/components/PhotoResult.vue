<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
      Your Photobooth Strip
    </h2>

    <!-- Final Image Preview -->
    <div class="mb-6 flex justify-center">
      <div class="border-4 border-gray-200 rounded-lg overflow-hidden shadow-xl">
        <img 
          :src="imageDataURL" 
          alt="Final photobooth result"
          class="max-w-full h-auto"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        @click="$emit('download')"
        :disabled="isDownloading"
        class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg v-if="!isDownloading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        <span>{{ isDownloading ? 'Downloading...' : 'Download Image' }}</span>
      </button>

      <button
        @click="$emit('new-session')"
        class="px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
      >
        Take New Photos
      </button>
    </div>

    <!-- Info Text -->
    <p class="text-center text-sm text-gray-500 mt-4">
      Your image is ready to download. No data is stored on our servers.
    </p>
  </div>
</template>

<script setup>
defineProps({
  imageDataURL: {
    type: String,
    required: true
  },
  isDownloading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['download', 'new-session'])
</script>