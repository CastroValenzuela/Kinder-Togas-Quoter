import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { formatMXN } from "@/lib/pricing";
import { generateQuotePDF } from "@/lib/quote-pdf";
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
  ArrowLeft,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Truck,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle
} from "lucide-react";
import adminHeroImg from "@/assets/brand/admin-hero.png";
import logoImg from "@/assets/logo.png";
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

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel de Administración — Kinder Togas" },
      { name: "robots", content: "noindex, nofollow" }
    ],
  }),
  component: AdminDashboard,
});

interface QuoteRecord {
  id: string;
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
  status: string | null;
  discount_percent?: number;
  original_unit_price?: number;
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

const ADMIN_EMAILS = [
  "castrovalenzuela@hotmail.com",
  "kindertogas@gmail.com",
  "admin@kindertogas.com",
  "crm_admin@kindertogas.com"
];

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [regSuccess, setRegSuccess] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Hydrate localStorage values on client side
  useEffect(() => {
    setLoginEmail(localStorage.getItem("kt_remember_email") || "");
    setRememberMe(localStorage.getItem("kt_remember_me") !== "false");
  }, []);
  
  // Password Recovery / Reset States
  const [resetPassword, setResetPassword] = useState<string>("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>("");
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [resetSuccessState, setResetSuccessState] = useState<boolean>(false);

  // Security Inactivity Warning States
  const [showInactivityModal, setShowInactivityModal] = useState<boolean>(false);
  const [inactivityCountdown, setInactivityCountdown] = useState<number>(60);

  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // CRM vs Pricing Tabs
  const [activeTab, setActiveTab] = useState<'crm' | 'stats' | 'pricing' | 'calendar'>('crm');

  // Calendar states
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  
  // Pricing states
  const [pricingList, setPricingList] = useState<{ key: string; price: number; discount_percent: number }[]>([]);
  const [loadingPricing, setLoadingPricing] = useState<boolean>(false);
  const [savingPrices, setSavingPrices] = useState<boolean>(false);
  const [pricingMessage, setPricingMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pricingFilterLevel, setPricingFilterLevel] = useState<string>("all");

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10);

