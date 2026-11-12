export const ASSET_VERSION = '20261112-2';

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

export function escapeHtml(str) {
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

export function renderDocumentLayout({
  activePath = '',
  title,
  description,
  mainHtml,
  extraScripts = [],
}) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const scriptsHtml = [
    `<script src="/site-nav.js?v=${ASSET_VERSION}" defer></script>`,
    ...extraScripts.map((src) => `<script src="${src}?v=${ASSET_VERSION}" defer></script>`),
  ].join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <link rel="stylesheet" href="/styles.css?v=${ASSET_VERSION}" />
  </head>
  <body>
    ${renderHeaderHtml(activePath)}

    <main class="container main-content">
      ${mainHtml}
    </main>

    ${renderFooterHtml()}

    ${scriptsHtml}
  </body>
</html>
`;
}

export function renderStandardDecoderCardHtml({ heading = 'Free 17-Character VIN Decoder', subtitle } = {}) {
  const safeHeading = escapeHtml(heading);
  const safeSubtitle = escapeHtml(
    subtitle ||
      'Decode any VIN to identify the vehicle, verify its model year, and review factory specifications including body class, engine details, and assembly plant information.'
  );

  return `<section id="decoder" class="hero-card" aria-labelledby="hero-title">
        <div class="hero-copy">
          <h2 id="hero-title">${safeHeading}</h2>
          <p class="hero-subtitle">${safeSubtitle}</p>
        </div>

        <div class="decoder-layout">
          <form id="vin-form" class="vin-form" novalidate>
            <div class="form-rows">
              <div class="form-row">
                <label for="vin-input" class="form-label">VIN</label>
                <div class="form-control-col">
                  <input
                    id="vin-input"
                    name="vin"
                    type="text"
                    maxlength="17"
                    inputmode="text"
                    autocomplete="off"
                    autocapitalize="characters"
                    spellcheck="false"
                    placeholder="Enter Your VIN Number"
                    aria-describedby="vin-help vin-error"
                  />
                  <p id="vin-help" class="field-help">Partial VINs are also accepted</p>
                </div>
              </div>

              <div class="form-row">
                <label for="model-year-input" class="form-label">Model Year</label>
                <div class="form-control-col">
                  <input
                    id="model-year-input"
                    name="modelyear"
                    type="number"
                    inputmode="numeric"
                    placeholder="Vehicle's Model Year"
                    aria-describedby="model-year-help vin-error"
                  />
                  <p id="model-year-help" class="field-help">If entered the year from VIN will be ignored</p>
                </div>
              </div>

              <div class="form-actions-row">
                <span class="form-label-spacer" aria-hidden="true"></span>
                <div class="form-actions-wrap">
                  <div class="form-actions-col">
                    <button id="decode-btn" type="submit" class="btn-primary btn-decode">
                      <span class="btn-spinner" aria-hidden="true"></span>
                      <span class="btn-label">Decode VIN</span>
                    </button>
                    <a
                      id="cvs-btn"
                      class="btn-info btn-cvs"
                      href="https://vpic.nhtsa.dot.gov/decoder/CaVehSpec?year=2026"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg class="maple-leaf-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                          fill="currentColor"
                          d="M12 1.5l-1.9 4.1-2.5-.9.9 3.6-3.7-.7 1 2-2.8 1.2 4.3 3.4-.7 1.8 4.4-.5-.2 4.8h2.4l-.2-4.8 4.4.5-.7-1.8 4.3-3.4-2.8-1.2 1-2-3.7.7.9-3.6-2.5.9z"
                        />
                      </svg>
                      <span>Canadian Vehicle Specifications</span>
                    </a>
                  </div>
                  <div class="example-row">
                    <button id="example-vin-btn" type="button" class="example-link">
                      Try example VIN: <code>1HGCM82633A004352</code>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="vin-error" class="alert alert-error" role="alert" hidden></div>

            <div id="loading-panel" class="loading-panel" role="status" aria-live="polite" hidden>
              <div class="loading-top">
                <span class="loading-status">
                  <span class="inline-spinner" aria-hidden="true"></span>
                  <span>Fetching factory specs from vehicle records…</span>
                </span>
                <span id="elapsed-counter" class="elapsed-counter">0.0s</span>
              </div>
              <div class="progress-track" aria-hidden="true">
                <div id="progress-fill" class="progress-fill"></div>
              </div>
              <p id="progress-caption" class="progress-caption">Estimated progress: 0%</p>
            </div>
          </form>

          <aside class="decoder-side-note" aria-label="VIN Check Digit Reference">
            Please refer to page 16 of the
            <a
              href="https://vpic.nhtsa.dot.gov/documents/ManufacturerHandbook.pdf?d=20261015"
              target="_blank"
              rel="noopener noreferrer"
            >New&nbsp;Manufacturer's&nbsp;Handbook</a>
            for specific instructions and/or
            <a
              href="https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565"
              target="_blank"
              rel="noopener noreferrer"
            >CFR&nbsp;49&nbsp;Part&nbsp;565</a>
            for questions regarding the calculation of the VIN Check Digit at position 9.
          </aside>
        </div>
      </section>

      <section id="results-section" class="results-stack" aria-labelledby="results-heading" hidden>
        <div class="nhtsa-card">
          <div class="nhtsa-card-header results-panel-header">
            <div class="results-title-wrap">
              <img id="make-logo" class="make-logo" alt="" hidden />
              <h2 id="results-heading" class="results-heading"></h2>
            </div>
            <button id="export-pdf-btn" type="button" class="btn-export-pdf d-print-none">Export to PDF</button>
          </div>

          <div class="nhtsa-card-body">
            <div id="error-status-banner" class="status-banner status-success" role="status">
              <svg id="status-icon-success" class="status-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4Z"
                />
              </svg>
              <svg id="status-icon-warning" class="status-icon" viewBox="0 0 24 24" aria-hidden="true" hidden>
                <path
                  fill="currentColor"
                  d="M12 2 1 21h22Zm1 15h-2v-2h2Zm0-4h-2V9h2Z"
                />
              </svg>
              <div>
                <strong>Error Text:</strong>
                <span id="error-status-text"></span>
              </div>
            </div>

            <div id="model-year-status" class="alert" role="status" hidden></div>

            <div class="mfg-grid">
              <div class="mfg-details">
                <p class="detail-line"><strong>Manufacturer:</strong> <span id="val-manufacturer"></span></p>
                <p class="detail-line"><strong>DBAs:</strong> <span id="val-dbas"></span></p>
                <p class="detail-line"><strong>Vehicle Type:</strong> <span id="val-vehicle-type"></span></p>
                <p class="detail-line"><strong>Model Year:</strong> <span id="val-model-year"></span></p>
                <p class="detail-line"><strong>Make:</strong> <span id="val-make"></span></p>
                <p class="detail-line"><strong>Model:</strong> <span id="val-model"></span></p>
                <p class="detail-line"><strong>Body Class:</strong> <span id="val-body-class"></span></p>

                <div class="show-details-wrap d-print-none">
                  <button
                    id="toggle-all-details-btn"
                    type="button"
                    class="btn-outline-blue"
                    aria-expanded="false"
                    aria-controls="all-details-card"
                  >
                    Show All Vehicle Details
                  </button>
                </div>
              </div>

              <div class="mfg-image-col">
                <img id="vehicle-drawing" class="vehicle-drawing" alt="Vehicle body class illustration" hidden />
              </div>
            </div>
          </div>
        </div>

        <div id="other-info-card" class="nhtsa-card">
          <div class="nhtsa-card-header">
            <h3 class="card-section-title">Other Information</h3>
          </div>
          <div class="nhtsa-card-body">
            <p class="other-info-lead">
              Information provided below is based on the details reported by the manufacturer of this vehicle in public 49 CFR Part 565 records.
            </p>

            <div id="other-info-grid" class="other-info-grid"></div>

            <hr class="section-divider" />

            <div class="airbags-block">
              <strong class="airbags-heading">Airbags:</strong>
              <ul id="airbags-list" class="airbags-list"></ul>
            </div>

            <hr class="section-divider" />

            <p class="plant-line">
              <strong>Plant Information:</strong>
              <span id="val-plant-info"></span>
            </p>
          </div>
        </div>

        <div id="all-details-card" class="nhtsa-card d-print-none" hidden>
          <div class="nhtsa-card-header results-panel-header">
            <h3 class="card-section-title">All Vehicle Details</h3>
            <button id="back-to-summary-btn" type="button" class="btn-outline-blue">Back to Summary</button>
          </div>
          <div class="nhtsa-card-body">
            <p class="other-info-lead">
              NOTE: Any missing decoded values indicate no data was reported for that specific variable. Missing values should NOT be interpreted as an indication that a feature or technology is unavailable for a vehicle.
            </p>

            <div class="dt-toolbar">
              <label class="dt-length">
                Show
                <select id="dt-page-size">
                  <option value="10" selected>10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                entries
              </label>

              <label class="dt-search">
                Search:
                <input id="dt-search-input" type="search" placeholder="Filter fields..." />
              </label>
            </div>

            <div class="dt-table-wrap">
              <table class="dt-table">
                <thead>
                  <tr>
                    <th scope="col">Group Name</th>
                    <th scope="col">Element</th>
                    <th scope="col">Value</th>
                  </tr>
                </thead>
                <tbody id="all-details-tbody"></tbody>
              </table>
            </div>

            <div class="dt-footer">
              <div id="dt-info" class="dt-info"></div>
              <div id="dt-pagination" class="dt-pagination" role="navigation" aria-label="Vehicle details pagination"></div>
            </div>
          </div>
        </div>

        <div id="recalls-section" class="nhtsa-card d-print-none" hidden>
          <div class="nhtsa-card-header results-panel-header">
            <h3 class="card-section-title">Open Safety Recalls</h3>
            <a id="recall-page-link" href="/recall-check" class="btn-outline-blue btn-link-compact">Standalone Recall Check</a>
          </div>
          <div class="nhtsa-card-body">
            <div id="recalls-body"></div>
          </div>
        </div>
      </section>`;
}
