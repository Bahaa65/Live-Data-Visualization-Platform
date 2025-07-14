import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import React from 'react';

interface HeroChartProps {
  data: { time: string; value: number }[];
  title: string;
  unit?: string;
  percentChange?: number;
}

const chartTypes = ["area", "line", "bar"] as const;
type ChartType = typeof chartTypes[number];

export default function HeroChart({ data, title, unit, percentChange }: HeroChartProps) {
  const [type, setType] = useState<ChartType>("area");
  const [isDark, setIsDark] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(120);
  const animationRef = useRef<number | null>(null);

  // Animated gradient angle
  useEffect(() => {
    let angle = 120;
    function animate() {
      angle = (angle + 0.2) % 360;
      setGradientAngle(angle);
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Detect dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  // More vibrant animated gradient colors
  const gradientColors = isDark
    ? {
        main: '#6366f1', // indigo-500
        accent: '#a78bfa', // violet-400
        extra: '#f472b6', // pink-400
        bgFrom: '#312e81', // indigo-900
        bgTo: '#7c3aed', // violet-600
      }
    : {
        main: '#2563eb', // blue-600
        accent: '#a21caf', // fuchsia-800
        extra: '#f472b6', // pink-400
        bgFrom: '#dbeafe', // blue-100
        bgTo: '#f0abfc', // fuchsia-200
      };

  // Color for up/down/neutral
  const color = percentChange && percentChange > 0
    ? '#22d3ee' // cyan-400
    : percentChange && percentChange < 0
    ? '#f472b6' // pink-400
    : gradientColors.main;

  // آخر نقطة في البيانات
  const lastPoint = data && data.length > 0 ? data[data.length - 1] : null;
  // حساب إحداثيات آخر نقطة (تقريبية)
  const getLastPointCoords = () => {
    if (!lastPoint || data.length < 2) return { cx: null, cy: null };
    // x: آخر عنصر (نسبة)
    const cx = ((data.length - 1) / (data.length - 1)) * 100;
    // y: نسبة معكوسة بين min/max
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const cy = 100 - ((lastPoint.value - min) / range) * 100;
    return { cx, cy };
  };
  const { cx, cy } = getLastPointCoords();

  return (
    <div
      className="w-full max-w-2xl mx-auto mb-8 p-6 rounded-2xl glass-card shadow-xl flex flex-col items-center relative overflow-hidden border-4"
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${gradientColors.bgFrom} 0%, ${gradientColors.bgTo} 100%)`,
        borderColor: gradientColors.main,
        boxShadow: isDark
          ? '0 8px 32px 0 rgba(0,0,0,0.28)'
          : '0 8px 32px 0 rgba(31,38,135,0.18)',
      }}
    >
      {/* Animated vibrant gradient overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `linear-gradient(${gradientAngle + 60}deg, ${gradientColors.main} 0%, ${gradientColors.accent} 50%, ${gradientColors.extra} 100%)`,
          opacity: 0.35,
        }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
      />
      <div className="flex items-center gap-4 mb-4 w-full justify-between z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {title}
            {percentChange !== undefined && (
              <motion.span
                className={
                  "text-lg font-semibold " +
                  (percentChange > 0
                    ? "text-cyan-400"
                    : percentChange < 0
                    ? "text-pink-400"
                    : "text-gray-400")
                }
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {percentChange > 0 ? '▲' : percentChange < 0 ? '▼' : ''} {percentChange.toFixed(2)}%
              </motion.span>
            )}
          </h2>
          <div className="text-xs text-gray-400 mt-1">Live Chart ({unit || "USD"})</div>
        </div>
        <div className="flex gap-2">
          {chartTypes.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={
                "px-2 py-1 rounded text-xs font-semibold border transition shadow-sm " +
                (type === t
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-400 text-white border-indigo-500 shadow-md scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700")
              }
              style={type === t ? { boxShadow: '0 2px 8px 0 rgba(99,102,241,0.15)' } : {}}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-72 z-10">
        {(!data || data.length === 0) ? (
          <div className="flex items-center justify-center h-full text-xl font-bold text-pink-600">لا توجد بيانات لعرضها</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" && (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradientColors.main} stopOpacity={1}/>
                    <stop offset="50%" stopColor={gradientColors.accent} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={gradientColors.extra} stopOpacity={0.6}/>
                  </linearGradient>
                  <radialGradient id="pulseDot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={gradientColors.extra} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={gradientColors.extra} stopOpacity={0}/>
                  </radialGradient>
                </defs>
                <XAxis dataKey="time" hide/>
                <YAxis domain={['auto', 'auto']} hide/>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08}/>
                <Tooltip contentStyle={{ background: isDark ? '#222' : '#fff', borderRadius: 8, fontSize: 14, color: isDark ? '#fff' : '#222' }}/>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={gradientColors.main}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={4}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
                {lastPoint && cx !== null && cy !== null && (
                  <circle
                    cx={cx + '%'}
                    cy={cy + '%'}
                    r={10}
                    fill="url(#pulseDot)"
                  />
                )}
              </>
            </AreaChart>
          )}
          {type === "line" && (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <>
                <XAxis dataKey="time" hide/>
                <YAxis domain={['auto', 'auto']} hide/>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08}/>
                <Tooltip contentStyle={{ background: isDark ? '#222' : '#fff', borderRadius: 8, fontSize: 14, color: isDark ? '#fff' : '#222' }}/>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={gradientColors.accent}
                  strokeWidth={4}
                  isAnimationActive={true}
                  animationDuration={1200}
                  dot={false}
                />
                {lastPoint && cx !== null && cy !== null && (
                  <circle
                    cx={cx + '%'}
                    cy={cy + '%'}
                    r={10}
                    fill="url(#pulseDot)"
                  />
                )}
              </>
            </AreaChart>
          )}
          {type === "bar" && (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <>
                <XAxis dataKey="time" hide/>
                <YAxis domain={['auto', 'auto']} hide/>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08}/>
                <Tooltip contentStyle={{ background: isDark ? '#222' : '#fff', borderRadius: 8, fontSize: 14, color: isDark ? '#fff' : '#222' }}/>
                <Bar
                  dataKey="value"
                  fill={`url(#barGradient)`}
                  radius={[8,8,0,0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradientColors.main} stopOpacity={1}/>
                    <stop offset="100%" stopColor={gradientColors.extra} stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </>
            </BarChart>
          )}
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
} 