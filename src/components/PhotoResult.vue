<template>
  <div class="space-y-8">
    <div class="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
      <h2 class="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3 drop-shadow-md">
        <span class="text-3xl">🎉</span>
        Your Photo Strip is Ready!
      </h2>

      <!-- Final Image Preview -->
      <div class="mb-8 flex justify-center">
        <div 
          class="rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          :style="layout === 'grid' ? 'width: 400px; height: 400px;' : 'width: 400px; height: 600px;'"
        >
          <img 
            :src="imageDataURL" 
            alt="Final photobooth result"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-4">
        <button
          @click="$emit('download')"
          :disabled="isDownloading"
          class="w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span class="text-2xl">{{ isDownloading ? '⏳' : '💾' }}</span>
          {{ isDownloading ? 'Downloading...' : 'Download Photo' }}
        </button>
        
        <button
          @click="$emit('retake')"
          class="w-full py-3 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white rounded-2xl transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg"
        >
          <span class="text-xl">📸</span>
          Take Photos Again
        </button>

        <button
          @click="$emit('new-session')"
          class="w-full py-3 border-2 border-white/30 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm"
        >
          🔄 New Session
        </button>
      </div>

      <!-- Info Text -->
      <p class="text-center text-sm text-white/80 mt-6 drop-shadow-sm">
        Your photo is ready to download. All settings were applied during capture.
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  imageDataURL: {
    type: String,
    required: true
  },
  layout: {
    type: String,
    default: 'vertical'
  },
  isDownloading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['download', 'new-session', 'retake'])
</script>