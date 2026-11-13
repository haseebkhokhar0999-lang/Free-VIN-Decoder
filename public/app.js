const EXAMPLE_VIN = '1HGCM82633A004352';

const OTHER_INFO_FIELDS = [
  { key: 'series', label: 'Series' },
  { key: 'trim', label: 'Trim' },
  { key: 'gvwr', label: 'Gross Vehicle Weight Rating' },
  { key: 'driveType', label: 'Drive Type' },
  { key: 'cylinders', label: 'Cylinders' },
  { key: 'primaryFuelType', label: 'Primary Fuel Type' },
  { key: 'electrificationLevel', label: 'Electrification Level' },
  { key: 'secondaryFuelType', label: 'Secondary Fuel Type' },
  { key: 'engineModel', label: 'Engine Model' },
  { key: 'engineBrakeHp', label: 'Engine Brake (HP)' },
  { key: 'engineManufacturer', label: 'Engine Manufacturer' },
  { key: 'transmissionSpeed', label: 'Transmission Speed' },
  { key: 'transmissionStyle', label: 'Transmission Style' },
  { key: 'engineDisplacementL', label: 'Engine Displacement (L)' },
];

const AIRBAG_FIELDS = [
  { key: 'front', label: 'Front' },
  { key: 'knee', label: 'Knee' },
  { key: 'side', label: 'Side' },
  { key: 'curtain', label: 'Curtain' },
  { key: 'seatCushion', label: 'Seat Cushion' },
  { key: 'otherRestraintInfo', label: 'Other Restraint Info' },
];

const form = document.getElementById('vin-form');
const vinInput = document.getElementById('vin-input');
const modelYearInput = document.getElementById('model-year-input');
const decodeBtn = document.getElementById('decode-btn');
const btnLabel = decodeBtn.querySelector('.btn-label');
const exampleBtn = document.getElementById('example-vin-btn');
const errorBox = document.getElementById('vin-error');
const loadingPanel = document.getElementById('loading-panel');
const elapsedCounter = document.getElementById('elapsed-counter');
const progressFill = document.getElementById('progress-fill');
const progressCaption = document.getElementById('progress-caption');