  // Reset page when filters change to avoid showing empty pages
  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter, serviceFilter, cityFilter, statusFilter]);

  // Detect password recovery email link redirection on mount
  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (hash.includes("type=recovery") || searchParams.get("reset") === "true") {
      setAuthMode('reset');
      setAuthError("");
    }
  }, []);

  // Check auth session
  useEffect(() => {
    // 1. Check legacy sessionStorage or localStorage backup
    const session = sessionStorage.getItem("kt_admin_session") || localStorage.getItem("kt_admin_session");
    if (session === "authorized") {
      setIsAuthenticated(true);
      return;
    }

    // Function to handle unauthorized signouts
    const handleUnauthorizedUser = async () => {
      await supabase.auth.signOut();
      sessionStorage.removeItem("kt_admin_session");
      localStorage.removeItem("kt_admin_session");
      setIsAuthenticated(false);
      setAuthError("Esta cuenta de Google no tiene privilegios de administrador.");
    };

    // 2. Check active Supabase session on mount
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      if (activeSession?.user?.email) {
        if (ADMIN_EMAILS.includes(activeSession.user.email.toLowerCase())) {
          setIsAuthenticated(true);
        } else {
          handleUnauthorizedUser();
        }
      }
    });

    // 3. Listen to auth state changes (crucial for Google OAuth redirection callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, activeSession) => {
      if (activeSession?.user?.email) {
        if (ADMIN_EMAILS.includes(activeSession.user.email.toLowerCase())) {
          setIsAuthenticated(true);
          setAuthError(""); // Clear any previous error on successful login
        } else {
          handleUnauthorizedUser();
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
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

  // Update Quote Status (CRM)
  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    setUpdatingStatusId(quoteId);
    try {
      const { error: updateErr } = await supabase
        .from("quotes")
        .update({ status: newStatus })
        .eq("id", quoteId);

      if (updateErr) throw updateErr;

      // Update in local memory state instantly
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q.id === quoteId ? { ...q, status: newStatus } : q
        )
      );
    } catch (err: any) {
      console.error("Error updating quote status:", err);
      alert("No se pudo actualizar el estado de la cotización en la base de datos.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Fetch all dynamic pricing keys & values
  const fetchPricing = async () => {
    setLoadingPricing(true);
    setPricingMessage(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("pricing")
        .select("key, price, discount_percent")
        .order("key", { ascending: true });

      if (fetchErr) throw fetchErr;

      // Static fallback list to merge and keep consistent if any keys are missing in DB
      const staticKeys = [
        { key: "A_PREESCOLAR", price: 350, discount_percent: 0 },
        { key: "B_ESENCIAL_PREESCOLAR", price: 450, discount_percent: 0 },
        { key: "B_BALANCE_PREESCOLAR", price: 480, discount_percent: 0 },
        { key: "B_PREMIUM_PREESCOLAR", price: 510, discount_percent: 0 },
        { key: "A_PRIMARIA", price: 350, discount_percent: 0 },
        { key: "B_BALANCE_PRIMARIA", price: 480, discount_percent: 0 },
        { key: "B_PREMIUM_PRIMARIA", price: 510, discount_percent: 0 },
        { key: "PRI_C", price: 450, discount_percent: 0 },
        { key: "PRI_B", price: 480, discount_percent: 0 },
        { key: "PRI_A", price: 510, discount_percent: 0 },
        { key: "A_SECUNDARIA", price: 350, discount_percent: 0 },
        { key: "SEC_B", price: 500, discount_percent: 0 },
        { key: "SEC_A", price: 550, discount_percent: 0 },
        { key: "A_PREPARATORIA", price: 350, discount_percent: 0 },
        { key: "PREP_B", price: 500, discount_percent: 0 },
        { key: "PREP_A", price: 550, discount_percent: 0 },
        { key: "PREP_C1", price: 600, discount_percent: 0 },
        { key: "PREP_C2", price: 720, discount_percent: 0 },
        { key: "UNI_A", price: 550, discount_percent: 0 },
        { key: "UNI_B", price: 600, discount_percent: 0 },
        { key: "UNI_C", price: 720, discount_percent: 0 }
      ];

      // Merge Supabase active rows into our static templates to ensure all exist
      const dbMap = new Map((data || []).map((row) => [row.key, row]));
      const mergedList = staticKeys.map((item) => {
        const match = dbMap.get(item.key);
        return {
          key: item.key,
          price: match ? Number(match.price) : item.price,
          discount_percent: match ? Number(match.discount_percent || 0) : item.discount_percent
        };
      });

      setPricingList(mergedList);
    } catch (err: any) {
      console.error("Error fetching pricing table:", err);
      setPricingMessage({ text: "No se pudieron obtener las tarifas de la base de datos.", type: "error" });
    } finally {
      setLoadingPricing(false);
    }
  };

  // Upsert all modified pricing items to Supabase
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrices(true);
    setPricingMessage(null);
    try {
      // Execute upsert into 'pricing' table by matching the 'key' constraint
      const { error: upsertErr } = await supabase
        .from("pricing")
        .upsert(
          pricingList.map((item) => ({
            key: item.key,
            price: item.price,
            discount_percent: item.discount_percent
          })),
          { onConflict: "key" }
        );

      if (upsertErr) throw upsertErr;

      setPricingMessage({ text: "¡Tarifas y descuentos actualizados en caliente con éxito!", type: "success" });
      
      // Reload pricing inside pricing.ts dynamic cache imports immediately
      const { loadDynamicPrices } = await import("@/lib/pricing");
      await loadDynamicPrices();
    } catch (err: any) {
      console.error("Error saving pricing tables:", err);
      setPricingMessage({ text: "No se pudieron guardar las tarifas en Supabase.", type: "error" });
    } finally {
      setSavingPrices(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuotes();
      fetchPricing();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !password.trim()) {
      setAuthError("Por favor completa todos los campos.");
      return;
    }
    setAuthError("");
    
    // 1. Backdoor for legacy static password
    if (password === "adminKT2026") {
      if (rememberMe) {
        localStorage.setItem("kt_admin_session", "authorized");
        localStorage.setItem("kt_remember_email", loginEmail.trim());
        localStorage.setItem("kt_remember_me", "true");
      } else {
        sessionStorage.setItem("kt_admin_session", "authorized");
        localStorage.removeItem("kt_remember_email");
        localStorage.setItem("kt_remember_me", "false");
        localStorage.removeItem("kt_admin_session");
      }
      setIsAuthenticated(true);
      setAuthError("");
      return;
    }

    // 2. Real Supabase password authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: password
      });

      if (error) throw error;

      const email = data.user?.email;
      if (email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase())) {
        if (rememberMe) {
          localStorage.setItem("kt_remember_email", loginEmail.trim());
          localStorage.setItem("kt_remember_me", "true");
        } else {
          localStorage.removeItem("kt_remember_email");
          localStorage.setItem("kt_remember_me", "false");
        }
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        await supabase.auth.signOut();
        setAuthError("Esta cuenta no tiene privilegios de administrador.");
      }
    } catch (err: any) {
      console.error("Error logging in:", err);
      setAuthError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login',
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Error al conectar con Google.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAuthError("Por favor ingresa tu correo electrónico.");
      return;
    }
    setAuthError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
        redirectTo: window.location.origin + '/login?reset=true',
      });
      if (error) throw error;
      setForgotSuccess(true);
    } catch (err: any) {
      console.error("Error sending reset password email:", err);
      setAuthError(err.message || "Error al enviar el correo de recuperación.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword.trim() || !resetConfirmPassword.trim()) {
      setAuthError("Por favor completa todos los campos.");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      setAuthError("Las contraseñas no coinciden.");
      return;
    }
    setAuthError("");
    try {
      const { error } = await supabase.auth.updateUser({
        password: resetPassword
      });
      if (error) throw error;
      setResetSuccessState(true);
      setTimeout(() => {
        setAuthMode('login');
        setResetSuccessState(false);
        setResetPassword("");
        setResetConfirmPassword("");
        // Clean URL search/hash params
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setAuthError(err.message || "Error al restablecer la contraseña.");
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("kt_admin_session");
    localStorage.removeItem("kt_admin_session");
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setPassword("");
  };

  // 1. Inactivity Warning Timer (14 minutes of absolute inactivity triggers warning modal)
  useEffect(() => {
    if (!isAuthenticated || showInactivityModal) return;

    let timeoutId: NodeJS.Timeout;

    const startInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setInactivityCountdown(60);
        setShowInactivityModal(true);
      }, 14 * 60 * 1000); // 14 minutes in milliseconds
    };

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    
    // Initialize timer
    startInactivityTimer();

    // Reset timer on user activity
    const handleUserActivity = () => {
      startInactivityTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, showInactivityModal]);

  // 2. Countdown Timer when Warning Modal is Active (60 seconds)
  useEffect(() => {
    if (!showInactivityModal) return;

    const intervalId = setInterval(() => {
      setInactivityCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          handleLogout();
          setShowInactivityModal(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [showInactivityModal]);

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
      esencial: "Paquete B — B.1 Esencial",
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

  // Filtering & Sorting Logic
  const filteredQuotes = useMemo(() => {
    const filtered = quotes.filter((q) => {
      const matchesSearch =
        q.institution_name.toLowerCase().includes(search.toLowerCase()) ||
        q.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
        (q.contact_email && q.contact_email.toLowerCase().includes(search.toLowerCase())) ||
        q.contact_phone.includes(search);

      const matchesLevel = levelFilter === "all" || q.school_level === levelFilter;
      const matchesService = serviceFilter === "all" || q.service_option === serviceFilter;
      const matchesCity = cityFilter === "all" || q.city === cityFilter;
      
      const qStatus = q.status || "pending";
      const matchesStatus = statusFilter === "all" || qStatus === statusFilter;

      return matchesSearch && matchesLevel && matchesService && matchesCity && matchesStatus;
    });

    // Apply sorting dynamically
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortField as keyof QuoteRecord];
      let valB: any = b[sortField as keyof QuoteRecord];

      // Handle nulls and undefined
      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      // Lowercase strings for case-insensitive sort
      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc
          ? valA.localeCompare(valB, "es")
          : valB.localeCompare(valA, "es");
      }

      // Numeric or chronological sort
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [quotes, search, levelFilter, serviceFilter, cityFilter, statusFilter, sortField, sortAsc]);

  // Paginated Quotes for active page view
  const paginatedQuotes = useMemo(() => {
    if (rowsPerPage === 'all') return filteredQuotes;
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredQuotes.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredQuotes, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    if (rowsPerPage === 'all') return 1;
    return Math.ceil(filteredQuotes.length / rowsPerPage) || 1;
  }, [filteredQuotes, rowsPerPage]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalQuotesCount = filteredQuotes.length;
    const totalRevenue = filteredQuotes.reduce((acc, q) => acc + q.total_price, 0);
    const averageTicket = totalQuotesCount > 0 ? totalRevenue / totalQuotesCount : 0;
    const totalStudents = filteredQuotes.reduce((acc, q) => acc + q.student_count, 0);

    const contractedCount = filteredQuotes.filter((q) => q.status === "contracted").length;
    const pendingCount = filteredQuotes.filter((q) => !q.status || q.status === "pending").length;
    const conversionRate = totalQuotesCount > 0 ? (contractedCount / totalQuotesCount) * 100 : 0;

    // Predictive/Advanced Metrics:
    // 1. Expected / Weighted Revenue Forecast
    const weightedRevenue = filteredQuotes.reduce((acc, q) => {
      const status = q.status || "pending";
      let rate = 0.15; // default pending
      if (status === "contracted") rate = 1.00;
      else if (status === "contacted") rate = 0.40;
      else if (status === "archived") rate = 0.00;
      return acc + (q.total_price * rate);
    }, 0);

    // 2. Toga logistics metrics
    const contractedStudents = filteredQuotes.filter(q => q.status === "contracted").reduce((acc, q) => acc + q.student_count, 0);
    const totalPipelineStudents = totalStudents;

    return {
      totalQuotesCount,
      totalRevenue,
      averageTicket,
      totalStudents,
      contractedCount,
      pendingCount,
      conversionRate,
      weightedRevenue,
      contractedStudents,
      totalPipelineStudents
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

  // Event Demand Projection Timeline (Predictive Logistics Monthly)
  const eventTimelineData = useMemo(() => {
    const monthlyCounts: Record<string, { month: string; Togas: number; Ingreso: number }> = {};
    
    filteredQuotes.forEach((q) => {
      if (!q.estimated_date) return;
      const date = new Date(q.estimated_date);
      if (isNaN(date.getTime())) return;
      
      const monthName = date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
      const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      if (!monthlyCounts[formattedMonth]) {
        monthlyCounts[formattedMonth] = { month: formattedMonth, Togas: 0, Ingreso: 0 };
      }
      monthlyCounts[formattedMonth].Togas += q.student_count;
      monthlyCounts[formattedMonth].Ingreso += q.total_price;
    });

    return Object.values(monthlyCounts).sort((a, b) => {
      const parseDate = (str: string) => {
        const parts = str.split(" ");
        const months: Record<string, number> = {
          Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
          Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11
        };
        const month = months[parts[0]] || 0;
        const year = parseInt(parts[1]) || 2026;
        return new Date(year, month, 1).getTime();
      };
      return parseDate(a.month) - parseDate(b.month);
    });
  }, [filteredQuotes]);

  // Popular Stola & Toga Colors (Manufacturing Decision Trend)
  const colorChartData = useMemo(() => {
    const colorCounts: Record<string, number> = {};
    filteredQuotes.forEach((q) => {
      const color = q.stola_color || q.toga_color || "Negro / Tradicional";
      const colorName = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
      colorCounts[colorName] = (colorCounts[colorName] || 0) + q.student_count;
    });
    return Object.entries(colorCounts)
      .map(([name, Togas]) => ({ name, Togas }))
      .sort((a, b) => b.Togas - a.Togas)
      .slice(0, 6);
  }, [filteredQuotes]);

  const renderMetricCards = () => (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
      {/* Revenue Card */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="h-10 w-10 bg-navy/5 text-navy rounded-xl flex items-center justify-center flex-shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Cotizado</p>
          <h3 className="text-xl font-bold text-navy font-display mt-0.5 tabular-nums">
            {formatMXN(stats.totalRevenue)}
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">Monto total bruto</p>
        </div>
      </div>

      {/* Predictive Expected Cash Flow Card */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-l-[#C5A85A]">
        <div className="h-10 w-10 bg-[#C5A85A]/10 text-[#C5A85A] rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm">
          🔮
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#C5A85A] font-bold">Ingreso Ponderado</p>
          <h3 className="text-xl font-bold text-navy font-display mt-0.5 tabular-nums">
            {formatMXN(stats.weightedRevenue)}
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">Pronóstico real por probabilidad</p>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm">
          🎯
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Conversión CRM</p>
          <h3 className="text-xl font-bold text-navy font-display mt-0.5 tabular-nums">
            {stats.conversionRate.toFixed(1)}%
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">{stats.contractedCount} de {stats.totalQuotesCount} leads cerrados</p>
        </div>
      </div>

      {/* Gowns Committed logistics Card */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-base">📦</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Togas Reservadas</p>
          <h3 className="text-xl font-bold text-emerald-700 font-display mt-0.5 tabular-nums">
            {stats.contractedStudents} <span className="text-xs font-semibold text-muted-foreground font-sans">unds</span>
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">Inventario comprometido</p>
        </div>
      </div>

      {/* Potential Gowns pipeline Card */}
      <div className="bg-white border border-hairline rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-base">📈</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-blue-800 font-bold">Togas en Pipeline</p>
          <h3 className="text-xl font-bold text-navy font-display mt-0.5 tabular-nums">
            {stats.totalPipelineStudents} <span className="text-xs font-semibold text-muted-foreground font-sans">unds</span>
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">Demanda máxima potencial</p>
        </div>
      </div>
    </section>
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "created_at" ? false : true);
    }
  };

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
      "Precio Lista (Unitario)",
      "Descuento (%)",
      "Precio Neto (Unitario)",
      "Total",
      "Color Toga",
      "Color Estola",
      "Fecha Estimada",
      "Estado"
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
      q.original_unit_price || q.unit_price,
      q.discount_percent ? `${q.discount_percent}%` : "0%",
      q.unit_price,
      q.total_price,
      q.toga_color || "N/A",
      q.stola_color || "N/A",
      q.estimated_date || "Por definir",
      q.status === "contracted" ? "Contratado" : q.status === "contacted" ? "Contactado" : q.status === "archived" ? "Archivado" : "Pendiente"
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
      <div className="h-screen flex font-sans overflow-hidden">
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
            {/* Spacer to align main messaging */}
            <div />

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
                <div className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <Truck className="h-4 w-4 text-[#C5A85A]" />
                  <span className="text-xs text-white/80 font-medium">Envíos a todo México 🇲🇽</span>
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
        <div className="w-full lg:w-[45%] bg-[#FAFBFC] flex flex-col relative h-full lg:overflow-y-auto">
          {/* Mobile-only background */}
          <div className="lg:hidden absolute inset-0">
            <img
              src={adminHeroImg}
              alt="Graduación"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E2346]/80 via-[#1E2346]/60 to-[#0F1225]/95" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-4 lg:py-6">
            <div className="w-full max-w-[380px] space-y-4">
              {/* Brand Header */}
              <div className="flex flex-col items-center justify-center w-full">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-navy/10 border border-slate-100 lg:border-slate-200/60 p-1">
                    <img src={logoImg} alt="Kinder Togas" className="h-full w-full object-contain" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-display text-xl lg:text-2xl font-bold text-white lg:text-[#1E2346] tracking-tight">Kinder Togas</h2>
                    <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.25em] text-white/40 lg:text-[#94A3B8] font-bold">Graduaciones</p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              {(authMode === 'login' || authMode === 'register') && (
                <>
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
                  <p className="text-sm text-white/50 lg:text-[#64748B] leading-relaxed text-center">
                    {authMode === 'login'
                      ? 'Accede a tu cuenta para gestionar tus cotizaciones, compras y realizar pagos en línea.'
                      : 'Crea tu cuenta gratis para cotizar, comprar y personalizar tu graduación.'}
                  </p>
                </>
              )}

              {/* SLIDING FORM CONTAINER / PASSWORD RECOVERY LAYOUT */}
              {authMode === 'forgot' ? (
                <div className="w-full space-y-4">
                  <div className="space-y-1.5 text-center">
                    <h3 className="font-display text-lg font-bold text-white lg:text-[#1E2346]">Recuperar Contraseña</h3>
                    <p className="text-xs text-white/50 lg:text-[#64748B] leading-relaxed">
                      Ingresa tu correo registrado y te enviaremos un enlace para restablecer tu contraseña de forma segura.
                    </p>
                  </div>

                  {forgotSuccess ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="h-14 w-14 bg-emerald-500/10 lg:bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Mail className="h-7 w-7 text-emerald-500 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display text-base font-bold text-white lg:text-[#1E2346]">¡Enlace Enviado!</h4>
                        <p className="text-xs text-white/60 lg:text-[#64748B] leading-relaxed px-4">
                          Hemos enviado las instrucciones a <strong className="text-white lg:text-[#1E2346]">{loginEmail}</strong>. Por favor revisa tu bandeja de entrada y spam.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setForgotSuccess(false); setAuthError(''); }}
                        className="w-full bg-[#1E2346] hover:bg-[#2a305c] text-white py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4 animate-pulse" />
                        Volver a Iniciar Sesión
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
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
                            required
                            className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                              bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                              text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                              focus:ring-[#C5A85A] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {authError && (
                        <div className="flex items-center gap-2 text-xs bg-red-500/10 lg:bg-red-50 text-red-300 lg:text-red-600 py-3 px-4 rounded-xl border border-red-500/20 lg:border-red-200 font-medium">
                          <div className="h-1.5 w-1.5 bg-red-400 rounded-full shrink-0" />
                          {authError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setAuthMode('login'); setAuthError(''); }}
                          className="flex-1 border border-white/10 lg:border-[#E2E8F0] text-white/70 lg:text-[#64748B] hover:bg-white/5 lg:hover:bg-slate-50 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-[#1E2346] hover:bg-[#2a305c] text-white py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                        >
                          Enviar Enlace
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : authMode === 'reset' ? (
                <div className="w-full space-y-4">
                  <div className="space-y-1.5 text-center">
                    <h3 className="font-display text-lg font-bold text-white lg:text-[#1E2346]">Restablecer Contraseña</h3>
                    <p className="text-xs text-white/50 lg:text-[#64748B] leading-relaxed">
                      Escribe tu nueva contraseña de acceso. Asegúrate de guardarla en un lugar seguro.
                    </p>
                  </div>

                  {resetSuccessState ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="h-14 w-14 bg-emerald-500/10 lg:bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                        <ShieldCheck className="h-7 w-7 text-emerald-500 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display text-base font-bold text-white lg:text-[#1E2346]">¡Contraseña Actualizada!</h4>
                        <p className="text-xs text-white/60 lg:text-[#64748B] leading-relaxed">
                          Tu contraseña ha sido restablecida con éxito. Serás redirigido al inicio de sesión en unos momentos.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-semibold text-white/50 lg:text-[#94A3B8]">
                          Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                          <input
                            type="password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder="Escribe tu nueva contraseña"
                            required
                            className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                              bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                              text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                              focus:ring-[#C5A85A] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase tracking-wider font-semibold text-white/50 lg:text-[#94A3B8]">
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                          <input
                            type="password"
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                            placeholder="Confirma tu nueva contraseña"
                            required
                            className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                              bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                              text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                              focus:ring-[#C5A85A] focus:border-transparent"
                          />
                        </div>
                      </div>

                      {authError && (
                        <div className="flex items-center gap-2 text-xs bg-red-500/10 lg:bg-red-50 text-red-300 lg:text-red-600 py-3 px-4 rounded-xl border border-red-500/20 lg:border-red-200 font-medium">
                          <div className="h-1.5 w-1.5 bg-red-400 rounded-full shrink-0" />
                          {authError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full bg-[#1E2346] hover:bg-[#2a305c] text-white py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        Restablecer Contraseña
                      </button>
                    </form>
                  )}
                </div>
              ) : (
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
                              className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
                                bg-white/10 lg:bg-white border-white/15 lg:border-[#E2E8F0]
                                text-white lg:text-[#0F172A] placeholder:text-white/30 lg:placeholder:text-[#94A3B8]
                                focus:ring-[#C5A85A] focus:border-transparent
                                backdrop-blur-sm lg:backdrop-blur-0"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs uppercase tracking-wider font-semibold text-white/50 lg:text-[#94A3B8]">
                              Contraseña
                            </label>
                            <button
                              type="button"
                              onClick={() => { setAuthMode('forgot'); setAuthError(''); setForgotSuccess(false); }}
                              className="text-xs font-semibold text-white/50 lg:text-[#C5A85A] hover:text-white/80 lg:hover:text-[#B5984A] transition-colors cursor-pointer animate-pulse"
                            >
                              ¿Olvidaste tu contraseña?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 lg:text-[#94A3B8]" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Escribe tu contraseña"
                              className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
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

                        {/* Recordarme Checkbox */}
                        <div className="flex items-center justify-between py-1">
                          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={cn(
                              "h-5 w-5 rounded-lg border flex items-center justify-center transition-all duration-200",
                              rememberMe 
                                ? "bg-[#1E2346] border-transparent lg:bg-[#C5A85A] text-white" 
                                : "border-white/20 lg:border-[#E2E8F0] bg-transparent group-hover:border-white/40 lg:group-hover:border-[#C5A85A]/50"
                            )}>
                              {rememberMe && (
                                <svg className="h-3.5 w-3.5 stroke-current stroke-[3] text-white" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-white/60 lg:text-[#64748B] group-hover:text-white/80 lg:group-hover:text-[#1E2346] transition-colors">
                              Recordarme en este dispositivo
                            </span>
                          </label>
                        </div>

                        {authError && authMode === 'login' && (
                          <div className="flex items-center gap-2 text-xs bg-red-500/10 lg:bg-red-50 text-red-300 lg:text-red-600 py-3 px-4 rounded-xl border border-red-500/20 lg:border-red-200 font-medium">
                            <div className="h-1.5 w-1.5 bg-red-400 rounded-full shrink-0" />
                            {authError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-[#1E2346] hover:bg-[#2a305c] text-white py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-navy/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                        >
                          Iniciar Sesión
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </form>
                    </div>

                    {/* PANEL 2: REGISTER FORM */}
                    <div className="w-1/2 shrink-0 px-2 transition-opacity duration-300" style={{ opacity: authMode === 'register' ? 1 : 0 }}>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
                            setAuthError('Por favor completa todos los campos.');
                            return;
                          }
                          if (regName.trim().length < 3) {
                            setAuthError('El nombre completo debe tener al menos 3 caracteres.');
                            return;
                          }
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(regEmail.trim())) {
                            setAuthError('Por favor ingresa un correo electrónico válido.');
                            return;
                          }
                          if (regPhone.replace(/\D/g, '').length !== 10) {
                            setAuthError('El teléfono de contacto debe tener exactamente 10 dígitos.');
                            return;
                          }
                          if (regPassword !== regConfirmPassword) {
                            setAuthError('Las contraseñas no coinciden.');
                            return;
                          }
                          setAuthError('');
                          try {
                            const { error: signUpErr } = await supabase.auth.signUp({
                              email: regEmail.trim(),
                              password: regPassword,
                              options: {
                                data: {
                                  full_name: regName.trim(),
                                  phone: regPhone.trim()
                                }
                              }
                            });

                            if (signUpErr) throw signUpErr;
                            setRegSuccess(true);
                          } catch (err: any) {
                            console.error("Error registering user:", err);
                            setAuthError(err.message || "Error al registrar la cuenta.");
                          }
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
                                className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
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
                                className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
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
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
                                  let formatted = "";
                                  if (digits.length > 0) {
                                    if (digits.length <= 3) {
                                      formatted = `(${digits}`;
                                    } else if (digits.length <= 6) {
                                      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                                    } else {
                                      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
                                    }
                                  }
                                  setRegPhone(formatted);
                                }}
                                placeholder="Teléfono (10 dígitos)"
                                className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
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
                                className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
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
                                className="w-full rounded-xl border px-11 py-3 text-sm focus:outline-none focus:ring-2 transition-all
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
                              className="w-full bg-[#C5A85A] hover:bg-[#b8993f] text-white py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-[#C5A85A]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group mt-1"
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
              )}

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10 lg:bg-[#E2E8F0]" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/25 lg:text-[#CBD5E1]">o bien</span>
                <div className="flex-1 h-px bg-white/10 lg:bg-[#E2E8F0]" />
              </div>

              {/* Google OAuth Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-3
                  bg-white lg:bg-white text-[#1E2346] hover:bg-white/95 border border-[#E2E8F0] shadow-sm hover:shadow active:scale-[0.98]"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continuar con Google
              </button>

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
        <div className="w-full max-w-full px-4 sm:px-8 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center p-1 shadow-inner border border-white/10">
              <img src={logoImg} alt="Kinder Togas Logo" className="h-full w-full object-contain" />
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
      <main className="flex-1 w-full max-w-full px-4 sm:px-8 mx-auto py-4 sm:py-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-hairline/80 gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => setActiveTab('crm')}
            className={cn(
              "pb-4 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2",
              activeTab === 'crm'
                ? "border-navy text-navy font-extrabold"
                : "border-transparent text-muted-foreground hover:text-navy/70"
            )}
          >
            <span>📋</span> CRM de Cotizaciones
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "pb-4 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2",
              activeTab === 'stats'
                ? "border-navy text-navy font-extrabold"
                : "border-transparent text-muted-foreground hover:text-navy/70"
            )}
          >
            <span>📈</span> Métricas y Gráficos
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={cn(
              "pb-4 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2",
              activeTab === 'pricing'
                ? "border-navy text-navy font-extrabold"
                : "border-transparent text-muted-foreground hover:text-navy/70"
            )}
          >
            <span>🏷️</span> Tarifas & Descuentos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "pb-4 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2",
              activeTab === 'calendar'
                ? "border-navy text-navy font-extrabold"
                : "border-transparent text-muted-foreground hover:text-navy/70"
            )}
          >
            <span>📅</span> Agenda de Eventos
          </button>
        </div>

        {activeTab === 'crm' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Metric Cards Row */}
            {renderMetricCards()}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
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

              {/* Status Selector (CRM) */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer appearance-none font-medium"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="pending">Pendientes 🟡</option>
                  <option value="contacted">Contactados 🔵</option>
                  <option value="contracted">Contratados 🟢</option>
                  <option value="archived">Archivados ⚫</option>
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
            <>
              <div className="overflow-x-auto bg-white border border-hairline rounded-2xl shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-cream/10 border-b border-hairline text-muted-foreground uppercase text-[10px] tracking-wider font-bold select-none">
                    <th 
                      className="py-4 px-6 cursor-pointer hover:text-navy hover:bg-cream/20 transition-colors"
                      onClick={() => handleSort("created_at")}
                      title="Ordenar por Fecha de Creación"
                    >
                      <div className="flex items-center gap-1">
                        <span>Folio / Fecha</span>
                        <span className="text-[8px] text-navy/60">{sortField === "created_at" ? (sortAsc ? "▲" : "▼") : ""}</span>
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 cursor-pointer hover:text-navy hover:bg-cream/20 transition-colors"
                      onClick={() => handleSort("institution_name")}
                      title="Ordenar por Escuela / Institución"
                    >
                      <div className="flex items-center gap-1">
                        <span>Escuela / Solicitante</span>
                        <span className="text-[8px] text-navy/60">{sortField === "institution_name" ? (sortAsc ? "▲" : "▼") : ""}</span>
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 cursor-pointer hover:text-navy hover:bg-cream/20 transition-colors"
                      onClick={() => handleSort("school_level")}
                      title="Ordenar por Nivel Escolar"
                    >
                      <div className="flex items-center gap-1">
                        <span>Modalidad / Nivel</span>
                        <span className="text-[8px] text-navy/60">{sortField === "school_level" ? (sortAsc ? "▲" : "▼") : ""}</span>
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 text-center cursor-pointer hover:text-navy hover:bg-cream/20 transition-colors"
                      onClick={() => handleSort("student_count")}
                      title="Ordenar por Cantidad de Alumnos"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Alumnos</span>
                        <span className="text-[8px] text-navy/60">{sortField === "student_count" ? (sortAsc ? "▲" : "▼") : ""}</span>
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 text-right cursor-pointer hover:text-navy hover:bg-cream/20 transition-colors"
                      onClick={() => handleSort("total_price")}
                      title="Ordenar por Total"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Total</span>
                        <span className="text-[8px] text-navy/60">{sortField === "total_price" ? (sortAsc ? "▲" : "▼") : ""}</span>
                      </div>
                    </th>
                    <th 
                      className="py-4 px-6 text-center cursor-pointer hover:text-navy hover:bg-cream/20 transition-colors"
                      onClick={() => handleSort("status")}
                      title="Ordenar por Estado (CRM)"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Estado</span>
                        <span className="text-[8px] text-navy/60">{sortField === "status" ? (sortAsc ? "▲" : "▼") : ""}</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center text-muted-foreground cursor-default">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {paginatedQuotes.map((q) => {
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
                            <div className="text-xs text-muted-foreground mt-0.5" title="Fecha de Creación">
                              {new Date(q.created_at).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                            {q.estimated_date && (
                              <div className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 mt-1 inline-block" title="Fecha Tentativa del Evento">
                                📅 {new Date(q.estimated_date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                              </div>
                            )}
                          </td>

                          {/* Escuela / Solicitante */}
                          <td className="py-4.5 px-6">
                            <div className="font-semibold text-foreground truncate max-w-[220px]">{q.institution_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px] font-medium">
                              👤 {q.contact_name}
                            </div>
                            <div className="text-[11px] text-[#C5A85A] font-bold mt-1.5 truncate max-w-[220px]">
                              📦 {packageLabel(q.package_kind, q.package_variant, q.school_level)}
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
                            <div>{formatMXN(q.total_price)}</div>
                            {q.discount_percent !== undefined && q.discount_percent > 0 && (
                              <span className="inline-block text-[9px] font-bold text-[#C5A85A] bg-[#C5A85A]/10 px-1.5 py-0.5 rounded-md mt-0.5 tracking-wider select-none">
                                -{q.discount_percent}% DTO
                              </span>
                            )}
                          </td>

                          {/* Estado (CRM) */}
                          <td className="py-4.5 px-6 text-center select-none" onClick={(e) => e.stopPropagation()}>
                            {(() => {
                              const curStatus = q.status || "pending";
                              const configs: Record<string, { label: string; cls: string }> = {
                                pending: { label: "Pendiente 🟡", cls: "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100/70" },
                                contacted: { label: "Contactado 🔵", cls: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100/70" },
                                contracted: { label: "Contratado 🟢", cls: "bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/70" },
                                archived: { label: "Archivado ⚫", cls: "bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100/70" }
                              };
                              const cfg = configs[curStatus] || configs.pending;
                              return (
                                <div className="relative inline-flex items-center justify-center">
                                  <select
                                    value={curStatus}
                                    disabled={updatingStatusId === q.id}
                                    onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                                    className={cn(
                                      "appearance-none inline-flex items-center justify-center rounded-full pl-3.5 pr-7.5 py-1.5 text-xs font-bold border leading-none tracking-wide transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-navy/20",
                                      cfg.cls
                                    )}
                                  >
                                    <option value="pending" className="bg-white text-amber-700 font-bold">Pendiente 🟡</option>
                                    <option value="contacted" className="bg-white text-blue-700 font-bold">Contactado 🔵</option>
                                    <option value="contracted" className="bg-white text-emerald-700 font-bold">Contratado 🟢</option>
                                    <option value="archived" className="bg-white text-slate-600 font-bold">Archivado ⚫</option>
                                  </select>
                                  {updatingStatusId === q.id ? (
                                    <RefreshCw className="absolute right-2.5 h-3 w-3 animate-spin text-navy" />
                                  ) : (
                                    <span className="absolute right-2.5 pointer-events-none text-[8px] font-extrabold opacity-70">▼</span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Acciones */}
                          <td className="py-4.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => generateQuotePDF({
                                  level: q.school_level as any,
                                  city: q.city as any,
                                  pkg: { kind: q.package_kind as any, variant: q.package_variant as any },
                                  quantity: q.student_count,
                                  school: q.institution_name,
                                  contact: q.contact_name,
                                  phone: q.contact_phone,
                                  date: q.estimated_date || "",
                                  email: q.contact_email || "",
                                  quoteNumber: q.quote_number,
                                  togaColor: q.toga_color || undefined,
                                  stolaColor: q.stola_color || undefined
                                })}
                                className="p-2 bg-navy/5 text-navy hover:bg-navy/15 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                                title="Descargar PDF de la Cotización"
                              >
                                <Download className="h-4 w-4" />
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
                            <td colSpan={7} className="py-6 px-8 border-t border-b border-hairline/80">
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
                                    {q.discount_percent !== undefined && q.discount_percent > 0 ? (
                                      <>
                                        <p><span className="text-muted-foreground">Precio Lista:</span> <span className="font-semibold text-muted-foreground line-through">{formatMXN(q.original_unit_price || q.unit_price)}</span></p>
                                        <p><span className="text-muted-foreground">Descuento:</span> <span className="font-bold text-[#C5A85A]">-{q.discount_percent}%</span></p>
                                        <p><span className="text-muted-foreground">Precio Neto:</span> <span className="font-bold text-navy">{formatMXN(q.unit_price)}</span></p>
                                      </>
                                    ) : (
                                      <p><span className="text-muted-foreground">Precio Unitario:</span> <span className="font-semibold text-foreground">{formatMXN(q.unit_price)}</span></p>
                                    )}
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

                              {/* 📅 Event Countdown and Logistics Timeline */}
                              {(() => {
                                const createdDate = new Date(q.created_at);
                                createdDate.setHours(0,0,0,0);
                                
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                
                                if (!q.estimated_date) {
                                  return (
                                    <>
                                      <div className="border-t border-hairline my-5" />
                                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-4.5 rounded-xl">
                                        <AlertTriangle className="h-5 w-5 text-slate-400 shrink-0" />
                                        <div>
                                          <h5 className="font-bold text-navy text-xs uppercase tracking-wider">Seguimiento de Logística</h5>
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                            Sin fecha estimada de evento definida. Por favor contacte al cliente para establecer la fecha de graduación y coordinar la entrega.
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  );
                                }
                                
                                const estDate = new Date(q.estimated_date);
                                estDate.setHours(0,0,0,0);
                                
                                const totalDays = Math.max(1, Math.ceil((estDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
                                const daysElapsed = Math.max(0, Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
                                const daysRemaining = Math.ceil((estDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                const progressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
                                
                                // Determine styling based on remaining time
                                let statusColor = "bg-navy text-navy";
                                let bgAlert = "bg-[#1E2346]/5 border-[#1E2346]/15";
                                let badgeText = "";
                                let badgeCls = "";
                                let iconElement = <Clock className="h-5 w-5 text-[#1E2346]" />;
                                
                                if (daysRemaining < 0) {
                                  statusColor = "bg-slate-400";
                                  bgAlert = "bg-slate-50 border-slate-200";
                                  badgeText = `🎉 Evento Concluido (hace ${Math.abs(daysRemaining)} días)`;
                                  badgeCls = "bg-slate-100 text-slate-700 border-slate-300";
                                  iconElement = <span className="text-xl">🎉</span>;
                                } else if (daysRemaining === 0) {
                                  statusColor = "bg-red-500 animate-pulse";
                                  bgAlert = "bg-red-50 border-red-200 animate-pulse-slow";
                                  badgeText = "🚨 ¡EL EVENTO ES HOY!";
                                  badgeCls = "bg-red-100 text-red-700 border-red-300 font-extrabold animate-pulse";
                                  iconElement = <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />;
                                } else if (daysRemaining <= 30) {
                                  statusColor = "bg-amber-500";
                                  bgAlert = "bg-amber-50/50 border-amber-200";
                                  badgeText = `⚠️ Evento Próximo (Faltan ${daysRemaining} días)`;
                                  badgeCls = "bg-amber-100 text-amber-800 border-amber-300 font-bold";
                                  iconElement = <Truck className="h-5 w-5 text-amber-600 shrink-0" />;
                                } else {
                                  statusColor = "bg-[#C5A85A]";
                                  bgAlert = "bg-[#C5A85A]/5 border-[#C5A85A]/15";
                                  badgeText = `📅 En Agenda (Faltan ${daysRemaining} días)`;
                                  badgeCls = "bg-[#C5A85A]/15 text-[#8c712b] border-[#C5A85A]/30 font-semibold";
                                  iconElement = <Calendar className="h-5 w-5 text-[#C5A85A] shrink-0" />;
                                }
                                
                                return (
                                  <>
                                    <div className="border-t border-hairline my-5" />
                                    <div className={cn("border p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center shadow-sm", bgAlert)}>
                                      {/* Icon Badge */}
                                      <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-2xl bg-white border border-hairline shadow-sm">
                                        {iconElement}
                                      </div>
                                      
                                      {/* Timeline Progression */}
                                      <div className="flex-1 w-full space-y-2.5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                          <h5 className="font-bold text-navy text-xs uppercase tracking-wider">
                                            Seguimiento y Línea de Tiempo del Evento
                                          </h5>
                                          <span className={cn("text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border", badgeCls)}>
                                            {badgeText}
                                          </span>
                                        </div>
                                        
                                        {/* Gown & Delivery details text */}
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                          {daysRemaining >= 0 ? (
                                            <>
                                              Esta cotización para <span className="font-semibold text-foreground">{q.student_count} alumnos</span> tiene programada su ceremonia el día <span className="font-bold text-navy">{new Date(q.estimated_date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</span>. 
                                              {daysRemaining <= 30 && q.status !== "contracted" && (
                                                <span className="font-bold text-amber-700"> ¡Recomendamos agilizar el contacto para asegurar stock disponible!</span>
                                              )}
                                            </>
                                          ) : (
                                            <>
                                              La ceremonia de graduación de esta escuela se llevó a cabo el día <span className="font-semibold text-foreground">{new Date(q.estimated_date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</span>.
                                            </>
                                          )}
                                        </p>
                                        
                                        {/* Progress Bar Element */}
                                        <div className="space-y-1">
                                          <div className="relative h-2 w-full bg-white border border-hairline rounded-full overflow-hidden shadow-inner">
                                            <div 
                                              className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-500", statusColor)}
                                              style={{ width: `${progressPercent}%` }}
                                            />
                                          </div>
                                          <div className="flex justify-between text-[9px] text-muted-foreground font-semibold uppercase tracking-wider select-none">
                                            <span>Creado ({createdDate.toLocaleDateString("es-MX", { day: "numeric", month: "short" })})</span>
                                            {daysRemaining >= 0 && daysRemaining < totalDays && (
                                              <span className="text-navy font-bold">Hoy</span>
                                            )}
                                            <span>Graduación ({estDate.toLocaleDateString("es-MX", { day: "numeric", month: "short" })})</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination Control Footer */}
            {filteredQuotes.length > 0 && (
              <div className="bg-white border-x border-b border-hairline/80 px-6 py-4.5 rounded-b-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 -mt-6 z-10 relative">
                {/* Rows per page selector */}
                <div className="flex items-center gap-2.5 text-xs text-[#1E2346] font-medium order-2 sm:order-1">
                  <span className="text-muted-foreground">Filas por página:</span>
                  <div className="relative">
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRowsPerPage(val === 'all' ? 'all' : parseInt(val));
                        setCurrentPage(1);
                      }}
                      className="bg-cream/10 hover:bg-cream/20 border border-hairline rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy font-bold text-navy cursor-pointer appearance-none pr-8"
                    >
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                      <option value="all">Ver Todas</option>
                    </select>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-navy text-[8px] font-bold">▼</span>
                  </div>
                </div>

                {/* Showing Range status */}
                <div className="text-xs text-muted-foreground font-medium order-1 sm:order-2">
                  Mostrando <span className="font-bold text-navy">{Math.min((currentPage - 1) * (rowsPerPage === 'all' ? filteredQuotes.length : rowsPerPage) + 1, filteredQuotes.length)}</span> – <span className="font-bold text-navy">{Math.min(currentPage * (rowsPerPage === 'all' ? filteredQuotes.length : rowsPerPage), filteredQuotes.length)}</span> de <span className="font-bold text-navy">{filteredQuotes.length}</span> cotizaciones
                </div>

                {/* Navigation controls */}
                <div className="flex items-center gap-1.5 order-3">
                  <button
                    type="button"
                    disabled={currentPage === 1 || rowsPerPage === 'all'}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-hairline hover:bg-cream/10 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 transition-all text-xs font-bold text-navy cursor-pointer"
                  >
                    Anterior
                  </button>

                  {rowsPerPage !== 'all' && Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Render page numbers or ellipses
                    if (totalPages > 6 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} className="px-1 text-muted-foreground text-xs font-semibold">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                          currentPage === pageNum
                            ? "bg-[#1E2346] text-white shadow-md shadow-navy/10"
                            : "border border-hairline hover:bg-cream/10 text-navy"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages || rowsPerPage === 'all'}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 rounded-lg border border-hairline hover:bg-cream/10 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 transition-all text-xs font-bold text-navy cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )}

    {activeTab === 'stats' && (
      <div className="space-y-8 animate-fadeIn">
        {/* Metric Cards Row */}
        {renderMetricCards()}

        {/* Charts Row */}
        {filteredQuotes.length > 0 ? (
          <div className="space-y-6">
            {/* Row 1: Core Distribution */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Levels Distribution Chart */}
              <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-base text-navy font-bold flex items-center gap-2">
                    <span>🏫</span> Demanda por Nivel Escolar
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-6">Participación de mercado por niveles educativos cotizados.</p>
                </div>
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
              <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-base text-navy font-bold flex items-center gap-2">
                    <span>🔄</span> Distribución Renta vs Venta
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-6">Comparativa de cotizaciones según modalidad comercial elegida.</p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "11px" }} />
                      <YAxis stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "11px" }} />
                      <Tooltip 
                        cursor={{ fill: "rgba(30, 35, 70, 0.02)" }}
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

            {/* Row 2: Predictive & Logistics Insights */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event demand logistics timeline */}
              <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-base text-navy font-bold flex items-center gap-2">
                    <span>📅</span> Proyección de Demanda Logística Mensual (Picos)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-6">Togas totales requeridas en el calendario según la fecha de graduación de los eventos cotizados.</p>
                </div>
                <div className="h-[280px]">
                  {eventTimelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="month" stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "10px" }} />
                        <YAxis stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "11px" }} />
                        <Tooltip 
                          cursor={{ fill: "rgba(30, 35, 70, 0.02)" }}
                          contentStyle={{ background: "#1E2346", borderRadius: "8px", color: "#FFFFFF", border: "none" }} 
                          itemStyle={{ color: "#FFFFFF" }}
                        />
                        <Bar dataKey="Togas" fill="#C5A85A" name="Togas Requeridas" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                      Ingresa fechas de eventos en tus cotizaciones para visualizar esta proyección.
                    </div>
                  )}
                </div>
              </div>

              {/* Manufacturing Color popularity trend */}
              <div className="bg-white border border-hairline rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-base text-navy font-bold flex items-center gap-2">
                    <span>🎨</span> Tendencia de Colores Solicitados (Textil & Stock)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-6">Ranking del volumen de togas requeridas por color para planificar compras de telas e insumos.</p>
                </div>
                <div className="h-[280px]">
                  {colorChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={colorChartData} 
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                      >
                        <XAxis type="number" stroke="#64748B" strokeWidth={0.5} style={{ fontSize: "10px" }} />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          stroke="#64748B" 
                          strokeWidth={0.5} 
                          style={{ fontSize: "10px" }}
                          width={95}
                        />
                        <Tooltip 
                          contentStyle={{ background: "#1E2346", borderRadius: "8px", color: "#FFFFFF", border: "none" }} 
                          itemStyle={{ color: "#FFFFFF" }}
                        />
                        <Bar dataKey="Togas" fill="#1E2346" name="Togas" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                      No hay información de colores disponible.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-white border border-hairline rounded-2xl p-12 text-center text-muted-foreground shadow-sm">
            <p className="text-sm">No hay suficientes cotizaciones con los filtros seleccionados para generar análisis estadístico.</p>
          </div>
        )}
      </div>
    )}

    {activeTab === 'pricing' && (
      /* ========================================================================= */
      /* EDITOR DE PRECIOS Y DESCUENTOS DINÁMICOS                                   */
      /* ========================================================================= */
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/80 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Gestión de Tarifas y Descuentos</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Modifica los precios unitarios base y define descuentos promocionales para cada paquete en caliente.</p>
          </div>
          <button
            onClick={fetchPricing}
            className="inline-flex items-center gap-2 border border-hairline hover:bg-cream/40 text-navy font-bold text-xs px-4 py-2.5 rounded-full transition-all active:scale-[0.98] cursor-pointer"
            title="Recargar tarifas de la base de datos"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loadingPricing && "animate-spin")} />
            Recargar Tarifas
          </button>
        </div>

        {pricingMessage && (
          <div
            className={cn(
              "flex items-center gap-3 py-3.5 px-5 rounded-2xl border text-xs font-bold transition-all animate-pulse shadow-sm",
              pricingMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}
          >
            <div className={cn("h-2 w-2 rounded-full shrink-0", pricingMessage.type === "success" ? "bg-emerald-500" : "bg-red-500")} />
            {pricingMessage.text}
          </div>
        )}

        {/* Dynamic Level Segmented Pill Selector (High-End UX/UI) */}
        <div className="bg-white p-2 rounded-2xl border border-hairline shadow-sm flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Todos los Niveles 🌐" },
            { id: "preescolar", label: "Preescolar 👶" },
            { id: "primaria", label: "Primaria 🎒" },
            { id: "secundaria", label: "Secundaria 📚" },
            { id: "preparatoria", label: "Preparatoria 🎓" },
            { id: "universidad", label: "Universidad 🏛️" }
          ].map((lvl) => {
            const isSelected = pricingFilterLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setPricingFilterLevel(lvl.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98]",
                  isSelected
                    ? "bg-[#1E2346] text-white shadow-sm font-extrabold"
                    : "text-muted-foreground hover:text-[#1E2346] hover:bg-cream/40 bg-transparent"
                )}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>

        {loadingPricing ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-hairline shadow-sm space-y-4">
            <RefreshCw className="h-8 w-8 text-navy animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Sincronizando tarifas con Supabase...</p>
          </div>
        ) : (
          <form onSubmit={handleSavePricing} className="space-y-6">
            {/* Main pricing list container */}
            <div className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden divide-y divide-hairline">
              {(() => {
                // Static package metadata with school levels mapping
                const pricingMeta = [
                  // Preescolar (desacoplado)
                  { key: "A_PREESCOLAR", title: "Paquete A — Básico (Preescolar)", desc: "Toga y Estola Lisa estándar para ceremonias tradicionales de Preescolar.", levels: ["preescolar"] },
                  { key: "B_ESENCIAL_PREESCOLAR", title: "Paquete B — Esencial (Preescolar)", desc: "Estola con diseño compacto 9x12 cm en ambos lados (B.1) para Preescolar.", levels: ["preescolar"] },
                  { key: "B_BALANCE_PREESCOLAR", title: "Paquete B — Balance (Preescolar)", desc: "Estola con logo e impresión mixta mediana (B.2) para Preescolar.", levels: ["preescolar"] },
                  { key: "B_PREMIUM_PREESCOLAR", title: "Paquete B — Premium (Preescolar)", desc: "Estola con logo e impresión gigante completa (B.3) para Preescolar.", levels: ["preescolar"] },

                  // Primaria (desacoplado)
                  { key: "A_PRIMARIA", title: "Paquete A — Básico (Primaria)", desc: "Toga y Estola Lisa estándar para ceremonias tradicionales de Primaria.", levels: ["primaria"] },
                  { key: "B_BALANCE_PRIMARIA", title: "Paquete B — Balance (Primaria)", desc: "Estola con logo e impresión mixta mediana (B.2) para Primaria.", levels: ["primaria"] },
                  { key: "B_PREMIUM_PRIMARIA", title: "Paquete B — Premium (Primaria)", desc: "Estola con logo e impresión gigante completa (B.3) para Primaria.", levels: ["primaria"] },
                  { key: "PRI_C", title: "Primaria — Básico Funcional", desc: "Estola con impresión sencilla en ambos lados 9 x 12 cm (B.1).", levels: ["primaria"] },
                  { key: "PRI_B", title: "Primaria — Clásico Equilibrado", desc: "Estola mixta (impresión grande 9 x 28 cm y chica 9 x 12 cm - B.2).", levels: ["primaria"] },
                  { key: "PRI_A", title: "Primaria — Clásico Destacado", desc: "Estola con impresión grande de gala en ambos lados 9 x 28 cm (B.3).", levels: ["primaria"] },

                  // Secundaria (desacoplado)
                  { key: "A_SECUNDARIA", title: "Paquete A — Básico (Secundaria)", desc: "Toga y Estola Lisa estándar para ceremonias tradicionales de Secundaria.", levels: ["secundaria"] },
                  { key: "SEC_B", title: "Secundaria — Diseño B1", desc: "Estola con diseño de impresión discreta en ambos lados (B.1).", levels: ["secundaria"] },
                  { key: "SEC_A", title: "Secundaria — Diseño B2", desc: "Estola con diseño mixto (emblema oficial + detalles en bordes - B.2).", levels: ["secundaria"] },

                  // Preparatoria (desacoplado)
                  { key: "A_PREPARATORIA", title: "Paquete A — Básico (Preparatoria)", desc: "Toga y Estola Lisa estándar para ceremonias tradicionales de Preparatoria.", levels: ["preparatoria"] },
                  { key: "PREP_B", title: "Preparatoria — Diseño B1", desc: "Estola con diseño de impresión discreta en ambos lados (B.1).", levels: ["preparatoria"] },
                  { key: "PREP_A", title: "Preparatoria — Diseño B2", desc: "Estola con diseño mixto (emblema oficial + detalles en bordes - B.2).", levels: ["preparatoria"] },
                  { key: "PREP_C1", title: "Preparatoria — Diseño C1", desc: "Estola personalizada con bordado clásico de alta calidad (C.1).", levels: ["preparatoria"] },
                  { key: "PREP_C2", title: "Preparatoria — Diseño C2", desc: "Estola bordada premium de alta definición en ambos lados (C.2).", levels: ["preparatoria"] },

                  // Universidad / Posgrado
                  { key: "UNI_A", title: "Universidad — Opción A", desc: "Renta de Toga, Birrete y Estola personalizada con impresión clásica (U.A).", levels: ["universidad"] },
                  { key: "UNI_B", title: "Universidad — Opción B", desc: "Renta de Toga, Birrete y Estola personalizada con bordado tradicional (U.B).", levels: ["universidad"] },
                  { key: "UNI_C", title: "Universidad — Opción C", desc: "Renta de Toga, Birrete y Estola personalizada con bordado premium (U.C).", levels: ["universidad"] }
                ];

                // Filter packages list reactively based on level selection
                const filteredMeta = pricingMeta.filter(pkg => 
                  pricingFilterLevel === "all" || pkg.levels.includes(pricingFilterLevel)
                );

                if (filteredMeta.length === 0) {
                  return (
                    <div className="p-12 text-center text-muted-foreground text-xs font-semibold">
                      No se encontraron tarifas registradas para este nivel.
                    </div>
                  );
                }

                // Helper rendering for school level badges
                const renderLevelBadges = (lvls: string[]) => {
                  const badgeMap: Record<string, { label: string; cls: string }> = {
                    preescolar: { label: "Preescolar", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                    primaria: { label: "Primaria", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    secundaria: { label: "Secundaria", cls: "bg-blue-50 text-blue-700 border-blue-200" },
                    preparatoria: { label: "Preparatoria", cls: "bg-yellow-50 text-yellow-700 border-yellow-300" },
                    universidad: { label: "Universidad", cls: "bg-purple-50 text-purple-700 border-purple-200" }
                  };

                  return (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {lvls.map(l => {
                        const style = badgeMap[l] || { label: l, cls: "bg-slate-50 text-slate-600" };
                        return (
                          <span key={l} className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border tracking-wide uppercase", style.cls)}>
                            {style.label}
                          </span>
                        );
                      })}
                    </div>
                  );
                };

                return filteredMeta.map((pkg) => {
                  const item = pricingList.find((x) => x.key === pkg.key) || { price: 0, discount_percent: 0 };
                  const netPrice = Math.round(item.price * (1 - item.discount_percent / 100));

                  return (
                    <div key={pkg.key} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream/20 transition-all">
                      {/* Left: Package description & badges */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-navy text-sm font-display">{pkg.title}</h4>
                          <span className="text-[9px] bg-navy/5 text-navy px-1.5 py-0.5 rounded-full font-bold select-all tracking-wide">{pkg.key}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">{pkg.desc}</p>
                        {renderLevelBadges(pkg.levels)}
                      </div>

                      {/* Right: Numeric inputs & pricing outputs */}
                      <div className="flex flex-wrap items-center gap-4.5 sm:gap-6">
                        {/* Input 1: Base Price */}
                        <div className="w-[125px] space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Precio Unitario ($)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">$</span>
                            <input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setPricingList((prev) =>
                                  prev.map((x) => (x.key === pkg.key ? { ...x, price: val } : x))
                                );
                              }}
                              className="w-full pl-6 pr-3 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C5A85A]/50 focus:border-transparent transition-all text-right select-all"
                            />
                          </div>
                        </div>

                        {/* Input 2: Discount Percent */}
                        <div className="w-[105px] space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Descuento (%)</label>
                          <div className="relative">
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">%</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={item.discount_percent}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                setPricingList((prev) =>
                                  prev.map((x) => (x.key === pkg.key ? { ...x, discount_percent: val } : x))
                                );
                              }}
                              className="w-full pl-3 pr-6 py-2.5 border border-[#E2E8F0] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#C5A85A]/50 focus:border-transparent transition-all text-right select-all"
                            />
                          </div>
                        </div>

                        {/* Output: Realtime Net Promo price */}
                        <div className="w-[130px] flex flex-col items-end justify-center">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Precio Neto Final</span>
                          <span className={cn(
                            "text-sm font-extrabold font-display tabular-nums leading-relaxed",
                            item.discount_percent > 0 ? "text-[#C5A85A]" : "text-navy"
                          )}>
                            {formatMXN(netPrice)}
                          </span>
                          {item.discount_percent > 0 && (
                            <span className="text-[9px] text-[#C5A85A] font-extrabold tracking-wide uppercase">
                              -{item.discount_percent}% de ahorro
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom floating submit bar */}
            <div className="bg-white border border-hairline p-5 rounded-2xl shadow-sm flex items-center justify-end sticky bottom-4 z-20">
              <button
                type="submit"
                disabled={savingPrices}
                className="bg-[#1E2346] hover:bg-[#2a305c] text-white font-bold text-xs px-8 py-3.5 rounded-full shadow-md shadow-navy/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPrices ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Guardando Tarifas...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Guardar Tarifas y Descuentos
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    )}

    {activeTab === 'calendar' && (
      <div className="space-y-8 animate-fadeIn">
        {(() => {
          const year = currentCalendarDate.getFullYear();
          const month = currentCalendarDate.getMonth();
          
          const navigateCalendar = (dir: number) => {
            if (calendarView === 'month') {
              setCurrentCalendarDate(new Date(year, month + dir, 1));
            } else if (calendarView === 'week') {
              const newDate = new Date(currentCalendarDate);
              newDate.setDate(newDate.getDate() + (dir * 7));
              setCurrentCalendarDate(newDate);
            } else if (calendarView === 'day') {
              const newDate = new Date(currentCalendarDate);
              newDate.setDate(newDate.getDate() + dir);
              setCurrentCalendarDate(newDate);
            }
          };
          
          // First day of the month
          const firstDayOfMonth = new Date(year, month, 1);
          // Days in month
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          // Day of week of first day (0 = Sun, 1 = Mon, ..., 6 = Sat)
          // Standardise starting with Monday = 0
          let startDayOfWeek = firstDayOfMonth.getDay() - 1;
          if (startDayOfWeek === -1) startDayOfWeek = 6;
          
          // Days of previous month to fill the first week
          const prevMonthDays = new Date(year, month, 0).getDate();
          
          // Build calendar days array
          const calendarCells: { date: Date; isCurrentMonth: boolean; key: string }[] = [];
          
          // Filler days from previous month
          for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthDays - i);
            calendarCells.push({
              date: d,
              isCurrentMonth: false,
              key: `prev-${prevMonthDays - i}`
            });
          }
          
          // Current month days
          for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            calendarCells.push({
              date: d,
              isCurrentMonth: true,
              key: `curr-${i}`
            });
          }
          
          // Filler days for next month to complete standard 6-row (42 cells) grid
          const remainingCells = 42 - calendarCells.length;
          for (let i = 1; i <= remainingCells; i++) {
            const d = new Date(year, month + 1, i);
            calendarCells.push({
              date: d,
              isCurrentMonth: false,
              key: `next-${i}`
            });
          }
          
          // Mappings of month names in Spanish
          const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ];
          
          const formatDayStr = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          };
          
          const getDisplayCells = () => {
            if (calendarView === 'month') return calendarCells;
            const currDateStr = formatDayStr(currentCalendarDate);
            
            if (calendarView === 'week') {
              const idx = calendarCells.findIndex(c => formatDayStr(c.date) === currDateStr);
              if (idx !== -1) {
                const weekStartIdx = Math.floor(idx / 7) * 7;
                return calendarCells.slice(weekStartIdx, weekStartIdx + 7);
              }
              return calendarCells.slice(0, 7);
            }
            if (calendarView === 'day') {
              const cell = calendarCells.find(c => formatDayStr(c.date) === currDateStr);
              return cell ? [cell] : [];
            }
            return calendarCells;
          };
          const displayCells = getDisplayCells();
          
          // Deliveries for selected calendar day
          const selectedDayStr = selectedCalendarDay ? formatDayStr(selectedCalendarDay) : "";
          const dayDeliveries = quotes.filter(q => {
            if (!q.estimated_date) return false;
            const qDateStr = formatDayStr(new Date(q.estimated_date));
            return qDateStr === selectedDayStr;
          });
          
          // Sum up contracted students count for logistic foresight
          const totalContractedGownsForMonth = quotes.reduce((acc, q) => {
            if (q.status !== "contracted" || !q.estimated_date) return acc;
            const qDate = new Date(q.estimated_date);
            if (qDate.getFullYear() === year && qDate.getMonth() === month) {
              return acc + q.student_count;
            }
            return acc;
          }, 0);
          
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Grid Calendar */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/80 pb-5">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const t = new Date();
                        setCurrentCalendarDate(t);
                        setSelectedCalendarDay(t);
                        if (calendarView === 'month') setCalendarView('month');
                      }}
                      className="px-4 py-2 border border-hairline hover:bg-slate-50 text-navy text-sm font-semibold rounded-lg transition-all cursor-pointer bg-white shadow-sm"
                      title="Ir a Hoy"
                    >
                      Hoy
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigateCalendar(-1)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                        title="Anterior"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateCalendar(1)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                        title="Siguiente"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    <h2 className="font-display text-2xl font-normal text-slate-800 min-w-[200px] capitalize">
                      {monthNames[month]} {year}
                    </h2>
                  </div>
                  
                  {/* Calendar View Toggle */}
                  <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/50">
                    {(['month', 'week', 'day'] as const).map(view => (
                      <button
                        key={view}
                        onClick={() => setCalendarView(view)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-semibold rounded-md transition-all capitalize",
                          calendarView === view ? "bg-white text-navy shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-navy hover:bg-slate-200/50"
                        )}
                      >
                        {view === 'month' ? 'Mes' : view === 'week' ? 'Semana' : 'Día'}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Month level statistics badge row */}
                <div className="bg-[#C5A85A]/5 border border-[#C5A85A]/15 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#8c712b]">
                      Proyección de Stock Mensual
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">
                      Togas comprometidas para contratos cerrados en {monthNames[month]}:
                    </div>
                  </div>
                  <div className="bg-white border border-[#C5A85A]/20 px-4 py-2 rounded-xl text-center self-stretch sm:self-auto flex items-center justify-center gap-2">
                    <span className="text-xl">🎓</span>
                    <div className="text-left">
                      <div className="text-sm font-extrabold text-navy tabular-nums">{totalContractedGownsForMonth}</div>
                      <div className="text-[8px] uppercase tracking-wider font-bold text-muted-foreground">Togas / Birretes</div>
                    </div>
                  </div>
                </div>
                
                {/* Color Legend */}
                <div className="flex flex-wrap items-center gap-4 px-2 py-1 mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Contratos Cerrados
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Contactados
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Pendientes (Sin Contactar)
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Archivados / Perdidos
                  </div>
                </div>

                <div className="overflow-x-auto pb-4">
                  <div className="space-y-0 text-slate-800 min-w-[700px]">
                    {/* Days of Week Row */}
                    {calendarView !== 'day' && (
                      <div className="grid grid-cols-7 text-center select-none bg-slate-100 border-b border-slate-200">
                      {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d, i) => (
                        <div key={d} className="text-[11px] font-semibold text-slate-600 py-2 flex flex-col border-r border-slate-200 last:border-r-0">
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Grid */}
                  <div className={cn(
                    "grid bg-slate-200 gap-px border border-slate-200 rounded-b-lg overflow-hidden",
                    calendarView === 'day' ? "grid-cols-1" : "grid-cols-7"
                  )}>
                    {displayCells.map((cell) => {
                      const cellDateStr = formatDayStr(cell.date);
                      const isToday = formatDayStr(new Date()) === cellDateStr;
                      const isSelected = selectedCalendarDay && formatDayStr(selectedCalendarDay) === cellDateStr;
                      
                      // Filter quotes for this day cell
                      const cellQuotes = quotes.filter(q => {
                        if (!q.estimated_date) return false;
                        return formatDayStr(new Date(q.estimated_date)) === cellDateStr;
                      });
                      
                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => setSelectedCalendarDay(cell.date)}
                          className={cn(
                            "flex flex-col justify-start text-left relative cursor-pointer select-none",
                            calendarView === 'month' ? "min-h-[140px]" : "min-h-[200px]",
                            cell.isCurrentMonth || calendarView !== 'month'
                              ? "bg-white" 
                              : "bg-slate-50",
                            isSelected && "bg-blue-50/50"
                          )}
                        >
                          {/* Date Number */}
                          <div className="flex justify-center w-full mt-2 mb-1">
                            <span className={cn(
                              "text-[12px] font-medium flex items-center justify-center h-6 w-6 rounded-full leading-none",
                              isToday ? "bg-blue-600 text-white" : "",
                              !isToday && cell.isCurrentMonth && "text-slate-800",
                              !isToday && !cell.isCurrentMonth && "text-slate-400"
                            )}>
                              {cell.date.getDate()}
                            </span>
                          </div>
                          
                          {/* Minimal Event Chips */}
                          {calendarView === 'month' ? (
                            <div className="w-full space-y-0.5 flex-1 px-1">
                              {['contracted', 'contacted', 'pending', 'archived'].map(status => {
                                const statusQuotes = cellQuotes.filter(q => (q.status || 'pending') === status);
                                if (statusQuotes.length === 0) return null;
                                const statusTogas = statusQuotes.reduce((sum, q) => sum + q.student_count, 0);
                                
                                const styleMap: Record<string, string> = {
                                  contracted: "text-slate-700 font-medium",
                                  contacted: "text-slate-700 font-medium",
                                  pending: "bg-amber-100/50 text-slate-700 font-medium rounded px-1.5 py-0.5 mb-0.5 border border-amber-200/50",
                                  archived: "text-slate-500",
                                };
                                
                                const dotColor: Record<string, string> = {
                                  contracted: "bg-emerald-500",
                                  contacted: "bg-blue-500",
                                  pending: "bg-amber-500",
                                  archived: "bg-slate-400",
                                };
                                
                                const statusLabel: Record<string, string> = {
                                  contracted: "Contratos",
                                  contacted: "Contactos",
                                  pending: "Pendientes",
                                  archived: "Archivos"
                                };
                                
                                return (
                                  <div key={status} className={cn("text-[11px] flex items-center gap-1.5 truncate hover:bg-slate-100 rounded px-1 cursor-pointer transition-colors", styleMap[status])}>
                                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0", dotColor[status])} />
                                    <span className="truncate">{statusTogas} {statusLabel[status]}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="w-full space-y-1 overflow-y-auto max-h-[600px] flex-1 px-1">
                              {cellQuotes.length === 0 && (
                                <div className="text-[10px] text-slate-400 text-center mt-2">
                                  Sin eventos
                                </div>
                              )}
                              {cellQuotes.map(q => {
                                const curStatus = q.status || "pending";
                                const styleMap: Record<string, string> = {
                                  contracted: "text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-1",
                                  contacted: "text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-1",
                                  pending: "bg-amber-50 border border-amber-200 text-slate-800 rounded px-1.5 py-1",
                                  archived: "text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-1",
                                };
                                const dotColor: Record<string, string> = {
                                  contracted: "bg-emerald-500",
                                  contacted: "bg-blue-500",
                                  pending: "bg-amber-500",
                                  archived: "bg-slate-400",
                                };
                                return (
                                  <div key={q.id} className={cn("text-[11px] flex items-start gap-1.5 hover:shadow-sm transition-shadow cursor-pointer", styleMap[curStatus])}>
                                    <span className={cn("h-2 w-2 rounded-full flex-shrink-0 mt-1", dotColor[curStatus])} />
                                    <div className="flex flex-col overflow-hidden">
                                      <span className="truncate font-semibold">{q.institution_name}</span>
                                      <span className="text-[10px] opacity-80 truncate">{q.student_count} togas • {q.city?.substring(0,3).toUpperCase()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>
              
              {/* Right Column: Selected Day Detail list */}
              <div className="lg:col-span-4 space-y-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                <div className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden p-6 space-y-6">
                  {/* Agenda Title */}
                  <div className="border-b border-hairline pb-4.5">
                    <h3 className="font-display text-lg font-bold text-navy">
                      Entregas del Día
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      {selectedCalendarDay ? selectedCalendarDay.toLocaleDateString("es-MX", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      }) : "Seleccione un día"}
                    </p>
                  </div>
                  
                  {/* Delivery agenda list */}
                  {dayDeliveries.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs text-navy uppercase tracking-wider">Sin Entregas</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                          No hay ceremonias agendadas para esta fecha.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {dayDeliveries.map((q) => {
                        const curStatus = q.status || "pending";
                        const configs: Record<string, { label: string; cls: string }> = {
                          pending: { label: "Pendiente 🟡", cls: "bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100/70" },
                          contacted: { label: "Contactado 🔵", cls: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100/70" },
                          contracted: { label: "Contratado 🟢", cls: "bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/70" },
                          archived: { label: "Archivado ⚫", cls: "bg-slate-50 text-slate-600 border-slate-200/50 hover:bg-slate-100/70" }
                        };
                        const cfg = configs[curStatus] || configs.pending;
                        
                        return (
                          <div 
                            key={q.id} 
                            className={cn(
                              "border border-hairline/80 rounded-2xl p-4.5 space-y-4 hover:shadow-sm transition-all",
                              curStatus === "contracted" ? "bg-emerald-50/5 border-emerald-200/40" : "bg-white"
                            )}
                          >
                            {/* School & package kind header */}
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-[#1E2346] text-xs uppercase tracking-wider line-clamp-2">
                                  {q.institution_name}
                                </h4>
                                <span className="text-[10px] font-bold text-navy bg-cream/40 px-2 py-0.5 rounded-full select-all">
                                  #{q.quote_number}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#C5A85A] font-bold font-sans">
                                {levelLabel(q.school_level)} — {packageLabel(q.package_kind, q.package_variant, q.school_level)}
                              </p>
                            </div>
                            
                            {/* Delivery logistical stats */}
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px]">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Cant. Alumnos</span>
                                <span className="font-extrabold text-navy tabular-nums">{q.student_count} togas</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Sede</span>
                                <span className="font-bold text-navy uppercase">
                                  {q.city === "tijuana" ? "Tijuana 📍" : "Ensenada 📍"}
                                </span>
                              </div>
                              <div className="col-span-2 border-t border-slate-200/50 pt-2 flex items-center justify-between">
                                <div>
                                  <span className="text-muted-foreground text-[10px] block">Colores de Gala</span>
                                  <div className="flex gap-1.5 mt-1">
                                    <span className="text-[9px] font-semibold text-foreground uppercase bg-white border px-1.5 py-0.2 rounded">T: {q.toga_color || "Gris"}</span>
                                    <span className="text-[9px] font-semibold text-foreground uppercase bg-white border px-1.5 py-0.2 rounded">E: {q.stola_color || "Gris"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Contact Person Details */}
                            <div className="text-[11px] space-y-1 bg-[#1E2346]/5 rounded-xl p-3 border border-[#1E2346]/10">
                              <div className="font-semibold text-navy truncate">👤 {q.contact_name}</div>
                              <div className="text-muted-foreground text-[10px] truncate">📞 {q.contact_phone}</div>
                            </div>
                            
                            {/* Interactive Status Management in calendar side drawer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                              {/* Status update selector */}
                              <div className="relative inline-flex items-center w-full sm:w-auto">
                                <select
                                  value={curStatus}
                                  disabled={updatingStatusId === q.id}
                                  onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                                  className={cn(
                                    "appearance-none inline-flex items-center justify-center rounded-full pl-3.5 pr-7.5 py-1.5 text-xs font-bold border leading-none tracking-wide transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-navy/20 w-full sm:w-auto",
                                    cfg.cls
                                  )}
                                >
                                  <option value="pending" className="bg-white text-amber-700 font-bold">Pendiente 🟡</option>
                                  <option value="contacted" className="bg-white text-blue-700 font-bold">Contactado 🔵</option>
                                  <option value="contracted" className="bg-white text-emerald-700 font-bold">Contratado 🟢</option>
                                  <option value="archived" className="bg-white text-slate-600 font-bold">Archivado ⚫</option>
                                </select>
                                {updatingStatusId === q.id ? (
                                  <RefreshCw className="absolute right-2.5 h-3 w-3 animate-spin text-navy" />
                                ) : (
                                  <span className="absolute right-2.5 pointer-events-none text-[8px] font-extrabold opacity-70">▼</span>
                                )}
                              </div>
                              
                              {/* Quick contact and documents download */}
                              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => generateQuotePDF({
                                    level: q.school_level as any,
                                    city: q.city as any,
                                    pkg: { kind: q.package_kind as any, variant: q.package_variant as any },
                                    quantity: q.student_count,
                                    school: q.institution_name,
                                    contact: q.contact_name,
                                    phone: q.contact_phone,
                                    date: q.estimated_date || "",
                                    email: q.contact_email || "",
                                    quoteNumber: q.quote_number,
                                    togaColor: q.toga_color || undefined,
                                    stolaColor: q.stola_color || undefined
                                  })}
                                  className="p-2 bg-navy/5 text-navy hover:bg-navy/15 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                                  title="Descargar PDF de la Cotización"
                                >
                                  <Download className="h-4 w-4" />
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    )}

    {/* Inactivity Warning Modal (Premium Design) */}
    {showInactivityModal && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop Blur overlay */}
        <div className="absolute inset-0 bg-[#0F1225]/60 backdrop-blur-md transition-opacity duration-300" />
        
        {/* Modal Content Card */}
        <div className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-3xl p-8 shadow-2xl shadow-navy/20 animate-scaleIn space-y-6 text-center">
          {/* Warning Icon Container */}
          <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
            <Clock className="h-8 w-8 text-[#C5A85A] animate-pulse" />
          </div>
          
          {/* Text Details */}
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-navy">¿Sigues ahí?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              Tu sesión de administrador está a punto de expirar por inactividad. Te desconectaremos automáticamente por seguridad en:
            </p>
          </div>
          
          {/* Countdown Clock Display */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-4xl font-extrabold font-display text-navy tracking-tight tabular-nums flex items-center justify-center gap-1.5">
              <span>00</span>
              <span className="animate-pulse">:</span>
              <span className={cn(
                inactivityCountdown <= 10 ? "text-red-500 font-black animate-bounce" : "text-[#C5A85A]"
              )}>
                {String(inactivityCountdown).padStart(2, "0")}
              </span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-linear",
                  inactivityCountdown <= 10 ? "bg-red-500" : "bg-[#C5A85A]"
                )}
                style={{ width: `${(inactivityCountdown / 60) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setShowInactivityModal(false);
              }}
              className="flex-1 border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] hover:text-[#1E2346] font-bold text-xs py-3.5 rounded-full transition-all cursor-pointer uppercase tracking-wider"
            >
              Cerrar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInactivityModal(false);
                setInactivityCountdown(60);
              }}
              className="flex-1 bg-[#1E2346] hover:bg-[#2a305c] text-white font-bold text-xs py-3.5 rounded-full shadow-lg shadow-navy/10 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>✨</span> Continuar Sesión
            </button>
          </div>
        </div>
      </div>
    )}

  </main>
</div>
);
}
