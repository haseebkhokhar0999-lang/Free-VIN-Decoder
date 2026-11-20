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

function renderHowToCheckAVinForFreePage() {
  const mainHtml = `
      <section class="content-card">
        <h1>How to Check a VIN for Free</h1>
        <p>
          Checking a Vehicle Identification Number (VIN) before buying or selling a car is one of the most important steps in evaluating any motor vehicle. With our free online VIN decoder, anyone can look up factory build specifications, verify manufacturer details, and screen for open safety recalls in seconds — with no subscription, no credit card, and no email required.
        </p>

        <div class="hero-actions-row">
          <a href="/#decoder" class="btn-primary">Decode a VIN for Free Now</a>
          <a href="/recall-check" class="btn-outline-blue btn-link-compact">Check Safety Recalls</a>
        </div>

        <h2>Step-by-Step: How to Decode a VIN on This Site</h2>
        <ol class="guide-list">
          <li>
            <strong>Find the 17-Character VIN:</strong> Look at the lower-left corner of the dashboard (visible through the driver’s side windshield), on the driver-side door jamb certification sticker, or on official paperwork such as the title certificate, vehicle registration, or insurance ID card. Remember: standard 17-character VINs never contain the letters <strong>I</strong>, <strong>O</strong>, or <strong>Q</strong> to prevent confusion with numbers 1 and 0.
          </li>
          <li>
            <strong>Enter the VIN in the Decoder:</strong> Navigate to the <a href="/#decoder">free VIN decoder form</a> at the top of the homepage or any of our dedicated make pages. Paste or type the 17 alphanumeric characters into the VIN input box.
          </li>
          <li>
            <strong>Enter the Model Year (Optional):</strong> If you know the 4-digit model year (for example, <code>2015</code>), entering it helps disambiguate repeating 30-year character codes (such as character codes shared between 1985 and 2015). If you are unsure, you can leave this field blank.
          </li>
          <li>
            <strong>Click "Decode VIN":</strong> Hit the <strong>Decode VIN</strong> button or press Enter. Our server instantly queries public National Highway Traffic Safety Administration (NHTSA) vPIC records in real time.
          </li>
          <li>
            <strong>Review the 4 Organized Results Tabs:</strong>
            <ul>
              <li><strong>Summary:</strong> Key vehicle identity data (Make, Model, Model Year, Vehicle Type, Body Class, Assembly Plant) alongside a clean line drawing of the vehicle body style.</li>
              <li><strong>Specs:</strong> Engine model, displacement (liters/cc), cylinder count, horsepower rating, primary and secondary fuel types, electrification level, and transmission configuration.</li>
              <li><strong>Dimensions &amp; Body:</strong> Doors, wheelbase, track width, bed length, curb weight, Gross Vehicle Weight Rating (GVWR), and body classification.</li>
              <li><strong>Safety &amp; Recalls:</strong> Front, knee, side, and curtain airbag locations, restraint types, plus active safety recall campaigns reported to NHTSA.</li>
            </ul>
          </li>
          <li>
            <strong>Explore All 145+ Variables or Print:</strong> Click <strong>Show All Vehicle Details</strong> to expand the full searchable table of every data field reported by the manufacturer, or click <strong>Print Specs</strong> to generate a clean, compact PDF reference.
          </li>
        </ol>

        <h2>What the Free VIN Report Shows</h2>
        <p>
          Every motor vehicle built for road use in the United States since 1981 is cataloged in public NHTSA vPIC records under federal regulation 49 CFR Part 565. A free lookup on this website retrieves:
        </p>
        <ul class="guide-list">
          <li><strong>Factory Build Identity:</strong> Manufacturer name, brand division, model, model year, series, and factory trim package.</li>
          <li><strong>Powertrain Specifications:</strong> Engine displacement (L), cylinders, fuel delivery, horsepower, electrification (Hybrid / EV), and transmission type.</li>
          <li><strong>Chassis &amp; Body Specs:</strong> Body style, door count, Gross Vehicle Weight Rating (GVWR) class, and drive layout (FWD, RWD, AWD, 4WD).</li>
          <li><strong>Origin &amp; Assembly Plant:</strong> Manufacturing company, plant country, and plant city location.</li>
          <li><strong>Position-9 Check Digit Verification:</strong> Mathematical confirmation that the 17-character VIN conforms to federal checksum standards and contains no obvious typos or altered digits.</li>
          <li><strong>Open Safety Recalls:</strong> Unrepaired safety recall campaigns published by NHTSA matching the vehicle’s year, make, and model.</li>
        </ul>

        <h2>What the Free Report Does NOT Show</h2>
        <div class="callout-box callout-note">
          <strong>Important consumer notice:</strong> A factory VIN decode tells you how a vehicle was built at the factory, NOT what happened to it after it rolled off the assembly line.
        </div>
        <p>
          To maintain transparency, keep in mind that free NHTSA vPIC lookups do <strong>not</strong> include the following information:
        </p>
        <ul class="guide-list">
          <li><strong>No Accident or Collision History:</strong> Police crash reports, fender benders, frame damage, and insurance claims are not submitted to NHTSA vPIC.</li>
          <li><strong>No Title Brands (Salvage, Flood, Rebuilt, Lemon):</strong> Brand designations such as Salvage, Rebuilt, Flood, Hail, Junk, or Manufacturer Buyback originate from state DMVs and the National Motor Vehicle Title Information System (NMVTIS).</li>
          <li><strong>No Odometer Rollback Tracking:</strong> Recorded mileage readings from annual safety inspections, emissions stations, dealership service visits, or auto auctions are not part of factory build data.</li>
          <li><strong>No Stolen Vehicle or Lien Records:</strong> Active stolen vehicle reports from law enforcement and outstanding bank auto loans are maintained in separate state and national databases.</li>
          <li><strong>No Maintenance &amp; Repair Logs:</strong> Routine oil changes, tire rotations, and scheduled dealer services are maintained in private dealership networks.</li>
        </ul>

        <h2>When Do You Need a Paid Vehicle History Report?</h2>
        <p>
          If you are shopping for a pre-owned car, a free VIN decode is your indispensable first filter to confirm that the car’s advertised engine, trim, and model year are genuine. However, before exchanging funds or signing a bill of sale, you should always purchase a comprehensive vehicle history report from services such as <strong>Carfax</strong>, <strong>AutoCheck</strong>, <strong>VinAudit</strong>, or <strong>ClearVIN</strong>.
        </p>
        <p>
          You can also take advantage of free supplemental government and non-profit tools:
        </p>
        <ul class="guide-list">
          <li>
            <strong>NICB VINCheck:</strong> The National Insurance Crime Bureau offers a free theft and total-loss insurance check at
            <a href="https://www.nicb.org/vincheck" target="_blank" rel="noopener noreferrer">nicb.org/vincheck</a> (allows up to 5 lookups per IP address every 24 hours).
          </li>
          <li>
            <strong>NHTSA Specific VIN Recall Tool:</strong> Confirm individual unrepaired recall status by entering the exact VIN at
            <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">nhtsa.gov/recalls</a>.
          </li>
        </ul>

        <div class="placeholder-actions">
          <a href="/#decoder" class="btn-primary placeholder-cta">Decode a VIN for Free</a>
          <a href="/check-a-vin-before-buying-a-used-car" class="btn-outline-blue btn-link-compact">Used Car Buying Checklist</a>
        </div>
      </section>`;

  return renderDocumentLayout({
    activePath: '/how-to-check-a-vin-for-free',
    title: 'How to Check a VIN for Free — Step-by-Step Free VIN Decoder Guide',
    description:
      'Step-by-step guide on how to check a VIN for free. Learn what free NHTSA vehicle decode reports show, what requires a paid history report, and when to get one.',
    mainHtml,
  });
}

