export const FOOTER_DISCLAIMER =
  'Free VIN Decoder is an independent, unofficial tool. It is not affiliated with, endorsed by, or connected to NHTSA, NICB, Carfax, or any vehicle manufacturer.';

export const MAKE_PAGES = [
  { slug: '/honda-vin-decoder', label: 'Honda', title: 'Honda VIN Decoder' },
  { slug: '/toyota-vin-decoder', label: 'Toyota', title: 'Toyota VIN Decoder' },
  { slug: '/ford-vin-decoder', label: 'Ford', title: 'Ford VIN Decoder' },
  { slug: '/chevrolet-vin-decoder', label: 'Chevrolet', title: 'Chevrolet VIN Decoder' },
  { slug: '/bmw-vin-decoder', label: 'BMW', title: 'BMW VIN Decoder' },
  { slug: '/mercedes-vin-decoder', label: 'Mercedes', title: 'Mercedes VIN Decoder' },
];

export const PLACEHOLDER_PAGES = [
  {
    path: '/recall-check',
    title: 'Open Safety Recall Check',
    description: 'Standalone recall lookup by make, model, and model year is coming soon.',
  },
  ...MAKE_PAGES.map((m) => ({
    path: m.slug,
    title: m.title,
    description: `Vehicle-specific VIN decoding guide for ${m.label} models is coming soon.`,
  })),
  {
    path: '/what-is-a-vin',
    title: 'What Is a VIN?',
    description: 'A complete guide to WMI, VDS, and VIS sections of a 17-character VIN is coming soon.',
  },
  {
    path: '/vin-decoder-vs-vehicle-history-report',
    title: 'VIN Decoder vs. Vehicle History Report',
    description: 'A side-by-side comparison of free factory spec decodes and paid history reports is coming soon.',
  },
  {
    path: '/about',
    title: 'About Free VIN Decoder',
    description: 'More information about this independent VIN lookup tool is coming soon.',
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Website feedback contact details are coming soon.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'Our full privacy policy and advertising cookie disclosures are coming soon.',
  },
  {
    path: '/terms',
    title: 'Terms of Use',
    description: 'Website terms of use are coming soon.',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions',
    description: 'Answers to common VIN lookup questions are coming soon.',
  },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderHeaderHtml(activePath = '') {
  const isMakeActive = MAKE_PAGES.some((m) => m.slug === activePath);

  return `<header class="site-header">
      <div class="container header-inner">
        <a href="/" class="brand">
          <span class="brand-mark" aria-hidden="true">VIN</span>
          <span class="brand-name">Free VIN Decoder</span>
        </a>

        <button
          id="mobile-nav-toggle"
          type="button"
          class="nav-toggle"
          aria-expanded="false"
          aria-controls="site-nav-menu"
          aria-label="Toggle navigation menu"
        >
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
        </button>

        <nav id="site-nav-menu" class="site-nav" aria-label="Main navigation">
          <ul class="nav-list">
            <li><a href="/" class="nav-link${activePath === '/' ? ' is-active' : ''}">Home</a></li>
            <li><a href="/#decoder" class="nav-link">VIN Decoder</a></li>
            <li><a href="/recall-check" class="nav-link${activePath === '/recall-check' ? ' is-active' : ''}">Recall Check</a></li>
            <li class="nav-dropdown">
              <button
                id="makes-dropdown-btn"
                type="button"
                class="nav-link nav-dropdown-toggle${isMakeActive ? ' is-active' : ''}"
                aria-expanded="false"
                aria-haspopup="true"
                aria-controls="makes-dropdown-menu"
              >
                <span>Makes</span>
                <svg class="dropdown-caret" viewBox="0 0 12 12" aria-hidden="true">
                  <path fill="currentColor" d="M2.5 4.25 6 7.75l3.5-3.5-.9-.9L6 5.95 3.4 3.35z" />
                </svg>
              </button>
              <ul id="makes-dropdown-menu" class="dropdown-menu">
                ${MAKE_PAGES.map(
                  (m) =>
                    `<li><a href="${m.slug}" class="dropdown-link${activePath === m.slug ? ' is-active' : ''}">${m.label}</a></li>`
                ).join('\n                ')}
              </ul>
            </li>
            <li><a href="/what-is-a-vin" class="nav-link${activePath === '/what-is-a-vin' ? ' is-active' : ''}">What is a VIN</a></li>
            <li><a href="/vin-decoder-vs-vehicle-history-report" class="nav-link${activePath === '/vin-decoder-vs-vehicle-history-report' ? ' is-active' : ''}">VIN vs History Report</a></li>
            <li><a href="/about" class="nav-link${activePath === '/about' ? ' is-active' : ''}">About</a></li>
            <li><a href="/contact" class="nav-link${activePath === '/contact' ? ' is-active' : ''}">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>`;
}

export function renderFooterHtml() {
  return `<footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col footer-about">
            <div class="footer-brand">
              <span class="brand-mark" aria-hidden="true">VIN</span>
              <span class="brand-name">Free VIN Decoder</span>
            </div>
            <p class="footer-copy">
              Instant, free vehicle specification lookups powered by public NHTSA vPIC records — no signup and no VIN storage.
            </p>
            <p class="footer-disclaimer-inline">
              ${FOOTER_DISCLAIMER}
            </p>
          </div>

          <div class="footer-col">
            <h3 class="footer-heading">Quick Links</h3>
            <ul class="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/#decoder">VIN Decoder</a></li>
              <li><a href="/recall-check">Recall Check</a></li>
              <li><a href="/what-is-a-vin">What is a VIN</a></li>
              <li><a href="/vin-decoder-vs-vehicle-history-report">VIN vs History Report</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h3 class="footer-heading">Popular Makes</h3>
            <ul class="footer-links">
              ${MAKE_PAGES.map((m) => `<li><a href="${m.slug}">${m.label}</a></li>`).join('\n              ')}
            </ul>
          </div>

          <div class="footer-col">
            <h3 class="footer-heading">Legal</h3>
            <ul class="footer-links">
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/faq">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">&copy; 2026 Free VIN Decoder</p>
          <p class="footer-disclaimer">${FOOTER_DISCLAIMER}</p>
        </div>
      </div>
    </footer>`;
}

export function renderPlaceholderPage(page) {
  const safeTitle = escapeHtml(page.title);
  const safeDesc = escapeHtml(page.description);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle} — Free VIN Decoder</title>
    <meta name="description" content="${safeDesc}" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    ${renderHeaderHtml(page.path)}

    <main class="container main-content">
      <section class="placeholder-card">
        <span class="coming-soon-badge">Coming Soon</span>
        <h1>${safeTitle}</h1>
        <p class="placeholder-copy">${safeDesc}</p>
        <p class="placeholder-note">
          This page is a temporary placeholder while the full guide is being built. You can decode any VIN for free on our main lookup tool right now.
        </p>
        <div class="placeholder-actions">
          <a href="/#decoder" class="btn-primary placeholder-cta">Go to VIN Decoder</a>
        </div>
      </section>
    </main>

    ${renderFooterHtml()}

    <script src="/site-nav.js" defer></script>
  </body>
</html>
`;
}

