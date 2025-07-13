import React, { useEffect, useState } from "react";

interface Prices {
  time: string;
  currencies: Record<string, number>;
  metals: { gold: number; silver: number };
}

export default function Home() {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:4000/prices");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        setPrices(data);
      } catch (err: any) {
        setError("Failed to fetch prices");
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-cyan-300">Live Currency & Metals Prices</h1>
      {loading ? (
        <div className="text-lg text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : prices ? (
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 flex flex-col gap-4">
          <div className="text-xs text-gray-400 mb-2">Last update: {new Date(prices.time).toLocaleString()}</div>
          <div>
            <h2 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Currencies (USD)</h2>
            <ul className="space-y-1">
              {Object.entries(prices.currencies).map(([cur, val]) => (
                <li key={cur} className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-300">{cur}</span>
                  <span className="font-mono text-indigo-600 dark:text-cyan-400">{val}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Metals (USD/oz)</h2>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span className="font-medium text-yellow-700 dark:text-yellow-300">Gold</span>
                <span className="font-mono text-yellow-600 dark:text-yellow-400">{prices.metals.gold}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-500 dark:text-gray-300">Silver</span>
                <span className="font-mono text-gray-400 dark:text-gray-200">{prices.metals.silver}</span>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </main>
  );
} 