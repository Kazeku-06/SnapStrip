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
export const calculateLayout = (layoutType, images, canvasWidth = 800, canvasHeight = 600, frameStyle = 'none') => {
  const imageCount = images.length
  const padding = getFramePadding(frameStyle)
  const textHeight = 60 // Space for timestamp
  
  let layout = {
    canvasWidth,
    canvasHeight: canvasHeight + textHeight,
    positions: [],
    padding: padding,
    frameStyle: frameStyle
  }

  // Special layout for music frame
  if (frameStyle === 'music') {
    return calculateMusicPlayerLayout(images, canvasWidth, canvasHeight)
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
 * Calculate layout for music player frame (3 photos in specific positions)
 */
export const calculateMusicPlayerLayout = (images, canvasWidth = 400, canvasHeight = 800) => {
  // Debug logging
  console.log('Music Player Layout Debug:')
  console.log('Canvas size:', canvasWidth, 'x', canvasHeight)
  
  // Music player frame specific dimensions
  const frameWidth = canvasWidth
  const frameHeight = canvasHeight
  
  // Fixed coordinates to place photos INSIDE the green boxes
  // Based on the image, green boxes are inside the music player frame
  const startX = 275                              // X position inside the frame (not scaled)
  const startY = 250                              // Y position of first green box
  const photoWidth = 120                          // Width to fit inside green box
  const photoHeight = 100                         // Height to fit inside green box
  const photoSpacing = 130                        // Vertical spacing between green boxes
  
  console.log('Photo dimensions:', photoWidth, 'x', photoHeight)
  console.log('Start position:', startX, ',', startY)
  console.log('Photo spacing:', photoSpacing)
  
  const layout = {
    canvasWidth: frameWidth,
    canvasHeight: frameHeight,
    positions: [],
    padding: 0,
    frameStyle: 'music'
  }
  
  // Position 3 photos vertically in the music player frame
  for (let i = 0; i < Math.min(3, images.length); i++) {
    const position = {
      x: startX,
      y: startY + (i * photoSpacing),
      width: photoWidth,
      height: photoHeight
    }
    console.log(`Photo ${i + 1} position:`, position)
    layout.positions.push(position)
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

/**
 * Get frame background color based on frame style
 */
export const getFrameBackgroundColor = (frameStyle) => {
  switch (frameStyle) {
    case 'cute':
      return '#ff9a9e'
    case 'elegant':
      return '#FFD700'
    case 'party':
      return '#ff6b6b'
    case 'vintage':
      return '#8B4513'
    case 'galaxy':
      return '#000428'
    case 'love':
      return '#ff9a9e'
    case 'music':
      return '#1a1a1a' // Dark background for music player theme
    case 'custom':
      return '#ff6b6b' // Atau warna sesuai desain kamu
    default:
      return '#ffffff'
  }
}

/**
 * Draw frame border around entire canvas
 */
export const drawFrameBorder = (ctx, width, height, frameStyle) => {
  if (frameStyle === 'music') {
    // For music frame, we'll overlay the frame image instead of drawing borders
    return drawMusicPlayerFrame(ctx, width, height)
  }
  
  const borderWidth = getFrameBorderWidth(frameStyle)
  const borderColor = getFrameBorderColor(frameStyle)
  
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth
  ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth)
  
  // Special effects for certain frames
  if (frameStyle === 'neon') {
    ctx.shadowColor = '#00ffff'
    ctx.shadowBlur = 15
    ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth)
    ctx.shadowBlur = 0
  }
}

/**
 * Draw music player frame overlay
 */
export const drawMusicPlayerFrame = async (ctx, width, height) => {
  try {
    // Load the music frame image
    const frameImage = await loadImage('/frames/Frame-2.png')
    
    // Draw the frame image on top of everything
    ctx.drawImage(frameImage, 0, 0, width, height)
  } catch (error) {
    console.error('Failed to load music frame image:', error)
    // Fallback: draw a simple border
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, width - 4, height - 4)
  }
}

/**
 * Draw frame around individual image
 */
export const drawImageFrame = (ctx, position, frameStyle) => {
  const { x, y, width, height } = position
  const borderWidth = 2
  const borderColor = getFrameBorderColor(frameStyle)
  
  ctx.strokeStyle = borderColor
  ctx.lineWidth = borderWidth
  ctx.strokeRect(x - borderWidth/2, y - borderWidth/2, width + borderWidth, height + borderWidth)
}

/**
 * Get frame border width
 */
export const getFrameBorderWidth = (frameStyle) => {
  switch (frameStyle) {
    case 'classic':
      return 8
    case 'vintage':
      return 12
    case 'modern':
      return 6
    case 'polaroid':
      return 15
    case 'neon':
      return 4
    case 'gold':
      return 10
    case 'film':
      return 15
    default:
      return 0
  }
}

/**
 * Get frame border color
 */
export const getFrameBorderColor = (frameStyle) => {
  switch (frameStyle) {
    case 'cute':
      return '#fecfef'
    case 'elegant':
      return '#FFA500'
    case 'party':
      return '#4ecdc4'
    case 'vintage':
      return '#A0522D'
    case 'galaxy':
      return '#004e92'
    case 'love':
      return '#fad0c4'
    case 'music':
      return '#333333' // Dark border for music theme
    case 'custom':
      return '#ff8c42' // Border color untuk custom frame
    default:
      return '#000000'
  }
}

/**
 * Get frame padding (spacing between photos)
 */
export const getFramePadding = (frameStyle) => {
  switch (frameStyle) {
    case 'cute':
      return 40  // Extra space for emoji decorations
    case 'elegant':
      return 45  // Luxury spacing
    case 'party':
      return 35  // Fun spacing
    case 'vintage':
      return 40  // Classic spacing
    case 'galaxy':
      return 35  // Space theme
    case 'love':
      return 40  // Romantic spacing
    case 'music':
      return 25  // Tight spacing for music player layout
    case 'custom':
      return 35  // Custom spacing
    default:
      return 30
  }
}

/**
 * Apply filter to canvas context
 */
export const applyCanvasFilter = (ctx, filterType) => {
  switch (filterType) {
    case 'vintage':
      // Sepia effect for vintage
      ctx.filter = 'sepia(0.8) contrast(1.2) brightness(1.1) saturate(1.3)'
      break
    case 'bw':
      // Black and white effect
      ctx.filter = 'grayscale(1) contrast(1.1)'
      break
    case 'none':
    default:
      ctx.filter = 'none'
      break
  }
}