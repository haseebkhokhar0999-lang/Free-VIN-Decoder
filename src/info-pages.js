import { escapeHtml, FOOTER_DISCLAIMER, renderDocumentLayout } from './pages.js';

function renderRecallCheckPage() {
  const mainHtml = `
      <section class="page-hero" aria-labelledby="page-hero-title">
        <h1 id="page-hero-title" class="page-hero-title">Open Safety Recall Check</h1>
        <p class="page-hero-subtitle">
          Search public NHTSA vehicle recall campaigns by make, model, and model year — free with no signup.
        </p>
      </section>

      <section class="hero-card" aria-labelledby="recall-form-title">
        <div class="hero-copy">
          <h2 id="recall-form-title">Check Vehicle Recalls by Make, Model &amp; Year</h2>
          <p class="hero-subtitle">
            Enter a vehicle’s make, model, and 4-digit model year to query the NHTSA Recalls API for campaign numbers, affected components, summaries, and remedies.
          </p>
        </div>

        <form id="recall-form" class="vin-form" novalidate>
          <div class="recall-form-grid">
            <div class="field-stack">
              <label for="recall-make" class="field-label">Make</label>
              <input
                id="recall-make"
                name="make"
                type="text"
                class="text-input"
                placeholder="e.g. Honda"
                autocomplete="off"
              />
            </div>

            <div class="field-stack">
              <label for="recall-model" class="field-label">Model</label>
              <input
                id="recall-model"
                name="model"
                type="text"
                class="text-input"
                placeholder="e.g. Accord"
                autocomplete="off"
              />
            </div>

            <div class="field-stack">
              <label for="recall-year" class="field-label">Model Year</label>
              <input
                id="recall-year"
                name="modelYear"
                type="number"
                inputmode="numeric"
                class="text-input"
                placeholder="e.g. 2003"
                min="1900"
                max="2099"
              />
            </div>
          </div>

          <div class="recall-actions-row">
            <button id="recall-submit-btn" type="submit" class="btn-primary">
              <span class="btn-spinner" aria-hidden="true"></span>
              <span class="btn-label">Check Recalls</span>
            </button>
            <button id="recall-example-btn" type="button" class="example-link">
              Try example: 2003 Honda Accord
            </button>
          </div>

          <div id="recall-error" class="alert alert-error" role="alert" hidden></div>

          <div id="recall-loading" class="loading-panel" role="status" aria-live="polite" hidden>
            <div class="loading-top">
              <span class="loading-status">
                <span class="inline-spinner" aria-hidden="true"></span>
                <span>Checking NHTSA safety recall records…</span>
              </span>
              <span id="recall-elapsed" class="elapsed-counter">0.0s</span>
            </div>
            <div class="progress-track" aria-hidden="true">
              <div id="recall-progress" class="progress-fill"></div>
            </div>
          </div>
        </form>
      </section>

      <section id="recall-results-card" class="nhtsa-card" aria-labelledby="recall-results-heading" hidden>
        <div class="nhtsa-card-header results-panel-header">
          <h2 id="recall-results-heading" class="card-section-title">Recall Results</h2>
          <a href="/#decoder" class="btn-outline-blue btn-link-compact">Decode a VIN</a>
        </div>
        <div class="nhtsa-card-body">
          <div id="recall-results-body"></div>
        </div>
      </section>

      <section class="content-card" aria-label="Recall Lookup Notes">
        <h2>About Vehicle Safety Recall Checks</h2>
        <p>
          Results on this page come from the public NHTSA Recalls API by make, model, and model year. A vehicle-level match shows campaigns issued for that model line, not whether a repair has already been completed on a specific car.
        </p>
        <p>
          Only unrepaired recalls remain open for an individual vehicle, and recalls older than 15 years may not appear in recall API results. To check whether a specific 17-character VIN still has unrepaired open recalls, visit the
          <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">NHTSA Recalls VIN Lookup (nhtsa.gov)</a>. This site does not replace NHTSA’s VIN-level recall check.
        </p>
      </section>`;

  return renderDocumentLayout({
    activePath: '/recall-check',
    title: 'Open Safety Recall Check — Free VIN Decoder',
    description:
      'Look up open vehicle safety recalls for free by make, model, and model year using the NHTSA Recalls API.',
    mainHtml,
    extraScripts: ['/recalls-ui.js', '/recall-check.js'],
  });
}

function renderAboutPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>About Free VIN Decoder</h1>
        <p>
          Free VIN Decoder is a lightweight lookup tool built to make checking factory vehicle specifications and vehicle-level safety recalls fast, transparent, and completely free. Paste a 17-character or partial VIN to view manufacturer-reported vehicle specs without creating an account, entering an email address, or hitting a paywall.
        </p>

        <h2>Public NHTSA Data Sources</h2>
        <p>
          All decoded vehicle specifications are retrieved directly from the public National Highway Traffic Safety Administration (NHTSA) Product Information Catalog and Vehicle Listing (vPIC) API. Open safety recall listings are queried from the public NHTSA Recalls API.
        </p>

        <h2>Independent, Unofficial Tool</h2>
        <p>
          ${escapeHtml(FOOTER_DISCLAIMER)}
        </p>

        <h2>What This Tool Covers — and What It Does Not</h2>
        <p>
          A VIN decode returns original factory-built attributes (make, model, model year, trim, body class, engine, fuel type, transmission, drive type, restraint info, and assembly plant). It does <strong>not</strong> include accident history, salvage or flood title brands, odometer readings, theft records, liens, or prior ownership records. For those checks, read our <a href="/vin-decoder-vs-vehicle-history-report">VIN Decoder vs. Vehicle History Report</a> guide.
        </p>

        <h2>Website Feedback</h2>
        <p>
          Spotted a display bug or broken link? Let us know through our <a href="/contact">Contact page</a>.
        </p>
      </section>`;

  return renderDocumentLayout({
    activePath: '/about',
    title: 'About — Free VIN Decoder',
    description: 'Learn how Free VIN Decoder works, our public NHTSA vPIC data source, and our non-affiliation notice.',
    mainHtml,
  });
}

function renderContactPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>Contact Us</h1>
        <p>
          Have feedback about the website, spotted a technical issue, or want to suggest a helpful improvement? Send us a message using the form below.
        </p>

        <div class="callout-box callout-note">
          <strong>Website Feedback Only:</strong> Please use this form only for website questions, bug reports, or general feedback. We cannot investigate vehicle disputes, verify title or mileage history, or modify manufacturer recall records.
        </div>

        <form id="contact-form" class="contact-form" novalidate>
          <div class="field-stack">
            <label for="contact-name" class="field-label">Name</label>
            <input id="contact-name" name="name" type="text" class="text-input" placeholder="Your name" required />
          </div>

          <div class="field-stack">
            <label for="contact-email" class="field-label">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              class="text-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div class="field-stack">
            <label for="contact-message" class="field-label">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              class="text-input text-area"
              placeholder="Share your feedback about the site..."
              required
            ></textarea>
          </div>

          <div>
            <button id="contact-submit-btn" type="submit" class="btn-primary">Send Feedback</button>
          </div>

          <div id="contact-status" class="alert" role="status" hidden></div>
        </form>

        <h2>Government &amp; Industry Vehicle Lookup Resources</h2>
        <ul class="guide-list">
          <li>
            <strong>NHTSA VIN Recall Lookup:</strong> Check unrepaired recalls on a specific VIN at
            <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">NHTSA.gov/recalls</a>.
          </li>
          <li>
            <strong>Theft &amp; Total-Loss Check:</strong> Run a free VINCheck search (up to 5 searches per IP per 24 hours) directly at
            <a href="https://www.nicb.org/vincheck" target="_blank" rel="noopener noreferrer">NICB.org/vincheck</a>.
          </li>
        </ul>
      </section>`;

  return renderDocumentLayout({
    activePath: '/contact',
    title: 'Contact — Free VIN Decoder',
    description: 'Send website feedback to Free VIN Decoder or find NHTSA and NICB vehicle lookup resources.',
    mainHtml,
    extraScripts: ['/contact.js'],
  });
}

function renderPrivacyPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>Privacy Policy</h1>
        <p class="muted-note">Effective date: November 2026</p>
        <p>
          Free VIN Decoder is committed to protecting your privacy while keeping vehicle specification lookups free and fast.
        </p>

        <h2>VIN Inputs Are Never Stored</h2>
        <p>
          Any VIN, model year, make, or model you enter into our lookup tools stays stateless: it is used strictly in real time to query public NHTSA APIs and display the response back to your browser. <strong>Entered VINs are never saved in a database, never tied to a user account, and never sold or shared for marketing.</strong> API lookup responses are served with <code>Cache-Control: no-store</code>.
        </p>

        <h2>Google AdSense &amp; Advertising Cookies</h2>
        <p>
          To keep this tool free without signups or paywalls, this website may display ads served by Google AdSense and its partners.
        </p>
        <ul class="guide-list">
          <li>
            Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites.
          </li>
          <li>
            Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.
          </li>
          <li>
            Users may opt out of personalised advertising by visiting
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings (google.com/settings/ads)</a>.
          </li>
          <li>
            You can also opt out of some third-party vendors’ uses of cookies for personalized advertising by visiting
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info/choices</a>
            or adjusting cookie controls in your web browser.
          </li>
        </ul>
        <p>
          Advertising cookies are managed directly by Google and third-party ad networks—they do not receive or store the VINs you look up on this site.
        </p>

        <h2>External Links</h2>
        <p>
          Our pages link to public government and automotive safety resources (such as NHTSA.gov, eCFR, and NICB). Once you leave our site, the privacy practices of those third-party websites apply.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please reach out via our <a href="/contact">Contact page</a>.
        </p>
      </section>`;

  return renderDocumentLayout({
    activePath: '/privacy',
    title: 'Privacy Policy — Free VIN Decoder',
    description: 'Read how Free VIN Decoder handles VIN queries without storage and discloses Google AdSense advertising cookies.',
    mainHtml,
  });
}

function renderTermsPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>Terms of Use</h1>
        <p class="muted-note">Last updated: November 2026</p>
        <p>
          By accessing and using Free VIN Decoder, you agree to the following plain terms of use.
        </p>

        <h2>Free Informational Use Only</h2>
        <p>
          This website is a free, independent informational utility. Decoded vehicle specifications and recall summaries are retrieved from public NHTSA vPIC and NHTSA Recalls APIs. Results reflect manufacturer-reported records and may be incomplete, delayed, or inaccurate for certain vehicles.
        </p>

        <h2>Not a Substitute for Inspection or History Reports</h2>
        <p>
          Information displayed here is <strong>not</strong> a substitute for an in-person mechanical inspection, a state DMV title verification, a safety recall repair confirmation with an authorized dealer, or a paid vehicle history report. Always verify critical purchase details independently before buying, selling, or insuring a vehicle.
        </p>

        <h2>No Warranty or Liability</h2>
        <p>
          Free VIN Decoder is provided on an “as-is” and “as-available” basis without warranties of any kind, express or implied. We are not liable for any decisions, losses, or damages arising from reliance on decoded specifications, recall listings, or external links.
        </p>

        <h2>Non-Affiliation</h2>
        <p>
          ${escapeHtml(FOOTER_DISCLAIMER)}
        </p>
      </section>`;

  return renderDocumentLayout({
    activePath: '/terms',
    title: 'Terms of Use — Free VIN Decoder',
    description: 'Terms of use for Free VIN Decoder: free informational lookups with no warranty and no agency or automaker affiliation.',
    mainHtml,
  });
}

function renderFaqPage() {
  const faqs = [
    {
      q: 'Is Free VIN Decoder completely free?',
      a: 'Yes. Decoding a VIN and checking vehicle-level safety recalls are 100% free with no account signup, email capture, or paywall.',
    },
    {
      q: 'What data does a VIN decode show?',
      a: 'A VIN decode returns factory-built vehicle specifications reported to public NHTSA vPIC records, including make, model, model year, trim, body class, engine specifications, fuel type, transmission style, drive type, restraint/airbag details, manufacturer, and assembly plant.',
    },
    {
      q: 'What does a VIN decode NOT show?',
      a: 'It does NOT show accident history, salvage or flood title brands, odometer readings or mileage rollbacks, theft records, liens, service records, or prior ownership history. Those details live in paid vehicle history reports or state/insurer theft and title checks.',
    },
    {
      q: 'Where can I find my vehicle’s VIN?',
      a: 'Check three places: (1) the lower-left corner of your dashboard visible through the windshield, (2) the safety certification sticker on the driver-side door jamb, and (3) your vehicle registration card, title, or auto insurance policy.',
    },
    {
      q: 'Are the VINs I enter stored anywhere?',
      a: 'No. Your VIN is used only in real time to fetch factory specifications from the public NHTSA vPIC API and is never stored in a database or user log.',
    },
    {
      q: 'Why is my VIN not found or missing some details?',
      a: 'The 17-character VIN standard began in the 1981 model year, so pre-1981 vehicles cannot be decoded with standard 17-character rules. Some vehicles built for markets outside the United States or older 1980s–early 1990s records may also have limited or no NHTSA data. Double-check for common lookalike mistakes: letters I, O, and Q are never valid in a VIN (use 1, 0, or 9 instead).',
    },
    {
      q: 'How does the Open Safety Recalls check work?',
      a: 'After decoding your VIN, or on our Recall Check page, we query the public NHTSA Recalls API by make, model, and model year. Note that this shows model-level recall campaigns and recalls older than 15 years may not appear. Always verify VIN-specific unrepaired recalls on NHTSA.gov/recalls.',
    },
  ];

  const mainHtml = `
      <section class="content-card">
        <h1>Frequently Asked Questions</h1>
        <p>Answers to the most common questions about decoding a VIN and checking safety recalls on Free VIN Decoder.</p>

        <div class="faq-list">
          ${faqs
            .map(
              (item) => `<article class="faq-item">
            <h2>${escapeHtml(item.q)}</h2>
            <p>${escapeHtml(item.a)}</p>
          </article>`
            )
            .join('\n          ')}
        </div>

        <div class="placeholder-actions">
          <a href="/#decoder" class="btn-primary placeholder-cta">Decode a VIN Now</a>
        </div>
      </section>`;

  return renderDocumentLayout({
    activePath: '/faq',
    title: 'FAQ — Free VIN Decoder',
    description: 'Frequently asked questions about free VIN decoding, privacy, data coverage, and safety recall lookups.',
    mainHtml,
  });
}

function renderWhatIsAVinPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>What Is a VIN?</h1>
        <p>
          A Vehicle Identification Number (VIN) is a unique 17-character code assigned to every motor vehicle built for road use in the United States and most international markets since the 1981 model year. Regulated in the U.S. under 49 CFR Part 565, a VIN serves as a vehicle’s permanent factory fingerprint from assembly onward.
        </p>

        <h2>The 3 Main Sections of a 17-Character VIN</h2>
        <div class="table-wrap">
          <table class="specs-table">
            <thead>
              <tr>
                <th scope="col">Positions</th>
                <th scope="col">Section</th>
                <th scope="col">What It Encodes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Characters 1–3</th>
                <td><strong>WMI</strong> (World Manufacturer Identifier)</td>
                <td>Identifies the country/region of manufacture, the manufacturer, and the vehicle division or type.</td>
              </tr>
              <tr>
                <th scope="row">Characters 4–9</th>
                <td><strong>VDS</strong> (Vehicle Descriptor Section)</td>
                <td>Positions 4–8 describe model line, body style, restraint system, transmission, and engine type. Position 9 is the mathematical <strong>Check Digit</strong> used to verify the VIN’s validity.</td>
              </tr>
              <tr>
                <th scope="row">Characters 10–17</th>
                <td><strong>VIS</strong> (Vehicle Identifier Section)</td>
                <td>Position 10 encodes the <strong>model year</strong>, position 11 identifies the <strong>assembly plant</strong>, and positions 12–17 represent the unique factory production sequence number.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Why Letters I, O, and Q Are Never Used</h2>
        <p>
          Standard 17-character VINs allow only digits <code>0–9</code> and uppercase letters <code>A–Z</code> <strong>excluding I, O, and Q</strong>. Those three letters are prohibited globally so they cannot be confused with the numbers <code>1</code>, <code>0</code>, and <code>9</code> when read off a dashboard plate or handwritten on paperwork.
        </p>

        <h2>Where to Find the VIN on a Vehicle</h2>
        <ul class="guide-list">
          <li><strong>Windshield / Dashboard:</strong> Look through the lower-left (driver’s side) corner of the front windshield.</li>
          <li><strong>Driver-Side Door Jamb:</strong> Open the driver’s door and inspect the white or silver certification sticker near the latch or B-pillar.</li>
          <li><strong>Paperwork:</strong> Check the vehicle’s registration card, certificate of title, or auto insurance policy.</li>
        </ul>

        <h2>What a VIN Decode Can and Cannot Tell You</h2>
        <p>
          Decoding a VIN reveals factory specifications and vehicle-level safety recalls, but it cannot tell you whether a car has been in an accident, flooded, stolen, or had its odometer rolled back. See our
          <a href="/vin-decoder-vs-vehicle-history-report">VIN Decoder vs. Vehicle History Report</a> guide to understand the difference, or test a VIN right now on the
          <a href="/#decoder">Free VIN Decoder</a>.
        </p>
      </section>`;

  return renderDocumentLayout({
    activePath: '/what-is-a-vin',
    title: 'What Is a VIN? — 17-Character VIN Positions Explained',
    description: 'Learn what a 17-character VIN is, what WMI, VDS, and VIS positions mean, why I/O/Q are excluded, and where to find your VIN.',
    mainHtml,
  });
}

function renderVinVsHistoryPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>VIN Decoder vs. Vehicle History Report</h1>
        <p>
          Before buying a used car, it is important to understand what a free VIN decode gives you versus what requires a full paid vehicle history report.
        </p>

        <div class="callout-box callout-note">
          <strong>Key takeaway:</strong> A clean VIN decode does NOT mean a clean car — it only confirms the vehicle’s factory identity, check digit, and original build specifications.
        </div>

        <h2>Side-by-Side Comparison</h2>
        <div class="table-wrap">
          <table class="specs-table comparison-table">
            <thead>
              <tr>
                <th scope="col">Data Category</th>
                <th scope="col">Free VIN Decoder</th>
                <th scope="col">Paid History Report</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Make, Model &amp; Model Year</th>
                <td>Included (free)</td>
                <td>Included</td>
              </tr>
              <tr>
                <th scope="row">Engine, Transmission, Trim &amp; Body</th>
                <td>Included (free)</td>
                <td>Included</td>
              </tr>
              <tr>
                <th scope="row">Assembly Plant Location</th>
                <td>Included (free)</td>
                <td>Included</td>
              </tr>
              <tr>
                <th scope="row">Open Safety Recalls (Make/Model/Year)</th>
                <td>Included (free via NHTSA)</td>
                <td>Included</td>
              </tr>
              <tr>
                <th scope="row">Title Brands (Salvage, Flood, Rebuilt, Lemon)</th>
                <td>Not included</td>
                <td>Included (NMVTIS &amp; state DMV records)</td>
              </tr>
              <tr>
                <th scope="row">Reported Accidents &amp; Airbag Deployments</th>
                <td>Not included</td>
                <td>Included (when reported)</td>
              </tr>
              <tr>
                <th scope="row">Odometer Readings &amp; Rollback Flags</th>
                <td>Not included</td>
                <td>Included</td>
              </tr>
              <tr>
                <th scope="row">Theft, Total-Loss &amp; Lien Records</th>
                <td>Not included</td>
                <td>Included (varies by provider)</td>
              </tr>
              <tr>
                <th scope="row">Ownership Count &amp; Service Entries</th>
                <td>Not included</td>
                <td>Included (when reported)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Paid History Report Providers</h2>
        <p>
          If your free VIN decode confirms the car’s specs match the seller’s listing, a paid report from established providers such as <strong>Carfax</strong>, <strong>AutoCheck</strong>, <strong>VinAudit</strong>, or <strong>ClearVIN</strong> pulls state title brands, odometer logs, insurance total-loss data, and reported collision history.
        </p>

        <h2>Free Supplemental Checks</h2>
        <ul class="guide-list">
          <li>
            <strong>NHTSA Recall Lookup by VIN:</strong> Check whether a specific VIN has unrepaired safety recalls at
            <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">nhtsa.gov/recalls</a>.
          </li>
          <li>
            <strong>NICB VINCheck (Theft &amp; Salvage Screen):</strong> The National Insurance Crime Bureau offers a free lookup for unrecovered theft and insurer salvage/total-loss records (up to 5 searches per IP per 24 hours) directly on
            <a href="https://www.nicb.org/vincheck" target="_blank" rel="noopener noreferrer">nicb.org/vincheck</a>.
          </li>
        </ul>

        <div class="placeholder-actions">
          <a href="/#decoder" class="btn-primary placeholder-cta">Decode a VIN for Free</a>
          <a href="/recall-check" class="btn-outline-blue btn-link-compact">Check Open Safety Recalls</a>
        </div>
      </section>`;

  return renderDocumentLayout({
    activePath: '/vin-decoder-vs-vehicle-history-report',
    title: 'VIN Decoder vs. Vehicle History Report — What’s the Difference?',
    description:
      'Compare a free NHTSA VIN decoder (factory specs & recalls) with paid vehicle history reports (title brands, accidents, odometer, and theft records).',
    mainHtml,
  });
}

export const INFO_PAGE_RENDERERS = new Map([
  ['/recall-check', renderRecallCheckPage],
  ['/about', renderAboutPage],
  ['/contact', renderContactPage],
  ['/privacy', renderPrivacyPage],
  ['/terms', renderTermsPage],
  ['/faq', renderFaqPage],
  ['/what-is-a-vin', renderWhatIsAVinPage],
  ['/vin-decoder-vs-vehicle-history-report', renderVinVsHistoryPage],
]);

export function renderInfoPage(routePath) {
  const renderer = INFO_PAGE_RENDERERS.get(routePath);
  return renderer ? renderer() : null;
}

