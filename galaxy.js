const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size and handle resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Pixel size (larger = more pixelated)
const pixelSize = 4;

let originalImageData = null;
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');

// Create starry background
function createStars() {
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for(let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        const opacity = Math.random();
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Animate stars
function animateStars() {
    createStars();
    requestAnimationFrame(animateStars);
}
animateStars();

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
            if (brightness > 30) {
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
            }
        }
    }
}

// Update download button
function updateDownloadButton() {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.href = tempCanvas.toDataURL('image/png');
    
    // Show download button with fade effect
    downloadButton.style.display = 'inline-block';
    downloadButton.style.opacity = '0';
    setTimeout(() => {
        downloadButton.style.transition = 'opacity 0.3s ease';
        downloadButton.style.opacity = '1';
    }, 10);
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
                tempCanvas.width = 500; 
                tempCanvas.height = 500;
                
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
                
                // Show pixelate button with fade effect
                const pixelateButton = document.getElementById('pixelateButton');
                pixelateButton.style.display = 'inline-block';
                pixelateButton.style.opacity = '0';
                setTimeout(() => {
                    pixelateButton.style.transition = 'opacity 0.3s ease';
                    pixelateButton.style.opacity = '1';
                }, 10);

                // Update download button
                updateDownloadButton();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Handle pixelation toggle with smooth transition
let isPixelated = false;
document.getElementById('pixelateButton').addEventListener('click', function() {
    if (!originalImageData) return;
    
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.transition = 'filter 0.3s ease';
    
    if (!isPixelated) {
        // Apply pixelation
        pixelateImage(tempCanvas, tempCtx, pixelSize);
        this.textContent = 'Original';
        imagePreview.style.filter = 'contrast(1.1)';
    } else {
        // Restore original
        tempCtx.putImageData(originalImageData, 0, 0);
        this.textContent = 'Pixelate';
        imagePreview.style.filter = 'none';
    }
    
    // Update preview and download link
    imagePreview.src = tempCanvas.toDataURL();
    updateDownloadButton();
    isPixelated = !isPixelated;
});
