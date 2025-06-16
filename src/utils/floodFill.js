// Helper functions for flood fill

// Check if canvas is blank
export const isCanvasBlank = (canvas) => {
  const ctx = canvas.getContext('2d');
  const pixelBuffer = new Uint32Array(
    ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );
  
  // Check if all pixels are white (or transparent)
  return !pixelBuffer.some(color => color !== 0 && color !== 0xffffffff);
};

// Optimize the getPixelColor function with bounds checking
export const getPixelColor = (imageData, x, y) => {
  const { data, width, height } = imageData;
  
  // Ensure coordinates are within bounds
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return [0, 0, 0, 0]; // Return transparent for out of bounds
  }
  
  const pixelPos = (y * width + x) * 4;
  return [
    data[pixelPos],
    data[pixelPos + 1],
    data[pixelPos + 2],
    data[pixelPos + 3]
  ];
};

// Improved color matching with better anti-aliasing handling
export const colorsMatch = (color1, color2, tolerance = 10) => {
  // For transparent areas
  if (color1[3] < 10 && color2[3] < 10) return true;
  
  // Alpha channel check - if one is transparent and the other isn't, they don't match
  if ((color1[3] < 10 && color2[3] >= 10) || (color1[3] >= 10 && color2[3] < 10)) {
    return false;
  }
  
  // For dark colors, use a tighter tolerance to prevent ghosting
  const isDarkColor = (color) => color[0] < 60 && color[1] < 60 && color[2] < 60;
  
  // Adjust tolerance based on alpha values - lower alpha (more transparent) gets higher tolerance
  // This helps with anti-aliased edges
  const alphaFactor = Math.min(color1[3], color2[3]) / 255;
  const effectiveTolerance = isDarkColor(color1) || isDarkColor(color2) 
    ? Math.max(1, tolerance / 3) 
    : tolerance * (0.5 + 0.5 * alphaFactor);
  
  // If tolerance is 0, use exact matching (for flood fill)
  if (tolerance === 0) {
    // For dark colors, we need to be even more precise
    const matchThreshold = isDarkColor(color1) || isDarkColor(color2) ? 0.5 : 1;
    return Math.abs(color1[0] - color2[0]) < matchThreshold && 
           Math.abs(color1[1] - color2[1]) < matchThreshold && 
           Math.abs(color1[2] - color2[2]) < matchThreshold && 
           Math.abs(color1[3] - color2[3]) < matchThreshold;
  }
  
  // Otherwise use tolerance-based matching (for other operations)
  if (Math.abs(color1[3] - color2[3]) > effectiveTolerance) return false;
  
  // Calculate color distance using weighted Euclidean distance (gives better perceptual results)
  // Human eye is more sensitive to green, less to blue
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];
  
  const colorDistance = Math.sqrt(
    0.3 * rDiff * rDiff + 
    0.59 * gDiff * gDiff + 
    0.11 * bDiff * bDiff
  );
  
  return colorDistance <= effectiveTolerance;
};

// Helper function to convert color string to RGBA
export const hexToRgba = (color) => {
  // If it's a named color or rgb/rgba format, create a temporary element to get its RGB values
  if (!color.startsWith('#')) {
    const tempElem = document.createElement('div');
    tempElem.style.color = color;
    document.body.appendChild(tempElem);
    const computedColor = window.getComputedStyle(tempElem).color;
    document.body.removeChild(tempElem);
    
    // Parse the computed RGB/RGBA value
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1], 10),
        parseInt(rgbMatch[2], 10),
        parseInt(rgbMatch[3], 10),
        rgbMatch[4] ? Math.round(parseFloat(rgbMatch[4]) * 255) : 255
      ];
    }
    
    // Fallback to black if parsing fails
    return [0, 0, 0, 255];
  }
  
  // Handle hex colors
  // Remove # if present
  color = color.replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  // Parse the hex values
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Return RGBA array (alpha is 255 for fully opaque)
  return [r, g, b, 255];
};

