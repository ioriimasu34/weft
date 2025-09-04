"use client";

// StitchOS RFID Platform — Production Dashboard
// Based on TextileTracker design with RFID-specific functionality

/// <reference types="react" />
/// <reference types="react-dom" />

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  GaugeCircle,
  Factory,
  Users,
  Bug,
  Box,
  Clock3,
  ChevronDown,
  Download,
  Settings,
  Zap,
  ShieldCheck,
  Moon,
  Sun,
  Globe2,
  Wifi,
  WifiOff,
  Tag,
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;

// Utilities
function classNames(...a: Array<string | false | null | undefined>): string {
  return a.filter(Boolean).join(" ");
}
function format(n: number): string {
  try { return new Intl.NumberFormat().format(n); } catch { return String(n); }
}

// Auth Guard
function AuthGuard({ children }: { children: ReactNode }): JSX.Element {
  const [loading, setLoading] = useState<boolean>(!!supabase);
  const [authed, setAuthed] = useState<boolean>(!supabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (!mounted) return;
      setAuthed(!!data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  async function onLogin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Checking session…</div>;
  }
  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-b from-emerald-50 to-white">
        <form onSubmit={onLogin} className="w-full max-w-sm rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white"><Factory className="h-5 w-5"/></div>
            <div>
              <div className="text-sm text-slate-500">StitchOS</div>
              <div className="text-base font-semibold">RFID Platform</div>
            </div>
          </div>
          <label className="mb-2 block text-sm text-slate-600">Email</label>
          <input name="email" type="email" className="mb-3 w-full rounded-lg border border-emerald-200 p-2" placeholder="Enter your email" required />
          <label className="mb-2 block text-sm text-slate-600">Password</label>
          <input name="password" type="password" className="mb-4 w-full rounded-lg border border-emerald-200 p-2" placeholder="Enter your password" required />
          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
          <button type="submit" className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-white">Continue</button>
          <p className="mt-3 text-center text-xs text-slate-500">Demo mode runs without auth if Supabase env vars are unset.</p>
        </form>
      </div>
    );
  }
  return <>{children}</>;
}

// Main Dashboard Component
export default function Page(): JSX.Element {
  return (
    <AuthGuard>
      <RFIDDashboard />
    </AuthGuard>
  );
}

