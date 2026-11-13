(function (global) {
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatRecallDate(raw) {
    if (!raw) return '';
    const s = String(raw).trim();
    if (!s) return '';

    const alreadyFormattedMatch = s.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
    if (alreadyFormattedMatch) {
      const d = parseInt(alreadyFormattedMatch[1], 10);
      const mStr = alreadyFormattedMatch[2].slice(0, 3).toLowerCase();
      const capM = mStr.charAt(0).toUpperCase() + mStr.slice(1);
      const y = alreadyFormattedMatch[3];
      return `${d} ${capM} ${y}`;
    }

    const msMatch = s.match(/\/Date\((\d+)\)\//i);
    if (msMatch) {
      const d = new Date(Number(msMatch[1]));
      if (!isNaN(d.getTime())) {
        return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      }
    }

    const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);
      if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
        return `${d} ${MONTH_NAMES[m]} ${y}`;
      }
    }

    const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (slashMatch) {
      const p1 = parseInt(slashMatch[1], 10);
      const p2 = parseInt(slashMatch[2], 10);
      const y = parseInt(slashMatch[3], 10);

      let d;
      let m;
      if (p2 > 12 && p1 <= 12) {
        // Second number is greater than 12: month-first (MM/DD/YYYY)
        m = p1 - 1;
        d = p2;
      } else {
        // First number is greater than 12, or both numbers are 12 or less: day-first (DD/MM/YYYY)
        d = p1;
        m = p2 - 1;
      }

      if (m >= 0 && m < 12 && d >= 1 && d <= 31) {
        return `${d} ${MONTH_NAMES[m]} ${y}`;
      }
    }

    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getUTCDate()} ${MONTH_NAMES[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
    }

    return s;
  }

  function createNhtsaRecallNotice() {
    const note = document.createElement('p');
    note.className = 'recall-disclaimer';
    note.append(
      'Vehicle-level recall campaigns are retrieved from the public NHTSA Recalls API by make, model, and model year. Only unrepaired recalls remain open for a specific vehicle, and recalls older than 15 years may not appear. Verify VIN-specific open recalls at '
    );

    const link = document.createElement('a');
    link.href = 'https://www.nhtsa.gov/recalls';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'NHTSA.gov/recalls';

    note.append(link, '.');
    return note;
  }

  function renderRecallsLoading(container, label = 'Checking NHTSA open safety recalls…') {
    if (!container) return;
    container.textContent = '';

    const box = document.createElement('div');
    box.className = 'recalls-loading';

    const spinner = document.createElement('span');
    spinner.className = 'inline-spinner';
    spinner.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = label;

    box.append(spinner, text);
    container.append(box);
  }

  function renderRecallsMessage(container, message, { isError = false, includeNotice = false } = {}) {
    if (!container) return;
    container.textContent = '';

    const box = document.createElement('div');
    box.className = isError ? 'alert alert-error' : 'recalls-empty';
    box.textContent = message;
    container.append(box);

    if (includeNotice) {
      container.append(createNhtsaRecallNotice());
    }
  }

  function appendRecallRow(list, label, value) {
    if (!value) return;
    const p = document.createElement('p');
    p.className = 'recall-detail';

    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;

    p.append(strong, document.createTextNode(value));
    list.append(p);
  }

  function renderRecallsResult(container, data) {
    if (!container) return;
    container.textContent = '';

    const recalls = Array.isArray(data?.recalls) ? data.recalls : [];
    const vehicleLabel = [data?.modelYear, data?.make, data?.model].filter(Boolean).join(' ');

    if (recalls.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'status-banner status-success recalls-none-banner';
      empty.textContent = vehicleLabel
        ? `No open recalls found for this vehicle (${vehicleLabel}).`
        : 'No open recalls found for this vehicle.';
      container.append(empty, createNhtsaRecallNotice());
      return;
    }

    const summary = document.createElement('p');
    summary.className = 'recalls-summary';
    summary.textContent = `${recalls.length} safety recall ${recalls.length === 1 ? 'campaign' : 'campaigns'} found${vehicleLabel ? ` for ${vehicleLabel}` : ''}:`;
    container.append(summary);

    const list = document.createElement('div');
    list.className = 'recalls-list';

    for (const recall of recalls) {
      const card = document.createElement('article');
      card.className = 'recall-item';

      const top = document.createElement('div');
      top.className = 'recall-item-header';

      const title = document.createElement('h4');
      title.className = 'recall-item-title';
      title.textContent = recall.component || 'Safety Recall Campaign';
      top.append(title);

      const meta = document.createElement('div');
      meta.className = 'recall-badges';

      if (recall.campaignNumber) {
        const badge = document.createElement('span');
        badge.className = 'recall-campaign-badge';
        badge.textContent = `Campaign #${recall.campaignNumber}`;
        meta.append(badge);
      }

      if (recall.reportDate) {
        const dateBadge = document.createElement('span');
        dateBadge.className = 'recall-date-badge';
        dateBadge.textContent = `Reported: ${formatRecallDate(recall.reportDate)}`;
        meta.append(dateBadge);
      }

      if (recall.parkIt) {
        const parkItBadge = document.createElement('span');
        parkItBadge.className = 'recall-danger-badge';
        parkItBadge.textContent = 'Do Not Drive';
        meta.append(parkItBadge);
      }

      if (recall.parkOutside) {
        const parkOutBadge = document.createElement('span');
        parkOutBadge.className = 'recall-warn-badge';
        parkOutBadge.textContent = 'Park Outside';
        meta.append(parkOutBadge);
      }

      if (meta.childNodes.length > 0) {
        top.append(meta);
      }

      card.append(top);
      appendRecallRow(card, 'Summary', recall.summary);
      appendRecallRow(card, 'Consequence', recall.consequence);
      appendRecallRow(card, 'Remedy', recall.remedy);

      list.append(card);
    }

    container.append(list, createNhtsaRecallNotice());
  }

  async function fetchRecalls({ make, model, modelYear, signal }) {
    const params = new URLSearchParams({
      make: String(make || '').trim(),
      model: String(model || '').trim(),
      modelYear: String(modelYear || '').trim(),
    });

    const response = await fetch(`/api/recalls?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
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
        'Unable to check safety recalls right now. Please try again shortly.';
      throw new Error(msg);
    }

    return payload;
  }

  global.VinRecallsUI = {
    fetchRecalls,
    renderRecallsLoading,
    renderRecallsMessage,
    renderRecallsResult,
  };
})(window);