// Main flood fill function
export const performFloodFill = (canvas, offsetX, offsetY, fillColor, saveToHistory) => {
  if (!canvas) return;
  
  // Use the provided offset coordinates directly
  const x = Math.floor(offsetX);
  const y = Math.floor(offsetY);
  
  const ctx = canvas.getContext('2d');
  
  // If the canvas is blank, just fill the entire canvas
  if (isCanvasBlank(canvas)) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    return true; // Return true to indicate canvas was modified
  }
  
  // Use the actual canvas coordinates without scaling
  const scaledX = Math.floor(x);
  const scaledY = Math.floor(y);
  
  // Bounds checking
  if (scaledX < 0 || scaledY < 0 || scaledX >= canvas.width || scaledY >= canvas.height) {
    console.warn("Flood fill coordinates out of bounds");
    return false;
  }
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Convert fillColor from string to RGB components
  const fillColorRGB = hexToRgba(fillColor);
  
  // Get the target color (the color at the clicked position)
  const startIndex = (scaledY * width + scaledX) * 4;
  const startColor = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3]
  ];
  
  // No need to continue if starting and target colors are the same
  if (colorsMatch(startColor, fillColorRGB, 0)) {
    return false;
  }
  
  // Use a typed array for visited tracking (much more efficient)
  const visited = new Uint8Array(width * height);
  
  // Use a typed array for the queue to improve performance
  const maxQueueSize = width * height;
  const queueX = new Int32Array(maxQueueSize);
  const queueY = new Int32Array(maxQueueSize);
  let queueLength = 0;
  let queueIndex = 0;
  
  // Add first pixel to queue
  queueX[queueLength] = scaledX;
  queueY[queueLength] = scaledY;
  queueLength++;
  
  // Mark starting pixel as visited
  visited[scaledY * width + scaledX] = 1;
  
  // Process pixels using scanline fill algorithm with anti-aliasing handling
  while (queueIndex < queueLength) {
    const x = queueX[queueIndex];
    const y = queueY[queueIndex];
    queueIndex++;
    
    // Find the leftmost and rightmost pixels of the current scanline
    let leftX = x;
    let rightX = x;
    
    // Find leftmost boundary of the area to fill with anti-aliasing handling
    while (leftX > 0) {
      const index = (y * width + (leftX - 1)) * 4;
      const color = [data[index], data[index + 1], data[index + 2], data[index + 3]];
      
      // For dark fill colors, use stricter matching to prevent ghosting
      const isDarkFillColor = fillColorRGB[0] < 60 && fillColorRGB[1] < 60 && fillColorRGB[2] < 60;
      const matchTolerance = isDarkFillColor ? 5 : 15;
      
      if (!colorsMatch(color, startColor, matchTolerance)) break;
      leftX--;
    }
    
    // Find rightmost boundary of the area to fill with anti-aliasing handling
    while (rightX < width - 1) {
      const index = (y * width + (rightX + 1)) * 4;
      const color = [data[index], data[index + 1], data[index + 2], data[index + 3]];
      
      // For dark fill colors, use stricter matching to prevent ghosting
      const isDarkFillColor = fillColorRGB[0] < 60 && fillColorRGB[1] < 60 && fillColorRGB[2] < 60;
      const matchTolerance = isDarkFillColor ? 5 : 15;
      
      if (!colorsMatch(color, startColor, matchTolerance)) break;
      rightX++;
    }
    
    // Fill the scanline
    for (let i = leftX; i <= rightX; i++) {
      const index = (y * width + i) * 4;
      
      // For dark colors, also fill semi-transparent pixels at boundaries to prevent ghosting
      const currentColor = [data[index], data[index + 1], data[index + 2], data[index + 3]];
      const isDarkFillColor = fillColorRGB[0] < 60 && fillColorRGB[1] < 60 && fillColorRGB[2] < 60;
      
      // Fill the pixel
      data[index] = fillColorRGB[0];
      data[index + 1] = fillColorRGB[1];
      data[index + 2] = fillColorRGB[2];
      data[index + 3] = fillColorRGB[3];
      
      // Check the pixels above and below for potential fill
      const checkY = [-1, 1]; // Check above and below
      
      for (const dy of checkY) {
        const ny = y + dy;
        
        // Skip if out of bounds
        if (ny < 0 || ny >= height) continue;
        
        const neighborIndex = (ny * width + i) * 4;
        const neighborColor = [
          data[neighborIndex],
          data[neighborIndex + 1],
          data[neighborIndex + 2],
          data[neighborIndex + 3]
        ];
        
        // If the neighbor matches the target color and hasn't been visited
        // For dark colors, use stricter matching
        const matchTolerance = isDarkFillColor ? 5 : 15;
        
        if (colorsMatch(neighborColor, startColor, matchTolerance) && !visited[ny * width + i]) {
          // Add to queue
          if (queueLength < maxQueueSize) {
            queueX[queueLength] = i;
            queueY[queueLength] = ny;
            queueLength++;
            visited[ny * width + i] = 1;
          } else {
            console.warn("Queue overflow in flood fill");
          }
        }
      }
    }
  }
  
  // Post-processing to clean up ghosting artifacts - apply to all colors
  const needsPostProcessing = true; // Apply to all colors
  if (needsPostProcessing) {
    // Do a second pass to clean up anti-aliased edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Skip pixels that are already the fill color or completely transparent
        if ((data[index] === fillColorRGB[0] && 
             data[index+1] === fillColorRGB[1] && 
             data[index+2] === fillColorRGB[2]) || 
            data[index+3] < 10) {
          continue;
        }
        
        // Check if this pixel is surrounded by filled pixels (potential ghost pixel)
        let surroundedCount = 0;
        let checkedCount = 0;
        let hasStrongBoundary = false;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            
            checkedCount++;
            const neighborIndex = (ny * width + nx) * 4;
            
            if (data[neighborIndex] === fillColorRGB[0] && 
                data[neighborIndex+1] === fillColorRGB[1] && 
                data[neighborIndex+2] === fillColorRGB[2]) {
              surroundedCount++;
            } else {
              // Check if this is a strong boundary (very different from fill color)
              const neighborColor = [
                data[neighborIndex], 
                data[neighborIndex+1], 
                data[neighborIndex+2], 
                data[neighborIndex+3]
              ];
              
              const colorDiff = Math.abs(neighborColor[0] - fillColorRGB[0]) + 
                               Math.abs(neighborColor[1] - fillColorRGB[1]) + 
                               Math.abs(neighborColor[2] - fillColorRGB[2]);
              
              if (colorDiff > 200 && neighborColor[3] > 200) {
                hasStrongBoundary = true;
              }
            }
          }
        }
        
        // If this pixel is mostly surrounded by fill color and is semi-transparent or grayish,
        // it's likely a ghost pixel from anti-aliasing
        if (surroundedCount >= 5 && checkedCount >= 7 && !hasStrongBoundary) {
          // Check if it's a light/gray pixel (potential anti-aliasing artifact)
          const isGrayish = Math.abs(data[index] - data[index+1]) < 30 && 
                            Math.abs(data[index] - data[index+2]) < 30;
          
          // Check if it's semi-transparent
          const isSemiTransparent = data[index+3] < 240;
          
          // Check if it's close to the target color (part of anti-aliasing)
          const isCloseToTarget = colorsMatch(
            [data[index], data[index+1], data[index+2], data[index+3]],
            startColor,
            30
          );
          
          if (isGrayish || isSemiTransparent || isCloseToTarget) {
            // Fill this pixel too to eliminate ghosting
            data[index] = fillColorRGB[0];
            data[index+1] = fillColorRGB[1];
            data[index+2] = fillColorRGB[2];
            data[index+3] = fillColorRGB[3];
          }
        }
      }
    }
  }
  
  // Update the canvas with the filled data
  ctx.putImageData(imageData, 0, 0);
  
  // Save to history after fill operation
  saveToHistory();
  return true; // Return true to indicate canvas was modified
};
