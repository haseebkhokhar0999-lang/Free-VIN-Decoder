const EXAMPLE_VIN = '1HGCM82633A004352';

const RESULT_SECTIONS = [
  {
    title: 'General Vehicle Information',
    keys: ['make', 'model', 'modelYear', 'trim', 'bodyClass'],
  },
  {
    title: 'Engine Details',
    keys: ['engine', 'fuelType', 'transmission', 'driveType'],
  },
  {
    title: 'Plant Information',
    keys: ['plantCountry', 'manufacturer'],
  },
];

const form = document.getElementById('vin-form');
const vinInput = document.getElementById('vin-input');
const modelYearInput = document.getElementById('model-year-input');
const charCounter = document.getElementById('vin-counter');
const decodeBtn = document.getElementById('decode-btn');
const btnLabel = decodeBtn.querySelector('.btn-label');
const exampleBtn = document.getElementById('example-vin-btn');
const errorBox = document.getElementById('vin-error');
const loadingPanel = document.getElementById('loading-panel');
const elapsedCounter = document.getElementById('elapsed-counter');
const progressFill = document.getElementById('progress-fill');
const progressCaption = document.getElementById('progress-caption');
const resultsSection = document.getElementById('results-section');
const resultsHeading = document.getElementById('results-heading');
const decodedVinBadge = document.getElementById('decoded-vin-badge');
const modelYearStatus = document.getElementById('model-year-status');
const resultsWarning = document.getElementById('results-warning');
const resultsGroups = document.getElementById('results-groups');
const clearBtn = document.getElementById('clear-btn');

let activeController = null;
let loadingTimer = null;

function normalizeVin(raw) {
  return String(raw || '').trim().toUpperCase();
}

function validateVinInput(raw) {
  const vin = normalizeVin(raw);

  if (!vin) {
    return { valid: false, vin, error: 'Please enter a 17-character VIN.' };
  }

  const forbidden = [...new Set(vin.match(/[IOQ]/g) || [])];
  if (forbidden.length > 0) {
    return {
      valid: false,
      vin,
      error: `Invalid VIN format: letters I, O, and Q are never valid in a VIN (found: ${forbidden.join(', ')}).`,
    };
  }

  if (/[^A-Z0-9]/.test(vin)) {
    return {
      valid: false,
      vin,
      error: 'Invalid VIN format: only letters (A–Z, excluding I, O, Q) and numbers (0–9) are allowed.',
    };
  }

  if (vin.length !== 17) {
    return {
      valid: false,
      vin,
      error: `Invalid VIN format: a VIN must be exactly 17 characters (entered ${vin.length}).`,
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

function updateCounter() {
  const value = normalizeVin(vinInput.value);
  const len = value.length;
  charCounter.textContent = `${len} / 17`;
  charCounter.classList.remove('is-valid', 'is-invalid');

  if (/[IOQ]/.test(value) || len > 17) {
    charCounter.classList.add('is-invalid');
  } else if (len === 17 && !/[^A-Z0-9]/.test(value)) {
    charCounter.classList.add('is-valid');
  }
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

function renderModelYearConfirmation(enteredYear, specByKey, warningText) {
  modelYearStatus.className = 'alert';
  modelYearStatus.textContent = '';

  if (!enteredYear) {
    modelYearStatus.hidden = true;
    return;
  }

  const decodedYear = specByKey.get('modelYear')?.value || '';
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

function createSectionElement(title, items) {
  const section = document.createElement('section');
  section.className = 'result-section';

  const heading = document.createElement('h3');
  heading.className = 'result-section-heading';
  heading.textContent = title;

  const wrap = document.createElement('div');
  wrap.className = 'table-wrap';

  const table = document.createElement('table');
  table.className = 'specs-table';

  const tbody = document.createElement('tbody');
  for (const spec of items) {
    const row = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = spec.label;

    const td = document.createElement('td');
    td.textContent = spec.value;

    row.append(th, td);
    tbody.append(row);
  }

  table.append(tbody);
  wrap.append(table);
  section.append(heading, wrap);
  return section;
}

function renderResults(data, enteredYear) {
  resultsGroups.textContent = '';

  resultsHeading.textContent = data.summary || 'Vehicle Specs';
  decodedVinBadge.textContent = data.vin;

  const specs = Array.isArray(data.specs) ? data.specs : [];
  const specByKey = new Map(specs.map((item) => [item.key, item]));

  renderModelYearConfirmation(enteredYear, specByKey, data.warning);

  if (data.warning) {
    resultsWarning.textContent = `Registry note: ${data.warning}`;
    resultsWarning.hidden = false;
  } else {
    resultsWarning.textContent = '';
    resultsWarning.hidden = true;
  }

  const assignedKeys = new Set();
  for (const group of RESULT_SECTIONS) {
    const groupItems = [];
    for (const key of group.keys) {
      const spec = specByKey.get(key);
      if (spec) {
        groupItems.push(spec);
        assignedKeys.add(key);
      }
    }
    if (groupItems.length > 0) {
      resultsGroups.append(createSectionElement(group.title, groupItems));
    }
  }

  const extraItems = specs.filter((item) => !assignedKeys.has(item.key));
  if (extraItems.length > 0) {
    const firstSection = resultsGroups.querySelector('.result-section tbody');
    if (firstSection) {
      for (const spec of extraItems) {
        const row = document.createElement('tr');
        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = spec.label;
        const td = document.createElement('td');
        td.textContent = spec.value;
        row.append(th, td);
        firstSection.append(row);
      }
    } else {
      resultsGroups.prepend(createSectionElement('General Vehicle Information', extraItems));
    }
  }

  resultsSection.hidden = false;
}

function hideResults() {
  resultsSection.hidden = true;
  resultsGroups.textContent = '';
  modelYearStatus.hidden = true;
  resultsWarning.hidden = true;
}

async function decodeVin(rawVin, rawModelYear = '') {
  const check = validateVinInput(rawVin);
  vinInput.value = check.vin;
  updateCounter();

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

    if (!payload || !Array.isArray(payload.specs) || payload.specs.length === 0) {
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

vinInput.addEventListener('input', () => {
  const pos = vinInput.selectionStart;
  const upper = vinInput.value.toUpperCase();
  if (vinInput.value !== upper) {
    vinInput.value = upper;
    if (typeof pos === 'number') {
      vinInput.setSelectionRange(pos, pos);
    }
  }
  updateCounter();
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
  updateCounter();
  decodeVin(EXAMPLE_VIN, '');
});

clearBtn.addEventListener('click', () => {
  vinInput.value = '';
  modelYearInput.value = '';
  updateCounter();
  clearError();
  hideResults();
  vinInput.focus();
});

updateCounter();
