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
const vehicleDrawing = document.getElementById('vehicle-drawing');

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
  allDetailsCard.hidden = !expanded;
  otherInfoCard.hidden = expanded;
  toggleAllDetailsBtn.setAttribute('aria-expanded', String(expanded));
  toggleAllDetailsBtn.textContent = expanded ? 'Hide All Vehicle Details' : 'Show All Vehicle Details';
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

function renderOtherInfo(other) {
  otherInfoGrid.textContent = '';
  for (const field of OTHER_INFO_FIELDS) {
    const item = document.createElement('div');
    item.className = 'other-info-item';

    const label = document.createElement('strong');
    label.textContent = `${field.label}: `;

    const value = document.createTextNode(other?.[field.key] || '');
    item.append(label, value);
    otherInfoGrid.append(item);
  }

  airbagsList.textContent = '';
  const airbags = other?.airbags || {};
  for (const field of AIRBAG_FIELDS) {
    const li = document.createElement('li');
    const label = document.createElement('strong');
    label.textContent = `${field.label}: `;
    const value = document.createTextNode(airbags[field.key] || '');
    li.append(label, value);
    airbagsList.append(li);
  }

  valPlantInfo.textContent = other?.plantInformation || '';
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

  valManufacturer.textContent = '';
  if (mfg.manufacturer && mfg.manufacturerUrl) {
    const link = document.createElement('a');
    link.href = mfg.manufacturerUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = mfg.manufacturer;
    valManufacturer.append(link);
  } else {
    valManufacturer.textContent = mfg.manufacturer || '';
  }

  valDbas.textContent = mfg.dbas || '';
  valVehicleType.textContent = mfg.vehicleType || '';
  valModelYear.textContent = mfg.modelYear || '';
  valMake.textContent = mfg.make || '';
  valModel.textContent = mfg.model || '';
  valBodyClass.textContent = mfg.bodyClass || '';

  if (header.vehicleImageUrl) {
    vehicleDrawing.alt = mfg.bodyClass ? `${mfg.bodyClass} illustration` : 'Vehicle illustration';
    vehicleDrawing.hidden = false;
    vehicleDrawing.src = header.vehicleImageUrl;
  } else {
    vehicleDrawing.hidden = true;
    vehicleDrawing.removeAttribute('src');
  }

  renderOtherInfo(data.otherInfo);

  allDetailsRows = Array.isArray(data.allDetails) ? data.allDetails : [];
  currentPage = 1;
  searchQuery = '';
  dtSearchInput.value = '';
  dtPageSize.value = String(pageSize);
  renderAllDetailsTable();
  setAllDetailsExpanded(false);

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

exportPdfBtn.addEventListener('click', () => {
  window.print();
});

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