const resultsSection = document.getElementById('results-section');
const makeLogo = document.getElementById('make-logo');
const resultsHeading = document.getElementById('results-heading');
const vehicleStockPhoto = document.getElementById('vehicle-stock-photo');
const printResultsBtn = document.getElementById('print-results-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const errorStatusBanner = document.getElementById('error-status-banner');
const statusIconSuccess = document.getElementById('status-icon-success');
const statusIconWarning = document.getElementById('status-icon-warning');
const errorStatusText = document.getElementById('error-status-text');
const modelYearStatus = document.getElementById('model-year-status');

const valManufacturer = document.getElementById('val-manufacturer');
const valDbas = document.getElementById('val-dbas');
const valVehicleType = document.getElementById('val-vehicle-type');
const valModelYear = document.getElementById('val-model-year');
const valMake = document.getElementById('val-make');
const valModel = document.getElementById('val-model');
const valBodyClass = document.getElementById('val-body-class');
const valSeries = document.getElementById('val-series');
const valTrim = document.getElementById('val-trim');
const vehicleDrawing = document.getElementById('vehicle-drawing');

const specsGrid = document.getElementById('specs-grid');
const dimensionsGrid = document.getElementById('dimensions-grid');

const toggleAllDetailsBtn = document.getElementById('toggle-all-details-btn');
const backToSummaryBtn = document.getElementById('back-to-summary-btn');
const otherInfoCard = document.getElementById('other-info-card');
const otherInfoGrid = document.getElementById('other-info-grid');
const airbagsList = document.getElementById('airbags-list');
const valPlantInfo = document.getElementById('val-plant-info');

const allDetailsCard = document.getElementById('all-details-card');
const dtPageSize = document.getElementById('dt-page-size');
const dtSearchInput = document.getElementById('dt-search-input');
const allDetailsTbody = document.getElementById('all-details-tbody');
const dtInfo = document.getElementById('dt-info');
const dtPagination = document.getElementById('dt-pagination');
const recallsSection = document.getElementById('recalls-section');
const recallsBody = document.getElementById('recalls-body');
const recallPageLink = document.getElementById('recall-page-link');

let activeController = null;
let recallController = null;
let loadingTimer = null;
let allDetailsRows = [];
let currentPage = 1;
let pageSize = 10;
let searchQuery = '';

function normalizeVin(raw) {
  return String(raw || '').trim().toUpperCase();
}

function validateVinInput(raw) {
  const vin = normalizeVin(raw);

  if (!vin) {
    return { valid: false, vin, error: 'Please enter a VIN.' };
  }

  const forbidden = [...new Set(vin.match(/[IOQ]/g) || [])];
  if (forbidden.length > 0) {
    return {
      valid: false,
      vin,
      error: `Invalid VIN format: letters I, O, and Q are never valid in a VIN (found: ${forbidden.join(', ')}).`,
    };
  }

  if (/[^A-Z0-9*]/.test(vin) || !/[A-Z0-9]/.test(vin)) {
    return {
      valid: false,
      vin,
      error: 'Invalid VIN format: only letters (A–Z, excluding I, O, Q) and numbers (0–9) are allowed.',
    };
  }

  if (vin.length > 17) {
    return {
      valid: false,
      vin,
      error: `Invalid VIN format: a VIN cannot exceed 17 characters (entered ${vin.length}).`,
    };
  }

  return { valid: true, vin, error: null };
}

function validateOptionalModelYear(raw) {
  const year = String(raw || '').trim();
  if (!year) {
    return { valid: true, year: '', error: null };
  }
  if (!/^\d{4}$/.test(year)) {
    return {
      valid: false,
      year,
      error: 'Optional Model Year must be 4 digits (e.g. 2020), or leave it blank.',
    };
  }
  return { valid: true, year, error: null };
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.textContent = '';
  errorBox.hidden = true;
}

function stopLoadingTimer() {
  if (loadingTimer !== null) {
    window.clearInterval(loadingTimer);
    loadingTimer = null;
  }
}

function setLoading(isLoading) {
  decodeBtn.disabled = isLoading;
  decodeBtn.classList.toggle('is-loading', isLoading);
  btnLabel.textContent = isLoading ? 'Decoding…' : 'Decode VIN';

  if (isLoading) {
    const startTime = performance.now();
    elapsedCounter.textContent = '0.0s';
    progressFill.style.width = '8%';
    progressCaption.textContent = 'Estimated progress: 8%';
    loadingPanel.hidden = false;

    stopLoadingTimer();
    loadingTimer = window.setInterval(() => {
      const elapsedSec = (performance.now() - startTime) / 1000;
      const estimatedPct = Math.min(92, Math.round(8 + 84 * (1 - Math.exp(-elapsedSec / 2.2))));
      elapsedCounter.textContent = `${elapsedSec.toFixed(1)}s`;
      progressFill.style.width = `${estimatedPct}%`;
      progressCaption.textContent = `Estimated progress: ${estimatedPct}%`;
    }, 100);
  } else {
    stopLoadingTimer();
    loadingPanel.hidden = true;
    progressFill.style.width = '0%';
  }
}

function renderModelYearConfirmation(enteredYear, decodedYear, warningText) {
  modelYearStatus.className = 'alert';
  modelYearStatus.textContent = '';

  if (!enteredYear) {
    modelYearStatus.hidden = true;
    return;
  }

  const hasYearMismatchWarning = /\b12\b|model year/i.test(warningText || '');

  if (decodedYear === enteredYear && !hasYearMismatchWarning) {
    modelYearStatus.classList.add('alert-success');
    modelYearStatus.textContent = `Model Year confirmed: ${enteredYear} matches the decoded VIN record.`;
  } else {
    modelYearStatus.classList.add('alert-warning');
    modelYearStatus.textContent =
      decodedYear && decodedYear !== enteredYear
        ? `Model Year mismatch: entered ${enteredYear}, but decoded record indicates ${decodedYear}.`
        : `Model Year notice: entered ${enteredYear}, which could not be confirmed against this VIN.`;
  }

  modelYearStatus.hidden = false;
}

function setAllDetailsExpanded(expanded) {
  if (allDetailsCard) allDetailsCard.hidden = !expanded;
  const tabsBar = document.querySelector('.results-tabs-bar');
  if (tabsBar) tabsBar.hidden = expanded;
  const panels = document.querySelectorAll('.tab-panel');
  if (expanded) {
    panels.forEach((p) => {
      p.hidden = true;
    });
  } else {
    resetTabsToSummary();
  }
  toggleAllDetailsBtn.setAttribute('aria-expanded', String(expanded));
  toggleAllDetailsBtn.textContent = expanded ? 'Hide All Vehicle Details' : 'Show All Vehicle Details';
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.results-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      if (!targetId) return;

      tabButtons.forEach((b) => {
        const isTarget = b === btn;
        b.classList.toggle('is-active', isTarget);
        b.setAttribute('aria-selected', String(isTarget));
      });

      tabPanels.forEach((panel) => {
        const isTarget = panel.id === targetId;
        panel.hidden = !isTarget;
        panel.classList.toggle('is-active', isTarget);
      });
    });
  });
}

