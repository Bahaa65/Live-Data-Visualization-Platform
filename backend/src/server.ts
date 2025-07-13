import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

let latestPrices: any = {};

// جلب أسعار العملات من exchangerate.host
async function fetchCurrencyRates() {
  const res = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=EUR,EGP,SAR');
  return res.data.rates;
}

// جلب أسعار الذهب والفضة من goldapi.io
async function fetchMetals() {
  const headers = { 'x-access-token': 'goldapi-5rb3smd1jwpp1-io' };
  const gold = await axios.get('https://www.goldapi.io/api/XAU/USD', { headers });
  const silver = await axios.get('https://www.goldapi.io/api/XAG/USD', { headers });
  return {
    gold: gold.data.price,
    silver: silver.data.price,
  };
}

async function updatePrices() {
  try {
    const [currencies, metals] = await Promise.all([
      fetchCurrencyRates(),
      fetchMetals(),
    ]);
    latestPrices = {
      time: new Date().toISOString(),
      currencies,
      metals,
    };
  } catch (err) {
    console.error('Error fetching prices:', err);
  }
}

// التحديث كل دقيقة
setInterval(updatePrices, 60 * 1000);
updatePrices();

app.get('/health', (_req, res) => {
  res.json({ status: 'API is working' });
});

app.get('/prices', (_req, res) => {
  res.json(latestPrices);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 