/**
 * Helper to process images at runtime and remove their black background.
 * Uses an HTML5 Canvas to perform chroma-keying on dark pixels.
 * 
 * @param {string} imgUrl - Original URL or path of the image.
 * @param {number} threshold - Threshold for darkness (0-255). Any pixel where R, G, B are all below this value will be made transparent.
 * @returns {Promise<string>} A promise that resolves to a transparent base64 Data URL.
 */
export function getTransparentPin(imgUrl, threshold = 22) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          // If the pixel is very dark (black background), make it transparent
          if (r < threshold && g < threshold && b < threshold) {
            data[i+3] = 0; // Alpha = 0
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL());
      } catch (e) {
        console.error("Failed to make image transparent:", e);
        resolve(imgUrl); // Fallback to original URL on canvas/CORS errors
      }
    };
    img.onerror = () => {
      resolve(imgUrl);
    };
    img.src = imgUrl;
  });
}
