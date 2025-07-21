// Game state
let equippedItems = new Set();
let clothingData = [];

// Initialize clothing items
function initializeClothingItems() {
    clothingData = [
        { id: 'shirt', name: 'Shirt', type: 'shirt', zLayer: 1, image: 'images/shirt.png' },
        { id: 'red-top', name: 'Red Top', type: 'shirt', subtype: 'overshirt', zLayer: 2, image: 'images/red-top.png' },
        { id: 'strawberry', name: 'Strawberry Shirt', type: 'shirt', zLayer: 1, image: 'images/strawberry.png' },

        { id: 'pants', name: 'Pants', type: 'pants', zLayer: 1, image: 'images/pants.png' },

        { id: 'shoes', name: 'Shoes', type: 'shoes', zLayer: 1, image: 'images/shoes.png' },
        { id: 'strawberry-shoes', name: 'Strawberry Shoes', type: 'shoes', zLayer: 2, image: 'images/strawberry-shoes.png' },

        { id: 'red-hair', name: 'Red Hair', type: 'accessory', subtype: 'hair', zLayer: 1, image: 'images/red-hair.png' },
        { id: 'glasses', name: 'Glasses', type: 'accessory', subtype: 'eyewear', zLayer: 3, image: 'images/glasses.png' },
        { id: 'hat', name: 'Hat', type: 'accessory', subtype: 'headwear', zLayer: 5, image: 'images/hat.png' },
        { id: 'strawberry-hat', name: 'Strawberry Hat', type: 'accessory', subtype: 'headwear', zLayer: 6, image: 'images/strawberry-hat.png' },
    ];
}

function renderClothingItems(filterType = null) {
    const container = document.getElementById('clothingItems');
    container.innerHTML = '';

    clothingData.forEach(item => {
        if (filterType && item.type !== filterType) return;

        const itemElement = document.createElement('div');
        itemElement.className = 'clothing-item';
        itemElement.id = item.id;
        itemElement.draggable = true;

        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.draggable = false;

        itemElement.appendChild(img);

        if (equippedItems.has(item.id)) {
            itemElement.classList.add('equipped');
        }

        itemElement.addEventListener('dragstart', handleDragStart);
        itemElement.addEventListener('dragend', handleDragEnd);
        itemElement.addEventListener('click', handleItemClick);

        container.appendChild(itemElement);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initializeClothingItems();

    const highlightOverlay = document.getElementById('highlightOverlay');
    highlightOverlay.style.pointerEvents = 'none';

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const type = button.getAttribute('data-type');
            renderClothingItems(type);
        });
    });

    document.querySelector('.tab-btn[data-type="shirt"]').click();
});

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleItemClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const itemId = e.currentTarget.id;
    if (equippedItems.has(itemId)) {
        removeItem(itemId);
    }
}

const characterDisplay = document.getElementById('characterDisplay');
const highlightOverlay = document.getElementById('highlightOverlay');

['dragover', 'dragenter', 'dragleave', 'drop'].forEach(event => {
    characterDisplay.addEventListener(event, e => {
        e.preventDefault();
        e.stopPropagation();

        highlightOverlay.style.pointerEvents = 'none';

        if (event === 'dragenter') {
            highlightOverlay.style.display = 'block';
        } else if (event === 'dragleave' || event === 'drop') {
            highlightOverlay.style.display = 'none';
        }

        if (event === 'drop') {
            const itemId = e.dataTransfer.getData('text/plain');
            equipItem(itemId);
        }
    });
});

function equipItem(itemId) {
    const item = clothingData.find(i => i.id === itemId);
    if (!item) return;

    clothingData.forEach(otherItem => {
        if (otherItem.type === item.type && otherItem.subtype === item.subtype && otherItem.id !== item.id) {
            removeItem(otherItem.id);
        }
    });

    equippedItems.add(itemId);
    updateItemVisual(itemId, true);
    addItemToCharacter(item);
}

function removeItem(itemId) {
    equippedItems.delete(itemId);
    updateItemVisual(itemId, false);
    removeItemFromCharacter(itemId);
}

function updateItemVisual(itemId, equipped) {
    const itemElement = document.getElementById(itemId);
    if (itemElement) {
        if (equipped) {
            itemElement.classList.add('equipped');
        } else {
            itemElement.classList.remove('equipped');
        }
    }
}

