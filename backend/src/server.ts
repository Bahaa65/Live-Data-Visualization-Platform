import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import https from 'https';

dotenv.config();

console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

let latestPrices: any = {};

async function fetchCurrencyRates() {
  const apiKey = process.env.EXCHANGE_API_KEY;
  const res = await axios.get(
    'https://api.apilayer.com/exchangerates_data/latest?base=USD&symbols=EUR,EGP,SAR',
    { headers: { apikey: apiKey } }
  );
  return (res.data as { rates: Record<string, number> }).rates;
}

// دالة جلب أسعار الذهب من RapidAPI (harem-altin-live-gold-price-data)
async function fetchGoldPricesRapidAPI(): Promise<any> {
  const options = {
    method: 'GET',
    hostname: 'harem-altin-live-gold-price-data.p.rapidapi.com',
    path: '/harem_altin/prices',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY as string,
      'x-rapidapi-host': 'harem-altin-live-gold-price-data.p.rapidapi.com',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks: Uint8Array[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// دالة جلب أكواد العملات من RapidAPI (exchange-rates7)
async function fetchCurrencyCodesRapidAPI(): Promise<any> {
  const options = {
    method: 'GET',
    hostname: 'exchange-rates7.p.rapidapi.com',
    path: '/codes',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY as string,
      'x-rapidapi-host': 'exchange-rates7.p.rapidapi.com',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks: Uint8Array[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// دالة جلب أسعار العملات من RapidAPI (exchange-rates7)
async function fetchCurrencyRatesRapidAPI(): Promise<Record<string, number>> {
  const options = {
    method: 'GET',
    hostname: 'exchange-rates7.p.rapidapi.com',
    path: '/latest?base=USD',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY as string,
      'x-rapidapi-host': 'exchange-rates7.p.rapidapi.com',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks: Uint8Array[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          const parsed = JSON.parse(body);
          // RapidAPI returns { base, date, rates: { ... } }
          resolve(parsed.rates);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function updatePrices() {
  try {
    const currencies = await fetchCurrencyRatesRapidAPI();
    latestPrices = {
      time: new Date().toISOString(),
      currencies,
      metals: null, // لم يعد هناك جلب للمعادن من goldapi.io
    };
  } catch (err) {
    console.error('Error fetching prices:', err);
    latestPrices = {
      time: new Date().toISOString(),
      currencies: null,
      metals: null,
      error: 'Failed to fetch live prices',
    };
  }
}

// التحديث كل دقيقة
setInterval(updatePrices, 60 * 1000);
updatePrices();

app.get('/', (_req, res) => {
  res.send(`
    <h2>Live Data Visualization Platform API</h2>
    <ul>
      <li><a href="/prices">/prices</a> - All live prices</li>
      <li><a href="/currency-codes-rapidapi">/currency-codes-rapidapi</a> - Currency codes</li>
      <li><a href="/currency-rates-rapidapi">/currency-rates-rapidapi</a> - Currency rates</li>
      <li><a href="/gold-rapidapi">/gold-rapidapi</a> - Gold prices (RapidAPI)</li>
      <li><a href="/health">/health</a> - Health check</li>
    </ul>
  `);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'API is working' });
});

app.get('/prices', (_req, res) => {
  if (!latestPrices || !latestPrices.time) {
    return res.status(200).json({
      currencies: null,
      metals: { gold: null, silver: null, error: 'No data available yet' },
      error: 'No data available yet',
    });
  }
  res.json(latestPrices);
});

app.get('/gold-rapidapi', async (_req, res) => {
  try {
    const data = await fetchGoldPricesRapidAPI();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch gold prices from RapidAPI' });
  }
});

app.get('/currency-codes-rapidapi', async (_req, res) => {
  try {
    const data = await fetchCurrencyCodesRapidAPI();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch currency codes from RapidAPI' });
  }
});

app.get('/currency-rates-rapidapi', async (_req, res) => {
  try {
    const data = await fetchCurrencyRatesRapidAPI();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to fetch currency rates from RapidAPI' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 