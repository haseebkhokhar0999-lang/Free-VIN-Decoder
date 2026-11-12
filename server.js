import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { decodeVinFromNhtsa, NhtsaApiError, validateVin } from './src/vin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

export function createApp({ fetchImpl } = {}) {
  const app = express();

  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  app.use(express.static(PUBLIC_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  async function handleDecode(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    const rawParam = req.params.vin ?? (Array.isArray(req.query.vin) ? req.query.vin[0] : req.query.vin);
    const validation = validateVin(typeof rawParam === 'string' ? rawParam : '');

    if (!validation.valid) {
      return res.status(400).json({
        error: 'INVALID_VIN',
        message: validation.error,
      });
    }

    try {
      const result = await decodeVinFromNhtsa(validation.vin, { fetchImpl });

      if (!result.found) {
        return res.status(404).json({
          error: 'VIN_NOT_FOUND',
          vin: validation.vin,
          message:
            'No vehicle record was found for this VIN in the NHTSA database. Double-check each character, or note that pre-1981 vehicles and some non-US market vehicles may not appear in NHTSA records.',
        });
      }

      return res.json({
        vin: validation.vin,
        summary: result.summary,
        warning: result.warning,
        specs: result.specs,
        source: 'NHTSA vPIC API',
      });
    } catch (err) {
      if (err instanceof NhtsaApiError) {
        return res.status(err.status).json({
          error: err.code,
          message: err.message,
        });
      }

      return res.status(502).json({
        error: 'API_UNREACHABLE',
        message: 'Unable to reach the NHTSA vPIC service right now. Please try again in a moment.',
      });
    }
  }

  app.get('/api/decode', handleDecode);
  app.get('/api/decode/:vin', handleDecode);

  app.get('/', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });

  return app;
}

const app = createApp();

const isDirectExecution =
  typeof process.argv[1] === 'string' && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution && !process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Free VIN Decoder listening on http://localhost:${port}`);
  });
}

export default app;

