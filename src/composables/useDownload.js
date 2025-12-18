import { ref } from 'vue'

export function useDownload() {
  const isDownloading = ref(false)

  const downloadCanvas = (canvas, filename = 'photobooth-image.png') => {
    if (!canvas) {
      throw new Error('No canvas provided')
    }

    isDownloading.value = true

    try {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        isDownloading.value = false
      }, 'image/png', 0.9)
    } catch (error) {
      console.error('Download failed:', error)
      isDownloading.value = false
      throw error
    }
  }

  const downloadDataURL = (dataURL, filename = 'photobooth-image.png') => {
    isDownloading.value = true

    try {
      const link = document.createElement('a')
      link.href = dataURL
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    downloadCanvas,
    downloadDataURL
  }
}