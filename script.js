const images = [
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0001.png', name: 'Treble Clef' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0002.png', name: 'Bass Clef' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0003.png', name: 'Sharp Sign' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0004.png', name: 'Flat Sign' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0005.png', name: 'Quarter Note' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0006.png', name: 'Quarter Rest' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0007.png', name: 'Eighth Note' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0008.png', name: 'Eighth Rest' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0009.png', name: 'Sixteenth Note' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0010.png', name: 'Sixteenth Rest' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0011.png', name: 'Whole Note' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0012.png', name: 'Half Note' },
  { url: 'https://eagleviewmusic.com/images/MusicalSymbolColoring0013.png', name: 'Double Eighths' }
];
let currentIndex = 0;
let imageDrawings = new Array(images.length).fill(null);
let imageBaseCanvasDrawings = new Array(images.length).fill(null); 

const baseCanvas = document.getElementById('baseCanvas');
const bgCanvas = document.getElementById('bgCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const baseCtx = baseCanvas.getContext('2d');
const bgCtx = bgCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');
const imgNameSpan = document.getElementById('imgName');
const prevImgBtn = document.getElementById('prevImg');
const nextImgBtn = document.getElementById('nextImg');
const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
const sidebar = document.querySelector('.sidebar');

const penBtn = document.getElementById('penBtn');
const eraserBtn = document.getElementById('eraserBtn');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const hideImageBtn = document.getElementById('hideImageBtn');
const copyBtn = document.getElementById('copyBtn');
const sizeCircles = document.querySelectorAll('.size-circle');
const colorButtons = document.querySelectorAll('.color-button');

let drawing = false;
let tool = 'pen'; 
let currentBrushSize = 6;
let imageVisible = true;
let isTouch = false;
let lastPoint = null;

window.addEventListener('touchstart', function() { isTouch = true; }, { once: true });
toggleSidebarBtn.addEventListener('click', function() { sidebar.classList.toggle('active'); });
document.addEventListener('click', function(e) {
  if (window.innerWidth <= 600 && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== toggleSidebarBtn) {
    sidebar.classList.remove('active');
  }
});

function updateSizeCircleColors() {
  const currentColor = colorPicker.value;
  sizeCircles.forEach(circle => {
    if (!circle.hasAttribute('data-bg')) { 
      circle.style.backgroundColor = tool === 'eraser' ? '#ffffff' : currentColor;
    }
  });
}

function saveDrawingForCurrentImage() {
  if (drawCanvas.width > 0 && drawCanvas.height > 0 && currentIndex >= 0 && currentIndex < imageDrawings.length) {
    imageDrawings[currentIndex] = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
  }
}

function loadDrawingForCurrentImage() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  if (currentIndex >= 0 && currentIndex < imageDrawings.length && imageDrawings[currentIndex]) {
    drawCtx.putImageData(imageDrawings[currentIndex], 0, 0);
  }
}

function saveBaseCanvasForCurrentImage() {
  if (baseCanvas.width > 0 && baseCanvas.height > 0 && currentIndex >= 0 && currentIndex < imageBaseCanvasDrawings.length) {
    imageBaseCanvasDrawings[currentIndex] = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
  }
}

function loadBaseCanvasForCurrentImage() {
  baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
  if (currentIndex >= 0 && currentIndex < imageBaseCanvasDrawings.length && imageBaseCanvasDrawings[currentIndex]) {
    baseCtx.putImageData(imageBaseCanvasDrawings[currentIndex], 0, 0);
  }
}

function resize() {
  const parentWidth = window.innerWidth;
  const parentHeight = window.innerHeight;
  if (parentWidth < 600) {
    sidebar.classList.remove('active');
    toggleSidebarBtn.style.display = 'block';
  } else {
    toggleSidebarBtn.style.display = 'none';
  }
  const container = document.querySelector('.canvas-container');
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  if (drawCanvas.width > 0 && drawCanvas.height > 0) saveDrawingForCurrentImage();
  if (baseCanvas.width > 0 && baseCanvas.height > 0) saveBaseCanvasForCurrentImage();

  [baseCanvas, bgCanvas, drawCanvas].forEach(c => {
    c.width = width;
    c.height = height;
  });
  
  drawBackground(); 
  loadDrawingForCurrentImage(); 
  loadBaseCanvasForCurrentImage(); 
}

window.addEventListener('resize', resize);
window.addEventListener('message', function(e) { if (e.data && e.data.type === 'resize') resize(); });

function drawBackground() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  const imgObj = images[currentIndex];
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imgObj.url;
  img.onload = () => {
    const scale = Math.min(bgCanvas.width / img.width, bgCanvas.height / img.height) * 0.8;
    const x = (bgCanvas.width - img.width * scale) / 2;
    const y = (bgCanvas.height - img.height * scale) / 2;
    imgNameSpan.textContent = imgObj.name;
    if (imageVisible) bgCtx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
  };
}

