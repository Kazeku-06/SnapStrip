# Smart Photobooth Web App

A production-quality, browser-based photobooth application built with Vue 3 and modern web APIs. Create instant photo strips using your device camera with automatic burst capture and intelligent layout generation.

## 🎯 Project Purpose

This is a **frontend-only** web application designed for real-world use and portfolio demonstration. It showcases clean architecture, proper separation of concerns, and effective use of browser APIs without requiring any backend infrastructure.

**Key Design Principles:**
- Production-ready code quality
- Clean, maintainable architecture
- Instant usability without installation
- Privacy-focused (no data storage)

## ✨ Features

### Core Functionality
- **Camera Access**: Seamless WebRTC integration with permission handling
- **Burst Capture**: Automatic multi-photo capture with configurable timing
- **Smart Layouts**: Auto-generated photo arrangements (vertical strip, grid)
- **Live Preview**: Real-time camera feed with mirror effect
- **Instant Download**: High-quality PNG export with no server dependency

### User Experience
- **Countdown System**: Visual countdown with progress indicators
- **Responsive Design**: Works on desktop and mobile browsers
- **Error Handling**: Graceful camera permission and access error management
- **Progress Feedback**: Real-time capture and processing status

## 🏗️ Architecture

### Composables-First Design
The application follows Vue 3 Composition API best practices with dedicated composables for each concern:

```
src/composables/
├── useCamera.js       # WebRTC camera management
├── useCountdown.js    # Timer and countdown logic
├── useBurstCapture.js # Multi-photo capture sequencing
├── usePhotoLayout.js  # Canvas-based image composition
└── useDownload.js     # File download handling
```

### Component Structure
```
src/components/
├── CameraPreview.vue    # Live camera feed display
├── CountdownOverlay.vue # Countdown timer with progress ring
├── ControlPanel.vue     # Settings and capture controls
└── PhotoResult.vue      # Final image preview and download
```

### Utility Layer
```
src/utils/
└── canvasHelpers.js     # Canvas manipulation and layout calculations
```

## 🛠️ Technical Implementation

### Browser APIs Used
- **WebRTC getUserMedia**: Camera access and stream management
- **Canvas API**: Image composition and manipulation
- **Blob API**: File generation for downloads
- **URL.createObjectURL**: Download link creation

### Layout Engine
The auto-layout system calculates optimal positioning for multiple photos:
- **Vertical Strip**: Single column with equal spacing
- **Grid Layout**: Dynamic grid based on photo count
- **Automatic Sizing**: Responsive dimensions with proper padding
- **Text Overlay**: Timestamp and optional event title

### State Management
Reactive state management using Vue 3's Composition API:
- Camera initialization and stream handling
- Capture progress tracking
- Image processing status
- Error state management

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.0+ or 22.12.0+
- Modern browser with camera support
- HTTPS connection (required for camera access)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

### Required Permissions
- Camera access (automatically requested)
- HTTPS context (required by WebRTC)

## 🎨 Design Decisions

### Why Frontend-Only?
- **Instant Deployment**: No server setup or maintenance
- **Privacy First**: No data leaves the user's device
- **Cost Effective**: Zero hosting costs for backend
- **Scalability**: Unlimited concurrent users

### Why No Authentication?
- **Friction-Free**: Immediate usability without signup
- **Privacy Focused**: No user data collection
- **Stateless Design**: Each session is independent

### Technology Choices
- **Vue 3 Composition API**: Modern, maintainable component architecture
- **Tailwind CSS**: Utility-first styling for consistent design
- **Canvas API**: High-performance image manipulation
- **Vite**: Fast development and optimized builds

## 🔧 Configuration

### Layout Options
```javascript
// Available layout types
const layouts = {
  vertical: 'Single column strip layout',
  grid: 'Dynamic grid based on photo count'
}

// Configurable capture settings
const settings = {
  shotCount: [3, 4, 6],        // Number of photos
  delayBetweenShots: 1200,     // Milliseconds between captures
  countdownDuration: 3         // Seconds before first capture
}
```

### Canvas Output
```javascript
// Default canvas settings
const canvasConfig = {
  width: 600,           // Base width in pixels
  height: 800,          // Base height in pixels
  format: 'image/png',  // Output format
  quality: 0.9          // Compression quality
}
```

## 📊 Performance Considerations

- **Memory Management**: Automatic cleanup of video streams and canvas objects
- **Image Optimization**: Configurable quality settings for file size control
- **Responsive Loading**: Progressive enhancement for different device capabilities
- **Error Recovery**: Graceful degradation when camera access fails

## 🔒 Privacy & Security

- **No Data Storage**: All processing happens client-side
- **No Network Requests**: Images never leave the user's device
- **Permission Respect**: Clear camera permission handling
- **Secure Context**: HTTPS requirement for WebRTC compliance

## 🚫 Intentionally Excluded Features

The following features were deliberately omitted to maintain focus and simplicity:

- **User Authentication**: Not needed for single-session use
- **Backend API**: All processing is client-side
- **Social Sharing**: Keeps the app privacy-focused
- **Image Editing**: Maintains simplicity and performance
- **Cloud Storage**: Preserves user privacy

## 📈 Future Enhancements

Potential improvements that maintain the core philosophy:
- Additional layout templates
- Custom branding options
- Print-optimized output formats
- Accessibility improvements
- Progressive Web App features

## 🤝 Contributing

This project demonstrates production-ready frontend architecture. When contributing:
1. Maintain separation of concerns
2. Follow Vue 3 Composition API patterns
3. Keep components focused and reusable
4. Ensure browser compatibility
5. Preserve privacy-first design

## 📄 License

MIT License - Feel free to use this code for learning, portfolio projects, or commercial applications.