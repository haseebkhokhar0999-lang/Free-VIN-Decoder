import { VARIABLE_GROUPS } from './vpic-groups.js';

export const EXAMPLE_VIN = '1HGCM82633A004352';

const NHTSA_DECODE_EXTENDED_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended';
const NHTSA_MFG_DETAILS_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetManufacturerDetails';
const DEFAULT_TIMEOUT_MS = 15000;
const MFG_TIMEOUT_MS = 5000;

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
      error: 'Please enter a VIN.',
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

  return {
    valid: true,
    vin,
    error: null,
  };
}

function cleanRawString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function cleanValue(value) {
  const trimmed = cleanRawString(value);
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

export function extractVehicleSpecs(nhtsaPayload, { dbas = '' } = {}) {
  const results = Array.isArray(nhtsaPayload?.Results) ? nhtsaPayload.Results : null;
  if (!results || results.length === 0) {
    return {
      found: false,
      specs: [],
      summary: null,
      warning: null,
      errorCode: '',
      errorText: '',
      header: null,
      manufacturerBlock: null,
      otherInfo: null,
      allDetails: [],
    };
  }

  const map = new Map();
  const rowByVariable = new Map();
  const allDetails = [];

  for (const row of results) {
    if (!row || typeof row.Variable !== 'string') continue;
    const key = row.Variable.trim();
    const rawVal = cleanRawString(row.Value);
    const val = cleanValue(row.Value);
    const valueId = cleanRawString(row.ValueId);
    const variableId = row.VariableId ?? null;

    if (key && !rowByVariable.has(key)) {
      rowByVariable.set(key, { value: rawVal, cleanValue: val, valueId, variableId });
    }
    if (key && val && !map.has(key)) {
      map.set(key, val);
    }

    allDetails.push({
      groupName: (variableId != null && VARIABLE_GROUPS[variableId]) || '',
      element: key,
      value: rawVal,
    });
  }

  const get = (name) => map.get(name) || '';
  const getRaw = (name) => rowByVariable.get(name)?.cleanValue || '';
  const getValueId = (name) => rowByVariable.get(name)?.valueId || '';

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
      errorCode,
      errorText,
      header: null,
      manufacturerBlock: null,
      otherInfo: null,
      allDetails: [],
    };
  }

  const make = getRaw('Make');
  const model = getRaw('Model');
  const modelYear = getRaw('Model Year');
  const vehicleType = getRaw('Vehicle Type');
  const bodyClass = getRaw('Body Class');
  const bodyClassId = getValueId('Body Class');
  const manufacturerName = getRaw('Manufacturer Name') || getRaw('Manufacturer');
  const manufacturerId = getValueId('Manufacturer Name');

  const summaryParts = [modelYear, make, model].filter(Boolean);
  const headingLead = [modelYear, make].filter(Boolean).join(' ').toUpperCase();
  const headingTitle = vehicleType
    ? `${headingLead}${headingLead ? ' - ' : ''}${vehicleType.toUpperCase()}`
    : headingLead || 'VEHICLE DECODED';

  const plantParts = [getRaw('Plant City'), getRaw('Plant State'), getRaw('Plant Country')].filter(Boolean);

  return {
    found: true,
    specs,
    summary: summaryParts.length > 0 ? summaryParts.join(' ') : null,
    warning: hasNonZeroErrorCode(errorCode) && errorText ? errorText : null,
    errorCode,
    errorText,
    isClean: !hasNonZeroErrorCode(errorCode),
    header: {
      title: headingTitle,
      makeLogoUrl: make
        ? `https://vpic.nhtsa.dot.gov/decoder/Images/Logos/${encodeURIComponent(make.toUpperCase())}.jpg`
        : '',
      vehicleImageUrl:
        bodyClassId && /^\d+$/.test(bodyClassId) && bodyClassId !== '0'
          ? `https://vpic.nhtsa.dot.gov/decoder/images/5/${encodeURIComponent(bodyClassId)}.png`
          : '',
    },
    manufacturerBlock: {
      manufacturer: manufacturerName,
      manufacturerUrl:
        manufacturerId && /^\d+$/.test(manufacturerId)
          ? `https://vpic.nhtsa.dot.gov/decoder/Manufacturer/Details/${encodeURIComponent(manufacturerId)}`
          : '',
      dbas: cleanRawString(dbas),
      vehicleType,
      modelYear,
      make,
      model,
      bodyClass,
    },
    otherInfo: {
      series: getRaw('Series'),
      trim: joinUnique([getRaw('Trim'), getRaw('Trim2')]),
      gvwr: getRaw('Gross Vehicle Weight Rating From'),
      driveType: getRaw('Drive Type'),
      cylinders: getRaw('Engine Number of Cylinders'),
      primaryFuelType: getRaw('Fuel Type - Primary') || getRaw('Fuel Type'),
      electrificationLevel: getRaw('Electrification Level'),
      secondaryFuelType: getRaw('Fuel Type - Secondary'),
      engineModel: getRaw('Engine Model'),
      engineBrakeHp: getRaw('Engine Brake (hp) From'),
      engineManufacturer: getRaw('Engine Manufacturer'),
      transmissionSpeed: getRaw('Transmission Speeds'),
      transmissionStyle: getRaw('Transmission Style') || getRaw('Transmission'),
      engineDisplacementL: getRaw('Displacement (L)'),
      airbags: {
        front: getRaw('Front Air Bag Locations'),
        knee: getRaw('Knee Air Bag Locations'),
        side: getRaw('Side Air Bag Locations'),
        curtain: getRaw('Curtain Air Bag Locations'),
        seatCushion: getRaw('Seat Cushion Air Bag Locations'),
        otherRestraintInfo: getRaw('Other Restraint System Info'),
      },
      plantInformation: plantParts.join(', '),
    },
    allDetails,
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

async function fetchManufacturerDbas(mfrId, fetchImpl) {
  if (!mfrId || !/^\d+$/.test(mfrId)) return '';
  try {
    const res = await fetchImpl(`${NHTSA_MFG_DETAILS_BASE_URL}/${encodeURIComponent(mfrId)}?format=json`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(MFG_TIMEOUT_MS),
    });
    if (!res.ok) return '';
    const data = await res.json();
    const first = Array.isArray(data?.Results) ? data.Results[0] : null;
    return first && typeof first.DBAs === 'string' ? first.DBAs.trim() : '';
  } catch {
    return '';
  }
}

export async function decodeVinFromNhtsa(
  vin,
  { modelYear = '', fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}
) {
  const cleanYear = typeof modelYear === 'string' && /^\d{4}$/.test(modelYear.trim()) ? modelYear.trim() : '';
  const query = cleanYear ? `?format=json&modelyear=${encodeURIComponent(cleanYear)}` : '?format=json';
  const url = `${NHTSA_DECODE_EXTENDED_BASE_URL}/${encodeURIComponent(vin)}${query}`;

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

  const mfrRow = Array.isArray(payload?.Results)
    ? payload.Results.find((row) => row && row.Variable === 'Manufacturer Name')
    : null;
  const mfrId = mfrRow && mfrRow.ValueId ? String(mfrRow.ValueId).trim() : '';
  const dbas = await fetchManufacturerDbas(mfrId, fetchImpl);

  return extractVehicleSpecs(payload, { dbas });
}