function addItemToCharacter(item) {
    const existing = characterDisplay.querySelector(`.clothing-layer[data-subtype="${item.subtype || item.type}"]`);
    if (existing) existing.remove();

    const layer = document.createElement('img');
    layer.src = item.image;
    layer.alt = item.name;
    layer.className = 'clothing-layer';
    layer.dataset.type = item.type;
    layer.dataset.subtype = item.subtype || item.type;
    layer.dataset.itemId = item.id;

    layer.style.position = 'absolute';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.objectFit = 'contain';
    layer.style.zIndex = String(getZIndexForItem(item));
    layer.style.pointerEvents = 'none';

    characterDisplay.appendChild(layer);
}

function removeItemFromCharacter(itemId) {
    const element = characterDisplay.querySelector(`.clothing-layer[data-item-id="${itemId}"]`);
    if (element) element.remove();
}

function getZIndexForItem(item) {
    const zIndexMap = {
        'shoes': 5,
        'pants': 10,
        'shirt': 20,
        'overshirt': 22,
        'neckwear': 25,
        'hair': 30,
        'eyewear': 35,
        'facewear': 37,
        'earwear': 38,
        'headwear': 40,
        'accessory': 60
    };
    return (zIndexMap[item.subtype] || zIndexMap[item.type] || 1) + (item.zLayer || 0);
}

function clearAllItems() {
    equippedItems.clear();
    document.querySelectorAll('.clothing-item').forEach(i => i.classList.remove('equipped'));
    document.querySelectorAll('.clothing-layer:not(.base-character)').forEach(l => l.remove());

    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const type = activeTab.getAttribute('data-type');
        renderClothingItems(type);
    }
}

function randomOutfit() {
    clearAllItems();
    const subtypesUsed = new Set();

    clothingData.forEach(item => {
        const key = `${item.type}:${item.subtype || ''}`;
        if (!subtypesUsed.has(key)) {
            equipItem(item.id);
            subtypesUsed.add(key);
        }
    });
}

const rotatingImages = [
  "bonbon/1.gif",
  "bonbon/2.gif",
  "bonbon/3.gif",
  "bonbon/4.gif",
  "bonbon/5.gif",
  "bonbon/6.gif",
  "bonbon/7.gif",
  "bonbon/8.gif",
  "bonbon/9.gif",
  "bonbon/10.gif",
  "bonbon/11.gif",
  "bonbon/12.gif",

];

let currentImageIndex = 0;

function rotateImage() {
  const imgElement = document.getElementById("rotatingImage");
  currentImageIndex = (currentImageIndex + 1) % rotatingImages.length;
  imgElement.src = rotatingImages[currentImageIndex];
}

setInterval(rotateImage, 1500); // change every 1.5 seconds



const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);
let currentTool = "pencil";
let painting = false;
let brushSize = 5;
let currentColor = "#000000";
let textInput = null;
let undoStack = [];
let airbrushInterval = null;
let mouseX = 0, mouseY = 0;
let startX = 0, startY = 0;

