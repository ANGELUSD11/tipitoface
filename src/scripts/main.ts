const root = document.documentElement;
const primaryInput = document.getElementById('primary-color');
const secondaryInput = document.getElementById('secondary-color');
const gdIcon = document.getElementById('gd-icon');
const eyeLeft = document.getElementById('eye-left');
const eyeRight = document.getElementById('eye-right');
const eyesGroup = document.getElementById('eyes');
const boxInput = document.getElementById('box-color');
const editableTitle = document.getElementById('editable-title');

const customCursor = document.createElement('div');
customCursor.className = 'custom-cursor';
customCursor.textContent = '🤚';
document.body.appendChild(customCursor);

// Change colors functionality
primaryInput?.addEventListener('input', (e) => {
  root.style.setProperty('--color-primary', (e.target as HTMLInputElement).value);
});

secondaryInput?.addEventListener('input', (e) => {
  root.style.setProperty('--color-secondary', (e.target as HTMLInputElement).value);
});

boxInput?.addEventListener('input', (e) => {
  root.style.setProperty('--color-box', (e.target as HTMLInputElement).value);
});

// Prevent line breaks in editable title and enforce 8 character limit
editableTitle?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    editableTitle.blur();
    return;
  }
  
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
  
  const text = editableTitle.textContent || '';
  const selection = window.getSelection();
  if (text.length >= 8 && selection && selection.toString().length === 0) {
    e.preventDefault();
  }
});

// Handle paste to respect the 8 character limit safely
editableTitle?.addEventListener('paste', (e) => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') || '';
  const selection = window.getSelection();
  if (!selection) return;
  
  const currentText = editableTitle.textContent || '';
  const selectionText = selection.toString();
  const allowedLength = 8 - (currentText.length - selectionText.length);
  
  if (allowedLength > 0) {
    const textToInsert = text.slice(0, allowedLength);
    document.execCommand('insertText', false, textToInsert);
  }
});

// Eyes follow the cursor
document.addEventListener('mousemove', (e) => {
  if (isPetMode) {
    customCursor.style.left = `${e.clientX - 20}px`;
    customCursor.style.top = `${e.clientY - 10}px`;
  }
  if (!gdIcon || !eyesGroup) return;
  const rect = gdIcon.getBoundingClientRect();
  
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const deltaX = e.clientX - centerX;
  const deltaY = e.clientY - centerY;
  
  const maxMove = 8; 
  const angle = Math.atan2(deltaY, deltaX);
  const distance = Math.min(maxMove, Math.hypot(deltaX, deltaY) / 15);
  
  const moveX = Math.cos(angle) * distance;
  const moveY = Math.sin(angle) * distance;
  
  eyesGroup.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

let activeEye: HTMLElement | null = null;
let isSleeping = false;
let isPetMode = false;
let petPoints = 0;
let lastMouseX = 0;
let petTimeout: any = null;

function spawnZzz() {
  if (!isSleeping || !gdIcon) return;
  const zzz = document.createElement('div');
  zzz.className = 'floating-zzz';
  zzz.textContent = 'z';
  const rect = gdIcon.getBoundingClientRect();
  zzz.style.left = `${rect.left + rect.width * 0.7 + (Math.random() * 20 - 10)}px`;
  zzz.style.top = `${rect.top + 30}px`;
  document.body.appendChild(zzz);
  setTimeout(() => zzz.remove(), 2000);
}

function spawnHeart(x: number, y: number) {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.textContent = '❤️';
  heart.style.left = `${x + (Math.random() * 40 - 20)}px`;
  heart.style.top = `${y + (Math.random() * 40 - 20)}px`;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 800);
}

// Blink one eye on click (or pointerdown for mobile consistency)
gdIcon?.addEventListener('pointerdown', () => {
  if (isSleeping) return; // Don't do a manual blink if we are about to wake up
  activeEye = Math.random() > 0.5 ? eyeLeft : eyeRight;
  if(activeEye) activeEye.style.transform = 'scaleY(0.1)';
});

window.addEventListener('mouseup', () => {
  if (activeEye) {
    activeEye.style.transform = 'scaleY(1)';
    activeEye = null;
  }
});

// Occasional auto-blink and sleep mechanic
setInterval(() => {
  if (isSleeping) return;

  // 10% chance to fall asleep
  if (Math.random() < 0.1) {
    isSleeping = true;
    if (eyeLeft) eyeLeft.style.transform = 'scaleY(0.1)';
    if (eyeRight) eyeRight.style.transform = 'scaleY(0.1)';
    gdIcon?.classList.add('sleeping');
    
    const zzzInterval = setInterval(() => {
      if (!isSleeping) clearInterval(zzzInterval);
      else spawnZzz();
    }, 800);
    return;
  }

  const randomEye = Math.random() > 0.5 ? eyeLeft : eyeRight;
  if (randomEye) {
    randomEye.style.transform = 'scaleY(0.1)';
    setTimeout(() => {
      if (!isSleeping) randomEye.style.transform = 'scaleY(1)';
    }, 150);
  }
}, 4000);

// --- Pop sound generator using Web Audio API ---
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
function playPop() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
  
  gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

// --- Floating numbers on click ---
let clickCount = 0;
document.addEventListener('pointerdown', (e) => {
  // Don't spawn numbers when clicking on color pickers
  if ((e.target as HTMLElement)?.tagName?.toLowerCase() === 'input') return;
  
  // Wake up if sleeping
  if (isSleeping) {
    isSleeping = false;
    gdIcon?.classList.remove('sleeping');
    if (eyeLeft) eyeLeft.style.transform = 'scaleY(1)';
    if (eyeRight) eyeRight.style.transform = 'scaleY(1)';
  }

  clickCount++;
  
  if (clickCount === 50 && !isPetMode) {
    isPetMode = true;
    document.body.classList.add('pet-mode');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Pat Pat Mode Unlocked! 🤚';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  playPop();
  
  const floater = document.createElement('div');
  floater.className = 'floating-number';
  floater.textContent = '+' + clickCount;
  
  floater.style.left = `${e.clientX}px`;
  floater.style.top = `${e.clientY}px`;
  
  document.body.appendChild(floater);
  
  setTimeout(() => {
    floater.remove();
  }, 800);
});

// Rubbing (Pat Pat) logic on gdIcon
gdIcon?.addEventListener('pointermove', (e) => {
  if (!isPetMode) return;
  const deltaX = Math.abs(e.clientX - lastMouseX);
  lastMouseX = e.clientX;
  
  // If the mouse moves more than 2px, it counts as a "pet"
  if (deltaX > 2) {
    petPoints += deltaX;
    if (petPoints > 50) { 
      // Is being happily pet
      customCursor.classList.add('petting');
      if (eyeLeft) eyeLeft.style.transform = 'scaleY(0.1)';
      if (eyeRight) eyeRight.style.transform = 'scaleY(0.1)';
      
      // Spawn random hearts while petting
      if (Math.random() < 0.1) {
        spawnHeart(e.clientX, e.clientY);
      }
      
      clearTimeout(petTimeout);
      petTimeout = setTimeout(() => {
        petPoints = 0;
        customCursor.classList.remove('petting');
        // Only open eyes if not sleeping
        if (!isSleeping && eyeLeft) eyeLeft.style.transform = 'scaleY(1)';
        if (!isSleeping && eyeRight) eyeRight.style.transform = 'scaleY(1)';
      }, 300);
    }
  }
});