function resetTabsToSummary() {
  const tabButtons = document.querySelectorAll('.results-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((btn) => {
    const isSummary = btn.getAttribute('aria-controls') === 'tab-panel-summary';
    btn.classList.toggle('is-active', isSummary);
    btn.setAttribute('aria-selected', String(isSummary));
  });

  tabPanels.forEach((panel) => {
    const isSummary = panel.id === 'tab-panel-summary';
    panel.hidden = !isSummary;
    panel.classList.toggle('is-active', isSummary);
  });
}

function updateStockCarPhoto(bodyClass) {
  if (!vehicleStockPhoto) return;
  const bc = String(bodyClass || '').toLowerCase();
  let photoSrc = '/car-stock-generic.png';
  let altText = 'Generic vehicle stock photo';

  if (bc.includes('sedan')) {
    photoSrc = '/car-stock-sedan.png';
    altText = 'Sedan stock photo';
  } else if (bc.includes('coupe')) {
    photoSrc = '/car-stock-coupe.png';
    altText = 'Coupe stock photo';
  } else if (bc.includes('suv') || bc.includes('sport utility') || bc.includes('crossover')) {
    photoSrc = '/car-stock-suv.png';
    altText = 'SUV stock photo';
  } else if (bc.includes('pickup') || bc.includes('truck')) {
    photoSrc = '/car-stock-pickup.png';
    altText = 'Pickup truck stock photo';
  }

  vehicleStockPhoto.src = photoSrc;
  vehicleStockPhoto.alt = altText;
}

function createPageButton(label, targetPage, { active = false, disabled = false } = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dt-page-btn';
  if (active) btn.classList.add('is-active');
  btn.disabled = disabled;
  btn.textContent = label;
  if (!disabled && !active) {
    btn.addEventListener('click', () => {
      currentPage = targetPage;
      renderAllDetailsTable();
    });
  }
  return btn;
}

function renderAllDetailsTable() {
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? allDetailsRows.filter(
        (row) =>
          row.groupName.toLowerCase().includes(q) ||
          row.element.toLowerCase().includes(q) ||
          row.value.toLowerCase().includes(q)
      )
    : allDetailsRows;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageRows = filtered.slice(startIndex, endIndex);

  allDetailsTbody.textContent = '';

  if (pageRows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = 'No matching vehicle details found.';
    tr.append(td);
    allDetailsTbody.append(tr);
  } else {
    for (const row of pageRows) {
      const tr = document.createElement('tr');
      const tdGroup = document.createElement('td');
      tdGroup.textContent = row.groupName;
      const tdEl = document.createElement('td');
      tdEl.textContent = row.element;
      const tdVal = document.createElement('td');
      tdVal.textContent = row.value;
      tr.append(tdGroup, tdEl, tdVal);
      allDetailsTbody.append(tr);
    }
  }

  const baseInfo =
    total === 0
      ? 'Showing 0 to 0 of 0 entries'
      : `Showing ${startIndex + 1} to ${endIndex} of ${total} entries`;
  dtInfo.textContent = q ? `${baseInfo} (filtered from ${allDetailsRows.length} total entries)` : baseInfo;

  dtPagination.textContent = '';
  dtPagination.append(createPageButton('Previous', currentPage - 1, { disabled: currentPage <= 1 }));

  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(totalPages, currentPage + 2);
  for (let p = windowStart; p <= windowEnd; p += 1) {
    dtPagination.append(createPageButton(String(p), p, { active: p === currentPage }));
  }

  dtPagination.append(createPageButton('Next', currentPage + 1, { disabled: currentPage >= totalPages }));
}

function setSummaryField(elem, value) {
  if (!elem) return;
  const str = value != null ? String(value).trim() : '';
  const row = elem.closest('.detail-line');
  if (str && !['0', 'null', 'not applicable', 'n/a', 'na', 'unknown'].includes(str.toLowerCase())) {
    elem.textContent = str;
    if (row) row.hidden = false;
  } else {
    elem.textContent = '';
    if (row) row.hidden = true;
  }
}

