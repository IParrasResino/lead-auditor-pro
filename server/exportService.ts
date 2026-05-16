import * as XLSX from "xlsx";
import { getAuditResultsByCampaign, getLeadsByCampaign } from "./db";

export interface ExportRow {
  "Nombre Negocio": string;
  Sector: string;
  Zona: string;
  Dirección: string;
  Teléfono: string;
  Web: string;
  Email: string;
  Rating: string;
  Reseñas: number;
  "Tiene Web": string;
  "Estado Web": string;
  Facebook: string;
  Instagram: string;
  "Score SEO": number;
  "Score Velocidad": number;
  "Score Contacto": number;
  "Score Redes Sociales": number;
  "Score Total": number;
  Prioridad: string;
  Temperatura: string;
  "Problemas Detectados": string;
  "Acción Recomendada": string;
  "PageSpeed Score": string;
  "Tiempo de Carga (ms)": string;
  "Tiene HTTPS": string;
  "Mobile Friendly": string;
}

const PRIORITY_LABELS: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const TEMPERATURE_LABELS: Record<string, string> = {
  hot: "Caliente",
  warm: "Templado",
  cold: "Frío",
};

export async function buildExportRows(campaignId: number): Promise<ExportRow[]> {
  const leads = await getLeadsByCampaign(campaignId);
  const auditResults = await getAuditResultsByCampaign(campaignId);

  const auditMap = new Map(auditResults.map((r) => [r.leadId, r]));

  return leads.map((lead) => {
    const audit = auditMap.get(lead.id);
    return {
      "Nombre Negocio": lead.businessName,
      Sector: lead.sector ?? "",
      Zona: lead.zone ?? "",
      Dirección: lead.address ?? "",
      Teléfono: lead.phone ?? "",
      Web: lead.website ?? "",
      Email: lead.email ?? "",
      Rating: lead.rating ? String(lead.rating) : "",
      Reseñas: lead.reviewCount ?? 0,
      "Tiene Web": lead.hasWebsite ? "Sí" : "No",
      "Estado Web": lead.websiteStatus ?? "",
      Facebook: lead.facebook ?? "",
      Instagram: lead.instagram ?? "",
      "Score SEO": audit?.scoreSeo ?? 0,
      "Score Velocidad": audit?.scoreSpeed ?? 0,
      "Score Contacto": audit?.scoreContact ?? 0,
      "Score Redes Sociales": audit?.scoreSocial ?? 0,
      "Score Total": audit?.scoreTotal ?? 0,
      Prioridad: PRIORITY_LABELS[audit?.priority ?? "low"] ?? "",
      Temperatura: TEMPERATURE_LABELS[audit?.temperature ?? "cold"] ?? "",
      "Problemas Detectados": ((audit?.detectedIssues as string[]) ?? []).join("; "),
      "Acción Recomendada": audit?.recommendedAction ?? "",
      "PageSpeed Score": audit?.pagespeedScore != null ? String(audit.pagespeedScore) : "",
      "Tiempo de Carga (ms)": audit?.loadTimeMs != null ? String(audit.loadTimeMs) : "",
      "Tiene HTTPS": audit?.hasHttps ? "Sí" : "No",
      "Mobile Friendly": audit?.isMobileFriendly ? "Sí" : "No",
    };
  });
}

export async function generateExcelBuffer(campaignId: number): Promise<Buffer> {
  const rows = await buildExportRows(campaignId);
  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 35 }, { wch: 18 },
    { wch: 35 }, { wch: 30 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 35 }, { wch: 35 }, { wch: 12 }, { wch: 16 },
    { wch: 16 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 40 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads Auditados");

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

export async function generateCsvBuffer(campaignId: number): Promise<Buffer> {
  const rows = await buildExportRows(campaignId);
  if (rows.length === 0) return Buffer.from("");

  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
  const csvLines = [
    headers.join(";"),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "").replace(/"/g, '""');
          return val.includes(";") || val.includes('"') || val.includes("\n")
            ? `"${val}"`
            : val;
        })
        .join(";")
    ),
  ];

  return Buffer.from("\uFEFF" + csvLines.join("\n"), "utf-8");
}
