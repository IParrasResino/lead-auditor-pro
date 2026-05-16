import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Key,
  MapPin,
  Settings,
  Tag,
  Zap,
  Info,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

const DEFAULT_ZONES = [
  "Carabanchel", "Usera", "Villaverde", "Puente de Vallecas",
  "Villa de Vallecas", "Leganés", "Getafe", "Alcorcón", "Fuenlabrada", "Móstoles",
];

const DEFAULT_SECTORS = [
  "clínicas dentales", "clínicas estéticas", "fisioterapeutas", "academias",
  "talleres mecánicos", "peluquerías", "centros de belleza", "gimnasios",
  "restaurantes", "pizzerías", "cafeterías",
];

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Escribe y pulsa Enter"}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={add} size="sm" className="px-3">
          Añadir
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={() => remove(tag)}
            title="Clic para eliminar"
          >
            {tag}
            <span className="text-xs opacity-60">×</span>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Sin elementos. Añade usando el campo de arriba.</span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

export default function NewCampaign() {
  const [, navigate] = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [city, setCity] = useState("Madrid");
  const [zones, setZones] = useState<string[]>(DEFAULT_ZONES.slice(0, 5));
  const [sectors, setSectors] = useState<string[]>(DEFAULT_SECTORS.slice(0, 5));
  const [searchRadius, setSearchRadius] = useState(5000);
  const [minRating, setMinRating] = useState(4.0);
  const [minReviews, setMinReviews] = useState(75);
  const [maxPages, setMaxPages] = useState(1);
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState(false);
  const [checkWebsiteStatus, setCheckWebsiteStatus] = useState(false);
  const [enableWebsiteAudit, setEnableWebsiteAudit] = useState(true);
  const [enablePagespeed, setEnablePagespeed] = useState(false);
  const [enableEmailExtraction, setEnableEmailExtraction] = useState(true);
  const [enableSocialExtraction, setEnableSocialExtraction] = useState(true);
  const [maxAuditLeads, setMaxAuditLeads] = useState(100);

  const createMutation = trpc.campaigns.create.useMutation();
  const startMutation = trpc.campaigns.start.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("El nombre de campaña es obligatorio."); return; }
    if (!businessType.trim()) { toast.error("El tipo de negocio es obligatorio."); return; }
    if (!city.trim()) { toast.error("La ciudad es obligatoria."); return; }
    setShowConfirm(true);
  };

  const handleStart = async () => {
    setShowConfirm(false);
    try {
      const { id } = await createMutation.mutateAsync({
        name: name.trim(),
        businessType: businessType.trim(),
        city: city.trim(),
        zones,
        sectors,
        searchRadius,
        minRating,
        minReviews,
        maxPages,
        onlyWithoutWebsite,
        checkWebsiteStatus,
        enableWebsiteAudit,
        enablePagespeed,
        enableEmailExtraction,
        enableSocialExtraction,
        maxAuditLeads,
      });

      await startMutation.mutateAsync({ id });
      await utils.campaigns.list.invalidate();
      toast.success("¡Campaña iniciada correctamente!");
      navigate(`/campaigns/${id}/progress`);
    } catch (err) {
      toast.error("Error al crear la campaña. Inténtalo de nuevo.");
    }
  };

  const isLoading = createMutation.isPending || startMutation.isPending;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nueva campaña</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Configura los parámetros de búsqueda y auditoría de leads.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Block 1: Basic data */}
          <Card className="bg-white border-border/60">
            <CardContent className="p-6">
              <SectionHeader icon={Tag} title="Datos básicos" desc="Nombre e identificación de la campaña." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">
                    Nombre de campaña <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Clínicas dentales Madrid Sur - Mayo 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="businessType" className="text-sm font-medium mb-1.5 block">
                    Tipo de negocio principal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="Ej: clínicas dentales"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm font-medium mb-1.5 block">
                    Ciudad principal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Madrid"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block 2: Zones */}
          <Card className="bg-white border-border/60">
            <CardContent className="p-6">
              <SectionHeader icon={MapPin} title="Zonas de búsqueda" desc="Municipios, barrios o zonas donde buscar negocios." />
              <TagInput
                label="Zonas / municipios / barrios"
                value={zones}
                onChange={setZones}
                placeholder="Escribe una zona y pulsa Enter"
              />
              <button
                type="button"
                className="mt-3 text-xs text-primary hover:underline"
                onClick={() => setZones(DEFAULT_ZONES)}
              >
                Cargar zonas de ejemplo (Madrid Sur)
              </button>
            </CardContent>
          </Card>

          {/* Block 3: Sectors */}
          <Card className="bg-white border-border/60">
            <CardContent className="p-6">
              <SectionHeader icon={Globe} title="Sectores de negocio" desc="Tipos de negocios que quieres buscar." />
              <TagInput
                label="Sectores"
                value={sectors}
                onChange={setSectors}
                placeholder="Ej: clínicas dentales"
              />
              <button
                type="button"
                className="mt-3 text-xs text-primary hover:underline"
                onClick={() => setSectors(DEFAULT_SECTORS)}
              >
                Cargar sectores de ejemplo
              </button>
            </CardContent>
          </Card>

          {/* Block 4: Quality filters */}
          <Card className="bg-white border-border/60">
            <CardContent className="p-6">
              <SectionHeader icon={Settings} title="Filtros de calidad" desc="Parámetros para filtrar y auditar los leads." />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Rating */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Rating mínimo: <span className="text-primary font-bold">{minRating.toFixed(1)} ★</span>
                  </Label>
                  <Slider
                    min={1} max={5} step={0.1}
                    value={[minRating]}
                    onValueChange={([v]) => setMinRating(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1.0</span><span>5.0</span>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <Label htmlFor="minReviews" className="text-sm font-medium mb-1.5 block">
                    Reseñas mínimas
                  </Label>
                  <Input
                    id="minReviews"
                    type="number"
                    min={0}
                    value={minReviews}
                    onChange={(e) => setMinReviews(Number(e.target.value))}
                  />
                </div>

                {/* Max pages */}
                <div>
                  <Label htmlFor="maxPages" className="text-sm font-medium mb-1.5 block">
                    Máximo páginas por búsqueda
                  </Label>
                  <Input
                    id="maxPages"
                    type="number"
                    min={1} max={10}
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value))}
                  />
                </div>

                {/* Max audit leads */}
                <div>
                  <Label htmlFor="maxAuditLeads" className="text-sm font-medium mb-1.5 block">
                    Límite máximo de leads a auditar
                  </Label>
                  <Input
                    id="maxAuditLeads"
                    type="number"
                    min={1} max={500}
                    value={maxAuditLeads}
                    onChange={(e) => setMaxAuditLeads(Number(e.target.value))}
                  />
                </div>

                {/* Search radius */}
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium mb-3 block">
                    Radio de búsqueda: <span className="text-primary font-bold">{(searchRadius / 1000).toFixed(1)} km</span>
                  </Label>
                  <Slider
                    min={500} max={50000} step={500}
                    value={[searchRadius]}
                    onValueChange={([v]) => setSearchRadius(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.5 km</span><span>50 km</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-6">
                {[
                  { label: "Solo negocios sin web", value: onlyWithoutWebsite, set: setOnlyWithoutWebsite },
                  { label: "Comprobar estado de web", value: checkWebsiteStatus, set: setCheckWebsiteStatus },
                  { label: "Activar auditoría web", value: enableWebsiteAudit, set: setEnableWebsiteAudit },
                  { label: "Activar PageSpeed", value: enablePagespeed, set: setEnablePagespeed },
                  { label: "Extracción de emails", value: enableEmailExtraction, set: setEnableEmailExtraction },
                  { label: "Extracción de redes sociales", value: enableSocialExtraction, set: setEnableSocialExtraction },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between py-2">
                    <Label className="text-sm cursor-pointer">{toggle.label}</Label>
                    <Switch
                      checked={toggle.value}
                      onCheckedChange={toggle.set}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Block 5: API Keys notice */}
          <Card className="bg-white border-border/60 border-dashed">
            <CardContent className="p-6">
              <SectionHeader icon={Key} title="API Keys" desc="Las API keys se configuran en la sección de Ajustes." />
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Las API keys (Google Places, PageSpeed, Hunter) se almacenan de forma segura en el servidor y se configuran en{" "}
                  <Link href="/settings" className="text-primary hover:underline font-medium">Ajustes</Link>.
                  No se exponen en el navegador.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Link href="/dashboard">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="gap-2 shadow-sm"
              size="lg"
            >
              <Zap className="w-4 h-4" />
              Comenzar campaña
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Iniciar campaña?</DialogTitle>
            <DialogDescription>
              Se lanzará el proceso de búsqueda y auditoría para <strong>"{name}"</strong>.
              Esto puede tardar varios minutos dependiendo del número de leads.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Ciudad:</span><span className="font-medium">{city}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Zonas:</span><span className="font-medium">{zones.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sectores:</span><span className="font-medium">{sectors.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Máx. leads:</span><span className="font-medium">{maxAuditLeads}</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStart} disabled={isLoading} className="gap-2">
              <Zap className="w-4 h-4" />
              {isLoading ? "Iniciando..." : "Sí, comenzar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
