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
  // Add more image filenames here
];

let currentImageIndex = 0;

function rotateImage() {
  const imgElement = document.getElementById("rotatingImage");
  currentImageIndex = (currentImageIndex + 1) % rotatingImages.length;
  imgElement.src = rotatingImages[currentImageIndex];
}

setInterval(rotateImage, 1500); // change every 1.5 seconds

let canvasInstance;
let brushColor = '#e49cb3';
let brushSize = 2;

function setup() {
  const parent = document.getElementById('p5sketch');
  const cnv = createCanvas(parent.offsetWidth - 10, 200); // 🎨 taller canvas
  cnv.parent(parent);
  background('#fff0f8');
}

function draw() {
  stroke(brushColor);
  strokeWeight(brushSize);
  if (
    mouseIsPressed &&
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  ) {
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

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

