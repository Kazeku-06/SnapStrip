<template>
  <div class="space-y-8">
    <div class="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30">
      <h2 class="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
        <span class="text-3xl">🎉</span>
        Your Photo Strip is Ready!
      </h2>

      <!-- Final Image Preview -->
      <div class="mb-8 flex justify-center">
        <div 
          class="rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
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
          class="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span class="text-2xl">{{ isDownloading ? '⏳' : '💾' }}</span>
          {{ isDownloading ? 'Downloading...' : 'Download Photo' }}
        </button>
        
        <button
          @click="$emit('retake')"
          class="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
        >
          <span class="text-xl">📸</span>
          Take Photos Again
        </button>

        <button
          @click="$emit('new-session')"
          class="w-full py-3 border-2 border-slate-600/50 text-white rounded-2xl hover:bg-slate-700/30 transition-all duration-300 font-medium"
        >
          🔄 New Session
        </button>
      </div>

      <!-- Info Text -->
      <p class="text-center text-sm text-gray-400 mt-6">
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