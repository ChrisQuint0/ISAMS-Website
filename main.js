/**
 * ISAMS Website — main.js
 * Handles module switching, hero text animation, and the contributors modal.
 */

/* ============================================================
   Module Data
============================================================ */
const MODULE_DATA = {
  home: {
    title: 'Integrated Smart Academic Management System',
    sub: 'The all-in-one operations hub for PLP-CCS. ISAMS brings order and integrity to college administration, ensuring every requirement and milestone is tracked and accessible.',
    screenshotId: 'ss-home',
    windowTitle: 'ISAMS — Dashboard',
  },
  thesis: {
    title: 'Thesis Archiving and Management',
    sub: 'A secure, structured repository for academic research. Easily store, organize, and retrieve thesis documents, ensuring student contributions are preserved and accessible.',
    screenshotId: 'ss-thesis',
    windowTitle: 'ISAMS — Thesis / HTE Archiving',
  },
  faculty: {
    title: 'Faculty Requirement Tracking',
    sub: 'Simplify administrative compliance by digitizing the submission and review of faculty requirements. Automated tracking ensures all documentation is collected promptly and securely.',
    screenshotId: 'ss-faculty',
    windowTitle: 'ISAMS — Faculty Requirement Submission',
  },
  violations: {
    title: 'Class and Student Management',
    sub: 'Maintain up-to-date class lists, track student violations, and monitor academic standing in one unified system — disciplinary and academic tracking made straightforward.',
    screenshotId: 'ss-violations',
    windowTitle: 'ISAMS — Student Violation Management',
  },
  lab: {
    title: 'Laboratory Time Monitoring',
    sub: 'Optimize campus facilities with precise tracking of laboratory schedules and utilization, ensuring fair access to resources and strict oversight of equipment.',
    screenshotId: 'ss-lab',
    windowTitle: 'ISAMS — Laboratory Management',
  },
};

/* ============================================================
   DOM refs
============================================================ */
const heroEl = document.getElementById('hero-dynamic');
const heroTitle = document.getElementById('hero-title');
const heroSub = document.getElementById('hero-sub');
const windowTitle = document.getElementById('window-title-text');
const windowMain = document.querySelector('.window-body');

// All bento buttons (home + cards)
const bentoHome = document.getElementById('bento-home');
const bentoCards = document.querySelectorAll('.bento-card');
const allBentobtns = [bentoHome, ...bentoCards];

// Screenshots
const screenshots = document.querySelectorAll('.window-screenshot');

// Modal
const modalBackdrop = document.getElementById('modal-contributors');
const btnContrib = document.getElementById('btn-contributors');
const btnClose = document.getElementById('btn-modal-close');

/* ============================================================
   State
============================================================ */
let currentModule = 'home';
let switching = false;

// Auto-scroll state
let isScrollPaused   = false;
let scrollDir        = 1;   // 1 = right, -1 = left
const scrollSpeed    = 0.4; // pixels per frame
let preciseScrollLeft = 0;   // track position precisely to avoid rounding issues

/* ============================================================
   Module Switch Logic
============================================================ */
function getScreenshot(id) {
  return document.getElementById(id);
}

function switchModule(key) {
  if (key === currentModule || switching) return;
  switching = true;

  const data = MODULE_DATA[key];
  if (!data) { switching = false; return; }

  // 1. Fade out hero text
  heroEl.classList.add('fade-out');

  // 2. Cross-fade screenshots
  const oldSS = getScreenshot(MODULE_DATA[currentModule].screenshotId);
  const newSS = getScreenshot(data.screenshotId);

  oldSS.classList.remove('visible');
  newSS.classList.add('visible');

  // 3. After text fade-out, update content and fade back in
  setTimeout(() => {
    // Update text (plain text — no line breaks)
    heroTitle.textContent = data.title;
    heroSub.textContent = data.sub;
    windowTitle.textContent = data.windowTitle;

    heroEl.classList.remove('fade-out');
    heroEl.classList.add('fade-in');

    setTimeout(() => {
      heroEl.classList.remove('fade-in');
      switching = false;
    }, 260);
  }, 220);

  // 4. Update active states
  currentModule = key;

  // 5. Reset auto-scroll to the start for the new screenshot
  preciseScrollLeft = 0;
  if (windowMain) windowMain.scrollLeft = 0;
  scrollDir = 1;

  // Home button
  if (key === 'home') {
    bentoHome.classList.add('active');
    bentoHome.setAttribute('aria-pressed', 'true');
  } else {
    bentoHome.classList.remove('active');
    bentoHome.setAttribute('aria-pressed', 'false');
  }

  // Module cards
  bentoCards.forEach((card) => {
    const isActive = card.dataset.module === key;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/* ============================================================
   Auto-scroll Animation
============================================================ */
function initAutoScroll() {
  if (!windowMain) return;

  function step() {
    if (!isScrollPaused) {
      const maxScroll = windowMain.scrollWidth - windowMain.clientWidth;

      if (maxScroll > 0) {
        // Update the high-precision position tracker
        preciseScrollLeft += scrollDir * scrollSpeed;

        // Reverse direction if we hit the edges
        if (preciseScrollLeft >= maxScroll && scrollDir === 1) {
          preciseScrollLeft = maxScroll;
          scrollDir = -1;
        } else if (preciseScrollLeft <= 0 && scrollDir === -1) {
          preciseScrollLeft = 0;
          scrollDir = 1;
        }

        // Apply to the element (browser will handle rounding/clamping automatically)
        windowMain.scrollLeft = preciseScrollLeft;
      }
    } else {
      // Sync the precise tracker if the user scrolled manually
      preciseScrollLeft = windowMain.scrollLeft;
    }
    requestAnimationFrame(step);
  }

  // Event listeners to handle pausing
  windowMain.addEventListener('mouseenter', () => { isScrollPaused = true; });
  windowMain.addEventListener('mouseleave', () => { isScrollPaused = false; });
  windowMain.addEventListener('touchstart', () => { isScrollPaused = true; }, { passive: true });
  windowMain.addEventListener('touchend', () => { isScrollPaused = false; });

  // Kick off the animation
  requestAnimationFrame(step);
}

/* ============================================================
   Button Event Listeners
============================================================ */
// Home button
bentoHome.addEventListener('click', () => switchModule('home'));

// Module cards
bentoCards.forEach((card) => {
  card.addEventListener('click', () => switchModule(card.dataset.module));
});

/* ============================================================
   Contributors Modal
============================================================ */
function openModal() {
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  btnClose.focus();
  // Lock scroll
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  btnContrib.focus();
}

btnContrib.addEventListener('click', openModal);
btnClose.addEventListener('click', closeModal);

// Close on backdrop click (outside modal panel)
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
    closeModal();
  }
});

/* ============================================================
   Initial setup — ensure hero text matches default state
============================================================ */
(function init() {
  const data = MODULE_DATA['home'];
  heroTitle.textContent = data.title;
  heroSub.textContent = data.sub;
  windowTitle.textContent = data.windowTitle;

  // Set aria-hidden on modal initially
  modalBackdrop.setAttribute('aria-hidden', 'true');

  // Start the auto-scroll loop
  initAutoScroll();
})();
