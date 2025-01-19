const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 140; // Leaves space for menu bar and toolbar

let painting = false;
let tool = 'pencil'; // Default tool
let startX, startY, currentX, currentY;
let savedCanvas; // To store the current canvas state

// Function to get color from the canvas
function getColorAtPosition(x, y) {
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
}

// Start drawing
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    if (tool === 'eyedropper') {
        // Use the eyedropper tool to pick a color
        const pickedColor = getColorAtPosition(startX, startY);
        document.getElementById('color-picker').value = rgbToHex(pickedColor);
        return; // Exit early for eyedropper tool
    }

    painting = true;

    if (tool !== 'pencil' && tool !== 'brush' && tool !== 'eraser') {
        // Save the current canvas state
        savedCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

// Stop drawing
canvas.addEventListener('mouseup', (e) => {
    painting = false;
    ctx.beginPath(); // Reset the path after drawing
});

// Draw dynamically while moving (for shapes)
canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    currentX = e.clientX - rect.left;
    currentY = e.clientY - rect.top;

    if (tool === 'pencil' || tool === 'brush') {
        draw(currentX, currentY);
    } else if (tool === 'eraser') {
        erase(currentX, currentY);
    } else if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
        // Restore the saved canvas state before redrawing the shape
        ctx.putImageData(savedCanvas, 0, 0);
        drawShape(tool, startX, startY, currentX, currentY);
    }
});

// Drawing functions
function draw(x, y) {
    ctx.lineWidth = tool === 'brush' ? 10 : 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = document.getElementById('color-picker').value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function erase(x, y) {
    ctx.clearRect(x - 10, y - 10, 20, 20);
}

// Shape drawing function
function drawShape(shape, x1, y1, x2, y2) {
    const color = document.getElementById('color-picker').value;
    ctx.strokeStyle = color;

    switch (shape) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;
        case 'rectangle':
            const width = x2 - x1;
            const height = y2 - y1;
            ctx.strokeRect(x1, y1, width, height);
            break;
        case 'circle':
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            ctx.beginPath();
            ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
    }
}

// Convert RGB to HEX
function rgbToHex(rgb) {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    if (!result) return '#000000'; // Default to black if conversion fails
    return `#${parseInt(result[1]).toString(16).padStart(2, '0')}${parseInt(result[2])
        .toString(16)
        .padStart(2, '0')}${parseInt(result[3]).toString(16).padStart(2, '0')}`;
}

// Tool selection
document.getElementById('pencil').addEventListener('click', () => (tool = 'pencil'));
document.getElementById('brush').addEventListener('click', () => (tool = 'brush'));
document.getElementById('eraser').addEventListener('click', () => (tool = 'eraser'));
document.getElementById('eyedropper').addEventListener('click', () => (tool = 'eyedropper'));
document.getElementById('line').addEventListener('click', () => (tool = 'line'));
document.getElementById('rectangle').addEventListener('click', () => (tool = 'rectangle'));
document.getElementById('circle').addEventListener('click', () => (tool = 'circle'));

// Clear canvas
document.getElementById('clear').addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));

// Save canvas
document.getElementById('save').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});
