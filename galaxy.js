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

                // Show edit and download buttons
                document.getElementById('editButton').style.display = 'inline-block';
                document.getElementById('downloadButton').style.display = 'inline-block';

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

// Handle edit button click
document.getElementById('editButton').addEventListener('click', function() {
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview.src) {
        const editWindow = window.open('', '_blank', 'width=1000,height=800');
        editWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Edit Image</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(45deg, #0a0a2e, #1a1a3a);
                        min-height: 100vh;
                        font-family: 'Poppins', sans-serif;
                        color: white;
                    }
                    .container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 20px;
                    }
                    .canvas-container {
                        position: relative;
                        border-radius: 15px;
                        overflow: hidden;
                        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    }
                    canvas {
                        background: white;
                        cursor: crosshair;
                    }
                    .tools {
                        display: flex;
                        gap: 15px;
                        padding: 15px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 10px;
                        align-items: center;
                    }
                    input[type="color"] {
                        width: 50px;
                        height: 50px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    input[type="range"] {
                        width: 150px;
                    }
                    .tool-label {
                        font-size: 14px;
                        margin-right: 5px;
                    }
                    button {
                        padding: 8px 16px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background 0.3s;
                    }
                    #saveButton {
                        background: rgba(100, 255, 100, 0.2);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="tools">
                        <div>
                            <span class="tool-label">Color:</span>
                            <input type="color" id="colorPicker" value="#000000">
                        </div>
                        <div>
                            <span class="tool-label">Pixel Size:</span>
                            <input type="range" id="pixelSize" min="1" max="20" value="4">
                        </div>
                        <div>
                            <button id="eraserToggle">🖌️ Draw</button>
                            <button id="saveButton">💾 Save</button>
                        </div>
                    </div>
                    <div class="canvas-container">
                        <canvas id="editCanvas"></canvas>
                    </div>
                </div>
                <script>
                    const canvas = document.getElementById('editCanvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.src = "${imagePreview.src}";
                    
                    img.onload = function() {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        
                        // Store original image for eraser
                        const originalCanvas = document.createElement('canvas');
                        originalCanvas.width = img.width;
                        originalCanvas.height = img.height;
                        const originalCtx = originalCanvas.getContext('2d');
                        originalCtx.drawImage(img, 0, 0);
                        
                        let isDrawing = false;
                        let lastX = 0;
                        let lastY = 0;
                        let isErasing = false;
                        
                        function drawPixel(x, y) {
                            const pixelSize = parseInt(document.getElementById('pixelSize').value);
                            const color = document.getElementById('colorPicker').value;
                            
                            const pixelX = Math.floor(x / pixelSize) * pixelSize;
                            const pixelY = Math.floor(y / pixelSize) * pixelSize;
                            
                            if (isErasing) {
                                const imageData = originalCtx.getImageData(pixelX, pixelY, pixelSize, pixelSize);
                                ctx.putImageData(imageData, pixelX, pixelY);
                            } else {
                                ctx.fillStyle = color;
                                ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
                            }
                        }
                        
                        function draw(e) {
                            if (!isDrawing) return;
                            
                            const rect = canvas.getBoundingClientRect();
                            const scaleX = canvas.width / rect.width;
                            const scaleY = canvas.height / rect.height;
                            
                            const x = (e.clientX - rect.left) * scaleX;
                            const y = (e.clientY - rect.top) * scaleY;
                            
                            drawPixel(x, y);
                            
                            const dx = x - lastX;
                            const dy = y - lastY;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const pixelSize = parseInt(document.getElementById('pixelSize').value);
                            
                            if (distance > pixelSize) {
                                const steps = Math.floor(distance / pixelSize);
                                for (let i = 1; i < steps; i++) {
                                    const interpolatedX = lastX + (dx * i / steps);
                                    const interpolatedY = lastY + (dy * i / steps);
                                    drawPixel(interpolatedX, interpolatedY);
                                }
                            }
                            
                            lastX = x;
                            lastY = y;
                        }
                        
                        canvas.addEventListener('mousedown', (e) => {
                            isDrawing = true;
                            const rect = canvas.getBoundingClientRect();
                            const scaleX = canvas.width / rect.width;
                            const scaleY = canvas.height / rect.height;
                            lastX = (e.clientX - rect.left) * scaleX;
                            lastY = (e.clientY - rect.top) * scaleY;
                        });
                        
                        canvas.addEventListener('mousemove', draw);
                        canvas.addEventListener('mouseup', () => isDrawing = false);
                        canvas.addEventListener('mouseout', () => isDrawing = false);
                        
                        document.getElementById('eraserToggle').addEventListener('click', function() {
                            isErasing = !isErasing;
                            this.textContent = isErasing ? '⌫ Erase' : '🖌️ Draw';
                            this.style.background = isErasing ? 'rgba(255, 100, 100, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                        });
                        
                        document.getElementById('saveButton').addEventListener('click', function() {
                            const link = document.createElement('a');
                            link.download = 'edited-image.png';
                            link.href = canvas.toDataURL('image/png');
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            
                            const originalText = this.textContent;
                            const originalBg = this.style.background;
                            this.textContent = '✓ Saved!';
                            this.style.background = 'rgba(100, 255, 100, 0.4)';
                            
                            setTimeout(() => {
                                this.textContent = originalText;
                                this.style.background = originalBg;
                            }, 1000);
                        });
                    };
                </script>
            </body>
            </html>
        `);
    }
});

// Handle choose image button click
document.getElementById('chooseImageButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});
