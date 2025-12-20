<template>
  <div class="space-y-8">
    <!-- Filter and Frame Selection Row -->
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Filter Selection -->
      <div>
        <label class="block text-lg font-semibold text-white mb-4 flex items-center gap-2 drop-shadow-md">
          <span class="text-xl">🎨</span>
          Step 1: Choose Filter
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            :class="[
              'p-4 border-2 rounded-2xl text-center transition-all duration-300 backdrop-blur-sm',
              selectedFilter === filter.value
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 text-white shadow-lg shadow-yellow-400/30'
                : 'border-white/30 bg-white/10 text-white hover:border-yellow-300 hover:bg-white/20'
            ]"
          >
            <div class="text-2xl mb-2">{{ filter.emoji }}</div>
            <div class="text-sm font-medium drop-shadow-sm">{{ filter.name }}</div>
          </button>
        </div>
      </div>

      <!-- Frame Selection -->
      <div>
        <label class="block text-lg font-semibold text-white mb-4 flex items-center gap-2 drop-shadow-md">
          <span class="text-xl">🖼️</span>
          Step 2: Choose Frame
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="frame in frameOptions.slice(0, 4)"
            :key="frame.value"
            @click="selectedFrame = frame.value"
            :class="[
              'p-4 border-2 rounded-2xl text-center transition-all duration-300 backdrop-blur-sm',
              selectedFrame === frame.value
                ? 'border-pink-400 bg-gradient-to-br from-pink-400/30 to-purple-400/30 text-white shadow-lg shadow-pink-400/30'
                : 'border-white/30 bg-white/10 text-white hover:border-pink-300 hover:bg-white/20'
            ]"
          >
            <div class="text-2xl mb-2">{{ frame.emoji }}</div>
            <div class="text-sm font-medium drop-shadow-sm">{{ frame.name }}</div>
          </button>
        </div>
        <!-- Additional frames in second row -->
        <div class="grid grid-cols-2 gap-3 mt-3">
          <button
            v-for="frame in frameOptions.slice(4)"
            :key="frame.value"
            @click="selectedFrame = frame.value"
            :class="[
              'p-4 border-2 rounded-2xl text-center transition-all duration-300 backdrop-blur-sm',
              selectedFrame === frame.value
                ? 'border-pink-400 bg-gradient-to-br from-pink-400/30 to-purple-400/30 text-white shadow-lg shadow-pink-400/30'
                : 'border-white/30 bg-white/10 text-white hover:border-pink-300 hover:bg-white/20'
            ]"
          >
            <div class="text-2xl mb-2">{{ frame.emoji }}</div>
            <div class="text-sm font-medium drop-shadow-sm">{{ frame.name }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Layout Selection -->
    <div>
      <label class="block text-lg font-semibold text-white mb-4 flex items-center gap-2 drop-shadow-md">
        <span class="text-xl">🎭</span>
        Step 3: Choose Your Style
      </label>
      <div class="grid grid-cols-1 gap-4">
        <button
          v-for="layout in layoutOptions"
          :key="layout.value"
          @click="selectedLayout = layout.value"
          :class="[
            'p-6 border-2 rounded-2xl text-left transition-all duration-300 backdrop-blur-sm',
            selectedLayout === layout.value
              ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 text-white shadow-lg shadow-cyan-400/30'
              : 'border-white/30 bg-white/10 text-white hover:border-cyan-300 hover:bg-white/20'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xl font-bold drop-shadow-sm">{{ layout.label }}</div>
              <div class="text-sm opacity-90 mt-1">{{ layout.description }}</div>
              <div class="text-xs font-medium mt-2 px-3 py-1 bg-white/20 rounded-full inline-block">
                {{ layout.photoCount }}
              </div>
            </div>
            <div class="text-3xl">
              {{ selectedLayout === layout.value ? '✓' : layout.value === 'vertical' ? '📱' : '🎨' }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Optional Title -->
    <div>
      <label class="block text-lg font-semibold text-white mb-4 flex items-center gap-2 drop-shadow-md">
        <span class="text-xl">🏷️</span>
        Step 4: Event Title (Optional)
      </label>
      <input
        v-model="eventTitle"
        type="text"
        placeholder="e.g., Birthday Party 2024"
        class="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
        maxlength="30"
      />
    </div>

    <!-- Action Buttons -->
    <div class="space-y-4">
      <button
        @click="startPhotoshoot"
        :disabled="!canStart"
        :class="[
          'w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3',
          canStart
            ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg shadow-green-400/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:scale-105'
            : 'bg-white/10 text-white/50 cursor-not-allowed'
        ]"
      >
        <span class="text-2xl">{{ isCapturing ? '📸' : '🚀' }}</span>
        {{ isCapturing ? 'Taking Photos...' : 'Start Photoshoot' }}
      </button>

      <button
        v-if="hasResults"
        @click="$emit('new-session')"
        class="w-full py-3 px-6 border-2 border-white/30 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 font-medium backdrop-blur-sm"
      >
        🔄 Take New Photos
      </button>
    </div>

    <!-- Capture Progress -->
    <div v-if="isCapturing" class="space-y-4">
      <div class="flex justify-between text-white font-medium">
        <span class="flex items-center gap-2 drop-shadow-md">
          <span class="text-lg">📊</span>
          Progress
        </span>
        <span class="text-white/90">{{ currentShot }}/{{ shotCount }}</span>
      </div>
      <div class="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
        <div 
          class="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500 shadow-lg"
          :style="{ width: `${(currentShot / shotCount) * 100}%` }"
        ></div>
      </div>
      <p class="text-center text-white/90 text-sm drop-shadow-sm">
        {{ currentShot === 0 ? 'Get ready! 📸' : currentShot === shotCount ? 'Processing...' : 'Keep smiling! 😊' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  canStart: {
    type: Boolean,
    default: false
  },
  isCapturing: {
    type: Boolean,
    default: false
  },
  currentShot: {
    type: Number,
    default: 0
  },
  hasResults: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-photoshoot', 'new-session'])

const selectedLayout = ref('vertical')
const selectedFilter = ref('none')
const selectedFrame = ref('none')
const eventTitle = ref('')

const filterOptions = [
  { value: 'none', name: 'Original', emoji: '📷' },
  { value: 'vintage', name: 'Vintage', emoji: '📸' },
  { value: 'bw', name: 'B&W', emoji: '⚫' }
]

const frameOptions = [
  { value: 'none', name: 'No Frame', emoji: '📷' },
  { value: 'cute', name: 'Cute Pink', emoji: '💕' },
  { value: 'elegant', name: 'Gold', emoji: '✨' },
  { value: 'party', name: 'Party', emoji: '🎉' },
  { value: 'vintage', name: 'Vintage', emoji: '📸' },
  { value: 'galaxy', name: 'Galaxy', emoji: '🌌' },
  { value: 'love', name: 'Love', emoji: '💖' },
  { value: 'custom', name: 'Custom', emoji: '🎨' }
]

const layoutOptions = [
  {
    value: 'vertical',
    label: 'Photo Strip',
    description: 'Classic vertical layout',
    photoCount: '3 Photos'
  },
  {
    value: 'grid',
    label: 'Photo Grid',
    description: 'Square grid layout',
    photoCount: '4 Photos'
  }
]

// Automatic shot count based on layout
const shotCount = computed(() => {
  return selectedLayout.value === 'vertical' ? 3 : 4
})

const startPhotoshoot = () => {
  emit('start-photoshoot', {
    layout: selectedLayout.value,
    shotCount: shotCount.value,
    title: eventTitle.value.trim(),
    filter: selectedFilter.value,
    frame: selectedFrame.value
  })
}
</script>