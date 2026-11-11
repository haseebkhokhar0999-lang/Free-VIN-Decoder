const mobileToggle = document.getElementById('mobile-nav-toggle');
const navMenu = document.getElementById('site-nav-menu');
const makesBtn = document.getElementById('makes-dropdown-btn');
const makesMenu = document.getElementById('makes-dropdown-menu');

function closeMakesDropdown() {
  if (!makesBtn || !makesMenu) return;
  makesBtn.setAttribute('aria-expanded', 'false');
  makesMenu.classList.remove('is-open');
}

function closeMobileNav() {
  if (!mobileToggle || !navMenu) return;
  mobileToggle.setAttribute('aria-expanded', 'false');
  navMenu.classList.remove('is-open');
  closeMakesDropdown();
}

if (mobileToggle && navMenu) {
  mobileToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) {
      closeMakesDropdown();
    }
  });
}

if (makesBtn && makesMenu) {
  makesBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = makesMenu.classList.toggle('is-open');
    makesBtn.setAttribute('aria-expanded', String(isOpen));
  });
}

document.addEventListener('click', (event) => {
  if (makesBtn && makesMenu && !makesBtn.contains(event.target) && !makesMenu.contains(event.target)) {
    closeMakesDropdown();
  }
  if (
    mobileToggle &&
    navMenu &&
    navMenu.classList.contains('is-open') &&
    !navMenu.contains(event.target) &&
    !mobileToggle.contains(event.target)
  ) {
    closeMobileNav();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileNav();
  }
});

if (navMenu) {
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });
}

