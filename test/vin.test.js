import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { PassThrough } from 'node:stream';
import { createApp } from '../server.js';
import { FOOTER_DISCLAIMER, PLACEHOLDER_PAGES } from '../src/pages.js';
import { EXAMPLE_VIN, extractVehicleSpecs, validateVin } from '../src/vin.js';

function dispatchRequest(app, method, requestPath) {
  return new Promise((resolve, reject) => {
    const socket = new PassThrough();
    socket.resume();
    socket.remoteAddress = '127.0.0.1';
    socket.destroy = () => {};

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = requestPath;
    req.headers = { host: 'localhost' };

    const res = new http.ServerResponse(req);
    const chunks = [];

    const origWrite = res.write.bind(res);
    const origEnd = res.end.bind(res);

    res.write = (chunk, encoding, cb) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      return origWrite(chunk, encoding, cb);
    };

    res.end = (chunk, encoding, cb) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      const result = origEnd(chunk, encoding, cb);
      const rawBody = Buffer.concat(chunks).toString('utf8');
      resolve({
        status: res.statusCode,
        headers: res.getHeaders(),
        body: rawBody,
        json() {
          return JSON.parse(rawBody);
        },
      });
      return result;
    };

    res.on('error', reject);
    app(req, res);
    req.push(null);
  });
}

test('validateVin accepts a valid 17-character VIN and normalizes case/whitespace', () => {
  const result = validateVin(`  ${EXAMPLE_VIN.toLowerCase()}  `);
  assert.equal(result.valid, true);
  assert.equal(result.vin, EXAMPLE_VIN);
  assert.equal(result.error, null);
});

test('validateVin rejects letters I, O, and Q with a clear error', () => {
  for (const ch of ['I', 'O', 'Q']) {
    const badVin = `1HGCM82633A00435${ch}`;
    const result = validateVin(badVin);
    assert.equal(result.valid, false);
    assert.match(result.error, /I, O, and Q/);
    assert.match(result.error, new RegExp(ch));
  }
});

test('validateVin accepts partial VINs and rejects VINs longer than 17 characters', () => {
  const partialResult = validateVin('1HGCM826');
  assert.equal(partialResult.valid, true);
  assert.equal(partialResult.vin, '1HGCM826');

  const wildcardResult = validateVin('1HGCM826*3A');
  assert.equal(wildcardResult.valid, true);
  assert.equal(wildcardResult.vin, '1HGCM826*3A');

  const longResult = validateVin('1HGCM82633A0043529');
  assert.equal(longResult.valid, false);
  assert.match(longResult.error, /cannot exceed 17 characters/);
});

test('validateVin rejects non-alphanumeric characters and empty input', () => {
  assert.equal(validateVin('').valid, false);
  assert.equal(validateVin('***').valid, false);
  assert.equal(validateVin('1HGCM826-3A004352').valid, false);
});