function selectTool(tool) {
  currentTool = tool;
  updateCursor();
  updateCursor();
  canvas.className = tool;
  currentTool = tool;
}
function changeBrushSize(size) {
  brushSize = parseInt(size);
}
function changeColor(color) {
  currentColor = color;
}
function saveState() {
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (undoStack.length > 20) undoStack.shift();
}
function undo() {
  if (undoStack.length > 0) {
    const imgData = undoStack.pop();
    ctx.putImageData(imgData, 0, 0);
  }
}
function clearCanvas() {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function spray(x, y) {
  const density = 20;
  for (let i = 0; i < density; i++) {
    const offsetX = Math.random() * brushSize * 2 - brushSize;
    const offsetY = Math.random() * brushSize * 2 - brushSize;
    if (offsetX ** 2 + offsetY ** 2 <= brushSize ** 2) {
      ctx.fillStyle = currentColor;
      ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
    }
  }
}

let previewCanvas = document.getElementById("preview-canvas") || document.createElement("canvas");
const previewCtx = previewCanvas.getContext("2d");
previewCanvas.width = canvas.width;
previewCanvas.height = canvas.height;
previewCanvas.style.position = "absolute";
previewCanvas.style.left = canvas.offsetLeft + "px";
previewCanvas.style.top = canvas.offsetTop + "px";
previewCanvas.style.pointerEvents = "none";
previewCanvas.style.zIndex = 5;
document.getElementById("canvas-container").appendChild(previewCanvas);

canvas.addEventListener("mousedown", (e) => {
  const { x, y } = getMousePos(e);
  if (currentTool === "text") {
    addTextBox(x, y);
    return;
  }
  saveState();
  painting = true;
  startX = x;
  startY = y;
  if (currentTool === "airbrush") {
    airbrushInterval = setInterval(() => spray(mouseX, mouseY), 20);
  } else if (!["line", "rect", "ellipse"].includes(currentTool)) {
    draw(e);
  }
});

canvas.addEventListener("mousemove", (e) => {
  const { x, y } = getMousePos(e);
  mouseX = x;
  mouseY = y;
  if (!painting) return;
  if (["line", "rect", "ellipse"].includes(currentTool)) {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.strokeStyle = currentColor;
    previewCtx.lineWidth = brushSize;
    previewCtx.beginPath();
    if (currentTool === "line") {
      previewCtx.moveTo(startX, startY);
      previewCtx.lineTo(x, y);
    } else if (currentTool === "rect") {
      previewCtx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentTool === "ellipse") {
      const radiusX = Math.abs(x - startX) / 2;
      const radiusY = Math.abs(y - startY) / 2;
      const centerX = (x + startX) / 2;
      const centerY = (y + startY) / 2;
      previewCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
    previewCtx.stroke();
  } else if (currentTool !== "airbrush") {
    draw(e);
  }
});

canvas.addEventListener("mouseup", (e) => {
  painting = false;
  ctx.beginPath();
  clearInterval(airbrushInterval);
  const { x, y } = getMousePos(e);
  if (["line", "rect", "ellipse"].includes(currentTool)) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    if (currentTool === "line") {
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
    } else if (currentTool === "rect") {
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentTool === "ellipse") {
      const radiusX = Math.abs(x - startX) / 2;
      const radiusY = Math.abs(y - startY) / 2;
      const centerX = (x + startX) / 2;
      const centerY = (y + startY) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
    ctx.stroke();
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  }
});

canvas.addEventListener("mouseleave", () => {
  painting = false;
  ctx.beginPath();
  clearInterval(airbrushInterval);
});

function draw(e) {
  if (!painting || currentTool === "text" || currentTool === "airbrush") return;

  const rect = canvas.getBoundingClientRect();
  let x = Math.min(Math.max(e.clientX - rect.left, 0), canvas.width);
  let y = Math.min(Math.max(e.clientY - rect.top, 0), canvas.height);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : currentColor;
  ctx.lineWidth = currentTool === "pencil" ? 1 : brushSize * 1.2;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}


function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function addTextBox(x, y) {
  if (textInput) return;
  const input = document.createElement("textarea");
  
  input.placeholder = "Type text...\n(Multiline supported)";
  input.style.position = "absolute";
  input.style.left = canvas.offsetLeft + x + "px";
  input.style.top = canvas.offsetTop + y + "px";
  input.style.fontSize = brushSize * 3 + "px";
  input.style.width = "150px";
  input.style.height = "25px";
  input.style.zIndex = 100;
  input.style.border = "1px dashed #333";
  input.style.background = "#fff";
  input.style.cursor = "move";
  input.style.resize = "none";
  input.style.overflow = "hidden";
  input.style.padding = "5px";
  input.style.lineHeight = "1.2";

  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply";
  applyBtn.style.position = "absolute";
  applyBtn.style.left = canvas.offsetLeft + x + 160 + "px";
  applyBtn.style.top = canvas.offsetTop + y + "px";
  applyBtn.style.zIndex = 101;

  document.body.appendChild(input);
  input.addEventListener("input", () => adjustTextInputSize(input));
  document.body.appendChild(applyBtn);
  textInput = input;
  input.focus();

  let dragging = false;
  let offsetX, offsetY;

  input.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (dragging) {
      input.style.left = e.clientX - offsetX + "px";
      input.style.top = e.clientY - offsetY + "px";
      applyBtn.style.left = parseInt(input.style.left) + 100 + "px";
      applyBtn.style.top = input.style.top;
    }
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });

  applyBtn.addEventListener("click", () => {
    const tx = parseInt(input.style.left) - canvas.offsetLeft;
    const ty = parseInt(input.style.top) - canvas.offsetTop;
    ctx.fillStyle = currentColor;
    ctx.font = input.style.fontSize + " sans-serif";
    ctx.textBaseline = "top";
    saveState();
    const lines = input.value.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, tx, ty + i * parseInt(input.style.fontSize));
    });
    document.body.removeChild(input);
    document.body.removeChild(applyBtn);
    textInput = null;
  });
}