prevImgBtn.addEventListener('click', () => {
  saveDrawingForCurrentImage();
  saveBaseCanvasForCurrentImage(); 
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  drawBackground();
  loadDrawingForCurrentImage();
  loadBaseCanvasForCurrentImage(); 
  playSound('blip');
});
nextImgBtn.addEventListener('click', () => {
  saveDrawingForCurrentImage();
  saveBaseCanvasForCurrentImage(); 
  currentIndex = (currentIndex + 1) % images.length;
  drawBackground();
  loadDrawingForCurrentImage();
  loadBaseCanvasForCurrentImage(); 
  playSound('blip');
});

hideImageBtn.addEventListener('click', () => {
  imageVisible = !imageVisible;
  drawBackground();
  hideImageBtn.textContent = imageVisible ? '👁️ Hide/Show' : '👁️ Hide/Show';
  playSound('switch');
});

function updateToolHighlight() {
  penBtn.classList.toggle('selected', tool === 'pen' || tool === 'bgBrush');
  eraserBtn.classList.toggle('selected', tool === 'eraser');
  updateSizeCircleColors();
}

function updateSizeHighlight(circle) {
  sizeCircles.forEach(c => c.classList.toggle('selected', c === circle));
}

penBtn.addEventListener('click', () => { 
  tool = 'pen';
  const selectedSizeCircle = document.querySelector('.size-circle.selected');
  if (selectedSizeCircle && selectedSizeCircle.hasAttribute('data-bg')) {
      tool = 'bgBrush';
  }
  updateToolHighlight(); 
  playSound('click');
});
eraserBtn.addEventListener('click', () => { 
  tool = 'eraser'; 
  updateToolHighlight(); 
  playSound('click');
});

sizeCircles.forEach(circle => {
  const sizeClickHandler = () => {
    currentBrushSize = parseInt(circle.dataset.size, 10);
    if (tool !== 'eraser') {
      tool = circle.hasAttribute('data-bg') ? 'bgBrush' : 'pen';
    }
    updateSizeHighlight(circle);
    updateToolHighlight();
    playSound('click');
  };
  circle.addEventListener('click', sizeClickHandler);
  circle.addEventListener('touchstart', (e) => { e.preventDefault(); sizeClickHandler(); });
});

colorButtons.forEach(btn => {
  const clickHandler = () => {
    const color = btn.getAttribute('data-color');
    colorPicker.value = color;
    colorButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateSizeCircleColors();
    playSound('pop');
  };
  btn.addEventListener('click', clickHandler);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); clickHandler(); });
});

colorPicker.addEventListener('change', () => {
  const selected = document.querySelector('.color-button.selected');
  if (selected) selected.classList.remove('selected');
  const matchingBtn = Array.from(colorButtons).find(b => b.getAttribute('data-color').toLowerCase() === colorPicker.value.toLowerCase());
  if (matchingBtn) matchingBtn.classList.add('selected');
  updateSizeCircleColors();
});

clearBtn.addEventListener('click', () => {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
  if (currentIndex >= 0 && currentIndex < imageDrawings.length) {
    imageDrawings[currentIndex] = null;
  }
  if (currentIndex >= 0 && currentIndex < imageBaseCanvasDrawings.length) { 
    imageBaseCanvasDrawings[currentIndex] = null;
  }
  playSound('clear');
});

