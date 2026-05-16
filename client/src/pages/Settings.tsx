import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Building2,
  Eye,
  EyeOff,
  Key,
  Save,
  Settings as SettingsIcon,
  Shield,
  User,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

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

function ApiKeyInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isMasked = value.startsWith("****");

  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Introduce tu API key"}
          className="pr-10 font-mono text-sm"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {isMasked && (
        <p className="text-xs text-muted-foreground mt-1">
          API key guardada. Escribe una nueva para reemplazarla.
        </p>
      )}
      {hint && !isMasked && (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const saveMutation = trpc.settings.save.useMutation();

  // API Keys
  const [googlePlacesApiKey, setGooglePlacesApiKey] = useState("");
  const [pagespeedApiKey, setPagespeedApiKey] = useState("");
  const [hunterApiKey, setHunterApiKey] = useState("");

  // Audit preferences
  const [defaultMinRating, setDefaultMinRating] = useState(4.0);
  const [defaultMinReviews, setDefaultMinReviews] = useState(75);
  const [defaultMaxPages, setDefaultMaxPages] = useState(1);
  const [defaultMaxAuditLeads, setDefaultMaxAuditLeads] = useState(100);
  const [defaultEnableWebsiteAudit, setDefaultEnableWebsiteAudit] = useState(true);
  const [defaultEnableEmailExtraction, setDefaultEnableEmailExtraction] = useState(true);
  const [defaultEnableSocialExtraction, setDefaultEnableSocialExtraction] = useState(true);

  // Profile
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [agencyName, setAgencyName] = useState("");

  useEffect(() => {
    if (!settings) return;
    setGooglePlacesApiKey(settings.googlePlacesApiKey ?? "");
    setPagespeedApiKey(settings.pagespeedApiKey ?? "");
    setHunterApiKey(settings.hunterApiKey ?? "");
    setDefaultMinRating(parseFloat(String(settings.defaultMinRating ?? 4.0)));
    setDefaultMinReviews(settings.defaultMinReviews ?? 75);
    setDefaultMaxPages(settings.defaultMaxPages ?? 1);
    setDefaultMaxAuditLeads(settings.defaultMaxAuditLeads ?? 100);
    setDefaultEnableWebsiteAudit(settings.defaultEnableWebsiteAudit ?? true);
    setDefaultEnableEmailExtraction(settings.defaultEnableEmailExtraction ?? true);
    setDefaultEnableSocialExtraction(settings.defaultEnableSocialExtraction ?? true);
    setOwnerName(settings.ownerName ?? user?.name ?? "");
    setOwnerEmail(settings.ownerEmail ?? user?.email ?? "");
    setAgencyName(settings.agencyName ?? "");
  }, [settings, user]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        googlePlacesApiKey,
        pagespeedApiKey,
        hunterApiKey,
        defaultMinRating,
        defaultMinReviews,
        defaultMaxPages,
        defaultMaxAuditLeads,
        defaultEnableWebsiteAudit,
        defaultEnableEmailExtraction,
        defaultEnableSocialExtraction,
        ownerName,
        ownerEmail: ownerEmail || undefined,
        agencyName,
      });
      toast.success("Ajustes guardados correctamente.");
    } catch {
      toast.error("Error al guardar los ajustes.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configura tus API keys, preferencias de auditoría y perfil.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* API Keys */}
            <Card className="bg-white border-border/60">
              <CardContent className="p-6">
                <SectionHeader
                  icon={Key}
                  title="API Keys"
                  desc="Las claves se almacenan de forma segura en el servidor y nunca se exponen en el navegador."
                />
                <div className="space-y-4">
                  <ApiKeyInput
                    label="Google Places API Key"
                    value={googlePlacesApiKey}
                    onChange={setGooglePlacesApiKey}
                    placeholder="AIzaSy..."
                    hint="Necesaria para buscar negocios locales. Obtén una en Google Cloud Console."
                  />
                  <ApiKeyInput
                    label="PageSpeed API Key (opcional)"
                    value={pagespeedApiKey}
                    onChange={setPagespeedApiKey}
                    placeholder="AIzaSy..."
                    hint="Mejora la precisión del score de velocidad web."
                  />
                  <ApiKeyInput
                    label="Hunter.io API Key (opcional)"
                    value={hunterApiKey}
                    onChange={setHunterApiKey}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    hint="Mejora la extracción de emails de contacto."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audit preferences */}
            <Card className="bg-white border-border/60">
              <CardContent className="p-6">
                <SectionHeader
                  icon={SettingsIcon}
                  title="Preferencias de auditoría"
                  desc="Valores por defecto para nuevas campañas."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="defMinRating" className="text-sm font-medium mb-1.5 block">Rating mínimo por defecto</Label>
                    <Input
                      id="defMinRating"
                      type="number"
                      min={1} max={5} step={0.1}
                      value={defaultMinRating}
                      onChange={(e) => setDefaultMinRating(parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defMinReviews" className="text-sm font-medium mb-1.5 block">Reseñas mínimas por defecto</Label>
                    <Input
                      id="defMinReviews"
                      type="number"
                      min={0}
                      value={defaultMinReviews}
                      onChange={(e) => setDefaultMinReviews(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defMaxPages" className="text-sm font-medium mb-1.5 block">Máximo páginas por defecto</Label>
                    <Input
                      id="defMaxPages"
                      type="number"
                      min={1} max={10}
                      value={defaultMaxPages}
                      onChange={(e) => setDefaultMaxPages(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defMaxLeads" className="text-sm font-medium mb-1.5 block">Máximo leads a auditar por defecto</Label>
                    <Input
                      id="defMaxLeads"
                      type="number"
                      min={1} max={500}
                      value={defaultMaxAuditLeads}
                      onChange={(e) => setDefaultMaxAuditLeads(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Separator className="mb-5" />

                <div className="space-y-3">
                  {[
                    { label: "Auditoría web activada por defecto", value: defaultEnableWebsiteAudit, set: setDefaultEnableWebsiteAudit },
                    { label: "Extracción de emails activada por defecto", value: defaultEnableEmailExtraction, set: setDefaultEnableEmailExtraction },
                    { label: "Extracción de redes sociales activada por defecto", value: defaultEnableSocialExtraction, set: setDefaultEnableSocialExtraction },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between py-1.5">
                      <Label className="text-sm cursor-pointer">{toggle.label}</Label>
                      <Switch checked={toggle.value} onCheckedChange={toggle.set} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profile */}
            <Card className="bg-white border-border/60">
              <CardContent className="p-6">
                <SectionHeader
                  icon={User}
                  title="Perfil comercial"
                  desc="Información de tu agencia o perfil profesional."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName" className="text-sm font-medium mb-1.5 block">Nombre</Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerEmail" className="text-sm font-medium mb-1.5 block">Email de contacto</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="agencyName" className="text-sm font-medium mb-1.5 block">Nombre de agencia (opcional)</Label>
                    <Input
                      id="agencyName"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="Tu Agencia Digital S.L."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal warnings */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm text-amber-800 mb-2">Avisos legales importantes</h3>
                    <ul className="space-y-1 text-sm text-amber-700">
                      <li>• Esta herramienta debe usarse solo con datos públicos de negocios.</li>
                      <li>• Respeta la normativa aplicable en comunicaciones comerciales (RGPD, LSSI).</li>
                      <li>• Revisa los leads antes de contactar.</li>
                      <li>• No envíes campañas masivas sin consentimiento o base legal adecuada.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end pb-8">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="gap-2 shadow-sm"
                size="lg"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Guardando..." : "Guardar ajustes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
