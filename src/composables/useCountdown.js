import { ref } from 'vue'

export function useCountdown() {
  const count = ref(0)
  const isActive = ref(false)

  const startCountdown = (duration = 3) => {
    return new Promise((resolve) => {
      count.value = duration
      isActive.value = true

      const timer = setInterval(() => {
        count.value--
        
        if (count.value <= 0) {
          clearInterval(timer)
          isActive.value = false
          resolve()
        }
      }, 1000)
    })
  }

  const stopCountdown = () => {
    count.value = 0
    isActive.value = false
  }

  return {
    count,
    isActive,
    startCountdown,
    stopCountdown
  }
}