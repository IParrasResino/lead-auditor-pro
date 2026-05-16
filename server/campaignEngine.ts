/**
 * Campaign Engine — orchestrates the full pipeline for a campaign
 * - Updates campaign status and progress
 * - Runs Python scripts (main.py, audit_webs.py, enhance_leads.py)
 * - Captures logs and errors
 * - Imports results into the database
 */

import { join } from "path";
import { runPythonPipeline } from "./pythonRunner";
import { importResultsFromPythonOutput } from "./pythonImporter";
import { updateCampaign, getUserSettings } from "./db";
import type { Campaign } from "../drizzle/schema";

async function updateCampaignProgress(
  campaignId: number,
  updates: {
    status?: "pending" | "running" | "completed" | "error";
    progress?: number;
    currentStep?: string | null;
    logs?: string[];
    totalLeads?: number;
    auditedLeads?: number;
    errorMessage?: string | null;
    completedAt?: Date | null;
  }
) {
  await updateCampaign(campaignId, updates as any);
}

async function importResultsFromPython(campaignId: number, pythonCwd: string) {
  try {
    const result = await importResultsFromPythonOutput(campaignId, pythonCwd);
    console.log(
      `[campaignEngine] Imported ${result.leadsCreated} leads and ${result.auditsCreated} audit results`
    );
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[campaignEngine] Error importing Python results: ${msg}`);
    throw error; // Propagate error to mark campaign as failed
  }
}

export async function runCampaignEngine(campaign: Campaign): Promise<void> {
  const campaignId = campaign.id;
  const logs: string[] = [];

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  try {
    // Step 1: Mark as running and prepare
    addLog("Iniciando campaña...");
    await updateCampaignProgress(campaignId, {
      status: "running",
      progress: 5,
      currentStep: "Preparando campaña",
      logs,
    });

    // Step 2: Read API keys from user settings (with fallback to env vars)
    const userSettings = await getUserSettings(campaign.userId);
    
    const googlePlacesKey = userSettings?.googlePlacesApiKey || process.env.GOOGLE_PLACES_API_KEY || "";
    const pagespeedKey = userSettings?.pagespeedApiKey || process.env.PAGESPEED_API_KEY || "";
    const hunterKey = userSettings?.hunterApiKey || process.env.HUNTER_API_KEY || "";

    // Step 3: Build environment variables from campaign config and user settings
    const env: Record<string, string> = {
      GOOGLE_PLACES_API_KEY: googlePlacesKey,
      PAGESPEED_API_KEY: pagespeedKey,
      HUNTER_API_KEY: hunterKey,
      CITY: campaign.city,
      ZONES: (campaign.zones as string[]).join(","),
      SECTORS: (campaign.sectors as string[]).join(","),
      MAX_PAGES: String(campaign.maxPages),
      MIN_RATING: String(campaign.minRating),
      MIN_REVIEWS: String(campaign.minReviews),
      ONLY_WITHOUT_WEBSITE: String(campaign.onlyWithoutWebsite),
      CHECK_WEBSITE_STATUS: String(campaign.checkWebsiteStatus),
      RUN_PAGESPEED: String(campaign.enablePagespeed),
      ENABLE_PAGESPEED: String(campaign.enablePagespeed),
      ENABLE_WEBSITE_AUDIT: String(campaign.enableWebsiteAudit),
      ENABLE_EMAIL_EXTRACTION: String(campaign.enableEmailExtraction),
      ENABLE_SOCIAL_EXTRACTION: String(campaign.enableSocialExtraction),
      WEBSITE_AUDIT_LIMIT: String(campaign.maxAuditLeads),
      MAX_AUDIT_LEADS: String(campaign.maxAuditLeads),
      AUDIT_MIN_SCORE: "40",
      AUDIT_ONLY_WITH_WEBSITE: "false",
      OUTPUT_DIR: "output",
      INPUT_FILE: "output/places_results.json",
      REQUEST_DELAY_SECONDS: "0.5",
      NEXT_PAGE_DELAY_SECONDS: "1",
      WEBSITE_TIMEOUT_SECONDS: "10",
      AUDIT_TIMEOUT_SECONDS: "15",
      CONTACT_PAGE_LIMIT: "5",
      AUDIT_DELAY_SECONDS: "0.2",
    };

    addLog("Variables de entorno configuradas");
    addLog(`Campaña: ${campaign.name}`);
    addLog(`Ciudad: ${campaign.city}`);
    addLog(`Zonas: ${(campaign.zones as string[]).join(", ")}`);
    addLog(`Sectores: ${(campaign.sectors as string[]).join(", ")}`);
    addLog(`Máximo de leads a auditar: ${campaign.maxAuditLeads}`);

    // Step 4: Run Python pipeline
    const pythonCwd = join(process.cwd(), "python_pipeline");

    // Step 4a: main.py - Search for businesses
    addLog("Iniciando búsqueda de negocios en Google Places...");
    await updateCampaignProgress(campaignId, {
      progress: 25,
      currentStep: "Buscando negocios en Google Places",
      logs,
    });

    await runPythonPipeline(["main.py"], {
      env,
      onLog: addLog,
      cwd: pythonCwd,
      timeout: 10 * 60 * 1000, // 10 minutes for main.py
    });

    addLog("Búsqueda completada");

    // Step 4b: audit_webs.py - Audit websites
    addLog("Iniciando auditoría de sitios web...");
    await updateCampaignProgress(campaignId, {
      progress: 55,
      currentStep: "Auditando sitios web",
      logs,
    });

    await runPythonPipeline(["audit_webs.py"], {
      env,
      onLog: addLog,
      cwd: pythonCwd,
      timeout: 15 * 60 * 1000, // 15 minutes for audit_webs.py
    });

    addLog("Auditoría de webs completada");

    // Step 4c: enhance_leads.py - Extract contacts and enhance data
    addLog("Extrayendo contactos y mejorando datos...");
    await updateCampaignProgress(campaignId, {
      progress: 85,
      currentStep: "Extrayendo contactos",
      logs,
    });

    await runPythonPipeline(["enhance_leads.py"], {
      env,
      onLog: addLog,
      cwd: pythonCwd,
      timeout: 10 * 60 * 1000, // 10 minutes for enhance_leads.py
    });

    addLog("Extracción de contactos completada");

    // Step 5: Import results into database
    addLog("Importando resultados a la base de datos...");
    await updateCampaignProgress(campaignId, {
      progress: 90,
      currentStep: "Importando resultados",
      logs,
    });

    await importResultsFromPython(campaignId, pythonCwd);

    // Step 6: Mark as completed
    addLog("¡Campaña finalizada exitosamente!");
    await updateCampaignProgress(campaignId, {
      status: "completed",
      progress: 100,
      currentStep: null,
      logs,
      completedAt: new Date(),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    addLog(`ERROR: ${errorMsg}`);
    console.error("[campaignEngine] Error:", error);

    await updateCampaignProgress(campaignId, {
      status: "error",
      errorMessage: errorMsg,
      logs,
    });
  }
}
