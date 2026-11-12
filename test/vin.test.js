import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { PassThrough } from 'node:stream';
import { createApp } from '../server.js';
import { EXAMPLE_VIN, extractVehicleSpecs, validateVin } from '../src/vin.js';

function dispatchRequest(app, method, requestPath) {
  return new Promise((resolve, reject) => {
    const socket = new PassThrough();
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

test('validateVin rejects VINs shorter or longer than 17 characters', () => {
  const shortResult = validateVin('1HGCM82633A00435');
  assert.equal(shortResult.valid, false);
  assert.match(shortResult.error, /exactly 17 characters/);

  const longResult = validateVin('1HGCM82633A0043529');
  assert.equal(longResult.valid, false);
  assert.match(longResult.error, /exactly 17 characters/);
});

test('validateVin rejects non-alphanumeric characters and empty input', () => {
  assert.equal(validateVin('').valid, false);
  assert.equal(validateVin('1HGCM826-3A004352').valid, false);
});

test('extractVehicleSpecs extracts only populated fields among the 11 expected specs', () => {
  const payload = {
    Results: [
      { Variable: 'Make', Value: 'HONDA' },
      { Variable: 'Model', Value: 'Accord' },
      { Variable: 'Model Year', Value: '2003' },
      { Variable: 'Trim', Value: '' },
      { Variable: 'Body Class', Value: 'Sedan/Saloon' },
      { Variable: 'Displacement (L)', Value: '2.998832712' },
      { Variable: 'Engine Number of Cylinders', Value: '4' },
      { Variable: 'Engine Configuration', Value: 'In-Line' },
      { Variable: 'Engine Model', Value: 'K24A4' },
      { Variable: 'Fuel Type - Primary', Value: 'Gasoline' },
      { Variable: 'Transmission Speeds', Value: '5' },
      { Variable: 'Transmission Style', Value: 'Automatic' },
      { Variable: 'Drive Type', Value: 'Not Applicable' },
      { Variable: 'Plant Country', Value: 'UNITED STATES (USA)' },
      { Variable: 'Manufacturer Name', Value: 'HONDA OF AMERICA MFG., INC.' },
      { Variable: 'Error Code', Value: '0' },
    ],
  };

  const extracted = extractVehicleSpecs(payload);
  assert.equal(extracted.found, true);
  assert.equal(extracted.summary, '2003 HONDA Accord');
  assert.equal(extracted.warning, null);

  const byLabel = Object.fromEntries(extracted.specs.map((item) => [item.label, item.value]));
  assert.equal(byLabel['Make'], 'HONDA');
  assert.equal(byLabel['Model'], 'Accord');
  assert.equal(byLabel['Model Year'], '2003');
  assert.equal('Trim' in byLabel, false);
  assert.equal('Drive Type' in byLabel, false);
  assert.equal(byLabel['Body Class'], 'Sedan/Saloon');
  assert.equal(byLabel['Engine'], '3.0L 4-cyl In-Line (K24A4)');
  assert.equal(byLabel['Fuel Type'], 'Gasoline');
  assert.equal(byLabel['Transmission'], '5-Speed Automatic');
  assert.equal(byLabel['Plant Country'], 'UNITED STATES (USA)');
  assert.equal(byLabel['Manufacturer'], 'HONDA OF AMERICA MFG., INC.');
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
