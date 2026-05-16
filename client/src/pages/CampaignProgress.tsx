import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Loader2,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

const STEPS = [
  "Preparando campaña",
  "Buscando negocios en Google Places",
  "Generando base de leads",
  "Auditando webs",
  "Extrayendo emails y señales comerciales",
  "Calculando scoring comercial",
  "Generando informe final",
  "Campaña finalizada",
];

function StepIndicator({ currentStep, progress }: { currentStep: string | null | undefined; progress: number }) {
  const currentIndex = STEPS.findIndex((s) => s === currentStep);

  return (
    <div className="space-y-2">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex || progress === 100;
        const isCurrent = i === currentIndex && progress < 100;
        const isPending = i > currentIndex && progress < 100;

        return (
          <div
            key={step}
            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
              isCurrent ? "bg-primary/5 border border-primary/20" : ""
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              isDone ? "bg-emerald-500" : isCurrent ? "bg-primary" : "bg-muted"
            }`}>
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-white" />
              ) : isCurrent ? (
                <Loader2 className="w-3 h-3 text-white animate-spin" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              )}
            </div>
            <span className={`text-sm ${
              isDone ? "text-emerald-700 font-medium" :
              isCurrent ? "text-primary font-semibold" :
              "text-muted-foreground"
            }`}>
              {step}
            </span>
            {isCurrent && (
              <span className="ml-auto text-xs text-primary animate-pulse">En curso...</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CampaignProgress() {
  const params = useParams<{ id: string }>();
  const campaignId = parseInt(params.id, 10);
  const [, navigate] = useLocation();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data: campaign } = trpc.campaigns.get.useQuery({ id: campaignId });
  const { data: progress, refetch } = trpc.campaigns.progress.useQuery(
    { id: campaignId },
    { refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (status === "completed" || status === "error") return false;
        return 1500;
      }
    }
  );

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [progress?.logs]);

  // Redirect to results when done
  useEffect(() => {
    if (progress?.status === "completed") {
      const timer = setTimeout(() => navigate(`/campaigns/${campaignId}/results`), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress?.status, campaignId, navigate]);

  const isRunning = progress?.status === "running" || progress?.status === "pending";
  const isCompleted = progress?.status === "completed";
  const isError = progress?.status === "error";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {campaign?.name ?? "Campaña en progreso"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {campaign?.city} · {campaign?.businessType}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Progress + steps */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress bar */}
            <Card className="bg-white border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isRunning && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {isError && <XCircle className="w-4 h-4 text-destructive" />}
                    <span className="font-semibold text-sm">
                      {isCompleted ? "¡Campaña finalizada!" :
                       isError ? "Error en la campaña" :
                       progress?.currentStep ?? "Iniciando..."}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{progress?.progress ?? 0}%</span>
                </div>
                <Progress value={progress?.progress ?? 0} className="h-2.5" />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border/60">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{progress?.totalLeads ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Leads encontrados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{progress?.auditedLeads ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Auditados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {progress?.totalLeads && progress.totalLeads > 0
                        ? Math.round((progress.auditedLeads / progress.totalLeads) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Progreso auditoría</div>
                  </div>
                </div>

                {isCompleted && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium text-center">
                    Redirigiendo a resultados...
                  </div>
                )}

                {isError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <strong>Error:</strong> {progress?.errorMessage ?? "Error desconocido."}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="bg-white border-border/60">
              <CardContent className="p-6">
                <h3 className="font-semibold text-sm mb-4">Etapas del proceso</h3>
                <StepIndicator currentStep={progress?.currentStep} progress={progress?.progress ?? 0} />
              </CardContent>
            </Card>
          </div>

          {/* Right: Logs */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border/60 h-full">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : isCompleted ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  <span className="text-sm font-medium">Log de actividad</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs max-h-[500px]">
                  {(!progress?.logs || progress.logs.length === 0) ? (
                    <div className="text-muted-foreground italic text-center py-8">
                      Esperando actividad...
                    </div>
                  ) : (
                    (progress.logs as string[]).map((log, i) => (
                      <div
                        key={i}
                        className={`leading-relaxed ${
                          log.includes("✓") ? "text-emerald-600" :
                          log.includes("✗") || log.includes("Error") ? "text-red-600" :
                          "text-foreground/70"
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          {isCompleted && (
            <Link href={`/campaigns/${campaignId}/results`}>
              <Button className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Ver resultados
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
          {isError && (
            <Link href="/campaigns/new">
              <Button variant="outline" className="gap-2">
                <Zap className="w-4 h-4" />
                Nueva campaña
              </Button>
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