function autosizeTextarea(el) {
  el.style.height = "auto";
  el.style.width = "auto";
  const tmp = document.createElement("div");
  tmp.style.position = "absolute";
  tmp.style.visibility = "hidden";
  tmp.style.whiteSpace = "pre-wrap";
  tmp.style.wordWrap = "break-word";
  tmp.style.font = el.style.font;
  tmp.style.lineHeight = el.style.lineHeight;
  tmp.style.padding = el.style.padding;
  tmp.style.width = "fit-content";
  tmp.style.maxWidth = "300px";
  tmp.innerText = el.value || el.placeholder;
  document.body.appendChild(tmp);
  el.style.width = tmp.offsetWidth + 20 + "px";
  el.style.height = tmp.offsetHeight + 10 + "px";
  document.body.removeChild(tmp);
}

function updateCursor() {
  let cursor = "crosshair";
  if (currentTool === "brush") {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize*2}' height='${brushSize*2}'><circle cx='${brushSize}' cy='${brushSize}' r='${brushSize}' fill='black'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") ${brushSize} ${brushSize}, auto`;
  } else if (currentTool === "eraser") {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize}' height='${brushSize}'><rect width='${brushSize}' height='${brushSize}' fill='gray'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") ${brushSize/2} ${brushSize/2}, auto`;
  } else if (currentTool === "airbrush") {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize}' height='${brushSize}'><circle cx='${brushSize/2}' cy='${brushSize/2}' r='2' fill='gray'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") ${brushSize/2} ${brushSize/2}, auto`;
  }
  canvas.style.cursor = cursor;
  const preview = document.getElementById("cursorPreview");
  preview.innerHTML = `<svg width='${brushSize*2}' height='${brushSize*2}'><circle cx='${brushSize}' cy='${brushSize}' r='${brushSize}' fill='black'/></svg>`;
}

document.getElementById("brushSize").addEventListener("input", function () {
  changeBrushSize(this.value);
  updateCursor();
});

function syncBrushSize(value) {
  brushSize = parseInt(value);
  document.getElementById("brushSize").value = brushSize;
  document.getElementById("brushSizeNumber").value = brushSize;
  updateCursor();
}

// Override updateCursor to reflect tool and show realistic preview
function updateCursor() {
  let cursor = "crosshair";
  let svg = "";
  const preview = document.getElementById("cursorPreview");

  if (currentTool === "brush") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize*2}' height='${brushSize*2}'><circle cx='${brushSize}' cy='${brushSize}' r='${brushSize}' fill='black'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") ${brushSize} ${brushSize}, auto`;
    preview.innerHTML = svg;
  } else if (currentTool === "eraser") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize}' height='${brushSize}'><rect width='${brushSize}' height='${brushSize}' fill='gray'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") ${brushSize/2} ${brushSize/2}, auto`;
    preview.innerHTML = svg;
  } else if (currentTool === "airbrush") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize}' height='${brushSize}'><circle cx='${brushSize/2}' cy='${brushSize/2}' r='2' fill='gray'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") ${brushSize/2} ${brushSize/2}, auto`;
    preview.innerHTML = svg;
  } else if (currentTool === "pencil") {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='1' height='1' fill='black'/></svg>`;
    cursor = `url("data:image/svg+xml;base64,${btoa(svg)}") 1 1, auto`;
    preview.innerHTML = svg;
  } else if (currentTool === "text") {
    preview.innerHTML = `<div style='font-size: ${brushSize * 3}px;'>abc</div>`;
  } else {
    preview.innerHTML = "";
  }

  canvas.style.cursor = cursor;
}

function adjustTextInputSize(el) {
  el.style.height = "auto";
  const lines = el.value.split("\n").length || 1;
  const px = parseInt(el.style.fontSize);
  el.style.height = (lines * px * 1.2) + "px";
}

document.getElementById("saveBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "milady_drawing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

document.getElementById('submitBtn').addEventListener('click', async () => {
  const canvas = document.getElementById('canvas');
  const imageData = canvas.toDataURL('image/png');

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('✅ Submission successful!');
    } else {
      alert(`❌ Submission failed: ${data.error}`);
    }
  } catch (err) {
    console.error(err);
    alert('❌ Submission failed.');
  }
});








document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveSketch')?.addEventListener('click', () => {
    saveCanvas('milady_doodle', 'png');
  });

  document.getElementById('clearCanvas')?.addEventListener('click', () => {
    background('#fff0f8');
  });

  document.getElementById('brushColor')?.addEventListener('input', (e) => {
    brushColor = e.target.value;
  });

  document.getElementById('brushSize')?.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
  });
});


//function toggleChat() {
//  const content = document.querySelector('.chat-content');
//  content.classList.toggle('hidden');
//}