function renderOtherInfo(other) {
  if (otherInfoGrid) {
    otherInfoGrid.textContent = '';
    for (const field of OTHER_INFO_FIELDS) {
      const val = other?.[field.key];
      const str = val != null ? String(val).trim() : '';
      if (!str || ['0', 'null', 'not applicable', 'n/a', 'na'].includes(str.toLowerCase())) {
        continue;
      }
      const item = document.createElement('div');
      item.className = 'other-info-item';

      const label = document.createElement('strong');
      label.textContent = `${field.label}: `;

      const value = document.createTextNode(str);
      item.append(label, value);
      otherInfoGrid.append(item);
    }
  }

  if (airbagsList) {
    airbagsList.textContent = '';
    const airbags = other?.airbags || {};
    let airbagCount = 0;
    for (const field of AIRBAG_FIELDS) {
      const rawVal = airbags[field.key];
      if (!rawVal) continue;
      const cleanVal = String(rawVal).trim();
      if (!cleanVal || ['0', 'null', 'not applicable', 'n/a', 'na'].includes(cleanVal.toLowerCase())) {
        continue;
      }
      const li = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = `${field.label}: `;
      const value = document.createTextNode(cleanVal);
      li.append(label, value);
      airbagsList.append(li);
      airbagCount += 1;
    }
    if (airbagCount === 0) {
      const li = document.createElement('li');
      li.textContent = 'No airbag location details reported for this vehicle.';
      airbagsList.append(li);
    }
  }

  if (valPlantInfo) {
    setSummaryField(valPlantInfo, other?.plantInformation);
  }
}

function renderSpecsGrid(data) {
  if (!specsGrid) return;
  specsGrid.textContent = '';
  const other = data.otherInfo || {};
  const specs = data.specs || [];

  const engineSpec = specs.find((s) => s.key === 'engine')?.value || other.engineModel || '';
  const fuelSpec = specs.find((s) => s.key === 'fuelType')?.value || other.primaryFuelType || '';
  const transSpec = specs.find((s) => s.key === 'transmission')?.value || other.transmissionStyle || '';
  const driveSpec = specs.find((s) => s.key === 'driveType')?.value || other.driveType || '';

  const specItems = [
    { label: 'Engine', value: engineSpec },
    { label: 'Engine Displacement', value: other.engineDisplacementL ? `${other.engineDisplacementL} L` : '' },
    { label: 'Cylinders', value: other.cylinders },
    { label: 'Horsepower', value: other.engineBrakeHp ? `${other.engineBrakeHp} HP` : '' },
    { label: 'Engine Model', value: other.engineModel },
    { label: 'Engine Manufacturer', value: other.engineManufacturer },
    { label: 'Fuel Type', value: fuelSpec },
    { label: 'Secondary Fuel Type', value: other.secondaryFuelType },
    { label: 'Electrification Level', value: other.electrificationLevel },
    { label: 'Transmission', value: transSpec },
    { label: 'Transmission Speeds', value: other.transmissionSpeed },
    { label: 'Drive Type', value: driveSpec },
    { label: 'Gross Vehicle Weight Rating', value: other.gvwr },
  ].filter((item) => item.value && String(item.value).trim());

  if (specItems.length === 0) {
    const p = document.createElement('p');
    p.className = 'other-info-lead';
    p.textContent = 'No powertrain specifications were reported for this vehicle in NHTSA records.';
    specsGrid.append(p);
    return;
  }

  for (const item of specItems) {
    const div = document.createElement('div');
    div.className = 'spec-row';
    const strong = document.createElement('strong');
    strong.textContent = `${item.label}:`;
    const span = document.createElement('span');
    span.textContent = String(item.value).replace(/,([^\s])/g, ', ');
    div.append(strong, span);
    specsGrid.append(div);
  }
}