test('extractVehicleSpecs extracts full vPIC fields, manufacturer block, other info, and plant info', () => {
  const payload = {
    Results: [
      { VariableId: 143, Variable: 'Error Code', Value: '0', ValueId: '0' },
      {
        VariableId: 191,
        Variable: 'Error Text',
        Value: '0 - VIN decoded clean. Check Digit (9th position) is correct',
        ValueId: '',
      },
      { VariableId: 26, Variable: 'Make', Value: 'HONDA', ValueId: '474' },
      { VariableId: 27, Variable: 'Manufacturer Name', Value: 'AMERICAN HONDA MOTOR CO., INC.', ValueId: '988' },
      { VariableId: 28, Variable: 'Model', Value: 'Accord', ValueId: '1861' },
      { VariableId: 29, Variable: 'Model Year', Value: '2003', ValueId: '' },
      { VariableId: 39, Variable: 'Vehicle Type', Value: 'PASSENGER CAR', ValueId: '2' },
      { VariableId: 38, Variable: 'Trim', Value: 'EX-V6', ValueId: '' },
      { VariableId: 5, Variable: 'Body Class', Value: 'Coupe', ValueId: '3' },
      { VariableId: 25, Variable: 'Gross Vehicle Weight Rating From', Value: 'Class 1C', ValueId: '12' },
      { VariableId: 136, Variable: 'Displacement (L)', Value: '2.998832712', ValueId: '' },
      { VariableId: 9, Variable: 'Engine Number of Cylinders', Value: '6', ValueId: '' },
      { VariableId: 64, Variable: 'Engine Configuration', Value: 'V-Shaped', ValueId: '2' },
      { VariableId: 18, Variable: 'Engine Model', Value: 'J30A4', ValueId: '' },
      { VariableId: 71, Variable: 'Engine Brake (hp) From', Value: '240', ValueId: '' },
      { VariableId: 24, Variable: 'Fuel Type - Primary', Value: 'Gasoline', ValueId: '4' },
      { VariableId: 63, Variable: 'Transmission Speeds', Value: '5', ValueId: '' },
      { VariableId: 37, Variable: 'Transmission Style', Value: 'Automatic', ValueId: '2' },
      { VariableId: 15, Variable: 'Drive Type', Value: 'Not Applicable', ValueId: '0' },
      { VariableId: 65, Variable: 'Front Air Bag Locations', Value: '1st Row (Driver and Passenger)', ValueId: '3' },
      { VariableId: 69, Variable: 'Knee Air Bag Locations', Value: null, ValueId: null },
      { VariableId: 31, Variable: 'Plant City', Value: 'MARYSVILLE', ValueId: '' },
      { VariableId: 77, Variable: 'Plant State', Value: 'OHIO', ValueId: '' },
      { VariableId: 75, Variable: 'Plant Country', Value: 'UNITED STATES (USA)', ValueId: '6' },
    ],
  };

  const extracted = extractVehicleSpecs(payload, { dbas: 'Honda Development & Manufacturing of America, LLC' });
  assert.equal(extracted.found, true);
  assert.equal(extracted.isClean, true);
  assert.equal(extracted.header.title, '2003 HONDA - PASSENGER CAR');
  assert.equal(extracted.header.makeLogoUrl, 'https://vpic.nhtsa.dot.gov/decoder/Images/Logos/HONDA.jpg');
  assert.equal(extracted.header.vehicleImageUrl, 'https://vpic.nhtsa.dot.gov/decoder/images/5/3.png');
  assert.equal(
    extracted.manufacturerBlock.manufacturerUrl,
    'https://vpic.nhtsa.dot.gov/decoder/Manufacturer/Details/988'
  );
  assert.equal(extracted.manufacturerBlock.dbas, 'Honda Development & Manufacturing of America, LLC');
  assert.equal(extracted.otherInfo.series, '');
  assert.equal(extracted.otherInfo.trim, 'EX-V6');
  assert.equal(extracted.otherInfo.cylinders, '6');
  assert.equal(extracted.otherInfo.engineBrakeHp, '240');
  assert.equal(extracted.otherInfo.transmissionSpeed, '5');
  assert.equal(extracted.otherInfo.transmissionStyle, 'Automatic');
  assert.equal(extracted.otherInfo.engineDisplacementL, '2.998832712');
  assert.equal(extracted.otherInfo.airbags.front, '1st Row (Driver and Passenger)');
  assert.equal(extracted.otherInfo.airbags.knee, '');
  assert.equal(extracted.otherInfo.plantInformation, 'MARYSVILLE, OHIO, UNITED STATES (USA)');
  assert.equal(extracted.allDetails.length, 24);
  assert.deepEqual(extracted.allDetails[2], {
    groupName: 'General',
    element: 'Make',
    value: 'HONDA',
  });
});

test('extractVehicleSpecs marks record as not found when core fields are missing', () => {
  const payload = {
    Results: [
      { Variable: 'Error Code', Value: '6, 14' },
      { Variable: 'Error Text', Value: '6 - Incomplete VIN' },
      { Variable: 'Make', Value: '' },
      { Variable: 'Model', Value: null },
    ],
  };

  const extracted = extractVehicleSpecs(payload);
  assert.equal(extracted.found, false);
  assert.deepEqual(extracted.specs, []);
});

