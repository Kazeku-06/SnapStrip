import { ref } from 'vue'
import { 
  loadImage, 
  calculateLayout, 
  drawTextWithBackground,
  getFrameBackgroundColor,
  drawFrameBorder,
  drawImageFrame,
  getFramePadding
} from '@/utils/canvasHelpers'

export function usePhotoLayout() {
  const finalCanvas = ref(null)
  const isProcessing = ref(false)

  const createPhotoLayout = async (images, layoutType = 'vertical', options = {}) => {
    if (!images || images.length === 0) {
      throw new Error('No images provided')
    }

    isProcessing.value = true

    try {
      const {
        canvasWidth = 800,
        canvasHeight = 600,
        title = '',
        showTimestamp = true,
        frameStyle = 'none',
        frameColor = '#ffffff'
      } = options

      // Load all images
      const loadedImages = await Promise.all(
        images.map(imageData => loadImage(imageData))
      )

      // Calculate layout with frame style
      const layout = calculateLayout(layoutType, loadedImages, canvasWidth, canvasHeight, frameStyle)

      // Create canvas
      const canvas = document.createElement('canvas')
      canvas.width = layout.canvasWidth
      canvas.height = layout.canvasHeight
      const ctx = canvas.getContext('2d')

      // Fill background with frame color
      const bgColor = getFrameBackgroundColor(frameStyle)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw frame border if needed
      if (frameStyle !== 'none') {
        drawFrameBorder(ctx, canvas.width, canvas.height, frameStyle)
      }

      // Draw images
      loadedImages.forEach((img, index) => {
        if (layout.positions[index]) {
          const pos = layout.positions[index]
          ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height)
          
          // Add frame around each image if needed
          if (frameStyle !== 'none') {
            drawImageFrame(ctx, pos, frameStyle)
          }
        }
      })

      // Add timestamp and title
      const textY = canvas.height - 20
      const centerX = canvas.width / 2

      if (showTimestamp) {
        const timestamp = new Date().toLocaleString()
        drawTextWithBackground(ctx, timestamp, centerX, textY, 14)
      }

      if (title) {
        const titleY = showTimestamp ? textY - 30 : textY
        drawTextWithBackground(ctx, title, centerX, titleY, 16)
      }

      finalCanvas.value = canvas
      return canvas

    } catch (error) {
      console.error('Photo layout creation failed:', error)
      throw error
    } finally {
      isProcessing.value = false
    }
  }

  const getCanvasDataURL = (format = 'image/png', quality = 0.9) => {
    if (!finalCanvas.value) {
      throw new Error('No canvas available')
    }
    return finalCanvas.value.toDataURL(format, quality)
  }

  return {
    finalCanvas,
    isProcessing,
    createPhotoLayout,
    getCanvasDataURL
  }
}