function renderDimensionsGrid(data) {
  if (!dimensionsGrid) return;
  dimensionsGrid.textContent = '';
  const allDetails = Array.isArray(data.allDetails) ? data.allDetails : [];
  const mfg = data.manufacturerBlock || {};

  const detailMap = new Map();
  for (const row of allDetails) {
    if (row && row.element && row.value && !detailMap.has(row.element)) {
      const v = String(row.value).trim();
      if (v && !['0', 'null', 'not applicable', 'n/a', 'na', 'unknown'].includes(v.toLowerCase())) {
        detailMap.set(row.element, v);
      }
    }
  }

  const dimensionKeys = [
    { label: 'Doors', keys: ['Doors', 'Number of Doors'] },
    { label: 'Body Class', fallback: mfg.bodyClass || detailMap.get('Body Class') },
    {
      label: 'Wheelbase',
      keys: [
        'Wheelbase (inches)',
        'Wheel Base (inches)',
        'Wheel Base (inches) From',
        'Wheel Base (inches) To',
        'Wheelbase',
      ],
      suffix: ' in',
    },
    { label: 'Track Width', keys: ['Track Width (inches)'], suffix: ' in' },
    { label: 'Bed Length', keys: ['Bed Length (inches)'], suffix: ' in' },
    { label: 'Bed Type', keys: ['Bed Type'] },
    { label: 'Cab Type', keys: ['Cab Type'] },
    { label: 'Curb Weight', keys: ['Curb Weight (pounds)'], suffix: ' lbs' },
    {
      label: 'Gross Vehicle Weight Rating',
      keys: ['Gross Vehicle Weight Rating From', 'Gross Vehicle Weight Rating To', 'Gross Vehicle Weight Rating'],
    },
    { label: 'NCSA Body Type', keys: ['NCSA Body Type'] },
  ];

  const foundItems = [];
  for (const item of dimensionKeys) {
    let val = item.fallback || '';
    if (!val && item.keys) {
      for (const k of item.keys) {
        if (detailMap.has(k)) {
          val = detailMap.get(k);
          if (item.suffix && !val.toLowerCase().includes('in') && !val.toLowerCase().includes('lb')) {
            val = `${val}${item.suffix}`;
          }
          break;
        }
      }
    }
    if (val && !['0', 'null', 'not applicable', 'n/a', 'na'].includes(val.toLowerCase())) {
      let formattedVal = String(val);
      if (item.label === 'NCSA Body Type') {
        formattedVal = formattedVal.replace(/,/g, ', ').replace(/,\s+/g, ', ');
      }
      foundItems.push({ label: item.label, value: formattedVal });
    }
  }

  if (foundItems.length === 0) {
    const p = document.createElement('p');
    p.className = 'other-info-lead';
    p.textContent = 'No dimension specifications were reported for this vehicle in NHTSA records.';
    dimensionsGrid.append(p);
    return;
  }

  for (const item of foundItems) {
    const div = document.createElement('div');
    div.className = 'spec-row';
    const strong = document.createElement('strong');
    strong.textContent = `${item.label}:`;
    const span = document.createElement('span');
    let displayValue = item.value;
    if (item.label === 'NCSA Body Type') {
      displayValue = String(displayValue).replace(/,/g, ', ').replace(/,\s+/g, ', ');
    }
    span.textContent = displayValue;
    div.append(strong, span);
    dimensionsGrid.append(div);
  }
}

