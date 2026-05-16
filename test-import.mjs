#!/usr/bin/env node
/**
 * test-import.mjs — Test the Python importer with example data
 * 
 * Creates a test campaign and imports final_leads.json
 */

import { importResultsFromPythonOutput } from "./server/pythonImporter.ts";
import { createCampaign, getUserSettings } from "./server/db.ts";
import { getDb } from "./server/db.ts";

async function main() {
  try {
    console.log("[test-import] Starting import test...");
    
    // Get database connection
    const db = await getDb();
    if (!db) {
      console.error("[test-import] ERROR: Database not available");
      process.exit(1);
    }
    
    // Create a test campaign
    console.log("[test-import] Creating test campaign...");
    const campaignId = await createCampaign({
      userId: 1, // Test user ID
      name: "Test Campaign - Import Validation",
      businessType: "restaurantes",
      city: "Madrid",
      zones: ["Centro"],
      sectors: ["restaurantes"],
      searchRadius: 5000,
      minRating: "4.0",
      minReviews: 75,
      maxPages: 1,
      onlyWithoutWebsite: false,
      checkWebsiteStatus: false,
      enableWebsiteAudit: true,
      enablePagespeed: false,
      enableEmailExtraction: true,
      enableSocialExtraction: true,
      maxAuditLeads: 100,
      status: "pending",
      progress: 0,
      totalLeads: 0,
      auditedLeads: 0,
      logs: [],
    });
    
    console.log(`[test-import] Created campaign ID: ${campaignId}`);
    
    // Import results from final_leads.json
    console.log("[test-import] Importing results from final_leads.json...");
    const result = await importResultsFromPythonOutput(
      campaignId,
      "python_pipeline"
    );
    
    console.log(`[test-import] Import successful!`);
    console.log(`[test-import] Leads created: ${result.leadsCreated}`);
    console.log(`[test-import] Audits created: ${result.auditsCreated}`);
    
    // Verify data in database
    console.log("[test-import] Verifying data in database...");
    const { getLeadsByCampaign, getAuditResultsByCampaign } = await import("./server/db.ts");
    
    const leads = await getLeadsByCampaign(campaignId);
    const audits = await getAuditResultsByCampaign(campaignId);
    
    console.log(`[test-import] Leads in DB: ${leads.length}`);
    console.log(`[test-import] Audits in DB: ${audits.length}`);
    
    if (leads.length > 0) {
      console.log("[test-import] First lead:");
      console.log(JSON.stringify(leads[0], null, 2));
    }
    
    if (audits.length > 0) {
      console.log("[test-import] First audit:");
      console.log(JSON.stringify(audits[0], null, 2));
    }
    
    console.log("[test-import] ✓ Import test completed successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("[test-import] ERROR:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
