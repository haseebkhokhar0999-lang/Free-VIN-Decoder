import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { decodeVinFromNhtsa, NhtsaApiError, validateVin } from './src/vin.js';
import { fetchRecallsFromNhtsa, NhtsaRecallsError, validateRecallQuery } from './src/recalls.js';
import { MAKE_PAGE_PATHS, renderMakePage } from './src/make-pages.js';
import { INFO_PAGE_RENDERERS, renderInfoPage } from './src/info-pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

export function createApp({ fetchImpl } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

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

    const rawYear = Array.isArray(req.query.modelyear) ? req.query.modelyear[0] : req.query.modelyear;
    const modelYear =
      typeof rawYear === 'string' && /^\d{4}$/.test(rawYear.trim()) ? rawYear.trim() : '';

    if (!validation.valid) {
      return res.status(400).json({
        error: 'INVALID_VIN',
        message: validation.error,
      });
    }

    try {
      const result = await decodeVinFromNhtsa(validation.vin, { modelYear, fetchImpl });

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
        ...(modelYear ? { requestedModelYear: modelYear } : {}),
        summary: result.summary,
        warning: result.warning,
        errorCode: result.errorCode,
        errorText: result.errorText,
        isClean: result.isClean,
        header: result.header,
        manufacturerBlock: result.manufacturerBlock,
        otherInfo: result.otherInfo,
        allDetails: result.allDetails,
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

  app.get('/api/recalls', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    const pickQuery = (key) => {
      const val = req.query[key];
      return typeof val === 'string' ? val : Array.isArray(val) ? String(val[0] || '') : '';
    };

    const validation = validateRecallQuery({
      make: pickQuery('make'),
      model: pickQuery('model'),
      modelYear: pickQuery('modelYear') || pickQuery('modelyear') || pickQuery('year'),
    });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'INVALID_RECALL_QUERY',
        message: validation.error,
      });
    }

    try {
      const result = await fetchRecallsFromNhtsa(
        {
          make: validation.make,
          model: validation.model,
          modelYear: validation.modelYear,
        },
        { fetchImpl }
      );
      return res.json(result);
    } catch (err) {
      if (err instanceof NhtsaRecallsError) {
        return res.status(err.status).json({
          error: err.code,
          message: err.message,
        });
      }

      return res.status(502).json({
        error: 'API_UNREACHABLE',
        message: 'Unable to reach the NHTSA Recalls service right now. Please try again in a moment.',
      });
    }
  });

  app.post('/api/contact', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'INVALID_CONTACT_SUBMISSION',
        message: 'Please provide your name, email address, and feedback message.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address.',
      });
    }

    return res.json({
      ok: true,
      message: 'Thank you for your website feedback! Your note has been received.',
    });
  });

  app.get('/decode', (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });

  for (const slug of MAKE_PAGE_PATHS) {
    app.get(slug, (_req, res) => {
      res.type('html').send(renderMakePage(slug));
    });
  }

  for (const routePath of INFO_PAGE_RENDERERS.keys()) {
    app.get(routePath, (_req, res) => {
      res.type('html').send(renderInfoPage(routePath));
    });
  }

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