function getCoords(e) {
  const rect = drawCanvas.getBoundingClientRect();
  const scaleX = drawCanvas.width / rect.width;
  const scaleY = drawCanvas.height / rect.height;
  let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function startDraw(e) {
  if (window.innerWidth <= 600 && sidebar.classList.contains('active')) sidebar.classList.remove('active');
  drawing = true;
  
  let activeCtx;
  if (tool === 'eraser') {
    activeCtx = (currentBrushSize === 50) ? baseCtx : drawCtx;
  } else if (tool === 'bgBrush') {
    activeCtx = baseCtx;
  } else { 
    activeCtx = drawCtx;
  }

  const gcoStore = activeCtx.globalCompositeOperation;
  activeCtx.beginPath();
  activeCtx.lineWidth = currentBrushSize;
  activeCtx.lineCap = 'round';
  activeCtx.lineJoin = 'round';

  if (tool === 'eraser') {
    activeCtx.globalCompositeOperation = 'destination-out';
    activeCtx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    activeCtx.globalCompositeOperation = 'source-over';
    activeCtx.strokeStyle = colorPicker.value;
  }
  
  const coords = getCoords(e);
  activeCtx.moveTo(coords.x, coords.y);
  lastPoint = coords;
  
  if (e.type.includes('touch')) {
    const tempGCO = activeCtx.globalCompositeOperation;
    const tempStyle = activeCtx.fillStyle;
    activeCtx.beginPath();
    activeCtx.arc(coords.x, coords.y, activeCtx.lineWidth / 2, 0, Math.PI * 2);
    if (tool === 'eraser') {
        activeCtx.globalCompositeOperation = 'destination-out';
        activeCtx.fillStyle = 'rgba(0,0,0,1)';
    } else {
        activeCtx.globalCompositeOperation = 'source-over';
        activeCtx.fillStyle = activeCtx.strokeStyle;
    }
    activeCtx.fill();
    activeCtx.globalCompositeOperation = tempGCO;
    activeCtx.fillStyle = tempStyle;
    activeCtx.beginPath();
    activeCtx.moveTo(coords.x, coords.y);
  }
  // Restore GCO for the line drawing part
  if (tool === 'eraser') {
     activeCtx.globalCompositeOperation = 'destination-out';
  } else {
     activeCtx.globalCompositeOperation = 'source-over';
  }
}

function draw(e) {
  if (!drawing) return;
  if (e.type.includes('touch')) e.preventDefault();
  
  let activeCtx;
  if (tool === 'eraser') {
    activeCtx = (currentBrushSize === 50) ? baseCtx : drawCtx;
  } else if (tool === 'bgBrush') {
    activeCtx = baseCtx;
  } else {
    activeCtx = drawCtx;
  }

  if (tool === 'eraser') activeCtx.globalCompositeOperation = 'destination-out';
  else activeCtx.globalCompositeOperation = 'source-over';

  const coords = getCoords(e);
  if (e.type.includes('touch') && lastPoint) {
    const midPointX = (lastPoint.x + coords.x) / 2;
    const midPointY = (lastPoint.y + coords.y) / 2;
    activeCtx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPointX, midPointY);
  } else {
     activeCtx.lineTo(coords.x, coords.y);
  }
  activeCtx.stroke();
  activeCtx.beginPath();
  activeCtx.moveTo(coords.x, coords.y);
  lastPoint = coords;
}

function endDraw() {
  if (!drawing) return;
  drawing = false;
  lastPoint = null;
  if (tool !== 'eraser') playSound('draw');
}

function playSound(type) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    let freq = 440, duration = 0.1, oscType = 'sine', vol = 0.1;
    switch(type) {
      case 'click': freq = 660; break;
      case 'blip': freq = 440; oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + duration); break;
      case 'draw': freq = 220 + Math.random() * 100; vol = 0.05; break;
      case 'clear': freq = 220; oscType = 'sawtooth'; duration = 0.3; oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + duration); break;
      case 'pop': freq = 880; oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + duration); break;
      case 'switch': freq = 220; oscType = 'square'; duration = 0.2; oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + duration); break;
    }
    oscillator.type = oscType;
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) { console.log("Sound not supported or error:", e); }
}

copyBtn.addEventListener('click', async () => {
  const originalText = copyBtn.innerHTML;
  try {
    copyBtn.innerHTML = '⏳ Copying...';
    
    // Create a temporary canvas to merge all layers
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = drawCanvas.width;
    mergedCanvas.height = drawCanvas.height;
    const mergedCtx = mergedCanvas.getContext('2d');

    // Fill background with white to avoid transparency issues
    mergedCtx.fillStyle = 'white';
    mergedCtx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);

    // Draw canvases in order: background, base drawings, then top drawings
    mergedCtx.drawImage(bgCanvas, 0, 0);
    mergedCtx.drawImage(baseCanvas, 0, 0);
    mergedCtx.drawImage(drawCanvas, 0, 0);

    // Use the Clipboard API to copy the merged canvas
    mergedCanvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        copyBtn.innerHTML = '✅ Copied!';
      } catch (err) {
        console.error('Failed to copy image to clipboard:', err);
        copyBtn.innerHTML = '❌ Failed!';
      }
    }, 'image/png');

  } catch (error) {
    console.error('Failed to capture canvas:', error);
    copyBtn.innerHTML = '❌ Failed!';
  } finally {
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  }
});

drawCanvas.addEventListener('mousedown', startDraw);
drawCanvas.addEventListener('mousemove', draw);
document.addEventListener('mouseup', endDraw);
drawCanvas.addEventListener('touchstart', startDraw, { passive: false });
drawCanvas.addEventListener('touchmove', draw, { passive: false });
document.addEventListener('touchend', endDraw);
document.addEventListener('touchcancel', endDraw);

document.addEventListener('visibilitychange', function() { if (document.visibilityState === 'visible') resize(); });

updateSizeCircleColors();
setTimeout(() => {
    resize(); 
    loadDrawingForCurrentImage(); 
    loadBaseCanvasForCurrentImage(); 
}, 100);

window.addEventListener('message', function(event) { if (event.data && event.data.type === 'resize') resize(); });
window.addEventListener('load', function() {
  if (window.parent !== window) window.parent.postMessage({ type: 'app-loaded' }, '*');
});
