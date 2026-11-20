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
  {
    slug: '/nissan-vin-decoder',
    make: 'Nissan',
    title: 'Nissan VIN Decoder',
    description:
      'Free Nissan VIN decoder powered by public NHTSA vPIC records. Look up factory specs, engine, transmission, assembly plant, and safety recalls.',
    intro:
      'Look up factory specifications for Nissan sedans, crossovers, SUVs, trucks, and electric vehicles using this free Nissan VIN decoder. From popular models like the Altima, Sentra, Maxima, Rogue, Murano, Pathfinder, and Armada to the Frontier, Titan, LEAF, and Ariya, entering any 17-character Nissan VIN queries public NHTSA vPIC records to return model year, trim level, body class, engine displacement, transmission type, and assembly plant.',
    wmiNote:
      'Nissan 17-character VINs start with a World Manufacturer Identifier (WMI) indicating the manufacturing country and plant (e.g., 1N4 or 1N6 for USA-built cars and trucks, 3N1 for Mexico, JN1 for Japan, and 5N1 for North American crossovers). Positions 4–8 encode the vehicle line, engine, and safety restraint type, position 9 is the mathematical check digit, position 10 designates the model year, and position 11 indicates the assembly plant (such as Smyrna, TN or Canton, MS).',
    locations: [
      'Lower-left corner of the dashboard, visible looking through the windshield from outside the driver’s side.',
      'Driver-side B-pillar / door jamb Federal Motor Vehicle Safety Standards (FMVSS) certification label.',
      'Vehicle registration certificate, title paperwork, and insurance identification card.',
      'Stamped on the center or firewall section of the engine bay on select Nissan sedans and SUVs.',
    ],
    faqs: [
      {
        q: 'Can I decode electric Nissan models like the LEAF or Ariya?',
        a: 'Yes. For electric vehicles, NHTSA vPIC reports Primary Fuel Type as Electric and provides electrification level along with motor horsepower where submitted by the manufacturer.',
      },
      {
        q: 'How can I tell if my Nissan was built in Japan or North America?',
        a: 'Check the first three characters (WMI) of the VIN: JN1 indicates Japan, 1N4 or 1N6 indicates the United States, 3N1 indicates Mexico, and 2N1 indicates Canada.',
      },
      {
        q: 'Does this decoder show open recalls on my Nissan?',
        a: 'Yes. Once the VIN decodes your vehicle’s make, model, and year, our integrated NHTSA recalls tool automatically queries open safety recalls.',
      },
      {
        q: 'Does decoding a Nissan VIN show past accident or title history?',
        a: 'No. Factory spec decoding covers manufacturer specifications and safety recalls only. For collision history, salvage branding, or mileage checks, order a commercial vehicle history report.',
      },
    ],
  },
  {
    slug: '/hyundai-vin-decoder',
    make: 'Hyundai',
    title: 'Hyundai VIN Decoder',
    description:
      'Decode a Hyundai VIN for free using NHTSA vPIC records to verify factory specs, engine displacement, trim, assembly plant, and open safety recalls.',
    intro:
      'Decode factory build specifications for Hyundai cars, crossovers, SUVs, and electric vehicles with this free Hyundai VIN decoder. Whether you drive an Elantra, Sonata, Accent, Venue, Kona, Tucson, Santa Fe, Palisade, Santa Cruz, or an Ioniq 5 / Ioniq 6 EV, entering the 17-character VIN retrieves official manufacturer details from NHTSA vPIC, including model year, trim, body style, powertrain, and assembly plant.',
    wmiNote:
      'Hyundai VINs use positions 1–3 for the WMI code, where KMH indicates Hyundai passenger cars built in South Korea, KM8 indicates South Korean SUVs/MPVs, and 5NP indicates vehicles manufactured at Hyundai Motor Manufacturing Alabama (HMMA) in the United States. Positions 4–5 describe the model line and series, positions 6–8 identify body type and engine code, position 9 is the check digit, position 10 is the model year, and position 11 marks the assembly plant.',
    locations: [
      'Driver-side corner of the dashboard, readable through the lower windshield.',
      'Safety certification label on the driver’s door jamb / B-pillar below the latch.',
      'Vehicle title, registration paperwork, and insurance card.',
      'Stamped onto the floor under the front passenger seat carpet flap or on the engine firewall on Korean-built models.',
    ],
    faqs: [
      {
        q: 'Does this decoder work for Hyundai hybrid and electric vehicles?',
        a: 'Yes. NHTSA vPIC records for Hyundai hybrid, plug-in hybrid, and battery-electric models (like the Ioniq series) report fuel type, motor specs, and electrification details.',
      },
      {
        q: 'How do I identify the assembly plant of my Hyundai?',
        a: 'Look at position 11 of the VIN: for example, "H" indicates the Montgomery, Alabama facility (HMMA), while "U" corresponds to Ulsan, South Korea.',
      },
      {
        q: 'Are open safety recalls displayed for my Hyundai?',
        a: 'Yes. Decoded year, make, and model information is automatically passed to the NHTSA recalls database to display any relevant safety recall campaigns.',
      },
      {
        q: 'Can I decode a used Hyundai before buying it?',
        a: 'Yes. You can verify whether the seller’s advertised trim, engine, and model year match the manufacturer’s official NHTSA build records.',
      },
    ],
  },
  {
    slug: '/kia-vin-decoder',
    make: 'Kia',
    title: 'Kia VIN Decoder',
    description:
      'Free Kia VIN decoder powered by NHTSA vPIC data. Look up factory specifications, trim, engine, plant location, and safety recalls.',
    intro:
      'Look up factory specifications for Kia passenger cars, crossovers, minivans, and electric vehicles using this free Kia VIN decoder. From popular models like the Forte, K5, Stinger, Soul, Seltos, Sportage, Sorento, Telluride, and Carnival to the EV6 and EV9, entering your 17-character Kia VIN queries public NHTSA records for model year, trim, engine specifications, restraint systems, and assembly plant.',
    wmiNote:
      'Kia VINs feature World Manufacturer Identifiers (WMI) across positions 1–3: KNA, KND, and KNY indicate Kia vehicles assembled in South Korea, 5XX identifies vehicles built at Kia Georgia (West Point, GA), and 3KP denotes vehicles produced in Mexico. Positions 4–8 describe model line, series, body style, and engine code, position 9 is the check digit, position 10 signifies model year, and position 11 represents the assembly plant.',
    locations: [
      'Dashboard plate on the lower driver-side corner, visible through the windshield.',
      'Driver-side B-pillar door jamb label displaying manufacturing date and GVWR.',
      'Vehicle registration document, state title certificate, and insurance policy.',
      'Stamped chassis crossmember under the front passenger seat or firewall on select models.',
    ],
    faqs: [
      {
        q: 'Can I decode Kia EVs like the EV6 and EV9?',
        a: 'Yes. NHTSA vPIC records include full powertrain specs for Kia electric vehicles, noting the electrification level and electric motor horsepower.',
      },
      {
        q: 'How can I tell if my Kia Telluride was built in the USA?',
        a: 'Tellurides and other Georgia-built Kias feature a VIN starting with WMI code "5XX", indicating assembly at the West Point, Georgia plant.',
      },
      {
        q: 'Does the Kia VIN decode show open safety recall campaigns?',
        a: 'Yes. The Open Safety Recalls section below your decoded specs automatically checks the NHTSA recall database for active safety campaigns.',
      },
      {
        q: 'Why does position 9 show a check digit warning?',
        a: 'Position 9 is a mathematical checksum. If a character was mistyped, the check digit will fail, alerting you to verify the entered VIN.',
      },
    ],
  },
  {
    slug: '/jeep-vin-decoder',
    make: 'Jeep',
    title: 'Jeep VIN Decoder',
    description:
      'Decode a Jeep VIN for free with NHTSA vPIC data. Check factory specs, 4x4 drive type, engine, trim, plant, and open safety recalls.',
    intro:
      'Verify factory specifications for Jeep 4x4s, SUVs, and trucks with this free Jeep VIN decoder. Whether you are checking a Wrangler, Gladiator, Grand Cherokee, Cherokee, Compass, Renegade, or Wagoneer / Grand Wagoneer, enter your 17-character VIN to retrieve manufacturer build details from NHTSA vPIC records, including model year, trim, drive system, engine displacement, GVWR, and assembly plant.',
    wmiNote:
      'Jeep VINs (part of Stellantis / FCA US) begin with WMI codes in positions 1–3 such as 1C4 (USA passenger vehicles/MPVs) or 1C6 (trucks like the Gladiator). Position 4 indicates the vehicle line or gross weight rating, positions 5–7 describe model series, body style, and engine type, position 8 identifies restraint systems, position 9 is the check digit, position 10 specifies model year, and position 11 denotes the assembly plant (such as Toledo, OH or Detroit, MI).',
    locations: [
      'Driver-side lower corner of the dashboard, visible through the front windshield glass.',
      'Driver-side door shut-face / B-pillar federal safety certification label.',
      'Vehicle registration card, certificate of title, and auto insurance documentation.',
      'Stamped on the passenger-side frame rail on body-on-frame models like the Wrangler and Gladiator.',
    ],
    faqs: [
      {
        q: 'Does the decode show whether a Jeep is 4WD or 2WD?',
        a: 'Yes. The Drive Type field in your decode results indicates 4WD/4-Wheel Drive, AWD, or Front-Wheel Drive / Rear-Wheel Drive where reported to NHTSA.',
      },
      {
        q: 'Can I decode Jeep 4xe plug-in hybrid models?',
        a: 'Yes. Wrangler 4xe and Grand Cherokee 4xe models report both gasoline and electric powertrain variables in NHTSA vPIC records.',
      },
      {
        q: 'Where are Jeep Wranglers assembled?',
        a: 'Jeep Wranglers are built at the Toledo Assembly Complex in Ohio, indicated by plant code "W" or "L" in position 11 of the VIN.',
      },
      {
        q: 'Does this decoder verify factory axle ratios or Rubicon package details?',
        a: 'NHTSA vPIC returns core regulatory build data like trim, series, engine, and GVWR. Specific dealer option groups like axle gearing may require a window sticker.',
      },
    ],
  },
  {
    slug: '/dodge-vin-decoder',
    make: 'Dodge',
    title: 'Dodge VIN Decoder',
    description:
      'Free Dodge VIN decoder powered by NHTSA vPIC data. Look up factory specs, engine displacement, trim, assembly plant, and safety recalls.',
    intro:
      'Check factory build details for Dodge muscle cars, sedans, SUVs, and minivans with this free Dodge VIN decoder. From popular performance icons like the Charger and Challenger to the Durango, Hornet, Journey, and Grand Caravan, entering any 17-character Dodge VIN pulls official manufacturer data from NHTSA vPIC, including model year, engine cylinders, horsepower, transmission, and assembly plant.',
    wmiNote:
      'Dodge VINs start with WMI codes in positions 1–3: 1B3 or 2C3 (Canada-built passenger cars like the Charger and Challenger from Brampton Assembly), 1C3 (USA cars), or 3D4 (Mexico). Positions 4–7 designate vehicle line, series, body style, and engine configuration, position 8 specifies restraint systems, position 9 is the check digit, position 10 denotes model year, and position 11 identifies the assembly plant.',
    locations: [
      'Driver-side dashboard plate viewed from outside through the bottom corner of the windshield.',
      'Driver-side door latch pillar certification and tire placard sticker.',
      'State vehicle title, registration certificate, and insurance policy documents.',
      'Under-hood cowl tag or radiator support bar on select classic and modern Dodge vehicles.',
    ],
    faqs: [
      {
        q: 'Can I distinguish between a 5.7L, 6.4L 392, or Hellcat 6.2L engine with the VIN?',
        a: 'Yes. Position 8 and the engine configuration fields in NHTSA vPIC specify the exact engine displacement, cylinders, and horsepower rating.',
      },
      {
        q: 'Why are Ram trucks not listed under Dodge after 2010?',
        a: 'Starting with the 2011 model year, Ram became its own standalone brand. For trucks built in 2011 and newer, use our Ram VIN Decoder.',
      },
      {
        q: 'Are open safety recalls checked for Dodge vehicles?',
        a: 'Yes. Recalls reported to NHTSA for your vehicle’s make, model, and year load automatically below the decoded build specifications.',
      },
      {
        q: 'Can I decode pre-1981 classic Dodge muscle cars?',
        a: 'Pre-1981 vehicles used shorter proprietary serial numbers not covered by the 17-character standard. NHTSA vPIC covers 1981 and newer models.',
      },
    ],
  },
  {
    slug: '/ram-vin-decoder',
    make: 'Ram',
    title: 'Ram VIN Decoder',
    description:
      'Decode a Ram truck VIN for free to check factory specs, engine, GVWR, cab style, assembly plant, and open safety recalls.',
    intro:
      'Verify factory specifications for Ram pickup trucks, chassis cabs, and commercial vans using this free Ram VIN decoder. Covering Ram 1500, 2500, 3500, 4500, 5500, and ProMaster models, entering any 17-character VIN queries public NHTSA vPIC records to reveal engine displacement, horsepower, cab style, bed length, Gross Vehicle Weight Rating (GVWR), and assembly plant.',
    wmiNote:
      'Ram trucks feature WMI prefixes in positions 1–3 such as 1C6 (USA truck/MPV), 3C6 (Mexico truck from Saltillo Assembly), or 2C6 (Canada). Position 4 specifies Gross Vehicle Weight Rating class, position 5 denotes model line (1500/2500/3500), position 6 indicates series/cab type, position 7 identifies body style/bed length, position 8 designates engine code (HEMI, Cummins Diesel, or Pentastar), position 9 is the check digit, position 10 is model year, and position 11 indicates the plant.',
    locations: [
      'Driver-side lower dashboard corner visible through the front windshield glass.',
      'Safety compliance and tire information sticker inside the driver-side door jamb / B-pillar.',
      'Vehicle registration document, state title certificate, and insurance cards.',
      'Passenger-side front frame rail stamped inscription on heavy-duty truck chassis.',
    ],
    faqs: [
      {
        q: 'Does the decode show Cummins Turbo Diesel vs HEMI V8 engines?',
        a: 'Yes. The engine model, fuel type (Diesel vs Gasoline), cylinders, and displacement are clearly listed in the decoded specifications.',
      },
      {
        q: 'Can I check the Gross Vehicle Weight Rating (GVWR) on a Ram 2500 or 3500?',
        a: 'Yes. NHTSA vPIC records report both GVWR class and numeric weight ranges, essential for commercial registration and towing compliance.',
      },
      {
        q: 'Are safety recalls checked for Ram trucks?',
        a: 'Yes. The Open Safety Recalls tool checks active NHTSA campaigns matching the decoded year, make, and model automatically.',
      },
      {
        q: 'Why does my 2008 truck decode as Dodge instead of Ram?',
        a: 'Before the 2011 model year, these trucks were sold under the Dodge brand name (Dodge Ram). From 2011 onward, they are branded as Ram.',
      },
    ],
  },
  {
    slug: '/tesla-vin-decoder',
    make: 'Tesla',
    title: 'Tesla VIN Decoder',
    description:
      'Free Tesla VIN decoder powered by NHTSA vPIC records. Check model year, motor configuration, battery/drive specs, plant, and safety recalls.',
    intro:
      'Decode factory build specifications for Tesla electric vehicles using this free Tesla VIN decoder. Covering Model S, Model 3, Model X, Model Y, and Cybertruck, entering any 17-character Tesla VIN queries public NHTSA vPIC data to report model year, motor drive configuration (Single, Dual, or Tri-Motor), battery type, restraint systems, and assembly plant.',
    wmiNote:
      'Tesla VINs utilize WMI codes in positions 1–3: 5YJ (Model S, Model 3), 7SA (Model X, Model Y), or 7G2 (Cybertruck and commercial platforms) for US manufacturing, and XP7 / LRW for international plants. Position 4 indicates the vehicle model line, position 5 identifies body type and gross weight, position 6 denotes restraint system, position 7 describes battery/drive motor type, position 8 specifies motor count, position 9 is the check digit, position 10 encodes model year, and position 11 marks the assembly factory (such as Fremont, CA or Austin, TX).',
    locations: [
      'Driver-side upper corner of the dashboard, viewed looking down through the windshield.',
      'Vehicle certification label printed on the driver-side door B-pillar.',
      'Touchscreen display: Tap Controls > Software to view the electronic VIN.',
      'Tesla mobile application at the bottom of the main vehicle screen.',
    ],
    faqs: [
      {
        q: 'Can I tell if a Tesla is Rear-Wheel Drive, Long Range, or Performance?',
        a: 'Yes. Motor configuration (Single Motor RWD vs Dual Motor AWD) and motor horsepower reported in NHTSA vPIC help identify the vehicle configuration.',
      },
      {
        q: 'How can I tell if my Tesla was built in Fremont, California or Giga Texas?',
        a: 'Look at position 11 of the VIN: "F" represents the Fremont, California plant, while "A" signifies Gigafactory Texas in Austin.',
      },
      {
        q: 'Does this tool show open NHTSA recalls for Tesla vehicles?',
        a: 'Yes. Active safety recalls reported by NHTSA—including over-the-air (OTA) software recall campaigns—are queried automatically.',
      },
      {
        q: 'Is my Tesla VIN saved or tracked when I run a decode?',
        a: 'No. Lookups query the public NHTSA vPIC API statelessly and are never logged or stored.',
      },
    ],
  },
  {
    slug: '/audi-vin-decoder',
    make: 'Audi',
    title: 'Audi VIN Decoder',
    description:
      'Decode an Audi VIN for free using NHTSA vPIC records to inspect factory specs, Quattro drive, engine, plant country, and safety recalls.',
    intro:
      'Inspect original factory specifications for Audi luxury sedans, coupes, Sportbacks, Avants, and Q-series SUVs with this free Audi VIN decoder. Covering popular models such as the A3, A4, A5, A6, A7, A8, Q3, Q5, Q7, Q8, TT, and e-tron electric vehicles, entering any 17-character Audi VIN queries NHTSA vPIC records for model year, trim, body style, Quattro all-wheel drive, engine displacement, and assembly plant.',
    wmiNote:
      'Audi VINs feature WMI prefixes in positions 1–3: WAU indicates Audi AG passenger cars built in Germany, WA1 indicates Audi SUVs (like Q5 and Q7), and 3VW or 3AV indicates Mexican production (such as the Q5 in San José Chiapa). Positions 4–8 encode series, engine type, and restraint systems, position 9 is the check digit, position 10 denotes model year, and position 11 identifies the assembly plant (such as Ingolstadt, Neckarsulm, or San José Chiapa).',
    locations: [
      'Driver-side lower edge of the front windshield on the dashboard VIN plate.',
      'Driver-side B-pillar door frame certification label.',
      'State vehicle title, registration certificate, and auto insurance documentation.',
      'Stamped into the right inner fender or suspension strut housing in the engine compartment.',
    ],
    faqs: [
      {
        q: 'Does the decode show whether an Audi has Quattro all-wheel drive?',
        a: 'Yes. Drive Type in your decode results indicates All-Wheel Drive (AWD/Quattro) or Front-Wheel Drive (FWD/FrontTrak) as reported to NHTSA.',
      },
      {
        q: 'Can I decode Audi e-tron all-electric models?',
        a: 'Yes. Pure electric e-tron models report Electric fuel type, motor specs, and battery electrification level in NHTSA vPIC data.',
      },
      {
        q: 'Where was my Audi manufactured?',
        a: 'Position 11 of the VIN indicates the plant: "A" for Ingolstadt, "N" for Neckarsulm, "1" for Győr (Hungary), and "2" for San José Chiapa (Mexico).',
      },
      {
        q: 'Does decoding an Audi VIN show dealer service records or maintenance logs?',
        a: 'No. This lookup covers official factory specifications and NHTSA safety recalls only; maintenance records require an authorized Audi dealer or vehicle history report.',
      },
    ],
  },
  {
    slug: '/volkswagen-vin-decoder',
    make: 'Volkswagen',
    title: 'Volkswagen VIN Decoder',
    description:
      'Free Volkswagen VIN decoder powered by NHTSA vPIC data. Look up factory specs, engine, body class, plant location, and safety recalls.',
    intro:
      'Look up factory specifications for Volkswagen passenger cars, crossovers, SUVs, and electric vehicles with this free Volkswagen VIN decoder. From popular models like the Jetta, Golf, GTI, Passat, Arteon, Taos, Tiguan, and Atlas to the all-electric ID.4, entering any 17-character VW VIN retrieves manufacturer details from public NHTSA vPIC records, including model year, trim, engine displacement, transmission, and assembly plant.',
    wmiNote:
      'Volkswagen VINs utilize WMI codes in positions 1–3 indicating the manufacturing entity: WVW indicates VW cars assembled in Germany, 1V1/1V2 indicates Volkswagen Group of America in Chattanooga, Tennessee, 3VW indicates production in Puebla, Mexico, and 9BW denotes Brazil. Positions 4–8 describe model line, engine code, and restraint types, position 9 is the check digit, position 10 denotes model year, and position 11 identifies the assembly plant.',
    locations: [
      'Lower driver-side corner of the dashboard, visible looking through the windshield from outside.',
      'Safety compliance certification sticker on the driver’s door jamb / B-pillar.',
      'Vehicle registration card, certificate of title, and auto insurance paperwork.',
      'Stamped on the passenger-side shock tower or firewall under the hood.',
    ],
    faqs: [
      {
        q: 'Can I decode the Volkswagen ID.4 electric SUV?',
        a: 'Yes. Both German-built and Tennessee-built ID.4 electric vehicles decode cleanly with full electric powertrain specs and electrification details.',
      },
      {
        q: 'How can I tell if my VW was assembled in Tennessee, Mexico, or Germany?',
        a: 'Check the first character of the VIN: "1" indicates the Chattanooga, TN plant, "3" indicates Puebla, Mexico, and "W" indicates Germany.',
      },
      {
        q: 'Does this VW VIN decoder show open safety recalls?',
        a: 'Yes. Once decoded, our integrated NHTSA recalls module queries open recall campaigns matching your Volkswagen’s make, model, and year.',
      },
      {
        q: 'Can I decode classic air-cooled VW Beetles or Buses built before 1981?',
        a: 'Pre-1981 VWs used 9-digit or 10-digit serial numbers that precede the modern 17-character federal standard, so they cannot be decoded via NHTSA vPIC.',
      },
    ],
  },
  {
    slug: '/subaru-vin-decoder',
    make: 'Subaru',
    title: 'Subaru VIN Decoder',
    description:
      'Decode a Subaru VIN for free with NHTSA vPIC records. Check Symmetrical AWD, Boxer engine, trim, plant, and open safety recalls.',
    intro:
      'Verify factory specifications for Subaru cars, wagons, and crossovers using this free Subaru VIN decoder. Whether you drive an Outback, Forester, Crosstrek, Ascent, Impreza, Legacy, WRX, BRZ, or Solterra EV, entering any 17-character Subaru VIN pulls official manufacturer data from NHTSA vPIC records, including model year, trim level, Symmetrical All-Wheel Drive, Boxer engine displacement, and assembly plant.',
    wmiNote:
      'Subaru VINs start with WMI codes in positions 1–3: JF1 indicates Subaru passenger cars manufactured by Fuji Heavy Industries / Subaru Corporation in Gunma, Japan, JF2 indicates Japan-built MPVs/SUVs, and 4S3 or 4S4 identifies vehicles produced at Subaru of Indiana Automotive (SIA) in Lafayette, Indiana. Positions 4–8 encode model line, body style, engine type (e.g., 2.0L, 2.4L Turbo, or 2.5L Boxer), and safety restraint systems, position 9 is the check digit, position 10 signifies model year, and position 11 identifies the assembly plant.',
    locations: [
      'Driver-side corner of the instrument panel/dashboard, visible through the bottom of the windshield.',
      'Federal safety certification label on the driver-side B-pillar door jamb.',
      'Vehicle registration certificate, state title documentation, and insurance card.',
      'Stamped on the right-hand strut tower housing or firewall in the engine compartment.',
    ],
    faqs: [
      {
        q: 'Does the decode confirm Symmetrical All-Wheel Drive (AWD)?',
        a: 'Yes. The Drive Type field indicates All-Wheel Drive (AWD) for all AWD Subaru models, or Rear-Wheel Drive (RWD) for the Subaru BRZ.',
      },
      {
        q: 'How can I tell if my Subaru was built in Indiana or Japan?',
        a: 'Check the WMI prefix in positions 1–3: "4S3" or "4S4" indicates the Lafayette, Indiana plant (SIA), while "JF1" or "JF2" indicates Gunma, Japan.',
      },
      {
        q: 'Does this decoder check for open Subaru safety recalls?',
        a: 'Yes. Open NHTSA safety recalls matching the decoded year, make, and model are displayed automatically below the vehicle build data.',
      },
      {
        q: 'Will the decode distinguish between naturally aspirated and turbocharged Boxer engines?',
        a: 'Yes. Engine displacement, cylinders, fuel delivery, and horsepower ratings are detailed in the decoded specs and all-details table.',
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

