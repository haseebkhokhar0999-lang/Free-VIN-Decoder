const NHTSA_RECALLS_BASE_URL = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
const DEFAULT_TIMEOUT_MS = 15000;

export class NhtsaRecallsError extends Error {
  constructor(message, code = 'API_UNREACHABLE', status = 502) {
    super(message);
    this.name = 'NhtsaRecallsError';
    this.code = code;
    this.status = status;
  }
}

function cleanText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatRecallDate(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';

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
    let m = p1 - 1;
    let d = p2;
    if (p1 > 12 && p2 <= 12) {
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

export function validateRecallQuery({ make, model, modelYear } = {}) {
  const cleanMake = cleanText(make);
  const cleanModel = cleanText(model);
  const cleanYear = cleanText(modelYear);

  if (!cleanMake) {
    return {
      valid: false,
      error: 'Please enter a vehicle make (e.g. Honda).',
    };
  }

  if (!cleanModel) {
    return {
      valid: false,
      error: 'Please enter a vehicle model (e.g. Accord).',
    };
  }

  if (!/^\d{4}$/.test(cleanYear)) {
    return {
      valid: false,
      error: 'Please enter a 4-digit model year (e.g. 2003).',
    };
  }

  const yearNum = Number(cleanYear);
  if (yearNum < 1900 || yearNum > 2099) {
    return {
      valid: false,
      error: 'Please enter a valid 4-digit model year between 1900 and 2099.',
    };
  }

  return {
    valid: true,
    make: cleanMake,
    model: cleanModel,
    modelYear: cleanYear,
    error: null,
  };
}

export function extractRecallRecords(payload) {
  const rawResults = Array.isArray(payload?.results) ? payload.results : [];
  return rawResults
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      campaignNumber: cleanText(item.NHTSACampaignNumber),
      component: cleanText(item.Component),
      summary: cleanText(item.Summary),
      remedy: cleanText(item.Remedy),
      consequence: cleanText(item.Consequence),
      reportDate: formatRecallDate(cleanText(item.ReportReceivedDate)),
      parkIt: Boolean(item.parkIt),
      parkOutside: Boolean(item.parkOutSide),
    }))
    .filter((item) => item.campaignNumber || item.component || item.summary || item.remedy);
}

export async function fetchRecallsFromNhtsa(
  { make, model, modelYear },
  { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const params = new URLSearchParams({
    make,
    model,
    modelYear,
  });
  const url = `${NHTSA_RECALLS_BASE_URL}?${params.toString()}`;

  let response;
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new NhtsaRecallsError(
      'Unable to reach the NHTSA Recalls database right now. Please check your connection and try again.',
      'API_UNREACHABLE',
      502
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  // NHTSA Recalls API returns HTTP 400 with { Count: 0, results: [] } when no recalls match.
  const isEmptyValidResponse =
    response.status === 400 && payload && Array.isArray(payload.results) && payload.results.length === 0;

  if (!response.ok && !isEmptyValidResponse) {
    throw new NhtsaRecallsError(
      `The NHTSA Recalls database returned an unexpected status (${response.status}). Please try again shortly.`,
      'API_UNREACHABLE',
      502
    );
  }

  if (!payload || !Array.isArray(payload.results)) {
    throw new NhtsaRecallsError(
      'The NHTSA Recalls service returned an invalid response. Please try again shortly.',
      'API_UNREACHABLE',
      502
    );
  }

  const recalls = extractRecallRecords(payload);
  return {
    make,
    model,
    modelYear,
    count: recalls.length,
    recalls,
    source: 'NHTSA Recalls API',
  };
}

