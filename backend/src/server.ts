import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/health', (_req, res) => {
  res.json({ status: 'API is working' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 