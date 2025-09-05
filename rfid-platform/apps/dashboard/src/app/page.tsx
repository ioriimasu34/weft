"use client";

// StitchOS RFID Platform — Production Dashboard
// Enhanced with TextileTracker components and RFID-specific functionality

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
  Tag,
  Cpu,
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

// TextileTracker Components
type Tone = "slate" | "green" | "blue" | "amber" | "rose" | "violet";

type KPICardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
};

const kpiCardVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function KPICard({ label, value, sublabel, icon: Icon, tone = "slate" }: KPICardProps) {
  const toneMap: Record<Tone, string> = {
    slate: "from-slate-50 to-white border-slate-200",
    green: "from-emerald-50 to-white border-emerald-200",
    blue: "from-sky-50 to-white border-sky-200",
    amber: "from-amber-50 to-white border-amber-200",
    rose: "from-rose-50 to-white border-rose-200",
    violet: "from-violet-50 to-white border-violet-200",
  };
  return (
    <motion.div
      variants={kpiCardVariants}
      className={classNames("rounded-2xl border bg-gradient-to-b p-4 shadow-sm", toneMap[tone])}
      role="group"
      aria-label={label}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
          {sublabel && <div className="mt-1 text-xs text-gray-500">{sublabel}</div>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-white/80 p-3 shadow-inner" aria-hidden>
            {React.createElement(Icon, { className: "h-5 w-5 text-gray-700" })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

type SectionProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

function SectionCard({ title, action, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" aria-label={title}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-800">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

// Mock data helpers for RFID context
const hours = [8, 9, 10, 11, 12, 13, 14, 15];
function genRFIDReadData() {
  return hours.map((h, i) => ({
    hour: `${h}:00`,
    reads: 120 + Math.round(20 * Math.sin(i / 1.7)),
    target: 150,
  }));
}

function genQualityData() {
  return hours.map((h, i) => ({
    hour: `${h}:00`,
    defects: 1.4 + 0.6 * ((i % 3) / 2) + 0.2 * Math.sin(i),
  }));
}

function genReaderData(n = 8) {
  return Array.from({ length: n }).map((_, i) => {
    const reads = 245 + (i * 7) % 32;
    const uptime = 3.5 + (i % 5) * 0.45;
    return { id: `R${i + 1}`, location: `Zone ${(i % 8) + 1}`, reads, uptime };
  });
}

// Auth Guard
function AuthGuard({ children }: { children: ReactNode }): JSX.Element | null {
  const [loading, setLoading] = useState<boolean>(!!supabase);
  const [authed, setAuthed] = useState<boolean>(!supabase || process.env.NODE_ENV === 'development');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      // Demo mode - no authentication required
      setLoading(false);
      setAuthed(true);
      return;
    }
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
  const [active, setActive] = useState<"live" | "quality" | "people" | "admin">("live");
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
    { key: "quality", label: "Quality", icon: <Bug className="h-4 w-4" /> },
    { key: "people", label: "People", icon: <Users className="h-4 w-4" /> },
    { key: "admin", label: "Admin", icon: <Settings className="h-4 w-4" /> },
  ] as const;

  // Generate data using the new helpers
  const readData = useMemo(() => genRFIDReadData(), []);
  const qualityData = useMemo(() => genQualityData(), []);
  const readers = useMemo(() => genReaderData(8), []);
  const bottlenecks = useMemo(() =>
    readers
      .map((r) => ({ reader: r.id, readsPerHour: r.reads / r.uptime }))
      .sort((a, b) => a.readsPerHour - b.readsPerHour)
      .slice(0, 3),
  [readers]);

  const totals = useMemo(() => {
    const totalReads = readData.reduce((acc, d) => acc + d.reads, 0);
    const currentRate = readData[readData.length - 1]?.reads ?? 120;
    const efficiency = (currentRate / 150) * 100;
    const onlineReaders = readers.filter(r => r.reads > 0).length;
    const activeAssets = Math.floor(Math.random() * 200) + 300;
    return { totalReads, currentRate, efficiency, onlineReaders, activeAssets };
  }, [readData, readers]);

  // Localization
  const L = useMemo(() => ({
    en: {
      deviceHealth: "Reader Health",
      updated: "Updated",
      factory: "Factory",
      line: "Line",
      shift: "Shift",
      exportPdf: "Export PDF",
      readRate: "Read Rate vs Target",
      readsByHour: "RFID reads by hour",
      bottlenecks: "Bottlenecks (lowest reads/hour)",
      autoUpdates: "auto-updates",
      qualityHour: "Quality — Defects by Hour",
      last8: "last 8 hours",
      perReader: "Per-Reader Snapshot",
      readsUptime: "reads & uptime",
      defectPareto: "Defect Pareto (mock)",
      defectPad: "Defect Pad (kiosk mock)",
      attendance: "Attendance / Utilization (mock)",
      planning: "Planning (SMV, Operators, Net minutes)",
      integrations: "Integrations & Export",
    },
    bn: {
      deviceHealth: "রিডার স্ট্যাটাস",
      updated: "আপডেট",
      factory: "ফ্যাক্টরি",
      line: "লাইন",
      shift: "শিফট",
      exportPdf: "PDF এক্সপোর্ট",
      readRate: "রিড রেট বনাম টার্গেট",
      readsByHour: "ঘণ্টাভিত্তিক RFID রিড",
      bottlenecks: "বোতলগলা (সবচেয়ে কম রিড/ঘণ্টা)",
      autoUpdates: "অটো আপডেট",
      qualityHour: "কোয়ালিটি — ঘণ্টাভিত্তিক ডিফেক্ট",
      last8: "শেষ ৮ ঘণ্টা",
      perReader: "পার-রিডার স্ন্যাপশট",
      readsUptime: "রিড ও আপটাইম",
      defectPareto: "ডিফেক্ট প্যারেটো (মক)",
      defectPad: "ডিফেক্ট প্যাড (কিওস্ক মক)",
      attendance: "উপস্থিতি / ইউটিলাইজেশন (মক)",
      planning: "প্ল্যানিং (SMV, অপারেটর, নেট মিনিট)",
      integrations: "ইন্টিগ্রেশন ও এক্সপোর্ট",
    },
  })[lang], [lang]);

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
                {!supabase && (
                  <div className="text-xs text-amber-600 font-medium">DEMO MODE</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Toggle language"
                onClick={() => setLang((p) => (p === "en" ? "bn" : "en"))}
                className={classNames("rounded-xl border px-2 py-1 text-xs", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")}
                title="Language"
              >
                <Globe2 className="h-4 w-4" />
              </button>
              <button
                aria-label="Toggle theme"
                onClick={() => setDark((d) => !d)}
                className={classNames("rounded-xl border px-2 py-1 text-xs", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")}
                title="Theme"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                aria-pressed={active === t.key ? "true" : "false"}
                className={classNames(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  active === t.key ? (dark ? "bg-slate-800 text-white shadow" : "bg-emerald-600 text-white shadow") : (dark ? "hover:bg-slate-900" : "hover:bg-emerald-50")
                )}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className={classNames("mt-8 rounded-2xl p-3 text-xs", dark ? "border border-slate-800 bg-slate-900 text-slate-400" : "border border-emerald-100 bg-emerald-50 text-emerald-700")}>
            <div className="mb-1 font-medium">{L.deviceHealth}</div>
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
              <p className="text-sm text-slate-500">{L.updated} {now} · Dhaka time</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={classNames("flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")}> 
                <span className="text-slate-600">{L.factory}</span>
                <button className={classNames("inline-flex items-center gap-1 rounded-xl px-2 py-1 text-white", dark ? "bg-slate-800" : "bg-emerald-600")} aria-haspopup="listbox" aria-expanded="false">
                  {factory}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <span className="ml-3 text-slate-600">{L.line}</span>
                <button className={classNames("rounded-xl px-2 py-1", dark ? "bg-slate-800" : "bg-emerald-50")}>Line 1</button>
                <span className="ml-3 text-slate-600">{L.shift}</span>
                <button className={classNames("rounded-xl px-2 py-1", dark ? "bg-slate-800" : "bg-emerald-50")}>Day</button>
              </div>
              <button className={classNames("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-emerald-200 bg-white")} aria-label={L.exportPdf}>
                <Download className="h-4 w-4" /> {L.exportPdf}
              </button>
            </div>
          </div>

          {/* KPI row */}
          <motion.div initial="initial" animate="animate" className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <KPICard label="Total Reads" value={format(totals.totalReads)} icon={Activity} tone="blue" />
            <KPICard label="Current Rate" value={totals.currentRate} icon={GaugeCircle} tone="green" />
            <KPICard label="Efficiency" value={totals.efficiency.toFixed(1) + "%"} icon={Zap} tone="amber" />
            <KPICard label="Online Readers" value={totals.onlineReaders} sublabel={`${readers.length} total`} icon={ShieldCheck} tone="rose" />
            <KPICard label="Active Assets" value={format(totals.activeAssets)} icon={Tag} tone="violet" />
          </motion.div>

          {/* Chart gradients */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="readStroke" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="defectFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Content based on active tab */}
          {active === "live" && (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <SectionCard title={L.readRate} action={<span className="text-xs text-slate-500">{L.readsByHour}</span>}>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <LineChart data={readData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RTooltip />
                        <Legend />
                        <ReferenceLine y={150} stroke="#94a3b8" strokeDasharray="4 4" label="Target" />
                        <Line type="monotone" dataKey="reads" stroke="url(#readStroke)" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
              
              <div className="xl:col-span-5">
                <SectionCard title={L.bottlenecks} action={<span className="text-xs text-slate-500">{L.autoUpdates}</span>}>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left">Reader</th>
                          <th className="px-3 py-2 text-left">Reads/Hour</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bottlenecks.map((b, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{b.reader}</td>
                            <td className="px-3 py-2">{b.readsPerHour.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>

              <div className="xl:col-span-7">
                <SectionCard title={L.qualityHour} action={<span className="text-xs text-slate-500">{L.last8}</span>}>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <BarChart data={qualityData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RTooltip />
                        <Bar dataKey="defects" fill="url(#defectFill)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              <div className="xl:col-span-12">
                <SectionCard title={L.perReader} action={<span className="text-xs text-slate-500">{L.readsUptime}</span>}>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left">Reader</th>
                          <th className="px-3 py-2 text-left">Location</th>
                          <th className="px-3 py-2 text-left">Reads</th>
                          <th className="px-3 py-2 text-left">Uptime</th>
                          <th className="px-3 py-2 text-left">Reads/Hour</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readers.map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="px-3 py-2">{r.id}</td>
                            <td className="px-3 py-2">{r.location}</td>
                            <td className="px-3 py-2">{r.reads}</td>
                            <td className="px-3 py-2">{r.uptime.toFixed(1)}h</td>
                            <td className="px-3 py-2">{(r.reads / r.uptime).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {active === "quality" && (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-7">
                <SectionCard title={L.defectPareto}>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <AreaChart data={[
                        { k: "Read Error", v: 34 }, 
                        { k: "Signal Loss", v: 22 }, 
                        { k: "Interference", v: 18 }, 
                        { k: "Tag Damage", v: 12 }, 
                        { k: "Other", v: 8 }
                      ]}> 
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="k" />
                        <YAxis />
                        <RTooltip />
                        <Area type="monotone" dataKey="v" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>
              <div className="xl:col-span-5">
                <SectionCard title={L.defectPad}>
                  <div className="grid grid-cols-2 gap-2">
                    {["Read Error","Signal Loss","Interference","Tag Damage","Battery Low","Wrong Zone","Duplicate","Other"].map((d) => (
                      <button key={d} className={classNames("h-14 rounded-xl border text-sm font-medium shadow-sm", dark ? "border-slate-700 bg-slate-900 hover:bg-slate-800" : "border-slate-200 bg-white hover:bg-slate-50")}>{d}</button>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {active === "people" && (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <SectionCard title="Operator Counters (kiosk mock)">
                  <div className="grid grid-cols-2 gap-2">
                    {readers.slice(0,6).map((r) => (
                      <div key={r.id} className={classNames("rounded-xl border p-3", dark ? "border-slate-700" : "border-slate-200")}> 
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{r.id} · {r.location}</span>
                          <button className={classNames("rounded-lg px-2 py-1 text-xs", dark ? "bg-slate-800 text-white" : "bg-slate-900 text-white")}>Login</button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-3xl font-semibold">{(r.reads / r.uptime).toFixed(1)}</div>
                          <button className={classNames("rounded-lg border px-3 py-2 text-sm shadow-sm", dark ? "border-slate-700" : "border-slate-200")}>✓ Read</button>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{r.reads} reads · {r.uptime.toFixed(1)} h</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
              <div className="xl:col-span-6">
                <SectionCard title={L.attendance}>
                  <div className={classNames("rounded-xl border border-dashed p-8 text-center text-sm", dark ? "border-slate-700 text-slate-400" : "text-slate-500")}> 
                    Charts: present vs plan · utilization by zone · late logins
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {active === "admin" && (
            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="xl:col-span-6">
                <SectionCard title={L.planning}>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <label className="flex items-center gap-2"><span className="w-28 text-slate-500">SMV</span><input className={classNames("w-full rounded-lg border p-2", dark ? "border-slate-700 bg-slate-900" : "border-slate-200")} defaultValue={0.80} /></label>
                    <label className="flex items-center gap-2"><span className="w-28 text-slate-500">Readers</span><input className={classNames("w-full rounded-lg border p-2", dark ? "border-slate-700 bg-slate-900" : "border-slate-200")} defaultValue={8} /></label>
                    <label className="flex items-center gap-2"><span className="w-28 text-slate-500">Net Minutes</span><input className={classNames("w-full rounded-lg border p-2", dark ? "border-slate-700 bg-slate-900" : "border-slate-200")} defaultValue={420} /></label>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Targets update instantly; audit logged.</div>
                </SectionCard>
              </div>
              <div className="xl:col-span-6">
                <SectionCard title={L.integrations}>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <button className={classNames("rounded-xl border px-3 py-2 shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}>Generate Daily PDF</button>
                    <button className={classNames("rounded-xl border px-3 py-2 shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}>CSV Export</button>
                    <button className={classNames("rounded-xl border px-3 py-2 shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}>API Keys</button>
                    <button className={classNames("rounded-xl border px-3 py-2 shadow-sm", dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}>SSO Settings</button>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}