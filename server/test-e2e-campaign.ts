/**
 * test-e2e-campaign.ts — End-to-end test of the campaign pipeline
 * 
 * Tests:
 * 1. Create a campaign
 * 2. Run the campaign engine (Python pipeline)
 * 3. Verify leads are imported to database
 * 
 * Run with: npx tsx server/test-e2e-campaign.ts
 */

import { createCampaign, getLeadsByCampaign, getAuditResultsByCampaign, getCampaignById } from "./db";
import { runCampaignEngine } from "./campaignEngine";

async function main() {
  try {
    console.log("[e2e-test] Starting end-to-end campaign test...\n");
    
    // Step 1: Create a test campaign
    console.log("[e2e-test] Step 1: Creating test campaign...");
    const campaignId = await createCampaign({
      userId: 1,
      name: "E2E Test Campaign - Python Pipeline",
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
    
    console.log(`[e2e-test] ✓ Campaign created with ID: ${campaignId}\n`);
    
    // Step 1.5: Fetch the campaign from database
    console.log("[e2e-test] Step 1.5: Fetching campaign from database...");
    const campaign = await getCampaignById(campaignId, 1);
    if (!campaign) {
      console.error("[e2e-test] ✗ Campaign not found in database!");
      process.exit(1);
    }
    console.log("[e2e-test] ✓ Campaign fetched\n");
    
    // Step 2: Run the campaign engine
    console.log("[e2e-test] Step 2: Running campaign engine (Python pipeline)...");
    console.log("[e2e-test] This will execute: main.py → audit_webs.py → enhance_leads.py\n");
    
    try {
      await runCampaignEngine(campaign);
      console.log("\n[e2e-test] ✓ Campaign engine completed\n");
    } catch (error) {
      console.error("[e2e-test] ✗ Campaign engine failed:");
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
    
    // Step 3: Verify data in database
    console.log("[e2e-test] Step 3: Verifying data in database...");
    
    const leads = await getLeadsByCampaign(campaignId);
    const audits = await getAuditResultsByCampaign(campaignId);
    
    console.log(`[e2e-test] ✓ Leads imported: ${leads.length}`);
    console.log(`[e2e-test] ✓ Audits imported: ${audits.length}\n`);
    
    if (leads.length === 0) {
      console.error("[e2e-test] ✗ No leads were imported!");
      process.exit(1);
    }
    
    // Display sample data
    console.log("[e2e-test] Sample lead data:");
    console.log(JSON.stringify(leads[0], null, 2));
    
    if (audits.length > 0) {
      console.log("\n[e2e-test] Sample audit data:");
      console.log(JSON.stringify(audits[0], null, 2));
    }
    
    console.log("\n[e2e-test] ✓✓✓ END-TO-END TEST PASSED ✓✓✓");
    console.log("[e2e-test] Campaign pipeline is working correctly!");
    process.exit(0);
    
  } catch (error) {
    console.error("[e2e-test] ERROR:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
