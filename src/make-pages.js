import {
  escapeHtml,
  MAKE_PAGES,
  renderDocumentLayout,
  renderStandardDecoderCardHtml,
} from './pages.js';

const MAKE_CONTENT = [
  {
    slug: '/honda-vin-decoder',
    make: 'Honda',
    title: 'Honda VIN Decoder',
    description:
      'Decode a Honda VIN for free using public NHTSA vPIC data to check model year, trim, body class, engine specifications, assembly plant, and open safety recalls.',
    intro:
      'Use this free Honda VIN decoder to review factory build details for Honda cars, SUVs, minivans, and pickup trucks built with the 17-character VIN standard (1981 and newer). Looking up a Honda VIN returns manufacturer-reported specifications from NHTSA vPIC records, including model year, trim, body class, engine details, transmission style, and assembly plant location.',
    wmiNote:
      'Honda VINs begin with a three-character World Manufacturer Identifier (WMI) indicating the manufacturing entity and country of origin (for example, 1HG, 2HG, 5FN, or JHM depending on where the vehicle was built), while position 10 encodes the model year and position 11 marks the assembly plant.',
    locations: [
      'Lower-left corner of the dashboard on the driver’s side, readable through the front windshield.',
      'Driver-side B-pillar / door jamb certification label located near the door latch.',
      'Vehicle registration card, title document, and auto insurance ID card.',
      'Engine bay firewall or strut-tower plate on older models where an auxiliary stamp is present.',
    ],
    faqs: [
      {
        q: 'What information does a Honda VIN decode return?',
        a: 'It returns factory-assigned details reported to NHTSA, including make, model, model year, trim, body class, engine specifications, fuel type, transmission style, restraint system details, and assembly plant.',
      },
      {
        q: 'Can I decode a partial Honda VIN?',
        a: 'Yes. Partial VINs are accepted if you want to check the general model, manufacturer, or body class, though a full 17-character VIN gives the most complete decode and validates the position-9 check digit.',
      },
      {
        q: 'Does a Honda VIN decode include accident or maintenance history?',
        a: 'No. This lookup covers factory build specifications and NHTSA vehicle-level safety recalls only. Accident reports, title brands, odometer readings, and service history require a separate paid vehicle history report.',
      },
      {
        q: 'Are Honda VINs stored when I run a lookup?',
        a: 'No. Your VIN is used only to query the public NHTSA vPIC API for your current session and is never stored.',
      },
    ],
  },
  {
    slug: '/toyota-vin-decoder',
    make: 'Toyota',
    title: 'Toyota VIN Decoder',
    description:
      'Free Toyota VIN decoder powered by public NHTSA vPIC records. Look up factory specs, trim, engine, plant country, and vehicle recalls.',
    intro:
      'Enter any 17-character or partial Toyota VIN to look up original factory specifications from NHTSA vPIC records. Whether you are checking a sedan, SUV, hybrid, or pickup truck, the decoder reports manufacturer-submitted details such as model year, trim, body class, engine displacement, fuel type, and assembly plant.',
    wmiNote:
      'In a Toyota VIN, the first three characters identify the manufacturing plant region and division (for instance, vehicles assembled in North America versus Japan carry distinct WMI prefixes), positions 4 through 8 describe the vehicle line and powertrain, position 9 is the check digit, and position 10 identifies the model year.',
    locations: [
      'Driver-side lower windshield corner on top of the dashboard.',
      'Certification sticker inside the driver’s door jamb frame.',
      'State registration certificate, title paperwork, or insurance policy.',
      'Under-hood firewall or radiator support plate on select models.',
    ],
    faqs: [
      {
        q: 'Does the Toyota VIN decoder work for hybrid models?',
        a: 'Yes. When reported by the manufacturer in NHTSA vPIC data, hybrid and electrified models display Primary Fuel Type, Secondary Fuel Type, and Electrification Level fields.',
      },
      {
        q: 'Why are some Toyota fields blank in the decode table?',
        a: 'Only attributes submitted by the manufacturer for that model year and VIN pattern appear in NHTSA vPIC data. A blank row simply means no value was reported for that specific variable.',
      },
      {
        q: 'Can I check safety recalls after decoding a Toyota VIN?',
        a: 'Yes. Once your VIN decodes with a make, model, and model year, the Open Safety Recalls section queries NHTSA recall campaigns for that vehicle automatically.',
      },
      {
        q: 'Does this decoder verify title status or prior accidents?',
        a: 'No. Factory specification decoding cannot detect salvage titles, flood damage, odometer discrepancies, or past collisions.',
      },
    ],
  },
  {
    slug: '/ford-vin-decoder',
    make: 'Ford',
    title: 'Ford VIN Decoder',
    description:
      'Decode a Ford VIN for free to inspect factory specs, engine displacement, GVWR, body class, assembly plant, and open safety recalls.',
    intro:
      'Check original factory details for Ford cars, SUVs, vans, and pickups using this free Ford VIN decoder. Powered by the public NHTSA vPIC database, a lookup reveals model year, trim, body class, Gross Vehicle Weight Rating (GVWR), engine specifications, transmission details, and assembly plant information.',
    wmiNote:
      'Every 17-character Ford VIN follows the federal 49 CFR Part 565 format: positions 1–3 identify the Ford manufacturing entity and country, positions 4–8 describe restraint system, line, series, body style, and engine, position 9 serves as the check digit, and positions 10–17 capture model year, plant, and build sequence.',
    locations: [
      'Driver-side dashboard plate visible from outside through the lower-left windshield.',
      'Safety compliance certification label on the driver-side door jamb or B-pillar.',
      'Vehicle title, registration document, or insurance declaration page.',
      'Stamped frame rail or cowl tag on select trucks and commercial chassis.',
    ],
    faqs: [
      {
        q: 'Does this tool show Gross Vehicle Weight Rating (GVWR) for Ford trucks?',
        a: 'Yes. When reported in NHTSA vPIC records, Gross Vehicle Weight Rating appears in the Other Information section along with drive type, cylinders, and engine displacement.',
      },
      {
        q: 'What if I am checking a classic Ford built before 1981?',
        a: 'The 17-character VIN standard began with the 1981 model year. Pre-1981 vehicles used shorter manufacturer-specific serial formats that are generally not supported by modern NHTSA vPIC decoding.',
      },
      {
        q: 'Why does Ford VIN decoding ignore the VIN year if I enter Model Year?',
        a: 'Entering an optional 4-digit Model Year tells the NHTSA vPIC decoder which model year to evaluate, which helps disambiguate repeating 30-year model-year characters.',
      },
      {
        q: 'Is my Ford VIN saved anywhere?',
        a: 'No. Lookups run statelessly against the NHTSA API and entered VINs are never stored.',
      },
    ],
  },
  {
    slug: '/chevrolet-vin-decoder',
    make: 'Chevrolet',
    title: 'Chevrolet VIN Decoder',
    description:
      'Free Chevrolet VIN decoder powered by NHTSA vPIC data. View factory specs, engine, GVWR, assembly plant, and open safety recalls.',
    intro:
      'Look up factory specifications for Chevrolet passenger cars, crossovers, SUVs, and trucks for free. The Chevrolet VIN decoder connects directly to public NHTSA vPIC data so you can confirm model year, body class, trim, engine configuration, transmission, airbag locations, and manufacturing plant.',
    wmiNote:
      'Standard 1981+ Chevrolet VINs encode the GM/Chevrolet manufacturing origin in positions 1–3, platform, series, body style, restraint type, and engine code across positions 4–8, the check digit at position 9, model year at position 10, and assembly plant at position 11.',
    locations: [
      'Driver-side corner of the dashboard viewed through the bottom of the windshield.',
      'Certification and tire-loading sticker on the driver-side door frame or B-pillar.',
      'Service Parts Identification (SPID) / QR label inside the glove box or trunk area on many GM vehicles.',
      'Vehicle registration, title certificate, or auto insurance card.',
    ],
    faqs: [
      {
        q: 'Can I decode both Chevrolet cars and Chevy trucks here?',
        a: 'Yes. Passenger cars, SUVs, vans, and light-duty or medium-duty trucks built under the 17-character VIN standard are supported via NHTSA vPIC records.',
      },
      {
        q: 'Does a Chevrolet VIN decode tell me factory paint or RPO option codes?',
        a: 'NHTSA vPIC returns core regulatory and factory build specs such as trim, engine, transmission, GVWR, and safety systems. Detailed RPO option packages are typically listed on the vehicle’s Service Parts Identification label.',
      },
      {
        q: 'What does a clean check digit mean?',
        a: 'Position 9 is a calculated validation digit. If NHTSA reports Error Code 0, the VIN passed the check-digit calculation—though it does not guarantee a clean vehicle history.',
      },
      {
        q: 'How can I check open safety recalls on a Chevrolet?',
        a: 'Open safety recalls by make, model, and model year load automatically below your decode results, or you can use our Recall Check page anytime.',
      },
    ],
  },
  {
    slug: '/bmw-vin-decoder',
    make: 'BMW',
    title: 'BMW VIN Decoder',
    description:
      'Decode a BMW VIN for free using NHTSA vPIC records to view factory model year, body class, engine specifications, assembly plant, and safety recalls.',
    intro:
      'Inspect factory build specifications for BMW vehicles with this free BMW VIN decoder. Using public NHTSA vPIC records, the tool decodes US-market 17-character BMW VINs to show manufacturer details, model year, series/trim when reported, body class, engine cylinders and horsepower, transmission, and assembly plant.',
    wmiNote:
      'BMW VINs use World Manufacturer Identifiers in positions 1–3 reflecting the specific BMW assembly division and country (such as Germany or the United States), followed by vehicle series and engine/restraint descriptors in positions 4–8, the check digit at position 9, model year at position 10, and assembly plant at position 11.',
    locations: [
      'Lower driver-side corner of the windshield on the dashboard VIN plate.',
      'Manufacturer certification label on the driver-side door jamb / B-pillar.',
      'Stamped into the right-hand suspension strut tower or under-hood chassis frame on many BMW models.',
      'Vehicle registration card, title paperwork, and insurance documents.',
    ],
    faqs: [
      {
        q: 'Does this BMW VIN decoder work for imported non-US models?',
        a: 'NHTSA vPIC primarily covers US-market vehicles subject to 49 CFR Part 565 reporting. Gray-market or non-US regional BMWs may return partial specs or no NHTSA record.',
      },
      {
        q: 'Will a BMW VIN decode list factory option packages?',
        a: 'This free decoder displays manufacturer-reported NHTSA vPIC variables (make, model, year, engine, displacement, restraint systems, and plant), not BMW dealer-level option build sheets.',
      },
      {
        q: 'Why is the last 7 characters sometimes used when ordering BMW parts?',
        a: 'Positions 11–17 identify the plant and serial sequence, which parts catalogs sometimes request. For full NHTSA decoding here, entering the full 17-character VIN produces the most complete result.',
      },
      {
        q: 'Are recalls checked automatically for my BMW?',
        a: 'Yes. Once make, model, and model year are decoded, the Open Safety Recalls panel fetches NHTSA recalls for that vehicle model and year.',
      },
    ],
  },
  {
    slug: '/mercedes-vin-decoder',
    make: 'Mercedes-Benz',
    title: 'Mercedes VIN Decoder',
    description:
      'Free Mercedes-Benz VIN decoder powered by NHTSA vPIC data. Check model year, body class, engine details, assembly plant, and safety recalls.',
    intro:
      'Decode a Mercedes-Benz VIN for free to verify factory vehicle specifications reported to NHTSA vPIC. Whether you are checking a sedan, coupe, SUV, or van built for the US market, the tool retrieves manufacturer, model year, body class, engine specifications, restraint details, and assembly plant location.',
    wmiNote:
      'Mercedes-Benz 17-character VINs carry the WMI in positions 1–3 (identifying the Mercedes-Benz plant and country), model/chassis/engine/restraint attributes in positions 4–8, the position-9 check digit, model year at position 10, and assembly plant at position 11.',
    locations: [
      'Bottom left corner of the front windshield on the dashboard.',
      'Driver-side door jamb / B-pillar certification sticker.',
      'Under the front passenger seat carpet flap or engine-bay crossmember on select models and vans.',
      'Vehicle registration, title certificate, or insurance documents.',
    ],
    faqs: [
      {
        q: 'Can I decode Mercedes-Benz vans like Sprinter or Metris?',
        a: 'Yes. US-market commercial vans, SUVs, and passenger cars reported under 49 CFR Part 565 are included in the NHTSA vPIC database.',
      },
      {
        q: 'What if a Mercedes VIN shows some empty fields?',
        a: 'Empty rows indicate that the manufacturer did not report a value for that variable in the NHTSA dataset; they do not mean the feature is absent on the vehicle.',
      },
      {
        q: 'Does decoding a Mercedes VIN show past accidents or service records?',
        a: 'No. Factory spec decoding does not include collision history, title brands, mileage history, or dealer service logs.',
      },
      {
        q: 'How can I check open recalls on a Mercedes-Benz?',
        a: 'Open safety recalls appear automatically below your decoded specs, or you can search by make, model, and model year on our Recall Check page.',
      },
    ],
  },
];

