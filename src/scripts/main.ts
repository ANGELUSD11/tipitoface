const root = document.documentElement;
const primaryInput = document.getElementById('primary-color');
const secondaryInput = document.getElementById('secondary-color');
const gdIcon = document.getElementById('gd-icon');
const eyeLeft = document.getElementById('eye-left');
const eyeRight = document.getElementById('eye-right');
const eyesGroup = document.getElementById('eyes');
const boxInput = document.getElementById('box-color');

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

// Eyes follow the cursor
document.addEventListener('mousemove', (e) => {
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

// Blink one eye on click
gdIcon?.addEventListener('mousedown', () => {
  activeEye = Math.random() > 0.5 ? eyeLeft : eyeRight;
  if(activeEye) activeEye.style.transform = 'scaleY(0.1)';
});

window.addEventListener('mouseup', () => {
  if (activeEye) {
    activeEye.style.transform = 'scaleY(1)';
    activeEye = null;
  }
});

// Occasional auto-blink
setInterval(() => {
  const randomEye = Math.random() > 0.5 ? eyeLeft : eyeRight;
  if (randomEye) {
    randomEye.style.transform = 'scaleY(0.1)';
    setTimeout(() => {
      randomEye.style.transform = 'scaleY(1)';
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
  
  clickCount++;
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