function renderResults(data, enteredYear) {
  const header = data.header || {};
  const mfg = data.manufacturerBlock || {};

  const headingFallback = [mfg.modelYear, mfg.make, mfg.vehicleType].filter(Boolean);
  resultsHeading.textContent =
    header.title ||
    (headingFallback.length > 0 ? headingFallback.join(' ').toUpperCase() : '') ||
    data.summary ||
    'Vehicle Decoded';

  if (header.makeLogoUrl) {
    makeLogo.alt = mfg.make ? `${mfg.make} logo` : 'Make logo';
    makeLogo.hidden = false;
    makeLogo.src = header.makeLogoUrl;
  } else {
    makeLogo.hidden = true;
    makeLogo.removeAttribute('src');
  }

  const isClean = data.isClean !== undefined ? Boolean(data.isClean) : !data.warning;
  errorStatusBanner.className = `status-banner ${isClean ? 'status-success' : 'status-warning'}`;
  statusIconSuccess.hidden = !isClean;
  statusIconWarning.hidden = isClean;
  errorStatusText.textContent = data.errorText || data.warning || '0 - VIN decoded clean.';

  renderModelYearConfirmation(enteredYear, mfg.modelYear || '', data.warning);

  const mfgRow = valManufacturer ? valManufacturer.closest('.detail-line') : null;
  valManufacturer.textContent = '';
  if (mfg.manufacturer && mfg.manufacturerUrl) {
    const link = document.createElement('a');
    link.href = mfg.manufacturerUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = mfg.manufacturer;
    valManufacturer.append(link);
    if (mfgRow) mfgRow.hidden = false;
  } else if (mfg.manufacturer && String(mfg.manufacturer).trim()) {
    valManufacturer.textContent = mfg.manufacturer;
    if (mfgRow) mfgRow.hidden = false;
  } else if (mfgRow) {
    mfgRow.hidden = true;
  }

  setSummaryField(valDbas, mfg.dbas);
  setSummaryField(valVehicleType, mfg.vehicleType);
  setSummaryField(valModelYear, mfg.modelYear);
  setSummaryField(valMake, mfg.make);
  setSummaryField(valModel, mfg.model);
  setSummaryField(valBodyClass, mfg.bodyClass);
  setSummaryField(valSeries, data.otherInfo?.series);
  setSummaryField(valTrim, data.otherInfo?.trim);

  if (header.vehicleImageUrl) {
    vehicleDrawing.alt = mfg.bodyClass ? `${mfg.bodyClass} illustration` : 'Vehicle illustration';
    vehicleDrawing.hidden = false;
    if (
      header.vehicleImageUrl.endsWith('/3.png') ||
      (mfg.bodyClass && mfg.bodyClass.toLowerCase().includes('coupe'))
    ) {
      vehicleDrawing.src = '/body-coupe.png';
    } else {
      vehicleDrawing.src = header.vehicleImageUrl;
    }
  } else {
    vehicleDrawing.hidden = true;
    vehicleDrawing.removeAttribute('src');
  }

  updateStockCarPhoto(mfg.bodyClass || '');
  renderOtherInfo(data.otherInfo);
  renderSpecsGrid(data);
  renderDimensionsGrid(data);

  allDetailsRows = Array.isArray(data.allDetails) ? data.allDetails : [];
  currentPage = 1;
  searchQuery = '';
  dtSearchInput.value = '';
  dtPageSize.value = String(pageSize);
  renderAllDetailsTable();
  setAllDetailsExpanded(false);
  resetTabsToSummary();

  resultsSection.hidden = false;
  loadRecallsForVehicle(mfg.make || '', mfg.model || '', mfg.modelYear || '');
}

async function loadRecallsForVehicle(make, model, modelYear) {
  if (!recallsSection || !recallsBody || !window.VinRecallsUI) return;

  if (recallController) {
    recallController.abort();
    recallController = null;
  }

  const cleanMake = String(make || '').trim();
  const cleanModel = String(model || '').trim();
  const cleanYear = String(modelYear || '').trim();

  if (recallPageLink) {
    const linkParams = new URLSearchParams();
    if (cleanMake) linkParams.set('make', cleanMake);
    if (cleanModel) linkParams.set('model', cleanModel);
    if (cleanYear) linkParams.set('modelYear', cleanYear);
    const qs = linkParams.toString();
    recallPageLink.href = qs ? `/recall-check?${qs}` : '/recall-check';
  }

  recallsSection.hidden = false;

  if (!cleanMake || !cleanModel || !/^\d{4}$/.test(cleanYear)) {
    window.VinRecallsUI.renderRecallsMessage(
      recallsBody,
      'Make, Model, and a 4-digit Model Year are required to check vehicle-level recalls. Enter a full VIN or add Model Year above, or use the Standalone Recall Check page.',
      { includeNotice: true }
    );
    return;
  }

  recallController = new AbortController();
  window.VinRecallsUI.renderRecallsLoading(recallsBody);

  try {
    const data = await window.VinRecallsUI.fetchRecalls({
      make: cleanMake,
      model: cleanModel,
      modelYear: cleanYear,
      signal: recallController.signal,
    });
    window.VinRecallsUI.renderRecallsResult(recallsBody, data);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    window.VinRecallsUI.renderRecallsMessage(
      recallsBody,
      err?.message || 'Unable to check open safety recalls right now.',
      { isError: true, includeNotice: true }
    );
  } finally {
    recallController = null;
  }
}

function hideResults() {
  if (recallController) {
    recallController.abort();
    recallController = null;
  }
  resultsSection.hidden = true;
  modelYearStatus.hidden = true;
  if (recallsSection) {
    recallsSection.hidden = true;
  }
  if (recallsBody) {
    recallsBody.textContent = '';
  }
  allDetailsRows = [];
}

