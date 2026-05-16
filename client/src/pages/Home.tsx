import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Download,
  Globe,
  Mail,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Lead Auditor Pro</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Características</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Precios</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm">
                Ir al panel <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <>
              <a href={getLoginUrl("/dashboard")}>
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </a>
              <a href={getLoginUrl("/dashboard")}>
                <Button size="sm">
                  Comenzar gratis <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="pt-32 pb-24 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, oklch(0.48 0.22 264), transparent 70%)" }} />
      </div>

      <div className="container text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/20 bg-primary/5 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Automatización B2B para agencias y freelancers
        </Badge>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 max-w-4xl mx-auto">
          Encuentra negocios locales que{" "}
          <span className="gradient-text">necesitan una web mejor</span>{" "}
          en minutos
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Automatiza la búsqueda, auditoría y priorización de leads B2B usando Google Places,
          análisis web y scoring comercial. Sin código, sin complicaciones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href={isAuthenticated ? "/dashboard" : getLoginUrl("/dashboard")}>
            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25">
              <Zap className="w-4 h-4 mr-2" />
              Crear campaña ahora
            </Button>
          </a>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold bg-white">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Ver ejemplo de resultados
            </Button>
          </a>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "500+", label: "Leads por campaña" },
            { value: "8", label: "Señales de auditoría" },
            { value: "4", label: "Columnas de scoring" },
            { value: "100%", label: "Datos exportables" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Globe,
    title: "Detecta negocios sin web o con web mejorable",
    desc: "Identifica automáticamente negocios locales que carecen de presencia digital o cuya web está desactualizada, rota o sin HTTPS.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Star,
    title: "Prioriza por reseñas, rating y oportunidad",
    desc: "Filtra y ordena leads por rating de Google, número de reseñas, sector y potencial comercial para enfocar tu esfuerzo donde más importa.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: Mail,
    title: "Extrae datos útiles para contacto",
    desc: "Obtén emails públicos, teléfonos, webs y perfiles de redes sociales directamente desde las fichas de Google Places y las webs auditadas.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: FileSpreadsheet,
    title: "Genera un Excel listo para ventas",
    desc: "Exporta un informe completo con scoring SEO, velocidad, contacto y redes sociales. Listo para importar en tu CRM o enviar al equipo comercial.",
    color: "text-violet-600 bg-violet-50",
  },
  {
    icon: TrendingUp,
    title: "Ahorra horas de búsqueda manual",
    desc: "Lo que antes tardaba días, ahora tarda minutos. Configura la campaña, pulsa 'Comenzar' y recibe los resultados auditados automáticamente.",
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: Users,
    title: "Ideal para agencias web y freelancers",
    desc: "Diseñado específicamente para consultores digitales, agencias SEO, freelancers y cualquier profesional que venda servicios web a negocios locales.",
    color: "text-cyan-600 bg-cyan-50",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm border border-border">
            Características
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Todo lo que necesitas para captar leads B2B
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma completa que automatiza cada paso del proceso de captación y auditoría de leads locales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card key={f.title} className="card-hover border-border/60 bg-white">
              <CardContent className="p-6">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    icon: MapPin,
    title: "Configura tu campaña",
    desc: "Introduce la ciudad, zonas, sectores de negocio y parámetros de calidad. Ajusta los filtros de rating, reseñas y auditoría según tus necesidades.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    num: "02",
    icon: Search,
    title: "La IA busca y audita",
    desc: "El sistema busca automáticamente en Google Places, audita cada web encontrada, extrae emails y calcula el scoring comercial por columnas.",
    color: "from-violet-500 to-purple-600",
  },
  {
    num: "03",
    icon: Download,
    title: "Descarga y vende",
    desc: "Recibe un Excel completo con todos los leads auditados, su scoring SEO, velocidad, contacto y redes sociales. Listo para usar en tu proceso comercial.",
    color: "from-emerald-500 to-teal-600",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm border border-border">
            Proceso
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Cómo funciona en 3 pasos
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Sin código, sin configuraciones complejas. Solo configura, lanza y descarga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {STEPS.map((step) => (
            <div key={step.num} className="text-center relative">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <step.icon className="w-10 h-10 text-white" />
              </div>
              <div className="text-xs font-bold text-muted-foreground tracking-widest mb-2 uppercase">
                Paso {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Excel preview mockup */}
        <div className="mt-20 bg-white rounded-2xl border border-border shadow-xl overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-3 text-sm text-muted-foreground font-medium">leads-campaña-madrid.xlsx</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-primary/5 border-b border-border">
                  {["Negocio", "Sector", "Zona", "Web", "Email", "Score SEO", "Score Velocidad", "Score Contacto", "Score Redes", "Total", "Prioridad"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Clínica Dental Sonrisa", "Dental", "Getafe", "❌ Sin web", "✓ info@...", 12, 0, 45, 20, 19, "🔴 Alta"],
                  ["Fisio Activa Madrid", "Fisio", "Leganés", "⚠️ Lenta", "✓ fisio@...", 38, 22, 60, 35, 39, "🟡 Media"],
                  ["Peluquería Glamour", "Belleza", "Carabanchel", "❌ Sin web", "❌ Sin email", 8, 0, 15, 10, 8, "🔴 Alta"],
                  ["Taller Mecánico Rueda", "Taller", "Alcorcón", "✓ ok", "✓ taller@...", 72, 65, 80, 55, 68, "🟢 Baja"],
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap text-foreground/80">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Use cases ────────────────────────────────────────────────────────────────

const USE_CASES = [
  { icon: Building2, title: "Agencias web", desc: "Prospecta cientos de negocios locales sin web o con web mejorable en tu zona de actuación." },
  { icon: Globe, title: "Freelancers digitales", desc: "Encuentra clientes potenciales para servicios de diseño, SEO local y marketing digital." },
  { icon: BarChart3, title: "Consultores SEO", desc: "Identifica negocios con problemas técnicos graves que necesitan una auditoría SEO urgente." },
  { icon: Shield, title: "Consultores digitales", desc: "Presenta informes de auditoría profesionales como primera toma de contacto con el cliente." },
];

function UseCases() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm border border-border">Casos de uso</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">¿Para quién es Lead Auditor Pro?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Diseñado para profesionales del marketing digital que venden servicios a negocios locales.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((uc) => (
            <Card key={uc.title} className="card-hover bg-white border-border/60 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <uc.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    price: "29",
    period: "/mes",
    desc: "Para freelancers que empiezan a prospectar.",
    features: [
      "Hasta 500 leads/mes",
      "Exportación Excel y CSV",
      "Scoring básico (4 columnas)",
      "Historial de campañas",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: "79",
    period: "/mes",
    desc: "Para agencias y freelancers con volumen.",
    features: [
      "Hasta 3.000 leads/mes",
      "Auditoría web completa",
      "Extracción de emails públicos",
      "Scoring avanzado + PageSpeed",
      "Historial ilimitado",
      "Soporte prioritario",
    ],
    cta: "Comenzar con Pro",
    popular: true,
  },
  {
    name: "Agency",
    price: "199",
    period: "/mes",
    desc: "Para agencias con alto volumen y equipos.",
    features: [
      "Leads ilimitados",
      "Multiusuario (hasta 10 seats)",
      "Integraciones CRM",
      "Plantillas comerciales",
      "API de acceso",
      "Soporte dedicado",
    ],
    cta: "Contactar ventas",
    popular: false,
  },
];

function Pricing() {
  const { isAuthenticated } = useAuth();

  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm border border-border">Precios</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Planes simples y transparentes</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Sin costes ocultos. Cancela cuando quieras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 ${plan.popular ? "border-primary shadow-xl shadow-primary/10" : "border-border/60"} bg-white`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold">
                    Más popular
                  </Badge>
                </div>
              )}
              <CardHeader className="p-6 pb-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold">{plan.price}€</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={isAuthenticated ? "/dashboard" : getLoginUrl("/dashboard")}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "¿Necesito una API key de Google Places?",
    a: "Sí, necesitarás una API key de Google Places para buscar negocios locales. Puedes configurarla en la sección de Ajustes. Google ofrece un crédito mensual gratuito que suele cubrir cientos de búsquedas.",
  },
  {
    q: "¿Los datos de los negocios son públicos?",
    a: "Sí, todos los datos que extrae Lead Auditor Pro son públicos: fichas de Google Places, información visible en webs públicas y emails que aparecen de forma pública en las páginas de contacto.",
  },
  {
    q: "¿Puedo cancelar mi suscripción en cualquier momento?",
    a: "Sí, puedes cancelar tu suscripción cuando quieras sin penalizaciones. Seguirás teniendo acceso hasta el final del período facturado.",
  },
  {
    q: "¿Qué incluye el scoring comercial?",
    a: "El scoring se divide en 4 columnas: Score SEO (metadatos, H1, sitemap, HTTPS), Score Velocidad (PageSpeed, tiempo de carga), Score Contacto (email, teléfono visible) y Score Redes Sociales (presencia en Facebook, Instagram, LinkedIn).",
  },
  {
    q: "¿Puedo usar la herramienta para enviar emails masivos?",
    a: "No. Lead Auditor Pro es una herramienta de prospección y auditoría. El envío de comunicaciones comerciales es tu responsabilidad y debe cumplir con la normativa aplicable (RGPD, LSSI). Revisa siempre los leads antes de contactar.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm border border-border">FAQ</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Preguntas frecuentes</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <Card key={i} className="bg-white border-border/60 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <Separator className="mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────

function CTAFinal() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24">
      <div className="container">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-violet-600 p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative">
            <h2 className="text-4xl font-extrabold mb-4">
              Empieza a captar leads hoy mismo
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Únete a cientos de agencias y freelancers que ya automatizan su prospección B2B con Lead Auditor Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={isAuthenticated ? "/dashboard" : getLoginUrl("/dashboard")}>
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold bg-white text-primary hover:bg-white/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Crear mi primera campaña
                </Button>
              </a>
            </div>
            <p className="text-sm text-white/60 mt-4">
              Sin tarjeta de crédito · Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">Lead Auditor Pro</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <p>Esta herramienta debe usarse solo con datos públicos de negocios.</p>
            <p>Respeta la normativa aplicable en comunicaciones comerciales.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lead Auditor Pro
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-[Inter,sans-serif]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}
