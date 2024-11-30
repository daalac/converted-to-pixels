const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Pixel size (larger = more pixelated)
const pixelSize = 4;

let originalImageData = null;
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');

function pixelateImage(sourceCanvas, ctx, pixelSize) {
    const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    
    // Create pixelated effect
    for(let y = 0; y < sourceCanvas.height; y += pixelSize) {
        for(let x = 0; x < sourceCanvas.width; x += pixelSize) {
            const i = (y * sourceCanvas.width + x) * 4;
            
            // Get pixel color
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            // Only draw bright pixels
            if (brightness > 30) {  // Threshold to remove dark pixels
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
            }
        }
    }
}

// Handle uploaded images
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Set canvas dimensions
                tempCanvas.width = 300;
                tempCanvas.height = 300;
                
                // Calculate aspect ratio
                const aspectRatio = img.width / img.height;
                let drawWidth = tempCanvas.width;
                let drawHeight = tempCanvas.width / aspectRatio;
                
                if (drawHeight > tempCanvas.height) {
                    drawHeight = tempCanvas.height;
                    drawWidth = tempCanvas.height * aspectRatio;
                }
                
                // Center the image
                const x = (tempCanvas.width - drawWidth) / 2;
                const y = (tempCanvas.height - drawHeight) / 2;
                
                // Draw original image
                tempCtx.fillStyle = 'black';
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                tempCtx.drawImage(img, x, y, drawWidth, drawHeight);
                
                // Store original image data
                originalImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Update preview with original image
                const imagePreview = document.getElementById('imagePreview');
                imagePreview.src = tempCanvas.toDataURL();
                imagePreview.style.display = 'block';
                
                // Show pixelate button
                document.getElementById('pixelateButton').style.display = 'inline-block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Handle pixelation toggle
let isPixelated = false;
document.getElementById('pixelateButton').addEventListener('click', function() {
    if (!originalImageData) return;
    
    if (!isPixelated) {
        // Apply pixelation
        pixelateImage(tempCanvas, tempCtx, pixelSize);
        this.textContent = 'Original';
    } else {
        // Restore original
        tempCtx.putImageData(originalImageData, 0, 0);
        this.textContent = 'Pixelate';
    }
    
    // Update preview
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.src = tempCanvas.toDataURL();
    
    isPixelated = !isPixelated;
});
