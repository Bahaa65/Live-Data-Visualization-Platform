import { FaChartLine, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

interface TopbarProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  isOnline: boolean;
  lastUpdate?: string | null;
}

export default function Topbar({ dark, setDark, isOnline, lastUpdate }: TopbarProps) {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 shadow-md bg-white/80 dark:bg-gray-900/80 sticky top-0 z-20 backdrop-blur">
      <div className="flex items-center gap-3">
        <FaChartLine className="text-2xl text-indigo-600 dark:text-cyan-400" />
        <span className="text-xl font-bold text-indigo-700 dark:text-cyan-300 tracking-wide select-none">Live Data Visualization</span>
      </div>
      <div className="flex items-center gap-4">
        {/* مؤشر الاتصال */}
        <motion.span
          className={"flex items-center gap-1 text-xs " + (isOnline ? "text-green-600" : "text-red-500")}
          title={isOnline ? "Connected to backend" : "Disconnected from backend"}
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className={"inline-block w-2 h-2 rounded-full " + (isOnline ? "bg-green-500 animate-pulse" : "bg-red-500 animate-pulse")}></span>
          {isOnline ? "Online" : "Offline"}
        </motion.span>
        {/* آخر تحديث */}
        {lastUpdate && (
          <span className="text-xs text-gray-500 dark:text-gray-300" title={lastUpdate}>
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        )}
        {/* أيقونة تنبيهات */}
        <button className="relative p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-800 transition">
          <FaBell className="text-lg text-gray-500 dark:text-gray-300" />
          {/* نقطة تنبيه */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900" />
        </button>
        {/* زر الوضع الليلي */}
        <button
          onClick={() => setDark(!dark)}
          className="rounded-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          title={dark ? "الوضع النهاري" : "الوضع الليلي"}
        >
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M6.34 6.34l-.71-.71" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
          )}
        </button>
        {/* زر اللغة (لاحقًا) */}
        {/* <button className="ml-2 p-2 rounded hover:bg-indigo-100 dark:hover:bg-gray-800 transition">🌐</button> */}
      </div>
    </header>
  );
} 