test('HTTP routes handle homepage, valid decode, optional modelyear, invalid VIN, VIN not found, and NHTSA unreachable', async () => {
  let mockMode = 'ok';
  let lastRequestedUrl = '';
  const mockFetch = async (url) => {
    lastRequestedUrl = url;
    if (mockMode === 'network_error') {
      throw new Error('ECONNREFUSED');
    }
    if (mockMode === 'http_503') {
      return new Response('Service Unavailable', { status: 503 });
    }
    if (mockMode === 'not_found') {
      return new Response(
        JSON.stringify({
          Results: [
            { Variable: 'Error Code', Value: '6' },
            { Variable: 'Make', Value: '' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({
        Results: [
          { Variable: 'Make', Value: 'HONDA' },
          { Variable: 'Model', Value: 'Accord' },
          { Variable: 'Model Year', Value: '2003' },
          { Variable: 'Plant Country', Value: 'UNITED STATES (USA)' },
          { Variable: 'Error Code', Value: '0' },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const app = createApp({ fetchImpl: mockFetch });

  const homeRes = await dispatchRequest(app, 'GET', '/');
  assert.equal(homeRes.status, 200);
  assert.match(homeRes.body, /Free VIN Decoder is an independent, unofficial tool\./);
  assert.match(homeRes.body, /Official NHTSA Data/);
  assert.match(homeRes.body, /VINs Never Stored/);
  assert.match(homeRes.body, /&copy; 2026 Free VIN Decoder/);
  assert.match(homeRes.body, /id="decoder"/);

  for (const page of PLACEHOLDER_PAGES) {
    const res = await dispatchRequest(app, 'GET', page.path);
    assert.equal(res.status, 200, `Expected 200 for ${page.path}`);
    assert.match(res.body, /Coming Soon/);
    assert.ok(res.body.includes(FOOTER_DISCLAIMER), `Disclaimer missing on ${page.path}`);
    assert.match(res.body, /href="\/#decoder"/);
  }

  const decodeViewRes = await dispatchRequest(app, 'GET', `/decode?vin=${EXAMPLE_VIN}&modelYear=2003`);
  assert.equal(decodeViewRes.status, 200);
  assert.match(decodeViewRes.body, /Show All Vehicle Details/);

  const healthRes = await dispatchRequest(app, 'GET', '/api/health');
  assert.equal(healthRes.status, 200);
  assert.deepEqual(healthRes.json(), { ok: true });

  const invalidRes = await dispatchRequest(app, 'GET', '/api/decode?vin=1HGCM82633A00435O');
  assert.equal(invalidRes.status, 400);
  assert.equal(invalidRes.json().error, 'INVALID_VIN');

  const okRes = await dispatchRequest(app, 'GET', `/api/decode?vin=${EXAMPLE_VIN}`);
  assert.equal(okRes.status, 200);
  assert.equal(okRes.headers['cache-control'], 'no-store');
  assert.equal(lastRequestedUrl.includes('modelyear='), false);
  const okJson = okRes.json();
  assert.equal(okJson.vin, EXAMPLE_VIN);
  assert.equal(okJson.specs.length, 4);

  const yearRes = await dispatchRequest(app, 'GET', `/api/decode?vin=${EXAMPLE_VIN}&modelyear=2003`);
  assert.equal(yearRes.status, 200);
  assert.equal(lastRequestedUrl.includes('modelyear=2003'), true);
  assert.equal(yearRes.json().requestedModelYear, '2003');

  mockMode = 'not_found';
  const notFoundRes = await dispatchRequest(app, 'GET', '/api/decode?vin=11111111111111111');
  assert.equal(notFoundRes.status, 404);
  assert.equal(notFoundRes.json().error, 'VIN_NOT_FOUND');

  mockMode = 'network_error';
  const netErrRes = await dispatchRequest(app, 'GET', `/api/decode?vin=${EXAMPLE_VIN}`);
  assert.equal(netErrRes.status, 502);
  assert.equal(netErrRes.json().error, 'API_UNREACHABLE');

  mockMode = 'http_503';
  const badStatusRes = await dispatchRequest(app, 'GET', `/api/decode?vin=${EXAMPLE_VIN}`);
  assert.equal(badStatusRes.status, 502);
  assert.equal(badStatusRes.json().error, 'API_UNREACHABLE');
});
