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
            'p-3 border-2 rounded-lg text-center transition-colors',
            selectedLayout === layout.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="text-sm font-medium">{{ layout.label }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ layout.description }}</div>
        </button>
      </div>
    </div>

    <!-- Shot Count -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Number of Photos
      </label>
      <select 
        v-model="shotCount" 
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="3">3 Photos</option>
        <option value="4">4 Photos</option>
        <option value="6">6 Photos</option>
      </select>
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
import { ref, computed } from 'vue'

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
const shotCount = ref(4)
const eventTitle = ref('')

const layoutOptions = [
  {
    value: 'vertical',
    label: 'Strip',
    description: 'Vertical layout'
  },
  {
    value: 'grid',
    label: 'Grid',
    description: 'Square layout'
  }
]

const startPhotoshoot = () => {
  emit('start-photoshoot', {
    layout: selectedLayout.value,
    shotCount: parseInt(shotCount.value),
    title: eventTitle.value.trim()
  })
}
</script>