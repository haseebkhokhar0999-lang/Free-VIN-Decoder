function bootRecallCheck() {
  const form = document.getElementById('recall-form');
  const makeInput = document.getElementById('recall-make');
  const modelInput = document.getElementById('recall-model');
  const yearInput = document.getElementById('recall-year');
  const submitBtn = document.getElementById('recall-submit-btn');
  const btnLabel = submitBtn?.querySelector('.btn-label');
  const exampleBtn = document.getElementById('recall-example-btn');
  const errorBox = document.getElementById('recall-error');
  const loadingBox = document.getElementById('recall-loading');
  const elapsedEl = document.getElementById('recall-elapsed');
  const progressEl = document.getElementById('recall-progress');
  const resultsCard = document.getElementById('recall-results-card');
  const resultsBody = document.getElementById('recall-results-body');

  if (!form || !makeInput || !modelInput || !yearInput) return;

  let activeController = null;
  let timerId = null;

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.hidden = true;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('is-loading', isLoading);
    if (btnLabel) {
      btnLabel.textContent = isLoading ? 'Checking…' : 'Check Recalls';
    }

    if (isLoading) {
      const start = performance.now();
      elapsedEl.textContent = '0.0s';
      progressEl.style.width = '10%';
      loadingBox.hidden = false;

      if (timerId !== null) window.clearInterval(timerId);
      timerId = window.setInterval(() => {
        const sec = (performance.now() - start) / 1000;
        const pct = Math.min(92, Math.round(10 + 82 * (1 - Math.exp(-sec / 2))));
        elapsedEl.textContent = `${sec.toFixed(1)}s`;
        progressEl.style.width = `${pct}%`;
      }, 100);
    } else {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
      loadingBox.hidden = true;
      progressEl.style.width = '0%';
    }
  }

  async function runRecallCheck(makeVal, modelVal, yearVal, { pushUrl = true } = {}) {
    const make = String(makeVal || '').trim();
    const model = String(modelVal || '').trim();
    const modelYear = String(yearVal || '').trim();

    if (!make) {
      resultsCard.hidden = true;
      showError('Please enter a vehicle make (e.g. Honda).');
      makeInput.focus();
      return;
    }
    if (!model) {
      resultsCard.hidden = true;
      showError('Please enter a vehicle model (e.g. Accord).');
      modelInput.focus();
      return;
    }
    if (!/^\d{4}$/.test(modelYear)) {
      resultsCard.hidden = true;
      showError('Please enter a 4-digit model year (e.g. 2003).');
      yearInput.focus();
      return;
    }

    if (pushUrl) {
      const nextParams = new URLSearchParams({ make, model, modelYear });
      window.history.pushState({ make, model, modelYear }, '', `/recall-check?${nextParams.toString()}`);
    }

    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();

    clearError();
    resultsCard.hidden = true;
    setLoading(true);

    try {
      const data = await window.VinRecallsUI.fetchRecalls({
        make,
        model,
        modelYear,
        signal: activeController.signal,
      });
      progressEl.style.width = '100%';
      window.VinRecallsUI.renderRecallsResult(resultsBody, data);
      resultsCard.hidden = false;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      showError(err?.message || 'Unable to check safety recalls right now.');
    } finally {
      activeController = null;
      setLoading(false);
    }
  }

  yearInput.addEventListener('input', () => {
    const digits = yearInput.value.replace(/\D/g, '').slice(0, 4);
    if (yearInput.value !== digits) {
      yearInput.value = digits;
    }
    if (!errorBox.hidden) clearError();
  });

  [makeInput, modelInput].forEach((input) => {
    input.addEventListener('input', () => {
      if (!errorBox.hidden) clearError();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runRecallCheck(makeInput.value, modelInput.value, yearInput.value);
  });

  if (exampleBtn) {
    exampleBtn.addEventListener('click', () => {
      makeInput.value = 'Honda';
      modelInput.value = 'Accord';
      yearInput.value = '2003';
      runRecallCheck('Honda', 'Accord', '2003');
    });
  }

  function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('make') || '';
    const mod = params.get('model') || '';
    const y = params.get('modelYear') || params.get('year') || '';

    if (m) makeInput.value = m;
    if (mod) modelInput.value = mod;
    if (y) yearInput.value = y.replace(/\D/g, '').slice(0, 4);

    if (m.trim() && mod.trim() && /^\d{4}$/.test(yearInput.value.trim())) {
      runRecallCheck(makeInput.value, modelInput.value, yearInput.value, { pushUrl: false });
    }
  }

  window.addEventListener('popstate', loadFromUrl);
  loadFromUrl();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootRecallCheck);
} else {
  bootRecallCheck();
}

