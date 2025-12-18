/**
 * Load image from data URL
 */
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Calculate layout dimensions and positions
 */
export const calculateLayout = (layoutType, images, canvasWidth = 800, canvasHeight = 600) => {
  const imageCount = images.length
  const padding = 20
  const textHeight = 60 // Space for timestamp
  
  let layout = {
    canvasWidth,
    canvasHeight: canvasHeight + textHeight,
    positions: []
  }

  switch (layoutType) {
    case 'vertical': {
      const imageWidth = canvasWidth - (padding * 2)
      const availableHeight = canvasHeight - (padding * 2) - ((imageCount - 1) * padding)
      const imageHeight = availableHeight / imageCount
      
      for (let i = 0; i < imageCount; i++) {
        layout.positions.push({
          x: padding,
          y: padding + (i * (imageHeight + padding)),
          width: imageWidth,
          height: imageHeight
        })
      }
      break
    }
    
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(imageCount))
      const rows = Math.ceil(imageCount / cols)
      
      const availableWidth = canvasWidth - (padding * (cols + 1))
      const availableHeight = canvasHeight - (padding * (rows + 1))
      
      const imageWidth = availableWidth / cols
      const imageHeight = availableHeight / rows
      
      for (let i = 0; i < imageCount; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        
        layout.positions.push({
          x: padding + (col * (imageWidth + padding)),
          y: padding + (row * (imageHeight + padding)),
          width: imageWidth,
          height: imageHeight
        })
      }
      break
    }
    
    default:
      throw new Error(`Unknown layout type: ${layoutType}`)
  }

  return layout
}

/**
 * Draw text with background
 */
export const drawTextWithBackground = (ctx, text, x, y, fontSize = 16) => {
  ctx.font = `${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = fontSize
  
  // Draw background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(x - textWidth/2 - 10, y - textHeight - 5, textWidth + 20, textHeight + 10)
  
  // Draw text
  ctx.fillStyle = 'white'
  ctx.fillText(text, x, y - 5)
}