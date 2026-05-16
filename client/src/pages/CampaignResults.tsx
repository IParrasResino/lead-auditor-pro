import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  Mail,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

// ─── Badges ───────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    high: { label: "Alta", cls: "priority-high" },
    medium: { label: "Media", cls: "priority-medium" },
    low: { label: "Baja", cls: "priority-low" },
  };
  const cfg = map[priority] ?? { label: priority, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function TemperatureBadge({ temperature }: { temperature: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    hot: { label: "Caliente", cls: "temp-hot" },
    warm: { label: "Templado", cls: "temp-warm" },
    cold: { label: "Frío", cls: "temp-cold" },
  };
  const cfg = map[temperature] ?? { label: temperature, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 70 ? "bg-emerald-500" :
    value >= 40 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold w-7 text-right">{value}</span>
    </div>
  );
}

// ─── Results page ─────────────────────────────────────────────────────────────

export default function CampaignResults() {
  const params = useParams<{ id: string }>();
  const campaignId = parseInt(params.id, 10);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterTemperature, setFilterTemperature] = useState("all");
  const [filterWebsite, setFilterWebsite] = useState("all");

  const { data: campaign } = trpc.campaigns.get.useQuery({ id: campaignId });
  const { data: fullResults, isLoading } = trpc.audit.fullResults.useQuery({ campaignId });

  const exportExcel = trpc.export.excel.useMutation();
  const exportCsv = trpc.export.csv.useMutation();

  // ─── Filtered results ──────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!fullResults) return [];
    return fullResults.filter((r) => {
      if (search && !r.businessName.toLowerCase().includes(search.toLowerCase()) &&
          !r.sector?.toLowerCase().includes(search.toLowerCase()) &&
          !r.zone?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== "all" && r.audit?.priority !== filterPriority) return false;
      if (filterTemperature !== "all" && r.audit?.temperature !== filterTemperature) return false;
      if (filterWebsite === "with" && !r.hasWebsite) return false;
      if (filterWebsite === "without" && r.hasWebsite) return false;
      return true;
    });
  }, [fullResults, search, filterPriority, filterTemperature, filterWebsite]);

  // ─── Summary stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!fullResults) return null;
    const audits = fullResults.map((r) => r.audit).filter(Boolean);
    return {
      total: fullResults.length,
      audited: audits.length,
      highPriority: audits.filter((a) => a?.priority === "high").length,
      mediumPriority: audits.filter((a) => a?.priority === "medium").length,
      lowPriority: audits.filter((a) => a?.priority === "low").length,
      hot: audits.filter((a) => a?.temperature === "hot").length,
      warm: audits.filter((a) => a?.temperature === "warm").length,
      cold: audits.filter((a) => a?.temperature === "cold").length,
      withEmail: fullResults.filter((r) => r.email).length,
      withoutWebsite: fullResults.filter((r) => !r.hasWebsite).length,
      improvableWebsite: audits.filter((a) => a && (a.scoreSeo < 60 || a.scoreSpeed < 60)).length,
    };
  }, [fullResults]);

  // ─── Export handlers ───────────────────────────────────────────────────────

  const handleExportExcel = async () => {
    try {
      const result = await exportExcel.mutateAsync({ campaignId });
      const blob = new Blob([Buffer.from(result.base64, "base64")], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel descargado correctamente.");
    } catch {
      toast.error("Error al generar el Excel.");
    }
  };

  const handleExportCsv = async () => {
    try {
      const result = await exportCsv.mutateAsync({ campaignId });
      const byteCharacters = atob(result.base64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV descargado correctamente.");
    } catch {
      toast.error("Error al generar el CSV.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {campaign?.name ?? "Resultados"}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {campaign?.city} · {campaign?.businessType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={exportCsv.isPending}
              className="gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              CSV
            </Button>
            <Button
              size="sm"
              onClick={handleExportExcel}
              disabled={exportExcel.isPending}
              className="gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {exportExcel.isPending ? "Generando..." : "Descargar Excel"}
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(11)].map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Total leads", value: stats.total, icon: Users, color: "text-primary bg-primary/10" },
              { label: "Auditados", value: stats.audited, icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
              { label: "Prioridad alta", value: stats.highPriority, icon: TrendingUp, color: "text-red-600 bg-red-50" },
              { label: "Prioridad media", value: stats.mediumPriority, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
              { label: "Prioridad baja", value: stats.lowPriority, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
              { label: "Calientes", value: stats.hot, icon: TrendingUp, color: "text-red-600 bg-red-50" },
              { label: "Templados", value: stats.warm, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
              { label: "Fríos", value: stats.cold, icon: TrendingUp, color: "text-sky-600 bg-sky-50" },
              { label: "Con email", value: stats.withEmail, icon: Mail, color: "text-emerald-600 bg-emerald-50" },
              { label: "Sin web", value: stats.withoutWebsite, icon: Globe, color: "text-amber-600 bg-amber-50" },
              { label: "Web mejorable", value: stats.improvableWebsite, icon: Star, color: "text-orange-600 bg-orange-50" },
            ].map((s) => (
              <Card key={s.label} className="bg-white border-border/60">
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, sector o zona..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-36">
                  <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTemperature} onValueChange={setFilterTemperature}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Temperatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="hot">Caliente</SelectItem>
                  <SelectItem value="warm">Templado</SelectItem>
                  <SelectItem value="cold">Frío</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterWebsite} onValueChange={setFilterWebsite}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Web" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="with">Con web</SelectItem>
                  <SelectItem value="without">Sin web</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-auto">
                {filtered.length} resultados
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Results table */}
        <Card className="bg-white border-border/60">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <CardTitle className="text-base font-semibold">
              Leads auditados — Top oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Sin resultados</p>
                <p className="text-sm text-muted-foreground">Prueba a cambiar los filtros.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Negocio</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Zona</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Rating</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Web</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Email</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Score SEO</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Score Vel.</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Score Cont.</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Score Redes</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Total</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Prioridad</th>
                      <th className="px-3 py-3 text-left font-medium text-muted-foreground">Temp.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 50).map((r) => (
                      <tr key={r.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm max-w-[180px] truncate" title={r.businessName}>
                            {r.businessName}
                          </div>
                          <div className="text-xs text-muted-foreground">{r.sector}</div>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.zone}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="font-medium">{r.rating ?? "—"}</span>
                            <span className="text-muted-foreground">({r.reviewCount})</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {r.hasWebsite ? (
                            <span className={`text-xs font-medium ${
                              r.websiteStatus === "ok" ? "text-emerald-600" :
                              r.websiteStatus === "slow" ? "text-amber-600" :
                              "text-red-600"
                            }`}>
                              {r.websiteStatus === "ok" ? "✓ Ok" :
                               r.websiteStatus === "slow" ? "⚠ Lenta" :
                               "✗ Rota"}
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">✗ Sin web</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {r.email ? (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Sí
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar value={r.audit?.scoreSeo ?? 0} label="SEO" />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar value={r.audit?.scoreSpeed ?? 0} label="Vel" />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar value={r.audit?.scoreContact ?? 0} label="Cont" />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreBar value={r.audit?.scoreSocial ?? 0} label="Red" />
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-sm font-bold ${
                            (r.audit?.scoreTotal ?? 0) >= 70 ? "text-emerald-600" :
                            (r.audit?.scoreTotal ?? 0) >= 40 ? "text-amber-600" :
                            "text-red-600"
                          }`}>
                            {r.audit?.scoreTotal ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <PriorityBadge priority={r.audit?.priority ?? "low"} />
                        </td>
                        <td className="px-3 py-3">
                          <TemperatureBadge temperature={r.audit?.temperature ?? "cold"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length > 50 && (
                  <div className="px-6 py-3 text-sm text-muted-foreground border-t border-border/60">
                    Mostrando 50 de {filtered.length} resultados. Descarga el Excel para ver todos.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center pb-8">
          <Link href="/campaigns/new">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva campaña
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv} disabled={exportCsv.isPending} className="gap-1.5">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button onClick={handleExportExcel} disabled={exportExcel.isPending} className="gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              Descargar Excel completo
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
