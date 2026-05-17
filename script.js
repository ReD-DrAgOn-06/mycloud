/* ============================================
   MYCLOUD — MAIN SCRIPT
   ============================================ */

// ---- AUTH CONFIG ----
const VALID_USERNAME = 'I';
const VALID_PASSWORD = 'idk0o0';
const SESSION_KEY = 'mycloud_session';
const FILES_KEY = 'mycloud_files';

// ---- CURRENT PAGE ----
const page = document.body.className;

// ============================================
// PARTICLES (Login page)
// ============================================
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    opacity: Math.random() * 0.5 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 245, 255, ${p.opacity})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${0.06 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
}

// ============================================
// AUTH
// ============================================
function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  const errEl = document.getElementById('error-msg');

  if (user === VALID_USERNAME && pass === VALID_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, loginTime: Date.now() }));
    errEl.textContent = '';
    document.querySelector('.login-btn .btn-text').textContent = 'ACCESS GRANTED ✓';
    document.querySelector('.login-btn').style.borderColor = '#00f5c4';
    document.querySelector('.login-btn').style.color = '#00f5c4';
    setTimeout(() => window.location.href = 'home.html', 700);
  } else {
    errEl.textContent = '⚠ INVALID CREDENTIALS — ACCESS DENIED';
    document.querySelector('.login-card').style.animation = 'none';
    setTimeout(() => {
      errEl.style.animation = 'glitch 0.3s ease';
    }, 10);
  }
}

function checkAuth() {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

// ============================================
// SESSION TIMER (Home page)
// ============================================
function startSessionTimer() {
  const el = document.getElementById('session-time');
  if (!el) return;
  const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  const start = session.loginTime || Date.now();
  setInterval(() => {
    const diff = Math.floor((Date.now() - start) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

function goToCloud() {
  window.location.href = 'cloud.html';
}

// ============================================
// FILE STORAGE (localStorage)
// ============================================
function getFiles() {
  try {
    return JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
  } catch { return []; }
}

function saveFiles(files) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

// ============================================
// CLOUD PAGE — FILE ICONS
// ============================================
const FILE_ICONS = {
  image: '🖼',
  video: '🎬',
  pdf: '📄',
  doc: '📝',
  other: '📦'
};

const FILE_COLORS = {
  image: '#00f5ff',
  video: '#7b2fff',
  pdf: '#ff2f7b',
  doc: '#2f8fff',
  other: '#aaa'
};

// ============================================
// CLOUD PAGE — ADD MEGA LINK
// ============================================
function addMegaLink() {
  const link = document.getElementById('megaLink').value.trim();
  const name = document.getElementById('fileName').value.trim();
  const type = document.getElementById('fileType').value;

  if (!link) { showToast('⚠ Please enter a MEGA link'); return; }
  if (!link.startsWith('https://mega.nz')) { showToast('⚠ Link must be a mega.nz URL'); return; }

  const files = getFiles();
  files.unshift({
    id: Date.now(),
    name: name || 'Unnamed File',
    link,
    type,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  });
  saveFiles(files);

  document.getElementById('megaLink').value = '';
  document.getElementById('fileName').value = '';
  renderFiles('all');
  showToast('✓ FILE ADDED SUCCESSFULLY');
}

// ============================================
// CLOUD PAGE — HANDLE FILE SELECT (local preview)
// ============================================
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  const container = document.getElementById('selectedFiles');
  container.innerHTML = '';

  files.forEach(file => {
    const tag = document.createElement('div');
    tag.className = 'selected-file-tag';
    const ext = file.name.split('.').pop().toLowerCase();
    const icon = ['jpg','jpeg','png','gif','webp','svg'].includes(ext) ? '🖼' :
                 ['mp4','mov','avi','mkv'].includes(ext) ? '🎬' :
                 ext === 'pdf' ? '📄' :
                 ['doc','docx'].includes(ext) ? '📝' : '📦';
    tag.innerHTML = `<span>${icon}</span><span>${file.name.length > 24 ? file.name.slice(0, 22) + '…' : file.name}</span><span class="remove" onclick="this.parentElement.remove()">×</span>`;
    container.appendChild(tag);
  });

  if (files.length > 0) {
    showToast(`${files.length} file(s) selected — upload to MEGA and paste the share link below`);
  }
}

// ============================================
// CLOUD PAGE — RENDER FILES
// ============================================
function renderFiles(filter = 'all') {
  const grid = document.getElementById('filesGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  const files = getFiles();
  const filtered = filter === 'all' ? files : files.filter(f => f.type === filter);

  // Clear non-empty cards
  Array.from(grid.children).forEach(c => { if (!c.id) c.remove(); });

  if (filtered.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  filtered.forEach((file, i) => {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.setAttribute('data-type', file.type);
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <span class="file-icon-big">${FILE_ICONS[file.type] || '📦'}</span>
      <div class="file-name">${escHtml(file.name)}</div>
      <div class="file-meta">${file.type.toUpperCase()} · ${file.date}</div>
      <div class="file-actions">
        <a class="file-btn download" href="${escHtml(file.link)}" target="_blank" rel="noopener">⬇ OPEN</a>
        <button class="file-btn delete" onclick="deleteFile(${file.id})">✕</button>
      </div>
    `;
    grid.insertBefore(card, empty);
  });
}

function deleteFile(id) {
  const files = getFiles().filter(f => f.id !== id);
  saveFiles(files);
  renderFiles(currentFilter);
  showToast('FILE REMOVED');
}

let currentFilter = 'all';

function filterFiles(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderFiles(type);
}

// ============================================
// DRAG & DROP
// ============================================
function initDragDrop() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      document.getElementById('fileInput').files = dt.files;
      handleFileSelect({ target: { files } });
    }
  });
}

// ============================================
// TOAST
// ============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================
// HELPERS
// ============================================
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (page === 'login-page') {
    initParticles();
    // Redirect if already logged in
    if (sessionStorage.getItem(SESSION_KEY)) {
      window.location.href = 'home.html';
    }
  }

  if (page === 'home-page') {
    if (!checkAuth()) return;
    startSessionTimer();
  }

  if (page === 'cloud-page') {
    if (!checkAuth()) return;
    renderFiles('all');
    initDragDrop();
  }
});