function syncResultsUrl(vin, modelYear) {
  const params = new URLSearchParams({ vin, modelYear: modelYear || '' });
  const target = `/decode?${params.toString()}`;
  if (window.location.pathname + window.location.search !== target) {
    window.history.pushState({ vin, modelYear: modelYear || '' }, '', target);
  }
}

async function decodeVin(rawVin, rawModelYear = '', { pushUrl = true } = {}) {
  const check = validateVinInput(rawVin);
  vinInput.value = check.vin;

  if (!check.valid) {
    hideResults();
    showError(check.error);
    vinInput.focus();
    return;
  }

  const yearCheck = validateOptionalModelYear(rawModelYear);
  modelYearInput.value = yearCheck.year;
  if (!yearCheck.valid) {
    hideResults();
    showError(yearCheck.error);
    modelYearInput.focus();
    return;
  }

  if (pushUrl) {
    syncResultsUrl(check.vin, yearCheck.year);
  }

  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();

  clearError();
  hideResults();
  setLoading(true);

  try {
    const params = new URLSearchParams({ vin: check.vin });
    if (yearCheck.year) {
      params.set('modelyear', yearCheck.year);
    }

    const response = await fetch(`/api/decode?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: activeController.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const msg =
        (payload && typeof payload.message === 'string' && payload.message) ||
        (response.status >= 500
          ? 'The vehicle lookup service is currently unreachable. Please try again in a moment.'
          : 'Unable to decode this VIN.');
      showError(msg);
      return;
    }

    if (!payload || !payload.manufacturerBlock) {
      showError('No populated vehicle specifications were returned for this VIN.');
      return;
    }

    progressFill.style.width = '100%';
    progressCaption.textContent = 'Estimated progress: 100%';
    renderResults(payload, yearCheck.year);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    showError('Could not reach the VIN decoder service. Please check your connection and try again.');
  } finally {
    activeController = null;
    setLoading(false);
  }
}

function loadFromCurrentUrl() {
  const params = new URLSearchParams(window.location.search);
  const vinParam = params.get('vin') || '';
  const yearParam = params.get('modelYear') || params.get('modelyear') || '';

  if (vinParam.trim()) {
    vinInput.value = normalizeVin(vinParam);
    modelYearInput.value = yearParam.replace(/\D/g, '').slice(0, 4);
    decodeVin(vinInput.value, modelYearInput.value, { pushUrl: false });
  } else {
    clearError();
    hideResults();
  }
}

makeLogo.addEventListener('error', () => {
  makeLogo.hidden = true;
});

vehicleDrawing.addEventListener('error', () => {
  vehicleDrawing.hidden = true;
});

if (printResultsBtn) {
  printResultsBtn.addEventListener('click', () => {
    window.print();
  });
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', () => {
    window.print();
  });
}

setupTabs();

toggleAllDetailsBtn.addEventListener('click', () => {
  setAllDetailsExpanded(allDetailsCard.hidden);
});

backToSummaryBtn.addEventListener('click', () => {
  setAllDetailsExpanded(false);
});

dtPageSize.addEventListener('change', () => {
  pageSize = Number(dtPageSize.value) || 10;
  currentPage = 1;
  renderAllDetailsTable();
});

dtSearchInput.addEventListener('input', () => {
  searchQuery = dtSearchInput.value;
  currentPage = 1;
  renderAllDetailsTable();
});

vinInput.addEventListener('input', () => {
  const pos = vinInput.selectionStart;
  const upper = vinInput.value.toUpperCase();
  if (vinInput.value !== upper) {
    vinInput.value = upper;
    if (typeof pos === 'number') {
      vinInput.setSelectionRange(pos, pos);
    }
  }
  if (!errorBox.hidden) {
    clearError();
  }
});

modelYearInput.addEventListener('input', () => {
  const digits = modelYearInput.value.replace(/\D/g, '').slice(0, 4);
  if (modelYearInput.value !== digits) {
    modelYearInput.value = digits;
  }
  if (!errorBox.hidden) {
    clearError();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  decodeVin(vinInput.value, modelYearInput.value);
});

exampleBtn.addEventListener('click', () => {
  vinInput.value = EXAMPLE_VIN;
  modelYearInput.value = '';
  decodeVin(EXAMPLE_VIN, '');
});

window.addEventListener('popstate', loadFromCurrentUrl);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFromCurrentUrl);
} else {
  loadFromCurrentUrl();
}
