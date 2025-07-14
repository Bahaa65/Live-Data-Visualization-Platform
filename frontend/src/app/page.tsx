"use client";
import React, { useEffect, useState } from "react";

interface Prices {
  time: string;
  currencies: Record<string, number>;
  metals: { gold: number; silver: number; error?: string };
}

// نوع جديد لأكواد العملات
interface CurrencyCode {
  code: string;
  name: string;
}

// نوع جديد لأسعار الذهب من RapidAPI
interface GoldRapidAPI {
  [key: string]: any;
}

export default function Home() {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // حالة جديدة لأكواد العملات
  const [currencyCodes, setCurrencyCodes] = useState<CurrencyCode[]>([]);
  const [codesError, setCodesError] = useState("");
  // حالة جديدة لأسعار الذهب من RapidAPI
  const [goldRapid, setGoldRapid] = useState<GoldRapidAPI | null>(null);
  const [goldRapidError, setGoldRapidError] = useState("");

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

  // جلب أكواد العملات من الباكند
  useEffect(() => {
    async function fetchCodes() {
      setCodesError("");
      try {
        const res = await fetch("http://localhost:4000/currency-codes-rapidapi");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        // إذا كان الرد يحتوي على مصفوفة codes
        if (Array.isArray(data.codes)) {
          setCurrencyCodes(data.codes.map((c: any) => ({ code: c[0], name: c[1] })));
        } else if (Array.isArray(data)) {
          setCurrencyCodes(data.map((c: any) => ({ code: c[0], name: c[1] })));
        } else if (Array.isArray(data.supported_codes)) {
          setCurrencyCodes(data.supported_codes.map((c: any) => ({ code: c.code, name: c.name })));
        } else {
          setCodesError("No codes data available.");
        }
      } catch (err: any) {
        setCodesError("Failed to fetch currency codes");
      }
    }
    fetchCodes();
  }, []);

  // جلب أسعار الذهب من RapidAPI
  useEffect(() => {
    async function fetchGoldRapid() {
      setGoldRapidError("");
      try {
        const res = await fetch("http://localhost:4000/gold-rapidapi");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        setGoldRapid(data);
      } catch (err: any) {
        setGoldRapidError("Failed to fetch gold prices from RapidAPI");
      }
    }
    fetchGoldRapid();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-cyan-300">Live Currency & Metals Prices</h1>
      {loading ? (
        <div className="text-lg text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : !prices ? (
        <div className="text-red-500">No data available.</div>
      ) : (
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 flex flex-col gap-4">
          <div className="text-xs text-gray-400 mb-2">Last update: {prices.time ? new Date(prices.time).toLocaleString() : "N/A"}</div>
          <div>
            <h2 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Currencies (USD)</h2>
            {prices.currencies ? (
              <ul className="space-y-1">
                {Object.entries(prices.currencies).map(([cur, val]) => (
                  <li key={cur} className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-300">{cur}</span>
                    <span className="font-mono text-indigo-600 dark:text-cyan-400">{val}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-red-500">No currency data available.</div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Metals (USD/oz)</h2>
            {prices.metals && prices.metals.gold != null && prices.metals.silver != null ? (
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
            ) : (
              <div className="text-red-500">
                {prices.metals && prices.metals.error
                  ? `Error: ${prices.metals.error}`
                  : "No metals data available."}
              </div>
            )}
          </div>
          {/* قسم أكواد العملات من RapidAPI */}
          <div>
            <h2 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">All Currency Codes (RapidAPI)</h2>
            {codesError ? (
              <div className="text-red-500">{codesError}</div>
            ) : currencyCodes.length > 0 ? (
              <div className="max-h-40 overflow-y-auto border rounded bg-white/60 dark:bg-gray-800/60 p-2 text-xs">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {currencyCodes.map((c) => (
                    <li key={c.code} className="flex justify-between">
                      <span className="font-mono text-gray-700 dark:text-gray-200">{c.code}</span>
                      <span className="text-gray-500 dark:text-gray-400">{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-400">Loading currency codes...</div>
            )}
          </div>
          {/* قسم أسعار الذهب من RapidAPI */}
          <div>
            <h2 className="font-semibold text-lg mb-2 text-yellow-700 dark:text-yellow-300">Gold Prices (RapidAPI)</h2>
            {goldRapidError ? (
              <div className="text-red-500">{goldRapidError}</div>
            ) : goldRapid && Array.isArray(goldRapid.data) ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border bg-yellow-50 dark:bg-gray-900/40 rounded">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border">Type</th>
                      <th className="px-2 py-1 border">Buy</th>
                      <th className="px-2 py-1 border">Sell</th>
                      <th className="px-2 py-1 border">Change %</th>
                      <th className="px-2 py-1 border">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goldRapid.data.map((item: any) => (
                      <tr key={item.key}>
                        <td className="px-2 py-1 border">{item.key}</td>
                        <td className="px-2 py-1 border">{item.buy}</td>
                        <td className="px-2 py-1 border">{item.sell}</td>
                        <td className={`px-2 py-1 border ${item.arrow === 'up' ? 'text-green-600' : 'text-red-600'}`}>{item.percent}%</td>
                        <td className="px-2 py-1 border">{item.last_update}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-400">Loading gold prices...</div>
            )}
          </div>
        </div>
      )}
    </main>
  );
} 