/**
 * Compress and resize an image file to ensure it's under 1MB
 * Returns a base64 data URL string
 */
export async function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        let width = img.width
        let height = img.height
        const maxDimension = 1200 // Max width or height
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Try different quality levels to get under 1MB
        let quality = 0.9
        let base64 = canvas.toDataURL('image/jpeg', quality)
        
        // Keep reducing quality until under 1MB (base64 is ~33% larger than binary)
        // Target ~750KB base64 to ensure binary is under 1MB
        const targetSize = 750 * 1024 // 750KB in bytes
        
        while (base64.length > targetSize && quality > 0.1) {
          quality -= 0.1
          base64 = canvas.toDataURL('image/jpeg', quality)
        }
        
        // If still too large, reduce dimensions further
        if (base64.length > targetSize) {
          width = Math.floor(width * 0.8)
          height = Math.floor(height * 0.8)
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          base64 = canvas.toDataURL('image/jpeg', 0.7)
        }
        
        resolve(base64)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Made with Bob
