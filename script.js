const selectedItems = {};

document.querySelectorAll('.clothing').forEach(item => {
  const type = item.dataset.type;
  const layer = document.getElementById(`${type}-layer`);

  item.addEventListener('click', () => {
    const src = item.dataset.src;

    if (selectedItems[type]) {
      // Remove
      layer.src = '';
      item.classList.remove('selected');
      selectedItems[type] = false;
    } else {
      // Apply
      layer.src = src;
      item.classList.add('selected');
      selectedItems[type] = true;
    }
  });
});

interact('.clothing').draggable({
  listeners: {
    move(event) {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      target.style.transform = `translate(${x}px, ${y}px)`;
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },
    end(event) {
      event.target.style.transform = 'translate(0, 0)';
      event.target.setAttribute('data-x', 0);
      event.target.setAttribute('data-y', 0);
    }
  }
});

interact('.character-area').dropzone({
  accept: '.clothing',
  overlap: 0.5,
  ondrop(event) {
    const type = event.relatedTarget.dataset.type;
    const src = event.relatedTarget.dataset.src;
    const layer = document.getElementById(`${type}-layer`);
    layer.src = src;
    event.relatedTarget.classList.add('selected');
    selectedItems[type] = true;
  }
});
