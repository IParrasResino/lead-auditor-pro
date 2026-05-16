import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Globe,
  Mail,
  Plus,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: "Pendiente", class: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
    running: { label: "Ejecutando", class: "bg-blue-100 text-blue-700 border-blue-200", icon: Zap },
    completed: { label: "Finalizada", class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    error: { label: "Error", class: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  }[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border", icon: Clock };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.class}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-white border-border/60 card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.campaigns.list.useQuery();

  const metrics = [
    { title: "Campañas creadas", value: stats?.totalCampaigns ?? 0, icon: Target, color: "bg-primary/10 text-primary" },
    { title: "Leads generados", value: stats?.totalLeads ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { title: "Leads auditados", value: stats?.auditedLeads ?? 0, icon: BarChart3, color: "bg-violet-50 text-violet-600" },
    { title: "Prioridad alta", value: stats?.highPriorityLeads ?? 0, icon: TrendingUp, color: "bg-red-50 text-red-600" },
    { title: "Con email", value: stats?.leadsWithEmail ?? 0, icon: Mail, color: "bg-emerald-50 text-emerald-600" },
    { title: "Sin web", value: stats?.leadsWithoutWebsite ?? 0, icon: Globe, color: "bg-amber-50 text-amber-600" },
    { title: "Web mejorable", value: stats?.leadsWithImprovedWebsite ?? 0, icon: AlertTriangle, color: "bg-orange-50 text-orange-600" },
    { title: "Campañas activas", value: stats?.activeCampaigns ?? 0, icon: Zap, color: "bg-cyan-50 text-cyan-600" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Bienvenido{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">
              Resumen de tus campañas de captación de leads.
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nueva campaña
            </Button>
          </Link>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.title} {...m} loading={statsLoading} />
          ))}
        </div>

        {/* Campaigns table */}
        <Card className="bg-white border-border/60">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Historial de campañas</CardTitle>
              <Link href="/campaigns/new">
                <Button variant="outline" size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Nueva
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {campaignsLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !campaigns || campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Sin campañas todavía</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primera campaña para empezar a captar leads.
                </p>
                <Link href="/campaigns/new">
                  <Button size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Crear primera campaña
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Campaña</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ciudad</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leads</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Auditados</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{c.businessType}</div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{c.city}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 py-4 font-medium">{c.totalLeads}</td>
                        <td className="px-4 py-4 font-medium">{c.auditedLeads}</td>
                        <td className="px-4 py-4 text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: es })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {c.status === "running" || c.status === "pending" ? (
                              <Link href={`/campaigns/${c.id}/progress`}>
                                <Button variant="outline" size="sm">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Ver progreso
                                </Button>
                              </Link>
                            ) : c.status === "completed" ? (
                              <Link href={`/campaigns/${c.id}/results`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Resultados
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/campaigns/${c.id}/progress`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver detalle
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warning notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Aviso legal importante</p>
          <p className="text-amber-700">
            Esta herramienta debe usarse solo con datos públicos de negocios. Revisa los leads antes de contactar.
            No envíes campañas masivas sin consentimiento o base legal adecuada.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