function RFIDDashboard(): JSX.Element {
  const [active, setActive] = useState<"live" | "assets" | "readers" | "analytics">("live");
  const [factory] = useState<string>("KTL Factory");
  const [dark, setDark] = useState<boolean>(false);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [now, setNow] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const TABS = [
    { key: "live", label: "Live", icon: <Activity className="h-4 w-4" /> },
    { key: "assets", label: "Assets", icon: <Tag className="h-4 w-4" /> },
    { key: "readers", label: "Readers", icon: <Cpu className="h-4 w-4" /> },
    { key: "analytics", label: "Analytics", icon: <Settings className="h-4 w-4" /> },
  ] as const;

  return (
    <div className={classNames("min-h-screen text-slate-900", dark ? "bg-slate-900 text-slate-100" : "bg-gradient-to-b from-emerald-50 to-white")}>
      <div className="grid grid-cols-12 gap-0">
        {/* Sidebar */}
        <aside className={classNames("col-span-12 p-4 shadow-sm md:col-span-2 md:min-h-screen md:border-b-0", dark ? "border-b border-slate-800 md:border-r bg-slate-950" : "border-b border-emerald-100 bg-white md:border-r")}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={classNames("grid h-10 w-10 place-items-center rounded-2xl text-white shadow-sm", dark ? "bg-slate-800" : "bg-emerald-600")}>
                <Factory className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-slate-500">StitchOS</div>
                <div className="text-base font-semibold">RFID Platform</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button aria-label="Toggle language" onClick={() => setLang((p: "en" | "bn") => (p === "en" ? "bn" : "en"))} className={classNames("rounded-xl border px-2 py-1 text-xs", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")} title="Language">
                <Globe2 className="h-4 w-4" />
              </button>
              <button aria-label="Toggle theme" onClick={() => setDark((d: boolean) => !d)} className={classNames("rounded-xl border px-2 py-1 text-xs", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")} title="Theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActive(t.key as any)} aria-pressed={active === t.key ? "true" : "false"} className={classNames("flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition", active === t.key ? (dark ? "bg-slate-800 text-white shadow" : "bg-emerald-600 text-white shadow") : (dark ? "hover:bg-slate-900" : "hover:bg-emerald-50"))}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className={classNames("mt-8 rounded-2xl p-3 text-xs", dark ? "border border-slate-800 bg-slate-900 text-slate-400" : "border border-emerald-100 bg-emerald-50 text-emerald-700")}>
            <div className="mb-1 font-medium">Reader Health</div>
            <ul className="space-y-1">
              <li>R1 – Online · 82% 🔋</li>
              <li>R2 – Online · 67% 🔋</li>
              <li>R3 – Offline · 0% 💤</li>
              <li>R4 – Online · 91% 🔋</li>
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 p-4 md:col-span-10 md:p-6">
          {/* Top bar */}
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{factory} — Live Portal</h1>
              <p className="text-sm text-slate-500">Updated {now} · Dhaka time</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={classNames("flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")}> 
                <span className="text-slate-600">Factory</span>
                <button className={classNames("inline-flex items-center gap-1 rounded-xl px-2 py-1 text-white", dark ? "bg-slate-800" : "bg-emerald-600")} aria-haspopup="listbox" aria-expanded="false">
                  {factory}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <span className="ml-3 text-slate-600">Line</span>
                <button className={classNames("rounded-xl px-2 py-1", dark ? "bg-slate-800" : "bg-emerald-50")}>Line 1</button>
                <span className="ml-3 text-slate-600">Shift</span>
                <button className={classNames("rounded-xl px-2 py-1", dark ? "bg-slate-800" : "bg-emerald-50")}>Day</button>
              </div>
              <button className={classNames("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")} aria-label="Export PDF">
                <Download className="h-4 w-4" /> Export PDF
              </button>
            </div>
          </div>

          {/* KPI row */}
          <motion.div initial="initial" animate="animate" className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }} className="rounded-2xl border bg-gradient-to-b from-sky-50 to-white border-sky-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Reads</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">1,247</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                  <Activity className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }} className="rounded-2xl border bg-gradient-to-b from-emerald-50 to-white border-emerald-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Current Rate</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">142</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                  <GaugeCircle className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }} className="rounded-2xl border bg-gradient-to-b from-amber-50 to-white border-amber-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Efficiency</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">94.7%</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                  <Zap className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }} className="rounded-2xl border bg-gradient-to-b from-rose-50 to-white border-rose-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Online Readers</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">7</div>
                  <div className="mt-1 text-xs text-gray-500">8 total</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                  <ShieldCheck className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={{ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }} className="rounded-2xl border bg-gradient-to-b from-violet-50 to-white border-violet-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Active Assets</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">324</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 shadow-inner">
                  <Tag className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content based on active tab */}
          {active === "live" && (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-800">Read Rate vs Target</h3>
                    <span className="text-xs text-slate-500">RFID reads by hour</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <LineChart data={[
                        { hour: "08:00", reads: 120, target: 150 },
                        { hour: "09:00", reads: 135, target: 150 },
                        { hour: "10:00", reads: 142, target: 150 },
                        { hour: "11:00", reads: 138, target: 150 },
                        { hour: "12:00", reads: 145, target: 150 },
                        { hour: "13:00", reads: 140, target: 150 },
                        { hour: "14:00", reads: 148, target: 150 },
                        { hour: "15:00", reads: 142, target: 150 },
                      ]} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RTooltip />
                        <Legend />
                        <ReferenceLine y={150} stroke="#94a3b8" strokeDasharray="4 4" label="Target" />
                        <Line type="monotone" dataKey="reads" stroke="#10b981" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="xl:col-span-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-800">Top Readers</h3>
                    <span className="text-xs text-slate-500">auto-updates</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-emerald-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-emerald-50 text-emerald-700">
                        <tr>
                          <th className="px-3 py-2 text-left">Reader</th>
                          <th className="px-3 py-2 text-left">Reads</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-2">R1</td>
                          <td className="px-3 py-2">245</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              <CheckCircle className="h-3 w-3" />
                              online
                            </span>
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2">R2</td>
                          <td className="px-3 py-2">198</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              <CheckCircle className="h-3 w-3" />
                              online
                            </span>
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2">R3</td>
                          <td className="px-3 py-2">156</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                              <XCircle className="h-3 w-3" />
                              offline
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "assets" && (
            <div className="mt-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-medium text-gray-800 mb-3">Asset Tracking</h3>
                <p className="text-slate-600">Asset management and tracking features will be implemented here.</p>
              </div>
            </div>
          )}

          {active === "readers" && (
            <div className="mt-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-medium text-gray-800 mb-3">Reader Management</h3>
                <p className="text-slate-600">Reader configuration and management features will be implemented here.</p>
              </div>
            </div>
          )}

          {active === "analytics" && (
            <div className="mt-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-base font-medium text-gray-800 mb-3">Analytics & Reports</h3>
                <p className="text-slate-600">Analytics and reporting features will be implemented here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}