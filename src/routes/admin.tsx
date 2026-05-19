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
  Calendar,
  LogOut,
  RefreshCw
} from "lucide-react";
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

export const Route = createFileRoute("/admin")({
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
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-hairline p-8 shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-cream rounded-full flex items-center justify-center text-navy shadow-inner">
              <Lock className="h-8 w-8 text-navy" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-navy font-bold tracking-tight">Acceso Privado</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa la contraseña administrativa para ver métricas e información confidencial.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-hairline px-4 py-3 bg-cream/40 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent text-center font-mono"
              />
            </div>
            
            {authError && (
              <p className="text-xs text-destructive bg-destructive/5 py-2 px-3 rounded-lg border border-destructive/20 font-medium">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-navy text-white hover:bg-navy/90 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <button
            onClick={() => window.location.href = "/"}
            className="text-xs text-muted-foreground hover:text-navy underline cursor-pointer"
          >
            Regresar al Cotizador
          </button>
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
