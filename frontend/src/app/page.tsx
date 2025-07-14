"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaChartLine } from "react-icons/fa";
import Topbar from "../components/Topbar";

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
  // حالة الوضع الليلي
  const [dark, setDark] = useState(false);
  // بحث العملات
  const [currencySearch, setCurrencySearch] = useState("");
  // فرز العملات
  const [sortBy, setSortBy] = useState<'code'|'name'|'value'>("code");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("asc");

  // --- مؤشرات الاتصال ---
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const lastUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // حفظ آخر قيم للعملات لتمييز التغيرات
  const [prevCurrencies, setPrevCurrencies] = useState<Record<string, number>>({});
  useEffect(() => {
    if (prices?.currencies) setPrevCurrencies(prices.currencies);
  }, [prices?.currencies]);

  // دمج بيانات العملات مع الأكواد
  const mergedCurrencies = currencyCodes.length && prices?.currencies
    ? currencyCodes.map((c) => ({
        ...c,
        value: prices.currencies[c.code] ?? null,
      }))
    : [];

  // تصفية حسب البحث
  const filteredCurrencies = mergedCurrencies.filter((c) =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  // فرز
  const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
    let v1 = a[sortBy] ?? '';
    let v2 = b[sortBy] ?? '';
    if (sortBy === 'value') {
      v1 = v1 ?? 0;
      v2 = v2 ?? 0;
    } else {
      v1 = v1.toString();
      v2 = v2.toString();
    }
    if (v1 < v2) return sortDir === 'asc' ? -1 : 1;
    if (v1 > v2) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // أشهر العملات (اختياري: إبرازها)
  const popular = ["USD","EUR","SAR","EGP","GBP","JPY","CNY","AED","TRY","KWD","QAR","OMR","BHD","CHF","CAD","AUD"];

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

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

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

  // مراقبة الاتصال
  useEffect(() => {
    const check = () => {
      fetch("http://localhost:4000/health").then(r => setIsOnline(r.ok)).catch(() => setIsOnline(false));
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // تحديث وقت آخر تحديث
  useEffect(() => {
    if (prices?.time) {
      setLastUpdate(prices.time);
      if (lastUpdateRef.current) clearTimeout(lastUpdateRef.current);
      lastUpdateRef.current = setTimeout(() => setLastUpdate(null), 60000);
    }
  }, [prices?.time]);

  return (
    <div className={"min-h-screen w-full flex flex-col bg-gradient-to-br " + (dark ? "from-gray-900 to-slate-900" : "from-indigo-50 to-cyan-100") + " transition-colors duration-500"}>
      <Topbar dark={dark} setDark={setDark} isOnline={isOnline} lastUpdate={lastUpdate} />
      {/* Main Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl glass-card p-8 mt-8 flex flex-col gap-6 border border-white/30 dark:border-gray-700 shadow-2xl">
          {/* باقي المحتوى (الجداول، المؤشرات) */}
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
              {/* جدول الذهب الاحترافي */}
              <div>
                <h2 className="font-semibold text-lg mb-2 text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  Gold & Metals Prices
                  <span className="text-xs font-normal text-gray-400">{goldRapid && Array.isArray(goldRapid.data) ? `(${goldRapid.data.length})` : ''}</span>
                </h2>
                {goldRapidError ? (
                  <div className="text-red-500">{goldRapidError}</div>
                ) : goldRapid && Array.isArray(goldRapid.data) ? (
                  <GoldTable goldData={goldRapid.data} />
                ) : (
                  <div className="text-gray-400">Loading gold prices...</div>
                )}
              </div>
              {/* بحث العملات */}
              <div>
                <h2 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  Currencies (USD)
                  <span className="text-xs font-normal text-gray-400">({sortedCurrencies.length})</span>
                </h2>
                <input
                  type="text"
                  placeholder="Search currency..."
                  className="mb-2 px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-cyan-400"
                  value={currencySearch}
                  onChange={e => setCurrencySearch(e.target.value)}
                />
                <div className="overflow-x-auto rounded shadow">
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 z-10 bg-indigo-100/90 dark:bg-gray-800/90 backdrop-blur">
                      <tr>
                        <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('code');setSortDir(sortBy==='code'&&sortDir==='asc'?'desc':'asc')}}>
                          Code {sortBy==='code' ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                        <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('name');setSortDir(sortBy==='name'&&sortDir==='asc'?'desc':'asc')}}>
                          Name {sortBy==='name' ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                        <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('value');setSortDir(sortBy==='value'&&sortDir==='asc'?'desc':'asc')}}>
                          Value {sortBy==='value' ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCurrencies.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-4 text-gray-400">No currencies found.</td></tr>
                      ) : (
                        sortedCurrencies.map((c) => {
                          // مؤشر تغير السعر
                          let change: 'up'|'down'|'none' = 'none';
                          if (prevCurrencies[c.code] !== undefined && c.value !== null) {
                            if (c.value > prevCurrencies[c.code]) change = 'up';
                            else if (c.value < prevCurrencies[c.code]) change = 'down';
                          }
                          return (
                            <tr key={c.code}
                              className={
                                (popular.includes(c.code) ? "bg-yellow-50 dark:bg-gray-800 font-semibold " : "") +
                                "transition-colors duration-300 hover:bg-indigo-50 dark:hover:bg-gray-700 group"
                              }
                            >
                              <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-indigo-700 dark:text-cyan-300 font-mono group-hover:scale-105 transition-transform duration-200">
                                {c.code}
                              </td>
                              <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 group-hover:font-bold transition-all duration-200">{c.name}</td>
                              <td className={
                                "px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono flex items-center gap-1 justify-end " +
                                (change === 'up' ? 'text-green-600 animate-pulse' : change === 'down' ? 'text-red-600 animate-pulse' : '')
                              }>
                                {c.value !== null ? c.value : <span className="text-gray-400">N/A</span>}
                                {change === 'up' && <span title="Increased">▲</span>}
                                {change === 'down' && <span title="Decreased">▼</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// جدول الذهب الاحترافي
function GoldTable({ goldData }: { goldData: any[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'key'|'buy'|'sell'|'percent'|'last_update'>("key");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("asc");

  const filtered = goldData.filter((item) =>
    item.key.toLowerCase().includes(search.toLowerCase())
    || item.buy.toLowerCase().includes(search.toLowerCase())
    || item.sell.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let v1 = a[sortBy] ?? '';
    let v2 = b[sortBy] ?? '';
    if (sortBy === 'percent') {
      v1 = parseFloat(v1.replace(/,/g, ''));
      v2 = parseFloat(v2.replace(/,/g, ''));
    } else if (sortBy === 'buy' || sortBy === 'sell') {
      v1 = parseFloat(v1.replace(/,/g, ''));
      v2 = parseFloat(v2.replace(/,/g, ''));
    } else {
      v1 = v1.toString();
      v2 = v2.toString();
    }
    if (v1 < v2) return sortDir === 'asc' ? -1 : 1;
    if (v1 > v2) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search gold/metals..."
        className="mb-2 px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-300"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 z-10 bg-yellow-100/90 dark:bg-gray-800/90 backdrop-blur">
            <tr>
              <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('key');setSortDir(sortBy==='key'&&sortDir==='asc'?'desc':'asc')}}>
                Type {sortBy==='key' ? (sortDir==='asc'?'▲':'▼') : ''}
              </th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('buy');setSortDir(sortBy==='buy'&&sortDir==='asc'?'desc':'asc')}}>
                Buy {sortBy==='buy' ? (sortDir==='asc'?'▲':'▼') : ''}
              </th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('sell');setSortDir(sortBy==='sell'&&sortDir==='asc'?'desc':'asc')}}>
                Sell {sortBy==='sell' ? (sortDir==='asc'?'▲':'▼') : ''}
              </th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('percent');setSortDir(sortBy==='percent'&&sortDir==='asc'?'desc':'asc')}}>
                Change % {sortBy==='percent' ? (sortDir==='asc'?'▲':'▼') : ''}
              </th>
              <th className="px-2 py-1 cursor-pointer" onClick={() => {setSortBy('last_update');setSortDir(sortBy==='last_update'&&sortDir==='asc'?'desc':'asc')}}>
                Last Update {sortBy==='last_update' ? (sortDir==='asc'?'▲':'▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-400">No data found.</td></tr>
            ) : (
              sorted.map((item) => (
                <tr key={item.key}
                  className={
                    (item.arrow === 'up' ? 'bg-green-50 dark:bg-gray-800 ' : item.arrow === 'down' ? 'bg-red-50 dark:bg-gray-900 ' : '') +
                    'transition-colors duration-300 hover:bg-yellow-50 dark:hover:bg-gray-700 group'
                  }
                >
                  <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 font-semibold text-yellow-700 dark:text-yellow-300 group-hover:scale-105 transition-transform duration-200">{item.key}</td>
                  <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono">{item.buy}</td>
                  <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono">{item.sell}</td>
                  <td className={"px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-right font-mono flex items-center gap-1 justify-end " + (item.arrow === 'up' ? 'text-green-600 animate-pulse' : item.arrow === 'down' ? 'text-red-600 animate-pulse' : '')}>
                    {item.percent}%
                    {item.arrow === 'up' && <span title="Increased">▲</span>}
                    {item.arrow === 'down' && <span title="Decreased">▼</span>}
                  </td>
                  <td className="px-2 py-1 border-b border-gray-100 dark:border-gray-800 text-xs">{item.last_update}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}