function renderCheckVinBeforeBuyingUsedCarPage() {
  const mainHtml = `
      <section class="content-card">
        <h1>Check a VIN Before Buying a Used Car</h1>
        <p>
          Purchasing a pre-owned vehicle can save thousands of dollars, but it also carries significant financial and safety risks. Dishonest sellers sometimes misrepresent a car’s trim level, conceal serious accident history, or attempt to sell vehicles with dangerous open recalls. Decoding the Vehicle Identification Number (VIN) is the easiest and most powerful way to protect yourself before negotiating price or taking a test drive.
        </p>

        <div class="hero-actions-row">
          <a href="/#decoder" class="btn-primary">Decode Seller’s VIN Now</a>
          <a href="/how-to-check-a-vin-for-free" class="btn-outline-blue btn-link-compact">Free VIN Check Guide</a>
        </div>

        <h2>Why You Must Check the VIN First</h2>
        <p>
          A VIN is the vehicle’s legal fingerprint. Running a free decode on our site verifies the car’s factory build sheet against public federal records filed under 49 CFR Part 565 with the National Highway Traffic Safety Administration (NHTSA). Checking the VIN before meeting the seller allows you to:
        </p>
        <ul class="guide-list">
          <li><strong>Catch "Upbadging" and Trim Fraud:</strong> Sellers often list a base-model vehicle with premium badges, upgraded wheels, or an aftermarket spoiler to ask a higher price. The VIN decode tells you the exact factory trim and engine that originally left the factory.</li>
          <li><strong>Verify True Model Year:</strong> Vehicles manufactured late in a calendar year are frequently marketed as the next year’s model. Position 10 of the VIN reveals the official regulatory model year.</li>
          <li><strong>Identify Drive System Discrepancies:</strong> Confirm whether a crossover, truck, or SUV is truly equipped with All-Wheel Drive (AWD) or 4-Wheel Drive (4WD) rather than Front-Wheel Drive (FWD).</li>
          <li><strong>Screen for Unrepaired Safety Recalls:</strong> Unrepaired defects like faulty airbags, fuel leaks, or electrical short-circuits put you and your passengers at immediate risk.</li>
        </ul>

        <h2>Critical Red Flags in a VIN Decode</h2>
        <div class="callout-box callout-note">
          <strong>Red flag alert:</strong> Any mismatch between the vehicle’s physical appearance, the seller’s listing description, and the factory VIN decode is an immediate reason to pause negotiations and investigate further.
        </div>

        <ul class="guide-list">
          <li>
            <strong>1. Check Digit Mismatch (Error Code 1–11):</strong> Position 9 of every North American 17-character VIN is a calculated check digit. If our decoder reports a check digit calculation error, the VIN may contain a typo, or worse, the VIN plate may have been illegally cloned from another vehicle.
          </li>
          <li>
            <strong>2. Engine Displacement or Cylinder Mismatch:</strong> If the listing advertises a 3.5L V6 or 5.7L V8, but the VIN decode returns a 2.0L 4-cylinder engine, the vehicle may have been misidentified or subjected to an undocumented powertrain swap.
          </li>
          <li>
            <strong>3. Body Class or Transmission Differences:</strong> If the decode lists a manual transmission or a 2-door coupe, but the seller is presenting an automatic 4-door sedan, you are looking at the wrong paperwork or a cloned VIN plate.
          </li>
          <li>
            <strong>4. Assembly Plant / Country Contradiction:</strong> A seller claiming a BMW or Mercedes was "imported directly from Germany" can be easily verified: if positions 1–3 show assembly in the USA (Spartanburg, SC or Tuscaloosa, AL) or Mexico, the seller’s claims are false.
          </li>
          <li>
            <strong>5. Open Manufacturer Safety Recalls:</strong> If the Safety &amp; Recalls panel indicates open recall campaigns, verify with the seller whether the free dealership repair has been completed, or demand that it be performed prior to purchase.
          </li>
        </ul>

        <h2>What Requires a Paid Vehicle History Report</h2>
        <p>
          While our free VIN decoder confirms the factory configuration, a factory decode cannot show how the car was treated by prior owners. Before finalizing a purchase, always obtain a paid vehicle history report (such as <strong>Carfax</strong>, <strong>AutoCheck</strong>, or <strong>VinAudit</strong>) to screen for:
        </p>
        <ul class="guide-list">
          <li><strong>Salvage &amp; Rebuilt Title Brands:</strong> Indicates an insurance company declared the car a total loss following a major collision, flood, or fire.</li>
          <li><strong>Odometer Rollbacks &amp; Mileage Discrepancies:</strong> Shows historical mileage readings reported by DMVs, inspection stations, and repair facilities to detect odometer tampering.</li>
          <li><strong>Reported Accidents &amp; Frame Damage:</strong> Discloses police accident records, insurance collision claims, and structural repair notes.</li>
          <li><strong>Title Liens &amp; Outstanding Loans:</strong> Ensures the seller has clean title and does not owe money to a bank or lender who could repossess the car.</li>
          <li><strong>Number of Prior Owners &amp; Use Type:</strong> Reveals whether the vehicle was owned by a single private individual or used as a commercial taxi, rental fleet, or lease vehicle.</li>
        </ul>

        <h2>The Used Car Buyer’s VIN Checklist</h2>
        <p>
          Follow this 6-step checklist before handing over a deposit or signing purchase documents:
        </p>
        <ol class="guide-list">
          <li>
            <strong>Compare the VIN in All Three Physical Locations:</strong>
            Examine the dashboard VIN plate through the lower driver-side windshield, the driver’s door jamb B-pillar certification sticker, and the paper title certificate. All 17 characters must match exactly.
          </li>
          <li>
            <strong>Run the Free Decode on Free-VIN-Decoder:</strong>
            Confirm the factory make, model, year, body style, engine displacement, and transmission match the physical car sitting in front of you.
          </li>
          <li>
            <strong>Check the National Insurance Crime Bureau (NICB):</strong>
            Use the free <a href="https://www.nicb.org/vincheck" target="_blank" rel="noopener noreferrer">NICB VINCheck</a> tool to confirm the car has not been reported as stolen or an insurance total loss.
          </li>
          <li>
            <strong>Verify Recall Status at NHTSA.gov:</strong>
            Review any open recalls and verify whether the seller has dealership documentation proving repairs were completed.
          </li>
          <li>
            <strong>Purchase a Comprehensive Vehicle History Report:</strong>
            Order a Carfax or AutoCheck report to examine title brands, accident history, and mileage progression.
          </li>
          <li>
            <strong>Schedule an Independent Pre-Purchase Inspection (PPI):</strong>
            Take the car to a trusted certified mechanic who can lift the car, inspect the undercarriage for hidden frame damage or fluid leaks, and run diagnostic scans on the engine and transmission computers.
          </li>
        </ol>

        <div class="placeholder-actions">
          <a href="/#decoder" class="btn-primary placeholder-cta">Decode a VIN for Free</a>
          <a href="/vin-decoder-vs-vehicle-history-report" class="btn-outline-blue btn-link-compact">Compare Free vs Paid Reports</a>
        </div>
      </section>`;

  return renderDocumentLayout({
    activePath: '/check-a-vin-before-buying-a-used-car',
    title: 'Check a VIN Before Buying a Used Car — Red Flags & Buyer’s Checklist',
    description:
      'Essential guide to checking a VIN before buying a used car. Spot listing red flags, verify factory specs, check open recalls, and use our pre-purchase checklist.',
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
  ['/how-to-check-a-vin-for-free', renderHowToCheckAVinForFreePage],
  ['/check-a-vin-before-buying-a-used-car', renderCheckVinBeforeBuyingUsedCarPage],
]);

export function renderInfoPage(routePath) {
  const renderer = INFO_PAGE_RENDERERS.get(routePath);
  return renderer ? renderer() : null;
}

