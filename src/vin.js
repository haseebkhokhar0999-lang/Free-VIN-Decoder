export const EXAMPLE_VIN = '1HGCM82633A004352';

const NHTSA_DECODE_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin';
const DEFAULT_TIMEOUT_MS = 15000;

const EMPTY_VALUES = new Set(['', 'null', 'not applicable', 'n/a', 'na', 'unknown']);

export function normalizeVin(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase();
}

export function validateVin(raw) {
  const vin = normalizeVin(raw);

  if (!vin) {
    return {
      valid: false,
      vin,
      error: 'Please enter a 17-character VIN.',
    };
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

  return {
    valid: true,
    vin,
    error: null,
  };
}

function cleanValue(value) {
  if (value === null || value === undefined) return '';
  const trimmed = String(value).trim();
  if (!trimmed || EMPTY_VALUES.has(trimmed.toLowerCase())) {
    return '';
  }
  return trimmed;
}

function joinUnique(values, separator = ' / ') {
  const seen = new Set();
  const out = [];
  for (const val of values) {
    const cleaned = cleanValue(val);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(cleaned);
    }
  }
  return out.join(separator);
}

function formatDisplacementLiters(raw) {
  const cleaned = cleanValue(raw);
  if (!cleaned) return '';
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return cleaned;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return cleaned;
  return `${num.toFixed(1)}L`;
}

function buildEngineSpec(get) {
  const parts = [];
  const dispL = formatDisplacementLiters(get('Displacement (L)'));
  const dispCC = cleanValue(get('Displacement (CC)'));
  const cylinders = cleanValue(get('Engine Number of Cylinders'));
  const config = cleanValue(get('Engine Configuration'));
  const model = cleanValue(get('Engine Model'));
  const hp = cleanValue(get('Engine Brake (hp) From'));
  const kw = cleanValue(get('Engine Power (kW)'));

  if (dispL) {
    parts.push(dispL);
  } else if (dispCC) {
    parts.push(`${dispCC} cc`);
  }

  if (cylinders) {
    parts.push(/^\d+$/.test(cylinders) ? `${cylinders}-cyl` : cylinders);
  }

  if (config) {
    parts.push(config);
  }

  if (model) {
    parts.push(`(${model})`);
  }

  if (hp) {
    parts.push(`${hp} hp`);
  } else if (kw && !dispL && !cylinders) {
    parts.push(`${kw} kW`);
  }

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return cleanValue(get('Engine'));
}

function buildTransmissionSpec(get) {
  const speeds = cleanValue(get('Transmission Speeds'));
  const style = cleanValue(get('Transmission Style'));

  if (speeds && style) {
    const speedLabel = /^\d+$/.test(speeds) ? `${speeds}-Speed` : speeds;
    return `${speedLabel} ${style}`;
  }
  if (style) return style;
  if (speeds) return /^\d+$/.test(speeds) ? `${speeds}-Speed` : speeds;
  return cleanValue(get('Transmission'));
}

function hasNonZeroErrorCode(errorCodeRaw) {
  const cleaned = cleanValue(errorCodeRaw);
  if (!cleaned) return false;
  const tokens = cleaned
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return tokens.some((token) => {
    const match = token.match(/^(\d+)/);
    return match ? match[1] !== '0' : true;
  });
}

export function extractVehicleSpecs(nhtsaPayload) {
  const results = Array.isArray(nhtsaPayload?.Results) ? nhtsaPayload.Results : null;
  if (!results || results.length === 0) {
    return {
      found: false,
      specs: [],
      summary: null,
      warning: null,
    };
  }

  const map = new Map();
  for (const row of results) {
    if (!row || typeof row.Variable !== 'string') continue;
    const key = row.Variable.trim();
    const val = cleanValue(row.Value);
    if (key && val && !map.has(key)) {
      map.set(key, val);
    }
  }

  const get = (name) => map.get(name) || '';

  const candidates = [
    { key: 'make', label: 'Make', value: get('Make') },
    { key: 'model', label: 'Model', value: get('Model') },
    { key: 'modelYear', label: 'Model Year', value: get('Model Year') },
    { key: 'trim', label: 'Trim', value: joinUnique([get('Trim'), get('Trim2')]) },
    { key: 'bodyClass', label: 'Body Class', value: get('Body Class') },
    { key: 'engine', label: 'Engine', value: buildEngineSpec(get) },
    {
      key: 'fuelType',
      label: 'Fuel Type',
      value: joinUnique([get('Fuel Type - Primary'), get('Fuel Type - Secondary')]) || get('Fuel Type'),
    },
    { key: 'transmission', label: 'Transmission', value: buildTransmissionSpec(get) },
    { key: 'driveType', label: 'Drive Type', value: get('Drive Type') },
    { key: 'plantCountry', label: 'Plant Country', value: get('Plant Country') },
    { key: 'manufacturer', label: 'Manufacturer', value: get('Manufacturer Name') || get('Manufacturer') },
  ];

  const specs = candidates.filter((item) => item.value !== '');

  const hasCoreIdentity = Boolean(
    get('Make') || get('Model') || get('Model Year') || get('Body Class') || get('Manufacturer Name')
  );

  const errorCode = get('Error Code');
  const errorText = get('Error Text') || get('Additional Error Text');

  if (!hasCoreIdentity || specs.length === 0) {
    return {
      found: false,
      specs: [],
      summary: null,
      warning: errorText || null,
    };
  }

  const summaryParts = [get('Model Year'), get('Make'), get('Model')].filter(Boolean);

  return {
    found: true,
    specs,
    summary: summaryParts.length > 0 ? summaryParts.join(' ') : null,
    warning: hasNonZeroErrorCode(errorCode) && errorText ? errorText : null,
  };
}

export class NhtsaApiError extends Error {
  constructor(message, code = 'API_UNREACHABLE', status = 502) {
    super(message);
    this.name = 'NhtsaApiError';
    this.code = code;
    this.status = status;
  }
}

export async function decodeVinFromNhtsa(
  vin,
  { modelYear = '', fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const cleanYear = typeof modelYear === 'string' && /^\d{4}$/.test(modelYear.trim()) ? modelYear.trim() : '';
  const query = cleanYear ? `?format=json&modelyear=${encodeURIComponent(cleanYear)}` : '?format=json';
  const url = `${NHTSA_DECODE_BASE_URL}/${encodeURIComponent(vin)}${query}`;

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
    throw new NhtsaApiError(
      'Unable to reach the NHTSA vPIC vehicle database right now. Please check your connection and try again.',
      'API_UNREACHABLE',
      502
    );
  }

  if (!response.ok) {
    throw new NhtsaApiError(
      `The NHTSA vPIC vehicle database returned an unexpected status (${response.status}). Please try again shortly.`,
      'API_UNREACHABLE',
      502
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new NhtsaApiError(
      'The NHTSA vPIC service returned an invalid response. Please try again shortly.',
      'API_UNREACHABLE',
      502
    );
  }

  return extractVehicleSpecs(payload);
}

