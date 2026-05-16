import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  getCampaignsByUser: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      name: "Test Campaign",
      businessType: "clínicas dentales",
      city: "Madrid",
      zones: ["Carabanchel"],
      sectors: ["clínicas dentales"],
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
      status: "completed",
      progress: 100,
      currentStep: "Campaña finalizada",
      totalLeads: 10,
      auditedLeads: 10,
      logs: ["✓ Campaña finalizada."],
      outputExcelKey: null,
      outputCsvKey: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    },
  ]),
  getCampaignById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    name: "Test Campaign",
    businessType: "clínicas dentales",
    city: "Madrid",
    zones: ["Carabanchel"],
    sectors: ["clínicas dentales"],
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
    status: "completed",
    progress: 100,
    currentStep: "Campaña finalizada",
    totalLeads: 10,
    auditedLeads: 10,
    logs: ["✓ Campaña finalizada."],
    outputExcelKey: null,
    outputCsvKey: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: new Date(),
  }),
  createCampaign: vi.fn().mockResolvedValue(42),
  updateCampaign: vi.fn().mockResolvedValue(undefined),
  deleteCampaign: vi.fn().mockResolvedValue(undefined),
  getLeadsByCampaign: vi.fn().mockResolvedValue([
    {
      id: 1,
      campaignId: 1,
      businessName: "Clínica Dental Test",
      sector: "clínicas dentales",
      zone: "Carabanchel",
      address: "Calle Mayor 10, Carabanchel",
      phone: "+34 91 123 4567",
      website: "https://www.clinicadental.es",
      email: "info@clinicadental.es",
      rating: "4.5",
      reviewCount: 120,
      hasWebsite: true,
      websiteStatus: "ok",
      facebook: null,
      instagram: null,
      linkedin: null,
      twitter: null,
      googlePlaceId: "ChIJtest123",
      createdAt: new Date(),
    },
  ]),
  getAuditResultsByCampaign: vi.fn().mockResolvedValue([
    {
      id: 1,
      leadId: 1,
      campaignId: 1,
      scoreSeo: 72,
      scoreSpeed: 65,
      scoreContact: 80,
      scoreSocial: 45,
      scoreTotal: 65,
      priority: "low",
      temperature: "cold",
      detectedIssues: ["Sin presencia en redes sociales"],
      recommendedAction: "Implementar estrategia de redes sociales",
      pagespeedScore: 78,
      loadTimeMs: 1200,
      hasMeta: true,
      hasH1: true,
      hasSitemap: false,
      hasHttps: true,
      isMobileFriendly: true,
      emailsFound: ["info@clinicadental.es"],
      phonesFound: ["+34 91 123 4567"],
      createdAt: new Date(),
    },
  ]),
  getUserSettings: vi.fn().mockResolvedValue(null),
  upsertUserSettings: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalCampaigns: 1,
    activeCampaigns: 0,
    totalLeads: 10,
    auditedLeads: 10,
    highPriorityLeads: 3,
    leadsWithEmail: 7,
    leadsWithoutWebsite: 4,
    leadsWithImprovedWebsite: 2,
    lastCampaign: null,
  }),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./campaignEngine", () => ({
  runCampaignEngine: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./exportService", () => ({
  generateExcelBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-excel")),
  generateCsvBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-csv")),
}));

// ─── Auth context helper ──────────────────────────────────────────────────────

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("campaigns.list", () => {
  it("returns list of campaigns for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.campaigns.list();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Campaign");
    expect(result[0].status).toBe("completed");
  });
});

describe("campaigns.get", () => {
  it("returns a campaign by id for the authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.campaigns.get({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.city).toBe("Madrid");
    expect(result.businessType).toBe("clínicas dentales");
  });
});

describe("campaigns.create", () => {
  it("creates a campaign and returns the new id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.campaigns.create({
      name: "Nueva Campaña Test",
      businessType: "peluquerías",
      city: "Barcelona",
      zones: ["Eixample"],
      sectors: ["peluquerías"],
      searchRadius: 3000,
      minRating: 4.0,
      minReviews: 50,
      maxPages: 1,
      onlyWithoutWebsite: false,
      checkWebsiteStatus: false,
      enableWebsiteAudit: true,
      enablePagespeed: false,
      enableEmailExtraction: true,
      enableSocialExtraction: true,
      maxAuditLeads: 50,
    });
    expect(result.id).toBe(42);
  });
});

describe("campaigns.progress", () => {
  it("returns progress data for a campaign", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.campaigns.progress({ id: 1 });
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(100);
    expect(result.totalLeads).toBe(10);
    expect(result.auditedLeads).toBe(10);
    expect(Array.isArray(result.logs)).toBe(true);
  });
});

describe("audit.fullResults", () => {
  it("returns leads merged with audit results", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.audit.fullResults({ campaignId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].businessName).toBe("Clínica Dental Test");
    expect(result[0].audit).not.toBeNull();
    expect(result[0].audit?.scoreSeo).toBe(72);
    expect(result[0].audit?.scoreSpeed).toBe(65);
    expect(result[0].audit?.scoreContact).toBe(80);
    expect(result[0].audit?.scoreSocial).toBe(45);
    expect(result[0].audit?.scoreTotal).toBe(65);
    expect(result[0].audit?.priority).toBe("low");
    expect(result[0].audit?.temperature).toBe("cold");
  });
});

describe("dashboard.stats", () => {
  it("returns dashboard statistics for the user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result?.totalCampaigns).toBe(1);
    expect(result?.totalLeads).toBe(10);
    expect(result?.auditedLeads).toBe(10);
    expect(result?.highPriorityLeads).toBe(3);
  });
});

describe("settings.get", () => {
  it("returns default settings when no settings saved", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.get();
    expect(result.googlePlacesApiKey).toBe("");
    expect(result.defaultMinReviews).toBe(75);
    expect(result.defaultEnableWebsiteAudit).toBe(true);
  });
});

describe("export.excel", () => {
  it("returns base64 excel data for a campaign", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.export.excel({ campaignId: 1 });
    expect(result.base64).toBeTruthy();
    expect(result.filename).toContain(".xlsx");
    expect(result.mimeType).toContain("spreadsheetml");
  });
});

describe("export.csv", () => {
  it("returns base64 csv data for a campaign", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.export.csv({ campaignId: 1 });
    expect(result.base64).toBeTruthy();
    expect(result.filename).toContain(".csv");
    expect(result.mimeType).toBe("text/csv");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => clearedCookies.push(name),
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBe(1);
  });
});