export const MAKE_PAGE_PATHS = MAKE_CONTENT.map((item) => item.slug);

export function renderMakePage(slug) {
  const page = MAKE_CONTENT.find((item) => item.slug === slug);
  if (!page) return null;

  const decoderHtml = renderStandardDecoderCardHtml({
    heading: `${page.title}`,
    subtitle: `Enter a ${page.make} VIN below to decode factory specifications from public NHTSA vPIC records.`,
  });

  const mainHtml = `
      <section class="page-hero" aria-labelledby="page-hero-title">
        <h1 id="page-hero-title" class="page-hero-title">${escapeHtml(page.title)}</h1>
        <p class="page-hero-subtitle">${escapeHtml(page.intro)}</p>
        <div class="hero-actions-row">
          <a href="/#decoder" class="btn-outline-blue btn-link-compact">Back to Main VIN Decoder</a>
          <a href="/recall-check" class="btn-outline-blue btn-link-compact">Check Open Recalls</a>
        </div>
      </section>

      ${decoderHtml}

      <section class="info-grid" aria-label="${escapeHtml(page.make)} VIN Guide">
        <article class="info-card">
          <h2>Decoding ${escapeHtml(page.make)} VINs</h2>
          <p>${escapeHtml(page.wmiNote)}</p>
          <p class="muted-note">
            Data comes directly from public NHTSA vPIC manufacturer submissions. Pre-1981 models or vehicles built exclusively for markets outside the US may return limited or no records.
          </p>
        </article>

        <article class="info-card">
          <h2>Where to Find the VIN on ${escapeHtml(page.make)} Vehicles</h2>
          <ul class="guide-list">
            ${page.locations.map((loc) => `<li>${escapeHtml(loc)}</li>`).join('\n            ')}
          </ul>
          <p class="muted-note">
            Need a quick overview of every character position? Read <a href="/what-is-a-vin">What Is a VIN?</a> or go back to the <a href="/#decoder">main VIN decoder</a>.
          </p>
        </article>
      </section>

      <section class="content-card" aria-labelledby="make-faq-heading">
        <h2 id="make-faq-heading">${escapeHtml(page.make)} VIN Decoder FAQs</h2>
        <div class="faq-list">
          ${page.faqs
            .map(
              (faq) => `<article class="faq-item">
            <h3>${escapeHtml(faq.q)}</h3>
            <p>${escapeHtml(faq.a)}</p>
          </article>`
            )
            .join('\n          ')}
        </div>
      </section>`;

  return renderDocumentLayout({
    activePath: page.slug,
    title: `${page.title} — Free Factory Specs Lookup`,
    description: page.description,
    mainHtml,
    extraScripts: ['/recalls-ui.js', '/app.js'],
  });
}

export function getMakePageSlugs() {
  return MAKE_PAGES.map((m) => m.slug);
}

