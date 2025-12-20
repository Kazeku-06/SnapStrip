<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Photo Settings</h2>
    
    <!-- Layout Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Layout Style
      </label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="layout in layoutOptions"
          :key="layout.value"
          @click="selectedLayout = layout.value"
          :class="[
            'p-4 border-2 rounded-lg text-center transition-colors',
            selectedLayout === layout.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="text-lg font-medium">{{ layout.label }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ layout.description }}</div>
          <div class="text-xs text-blue-600 mt-2 font-medium">{{ layout.photoCount }}</div>
        </button>
      </div>
    </div>

    <!-- Optional Title -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Event Title (Optional)
      </label>
      <input
        v-model="eventTitle"
        type="text"
        placeholder="e.g., Birthday Party 2024"
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        maxlength="30"
      />
    </div>

    <!-- Action Buttons -->
    <div class="space-y-3">
      <button
        @click="startPhotoshoot"
        :disabled="!canStart"
        :class="[
          'w-full py-3 px-4 rounded-lg font-medium transition-colors',
          canStart
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        {{ isCapturing ? 'Taking Photos...' : 'Start Photoshoot' }}
      </button>

      <button
        v-if="hasResults"
        @click="$emit('new-session')"
        class="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Take New Photos
      </button>
    </div>

    <!-- Capture Progress -->
    <div v-if="isCapturing" class="mt-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>{{ currentShot }}/{{ shotCount }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(currentShot / shotCount) * 100}%` }"
        ></div>
      </div>
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