const EXAMPLE_VIN = '1HGCM82633A004352';

const form = document.getElementById('vin-form');
const vinInput = document.getElementById('vin-input');
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
const resultsWarning = document.getElementById('results-warning');
const specsTbody = document.getElementById('specs-tbody');
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

function renderResults(data) {
  specsTbody.textContent = '';

  resultsHeading.textContent = data.summary || 'Vehicle Specs';
  decodedVinBadge.textContent = data.vin;

  if (data.warning) {
    resultsWarning.textContent = `NHTSA note: ${data.warning}`;
    resultsWarning.hidden = false;
  } else {
    resultsWarning.textContent = '';
    resultsWarning.hidden = true;
  }

  for (const spec of data.specs || []) {
    const row = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = spec.label;

    const td = document.createElement('td');
    td.textContent = spec.value;

    row.append(th, td);
    specsTbody.append(row);
  }

  resultsSection.hidden = false;
}

function hideResults() {
  resultsSection.hidden = true;
  specsTbody.textContent = '';
  resultsWarning.hidden = true;
}

async function decodeVin(rawVin) {
  const check = validateVinInput(rawVin);
  vinInput.value = check.vin;
  updateCounter();

  if (!check.valid) {
    hideResults();
    showError(check.error);
    vinInput.focus();
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
    const response = await fetch(`/api/decode?vin=${encodeURIComponent(check.vin)}`, {
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
          ? 'The NHTSA vPIC service is currently unreachable. Please try again in a moment.'
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
    renderResults(payload);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    showError('Could not reach the VIN decoder service. Please check your connection and try again.');
  } finally {
    activeController = null;
    setLoading(false);
  }
}

vinInput.addEventListener('input', () => {
  updateCounter();
  if (!errorBox.hidden) {
    clearError();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  decodeVin(vinInput.value);
});

exampleBtn.addEventListener('click', () => {
  vinInput.value = EXAMPLE_VIN;
  updateCounter();
  decodeVin(EXAMPLE_VIN);
});

clearBtn.addEventListener('click', () => {
  vinInput.value = '';
  updateCounter();
  clearError();
  hideResults();
  vinInput.focus();
});

updateCounter();

