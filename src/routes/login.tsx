import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { formatMXN } from "@/lib/pricing";
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Eye, 
  EyeOff,
  Calendar,
  LogOut,
  RefreshCw,
  ArrowRight,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  User,
  Mail,
  Phone
} from "lucide-react";
import adminHeroImg from "@/assets/brand/admin-hero.png";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Panel de Administración — Kinder Togas" },
      { name: "robots", content: "noindex, nofollow" }
    ],
  }),
  component: AdminDashboard,
});

interface QuoteRecord {
  id: number;
  quote_number: string;
  institution_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  estimated_date: string | null;
  school_level: string;
  service_option: string;
  city: string | null;
  package_kind: string;
  package_variant: string | null;
  student_count: number;
  unit_price: number;
  total_price: number;
  toga_color: string | null;
  stola_color: string | null;
  created_at: string;
}

const BRAND_COLORS = {
  navy: "#1E2346",
  cream: "#F7F5F0",
  gold: "#C5A85A",
  green: "#25D366",
  slate: "#64748B",
  border: "#E2E8F0"
};

const CHART_PIE_COLORS = ["#1E2346", "#C5A85A", "#3B82F6", "#10B981", "#EC4899", "#8B5CF6"];

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Check auth session
  useEffect(() => {
    const session = sessionStorage.getItem("kt_admin_session");
    if (session === "authorized") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch quotes
  const fetchQuotes = async (showRefreshed = false) => {
    if (showRefreshed) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setQuotes(data || []);
    } catch (err: any) {
      console.error("Error fetching quotes:", err);
      setError("No se pudieron cargar las cotizaciones de la base de datos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuotes();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAuthError("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (password === "adminKT2026") {
      sessionStorage.setItem("kt_admin_session", "authorized");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Contraseña incorrecta. Por favor intenta de nuevo.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("kt_admin_session");
    setIsAuthenticated(false);
    setPassword("");
  };

  // Helper Labels
  const levelLabel = (l: string) => {
    const m: Record<string, string> = {
      preescolar: "Preescolar",
      primaria: "Primaria",
      secundaria: "Secundaria",
      preparatoria: "Preparatoria",
      universidad: "Universidad y Posgrado"
    };
    return m[l] || l;
  };

  const packageLabel = (kind: string, variant: string | null, level: string) => {
    if (kind === 'A') {
      if (level === 'universidad') return "Opción A — Impresión";
      return "Paquete A — Básico";
    }
    const labels: Record<string, string> = {
      hybrid: "Paquete B — B.2 Balance",
      max: "Paquete B — B.3 Premium",
      sec_b: "Paquete B — B.1 Diseño B1",
      sec_a: "Paquete B — B.2 Diseño B2",
      prep_b: "Paquete B — B.1 Diseño B1",
      prep_a: "Paquete B — B.2 Diseño B2",
      prep_c1: "Paquete C — C.1 Diseño C1",
      prep_c2: "Paquete C — C.2 Diseño C2",
      pri_c: "Paquete B — B.1 Básico Funcional",
      pri_b: "Paquete B — B.2 Clásico Equilibrado",
      pri_a: "Paquete B — B.3 Clásico Destacado",
      uni_b: "Opción B — Bordado Sencillo",
      uni_c: "Opción C — Bordado Premium",
    };
    return (variant && labels[variant]) || (kind === 'C' ? "Paquete C — Bordado" : "Paquete B — Personalizado");
  };

  // Filtering Logic
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch =
        q.institution_name.toLowerCase().includes(search.toLowerCase()) ||
        q.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
        (q.contact_email && q.contact_email.toLowerCase().includes(search.toLowerCase())) ||
        q.contact_phone.includes(search);

      const matchesLevel = levelFilter === "all" || q.school_level === levelFilter;
      const matchesService = serviceFilter === "all" || q.service_option === serviceFilter;
      const matchesCity = cityFilter === "all" || q.city === cityFilter;

      return matchesSearch && matchesLevel && matchesService && matchesCity;
    });
  }, [quotes, search, levelFilter, serviceFilter, cityFilter]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalQuotesCount = filteredQuotes.length;
    const totalRevenue = filteredQuotes.reduce((acc, q) => acc + q.total_price, 0);
    const averageTicket = totalQuotesCount > 0 ? totalRevenue / totalQuotesCount : 0;
    const totalStudents = filteredQuotes.reduce((acc, q) => acc + q.student_count, 0);

    return {
      totalQuotesCount,
      totalRevenue,
      averageTicket,
      totalStudents
    };
  }, [filteredQuotes]);

  // Chart Data preparation
  const levelChartData = useMemo(() => {
    const levelCounts: Record<string, number> = {};
    filteredQuotes.forEach((q) => {
      const lbl = levelLabel(q.school_level);
      levelCounts[lbl] = (levelCounts[lbl] || 0) + 1;
    });
    return Object.entries(levelCounts).map(([name, value]) => ({ name, value }));
  }, [filteredQuotes]);

  const serviceChartData = useMemo(() => {
    const rentCount = filteredQuotes.filter((q) => q.service_option === "renta").length;
    const saleCount = filteredQuotes.filter((q) => q.service_option === "venta").length;
    return [
      { name: "Renta", Cotizaciones: rentCount },
      { name: "Venta", Cotizaciones: saleCount }
    ];
  }, [filteredQuotes]);

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Export Filtered Quotes to CSV
  const handleExportCSV = () => {
    const headers = [
      "Folio",
      "Fecha Creacion",
      "Institucion",
      "Contacto",
      "Telefono",
      "Email",
      "Nivel Escolar",
      "Servicio",
      "Ciudad",
      "Paquete",
      "Alumnos",
      "Precio Unitario",
      "Total",
      "Color Toga",
      "Color Estola",
      "Fecha Estimada"
    ];

    const rows = filteredQuotes.map((q) => [
      q.quote_number,
      new Date(q.created_at).toLocaleDateString("es-MX"),
      q.institution_name,
      q.contact_name,
      `="${q.contact_phone}"`, // Prevent truncation of leading zeros or formatting in Excel
      q.contact_email || "",
      levelLabel(q.school_level),
      q.service_option === "renta" ? "Renta" : "Venta",
      q.city ? (q.city === "tijuana" ? "Tijuana" : "Ensenada") : "N/A",
      packageLabel(q.package_kind, q.package_variant, q.school_level),
      q.student_count,
      q.unit_price,
      q.total_price,
      q.toga_color || "N/A",
      q.stola_color || "N/A",
      q.estimated_date || "Por definir"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cotizaciones_kinder_togas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Follow Up Link
  const getWhatsAppLink = (q: QuoteRecord) => {
    const typeLabel = q.service_option === "renta" ? "renta" : "venta";
    const cityText = q.service_option === "renta" ? ` en la ciudad de ${q.city === "tijuana" ? "Tijuana" : "Ensenada"}` : "";
    const text = `Hola ${q.contact_name}, te contacto de Kinder Togas respecto a tu cotización con folio *${q.quote_number}* para la escuela *${q.institution_name}* (${levelLabel(q.school_level)}). ¿En qué podemos ayudarte para agendar tu evento?`;
    return `https://wa.me/52${q.contact_phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex font-sans">
        {/* Left Panel — Hero Image */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          {/* Hero Image */}
          <img
            src={adminHeroImg}
            alt="Graduación"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Navy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E2346]/90 via-[#1E2346]/75 to-[#1E2346]/60" />
          
          {/* Content over image */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center font-display font-black text-lg text-[#C5A85A] border border-white/15">
                KT
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">Kinder Togas</h2>
                <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">Graduaciones</p>
              </div>
            </div>

            {/* Center messaging */}
            <div className="space-y-6 max-w-md">
              <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
                Tu graduación, a un <span className="text-[#C5A85A]">clic</span> de distancia
              </h1>
              <p className="text-white/60 text-base leading-relaxed">
                Cotiza, personaliza y paga en línea de forma segura. Todo lo que necesitas para tu ceremonia de graduación en un solo lugar.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <CreditCard className="h-4 w-4 text-[#C5A85A]" />
                  <span className="text-xs text-white/80 font-medium">Pagos en línea seguros</span>
                </div>
                <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <FileText className="h-4 w-4 text-[#C5A85A]" />
                  <span className="text-xs text-white/80 font-medium">Cotizaciones al instante</span>
                </div>
                <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <GraduationCap className="h-4 w-4 text-[#C5A85A]" />
                  <span className="text-xs text-white/80 font-medium">Personaliza tu paquete</span>
                </div>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-white font-display tabular-nums">5+</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mt-0.5">Niveles escolares</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white font-display tabular-nums">2</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mt-0.5">Sedes en BC</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <p className="text-2xl font-bold text-white font-display">Seguro</p>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mt-0.5">Pago protegido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="w-full lg:w-[45%] bg-[#FAFBFC] flex flex-col relative">
          {/* Mobile-only background */}
          <div className="lg:hidden absolute inset-0">
            <img
              src={adminHeroImg}
              alt="Graduación"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E2346]/80 via-[#1E2346]/60 to-[#0F1225]/95" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12">
            {/* Mobile brand header */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="h-11 w-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center font-display font-black text-lg text-[#C5A85A] border border-white/15">
                KT
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white tracking-tight">Kinder Togas</h2>
                <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">Graduaciones</p>
              </div>
            </div>

            <div className="w-full max-w-[380px] space-y-6">
              {/* Header Icon */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center lg:justify-start w-full">
                  <div className="h-14 w-14 bg-[#1E2346] rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20 lg:shadow-navy/10">
                    <GraduationCap className="h-7 w-7 text-[#C5A85A]" />
                  </div>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl p-1 bg-white/8 lg:bg-[#F1F5F9] border border-white/10 lg:border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setRegSuccess(false); }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer",
                    authMode === 'login'
                      ? "bg-white/15 lg:bg-white text-white lg:text-[#1E2346] shadow-sm"
                      : "text-white/40 lg:text-[#94A3B8] hover:text-white/60 lg:hover:text-[#64748B]"
                  )}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer",
                    authMode === 'register'
                      ? "bg-white/15 lg:bg-white text-white lg:text-[#1E2346] shadow-sm"
                      : "text-white/40 lg:text-[#94A3B8] hover:text-white/60 lg:hover:text-[#64748B]"
                  )}
                >
                  Crear Cuenta
                </button>
              </div>

              {/* Subtitle */}
              <p className="text-sm text-white/50 lg:text-[#64748B] leading-relaxed text-center lg:text-left">
                {authMode === 'login'
                  ? 'Accede a tu cuenta para gestionar tus cotizaciones y realizar pagos en línea.'
                  : 'Crea tu cuenta gratis para cotizar, personalizar y pagar tu graduación en línea.'}
              </p>

              {/* SLIDING FORM CONTAINER */}
              <div className="w-full overflow-hidden relative px-1 py-1">
                <div 
                  className="flex w-[200%] transition-transform duration-500 ease-in-out"
                  style={{ transform: authMode === 'login' ? 'translateX(0%)' : 'translateX(-50%)' }}
                >
                  {/* PANEL 1: LOGIN FORM */}
                  <div className="w-1/2 shrink-0 px-2 transition-opacity duration-300" style={{ opacity: authMode === 'login' ? 1 : 0 }}>
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-semibold text-white/50 lg:text-[#94A3B8]">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            autoFocus
                            className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                              bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                              text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                              focus:ring-[#C5A85A] focus:border-transparent
                              backdrop-blur-sm lg:backdrop-blur-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-semibold text-white/50 lg:text-[#94A3B8]">
                          Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Escribe tu contraseña"
                            className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                              bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                              text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                              focus:ring-[#C5A85A] focus:border-transparent
                              backdrop-blur-sm lg:backdrop-blur-0"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 lg:text-[#94A3B8] hover:text-white/60 lg:hover:text-[#64748B] transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {authError && authMode === 'login' && (
                        <div className="flex items-center gap-2 text-xs bg-red-500/10 lg:bg-red-50 text-red-300 lg:text-red-600 py-3 px-4 rounded-xl border border-red-500/20 lg:border-red-200 font-medium">
                          <div className="h-1.5 w-1.5 bg-red-400 rounded-full shrink-0" />
                          {authError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-[#1E2346] hover:bg-[#2a305c] text-white py-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-navy/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                      >
                        Iniciar Sesión
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </form>
                  </div>

                  {/* PANEL 2: REGISTER FORM */}
                  <div className="w-1/2 shrink-0 px-2 transition-opacity duration-300" style={{ opacity: authMode === 'register' ? 1 : 0 }}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
                          setAuthError('Por favor completa todos los campos.');
                          return;
                        }
                        if (regPassword !== regConfirmPassword) {
                          setAuthError('Las contraseñas no coinciden.');
                          return;
                        }
                        setAuthError('');
                        setRegSuccess(true);
                      }}
                      className="space-y-3"
                    >
                      {regSuccess ? (
                        <div className="text-center space-y-4 py-4">
                          <div className="h-14 w-14 bg-emerald-500/10 lg:bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                            <ShieldCheck className="h-7 w-7 text-emerald-500" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-display text-lg font-bold text-white lg:text-[#1E2346]">¡Registro exitoso!</h3>
                            <p className="text-xs text-white/50 lg:text-[#64748B] leading-relaxed">
                              Tu cuenta ha sido creada. Pronto recibirás un correo de confirmación. Ya puedes iniciar sesión.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setAuthMode('login'); setRegSuccess(false); }}
                            className="w-full bg-[#1E2346] hover:bg-[#2a305c] text-white py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-navy/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                          >
                            Ir a Iniciar Sesión
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Name */}
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                            <input
                              type="text"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Nombre completo"
                              className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                                bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                                text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                                focus:ring-[#C5A85A] focus:border-transparent
                                backdrop-blur-sm lg:backdrop-blur-0"
                            />
                          </div>

                          {/* Email */}
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="Correo electrónico"
                              className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                                bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                                text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                                focus:ring-[#C5A85A] focus:border-transparent
                                backdrop-blur-sm lg:backdrop-blur-0"
                            />
                          </div>

                          {/* Phone */}
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                            <input
                              type="tel"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="Teléfono (10 dígitos)"
                              className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                                bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                                text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                                focus:ring-[#C5A85A] focus:border-transparent
                                backdrop-blur-sm lg:backdrop-blur-0"
                            />
                          </div>

                          {/* Password */}
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Crea una contraseña"
                              className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                                bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                                text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                                focus:ring-[#C5A85A] focus:border-transparent
                                backdrop-blur-sm lg:backdrop-blur-0"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 lg:text-[#94A3B8] hover:text-white/60 lg:hover:text-[#64748B] transition-colors cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          {/* Confirm Password */}
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Confirma tu contraseña"
                              className="w-full rounded-xl border px-11 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all
                                bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                                text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                                focus:ring-[#C5A85A] focus:border-transparent
                                backdrop-blur-sm lg:backdrop-blur-0"
                            />
                          </div>

                          {authError && authMode === 'register' && (
                            <div className="flex items-center gap-2 text-xs bg-red-500/10 lg:bg-red-50 text-red-300 lg:text-red-600 py-3 px-4 rounded-xl border border-red-500/20 lg:border-red-200 font-medium">
                              <div className="h-1.5 w-1.5 bg-red-400 rounded-full shrink-0" />
                              {authError}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full bg-[#C5A85A] hover:bg-[#b8993f] text-white py-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-[#C5A85A]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group mt-1"
                          >
                            Crear mi Cuenta
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10 lg:bg-[#E2E8F0]" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/25 lg:text-[#CBD5E1]">o bien</span>
                <div className="flex-1 h-px bg-white/10 lg:bg-[#E2E8F0]" />
              </div>

              {/* Back to Quoter */}
              <button
                onClick={() => window.location.href = "/"}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2
                  text-white/40 hover:text-white/60 lg:text-[#94A3B8] lg:hover:text-[#64748B]
                  border border-white/8 lg:border-[#E2E8F0] hover:border-white/15 lg:hover:border-[#CBD5E1]
                  bg-transparent lg:bg-transparent hover:bg-white/5 lg:hover:bg-[#F8FAFC]"
              >
                Regresar al Cotizador
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-center pb-6 px-6">
            <p className="text-[10px] text-white/20 lg:text-[#CBD5E1] tracking-wide">
              © {new Date().getFullYear()} Kinder Togas · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-navy text-white py-5 px-4 sm:px-8 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center font-display font-black text-xl text-gold border border-white/20">
              KT
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">Kinder Togas</h1>
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/50 font-bold">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchQuotes(true)}
              disabled={refreshing}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white disabled:opacity-50"
              title="Refrescar datos"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/20 hover:bg-white/10 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer text-white/90 hover:text-white"
            >
              <LogOut className="h-3 w-3" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Revenue Card */}
          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-navy/5 text-navy rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Cotizado</p>
              <h3 className="text-2xl font-bold text-navy font-display mt-1 tabular-nums">
                {formatMXN(stats.totalRevenue)}
              </h3>
            </div>
          </div>

          {/* Average Ticket Card */}
          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-navy/5 text-navy rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ticket Promedio</p>
              <h3 className="text-2xl font-bold text-navy font-display mt-1 tabular-nums">
                {formatMXN(stats.averageTicket)}
              </h3>
            </div>
          </div>

          {/* Quotes Card */}
          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-navy/5 text-navy rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cotizaciones</p>
              <h3 className="text-2xl font-bold text-navy font-display mt-1 tabular-nums">
                {stats.totalQuotesCount}
              </h3>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-navy/5 text-navy rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Alumnos</p>
              <h3 className="text-2xl font-bold text-navy font-display mt-1 tabular-nums">
                {stats.totalStudents}
              </h3>
            </div>
          </div>
        </section>

        {/* Charts Row */}
        {filteredQuotes.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Levels Distribution Chart */}
            <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg text-navy font-bold mb-6">Demanda por Nivel Escolar</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {levelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_PIE_COLORS[index % CHART_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#1E2346", borderRadius: "8px", color: "#FFFFFF", border: "none" }} 
                      itemStyle={{ color: "#FFFFFF" }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Distribution Chart */}
            <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-lg text-navy font-bold mb-6">Distribución Renta vs Venta</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "12px" }} />
                    <YAxis stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "12px" }} />
                    <Tooltip 
                      cursor={{ fill: "rgba(30, 35, 70, 0.04)" }}
                      contentStyle={{ background: "#1E2346", borderRadius: "8px", color: "#FFFFFF", border: "none" }} 
                      itemStyle={{ color: "#FFFFFF" }}
                    />
                    <Bar dataKey="Cotizaciones" fill="#1E2346" radius={[8, 8, 0, 0]}>
                      <Cell fill="#1E2346" />
                      <Cell fill="#C5A85A" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* Filter and Table Section */}
        <section className="bg-white border border-hairline rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header and Filters */}
          <div className="p-6 border-b border-hairline bg-cream/20 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg text-navy font-bold">Listado de Cotizaciones</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visualiza, busca y filtra las cotizaciones del cotizador interactivo.
                </p>
              </div>
              
              <button
                onClick={handleExportCSV}
                disabled={filteredQuotes.length === 0}
                className="flex items-center gap-2 self-start md:self-auto bg-navy hover:bg-navy/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Exportar a Excel (CSV)
              </button>
            </div>

            {/* Inputs Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar escuela, cliente, folio..."
                  className="w-full bg-white border border-hairline rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                />
              </div>

              {/* Level Selector */}
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer appearance-none"
                >
                  <option value="all">Todos los Niveles</option>
                  <option value="preescolar">Preescolar</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="preparatoria">Preparatoria</option>
                  <option value="universidad">Universidad y Posgrado</option>
                </select>
              </div>

              {/* Service Selector */}
              <div className="relative">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer appearance-none"
                >
                  <option value="all">Cualquier Modalidad</option>
                  <option value="renta">Renta</option>
                  <option value="venta">Venta</option>
                </select>
              </div>

              {/* Sede Selector */}
              <div className="relative">
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer appearance-none"
                >
                  <option value="all">Todas las Sedes</option>
                  <option value="tijuana">Tijuana</option>
                  <option value="ensenada">Ensenada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-navy" />
              <p className="text-sm font-medium">Cargando base de datos...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive space-y-2">
              <p className="text-sm font-bold">{error}</p>
              <button 
                onClick={() => fetchQuotes()} 
                className="text-xs text-navy underline hover:opacity-85 cursor-pointer font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground">
              <p className="text-sm">No se encontraron cotizaciones con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-cream/10 border-b border-hairline text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-4 px-6">Folio / Fecha</th>
                    <th className="py-4 px-6">Escuela / Solicitante</th>
                    <th className="py-4 px-6">Modalidad / Sede</th>
                    <th className="py-4 px-6 text-center">Alumnos</th>
                    <th className="py-4 px-6 text-right">Total</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredQuotes.map((q) => {
                    const isExpanded = expandedRows.has(q.id);
                    return (
                      <>
                        <tr 
                          key={q.id}
                          className={cn(
                            "hover:bg-cream/10 transition-colors text-sm group cursor-pointer",
                            isExpanded && "bg-cream/20"
                          )}
                          onClick={() => toggleRow(q.id)}
                        >
                          {/* Folio / Fecha */}
                          <td className="py-4.5 px-6">
                            <div className="font-semibold text-navy tracking-tight">{q.quote_number}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {new Date(q.created_at).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </td>

                          {/* Escuela / Solicitante */}
                          <td className="py-4.5 px-6">
                            <div className="font-semibold text-foreground truncate max-w-[220px]">{q.institution_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
                              {q.contact_name}
                            </div>
                          </td>

                          {/* Modalidad / Sede */}
                          <td className="py-4.5 px-6">
                            <div className="flex items-center gap-1.5">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                q.service_option === "renta" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : "bg-amber-100 text-amber-800"
                              )}>
                                {q.service_option === "renta" ? "Renta" : "Venta"}
                              </span>
                              {q.service_option === "renta" && q.city && (
                                <span className="text-xs text-muted-foreground font-medium">
                                  {q.city === "tijuana" ? "Tijuana" : "Ensenada"}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-medium">
                              {levelLabel(q.school_level)}
                            </div>
                          </td>

                          {/* Alumnos */}
                          <td className="py-4.5 px-6 text-center font-semibold tabular-nums text-foreground">
                            {q.student_count}
                          </td>

                          {/* Total */}
                          <td className="py-4.5 px-6 text-right font-bold text-navy tabular-nums">
                            {formatMXN(q.total_price)}
                          </td>

                          {/* Acciones */}
                          <td className="py-4.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => toggleRow(q.id)}
                                className="p-2 hover:bg-cream rounded-xl text-muted-foreground hover:text-navy transition-colors cursor-pointer"
                                title="Ver detalles"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                              <a
                                href={getWhatsAppLink(q)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                                title="Hacer seguimiento por WhatsApp"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <tr className="bg-cream/15">
                            <td colSpan={6} className="py-6 px-8 border-t border-b border-hairline/80">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                {/* Datos de Contacto */}
                                <div className="space-y-2">
                                  <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Contacto Completo</h4>
                                  <div className="space-y-1 text-xs">
                                    <p><span className="text-muted-foreground">Teléfono:</span> <span className="font-semibold text-foreground">{q.contact_phone}</span></p>
                                    <p><span className="text-muted-foreground">Email:</span> <span className="font-semibold text-foreground">{q.contact_email || "No provisto"}</span></p>
                                    <p><span className="text-muted-foreground">Fecha Estimada:</span> <span className="font-semibold text-foreground">{q.estimated_date ? new Date(q.estimated_date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "Por definir"}</span></p>
                                  </div>
                                </div>

                                {/* Especificaciones del Pedido */}
                                <div className="space-y-2">
                                  <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Detalles del Paquete</h4>
                                  <div className="space-y-1 text-xs">
                                    <p><span className="text-muted-foreground">Paquete:</span> <span className="font-semibold text-foreground">{packageLabel(q.package_kind, q.package_variant, q.school_level)}</span></p>
                                    <p><span className="text-muted-foreground">Precio Unitario:</span> <span className="font-semibold text-foreground">{formatMXN(q.unit_price)}</span></p>
                                    <p><span className="text-muted-foreground">Cantidad:</span> <span className="font-semibold text-foreground">{q.student_count} togas/birretes</span></p>
                                  </div>
                                </div>

                                {/* Colores de Graduación */}
                                <div className="space-y-2">
                                  <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Colores Seleccionados</h4>
                                  <div className="space-y-1 text-xs">
                                    <p><span className="text-muted-foreground">Color Toga:</span> <span className="font-semibold text-foreground uppercase tracking-wide">{q.toga_color || "Predeterminado"}</span></p>
                                    <p><span className="text-muted-foreground">Color Estola:</span> <span className="font-semibold text-foreground uppercase tracking-wide">{q.stola_color || "Predeterminado"}</span></p>
                                    {q.package_kind === "A" && <p className="text-muted-foreground/60 italic text-[11px]">* Paquete A incluye Toga y Estola Lisa por defecto.</p>}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
