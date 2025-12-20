<template>
  <div class="space-y-8">
    <!-- Layout Selection -->
    <div>
      <label class="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span class="text-xl">🎭</span>
        Choose Your Style
      </label>
      <div class="grid grid-cols-1 gap-4">
        <button
          v-for="layout in layoutOptions"
          :key="layout.value"
          @click="selectedLayout = layout.value"
          :class="[
            'p-6 border-2 rounded-2xl text-left transition-all duration-300 backdrop-blur-sm',
            selectedLayout === layout.value
              ? 'border-slate-400 bg-slate-700/50 text-white shadow-lg shadow-slate-500/20'
              : 'border-slate-600/50 bg-slate-800/30 text-gray-300 hover:border-slate-500 hover:bg-slate-700/30'
          ]"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xl font-bold">{{ layout.label }}</div>
              <div class="text-sm opacity-75 mt-1">{{ layout.description }}</div>
              <div class="text-xs font-medium mt-2 px-3 py-1 bg-slate-600/50 rounded-full inline-block">
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
      <label class="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span class="text-xl">🏷️</span>
        Event Title (Optional)
      </label>
      <input
        v-model="eventTitle"
        type="text"
        placeholder="e.g., Birthday Party 2024"
        class="w-full p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all"
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
            ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-slate-700/30 hover:shadow-xl hover:shadow-slate-600/40 transform hover:scale-105'
            : 'bg-slate-800/50 text-gray-500 cursor-not-allowed'
        ]"
      >
        <span class="text-2xl">{{ isCapturing ? '📸' : '🚀' }}</span>
        {{ isCapturing ? 'Taking Photos...' : 'Start Photoshoot' }}
      </button>

      <button
        v-if="hasResults"
        @click="$emit('new-session')"
        class="w-full py-3 px-6 border-2 border-slate-600/50 rounded-2xl text-white hover:bg-slate-700/30 transition-all duration-300 font-medium"
      >
        🔄 Take New Photos
      </button>
    </div>

    <!-- Capture Progress -->
    <div v-if="isCapturing" class="space-y-4">
      <div class="flex justify-between text-white font-medium">
        <span class="flex items-center gap-2">
          <span class="text-lg">📊</span>
          Progress
        </span>
        <span class="text-slate-300">{{ currentShot }}/{{ shotCount }}</span>
      </div>
      <div class="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
        <div 
          class="bg-slate-500 h-3 rounded-full transition-all duration-500 shadow-lg"
          :style="{ width: `${(currentShot / shotCount) * 100}%` }"
        ></div>
      </div>
      <p class="text-center text-gray-400 text-sm">
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
const eventTitle = ref('')

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
    title: eventTitle.value.trim()
  })
}
</script>