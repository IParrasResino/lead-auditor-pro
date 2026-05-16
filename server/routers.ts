import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCampaign,
  deleteCampaign,
  getAuditResultsByCampaign,
  getCampaignById,
  getCampaignsByUser,
  getDashboardStats,
  getLeadsByCampaign,
  getUserSettings,
  updateCampaign,
  upsertUserSettings,
} from "./db";
import { runCampaignEngine } from "./campaignEngine";
import { generateCsvBuffer, generateExcelBuffer } from "./exportService";

// ─── Campaign router ──────────────────────────────────────────────────────────

const campaignRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getCampaignsByUser(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.id, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      return campaign;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        businessType: z.string().min(1).max(255),
        city: z.string().min(1).max(255),
        zones: z.array(z.string()).default([]),
        sectors: z.array(z.string()).default([]),
        searchRadius: z.number().min(500).max(50000).default(5000),
        minRating: z.number().min(0).max(5).default(4.0),
        minReviews: z.number().min(0).default(75),
        maxPages: z.number().min(1).max(10).default(1),
        onlyWithoutWebsite: z.boolean().default(false),
        checkWebsiteStatus: z.boolean().default(false),
        enableWebsiteAudit: z.boolean().default(true),
        enablePagespeed: z.boolean().default(false),
        enableEmailExtraction: z.boolean().default(true),
        enableSocialExtraction: z.boolean().default(true),
        maxAuditLeads: z.number().min(1).max(500).default(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await createCampaign({
        userId: ctx.user.id,
        name: input.name,
        businessType: input.businessType,
        city: input.city,
        zones: input.zones,
        sectors: input.sectors,
        searchRadius: input.searchRadius,
        minRating: String(input.minRating) as unknown as string,
        minReviews: input.minReviews,
        maxPages: input.maxPages,
        onlyWithoutWebsite: input.onlyWithoutWebsite,
        checkWebsiteStatus: input.checkWebsiteStatus,
        enableWebsiteAudit: input.enableWebsiteAudit,
        enablePagespeed: input.enablePagespeed,
        enableEmailExtraction: input.enableEmailExtraction,
        enableSocialExtraction: input.enableSocialExtraction,
        maxAuditLeads: input.maxAuditLeads,
        status: "pending",
        progress: 0,
        totalLeads: 0,
        auditedLeads: 0,
        logs: [],
      });
      return { id };
    }),

  start: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.id, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      if (campaign.status === "running") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La campaña ya está en ejecución." });
      }

      // Reset for re-run
      await updateCampaign(campaign.id, {
        status: "pending",
        progress: 0,
        currentStep: null,
        totalLeads: 0,
        auditedLeads: 0,
        logs: [],
        errorMessage: null,
        completedAt: null,
      });

      // Run asynchronously (fire and forget)
      runCampaignEngine(campaign).catch(console.error);

      return { started: true };
    }),

  progress: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.id, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        status: campaign.status,
        progress: campaign.progress,
        currentStep: campaign.currentStep,
        totalLeads: campaign.totalLeads,
        auditedLeads: campaign.auditedLeads,
        logs: (campaign.logs as string[]) ?? [],
        errorMessage: campaign.errorMessage,
        completedAt: campaign.completedAt,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.id, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      await deleteCampaign(input.id, ctx.user.id);
      return { deleted: true };
    }),
});

// ─── Leads router ─────────────────────────────────────────────────────────────

const leadsRouter = router({
  byCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const campaign = await getCampaignById(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      return getLeadsByCampaign(input.campaignId);
    }),
});

// ─── Audit results router ─────────────────────────────────────────────────────

const auditRouter = router({
  byCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      return getAuditResultsByCampaign(input.campaignId);
    }),

  fullResults: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const [leads, audits] = await Promise.all([
        getLeadsByCampaign(input.campaignId),
        getAuditResultsByCampaign(input.campaignId),
      ]);

      const auditMap = new Map(audits.map((a) => [a.leadId, a]));

      return leads.map((lead) => ({
        ...lead,
        audit: auditMap.get(lead.id) ?? null,
      }));
    }),
});

// ─── Settings router ──────────────────────────────────────────────────────────

const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    if (!settings) {
      // Return defaults without API keys
      return {
        googlePlacesApiKey: "",
        pagespeedApiKey: "",
        hunterApiKey: "",
        defaultMinRating: "4.0",
        defaultMinReviews: 75,
        defaultMaxPages: 1,
        defaultMaxAuditLeads: 100,
        defaultEnableWebsiteAudit: true,
        defaultEnableEmailExtraction: true,
        defaultEnableSocialExtraction: true,
        ownerName: ctx.user.name ?? "",
        ownerEmail: ctx.user.email ?? "",
        agencyName: "",
      };
    }
    // Mask API keys (show only last 4 chars)
    const maskKey = (key: string | null | undefined) => {
      if (!key) return "";
      if (key.length <= 4) return "****";
      return "****" + key.slice(-4);
    };
    return {
      ...settings,
      googlePlacesApiKey: maskKey(settings.googlePlacesApiKey),
      pagespeedApiKey: maskKey(settings.pagespeedApiKey),
      hunterApiKey: maskKey(settings.hunterApiKey),
    };
  }),

  save: protectedProcedure
    .input(
      z.object({
        googlePlacesApiKey: z.string().optional(),
        pagespeedApiKey: z.string().optional(),
        hunterApiKey: z.string().optional(),
        defaultMinRating: z.number().min(0).max(5).optional(),
        defaultMinReviews: z.number().min(0).optional(),
        defaultMaxPages: z.number().min(1).max(10).optional(),
        defaultMaxAuditLeads: z.number().min(1).max(500).optional(),
        defaultEnableWebsiteAudit: z.boolean().optional(),
        defaultEnableEmailExtraction: z.boolean().optional(),
        defaultEnableSocialExtraction: z.boolean().optional(),
        ownerName: z.string().max(255).optional(),
        ownerEmail: z.string().email().optional(),
        agencyName: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await getUserSettings(ctx.user.id);
      const updateData: Record<string, unknown> = { userId: ctx.user.id };

      // Only update API keys if they are non-empty and not masked
      if (input.googlePlacesApiKey && !input.googlePlacesApiKey.startsWith("****")) {
        updateData.googlePlacesApiKey = input.googlePlacesApiKey;
      } else if (current?.googlePlacesApiKey) {
        updateData.googlePlacesApiKey = current.googlePlacesApiKey;
      }

      if (input.pagespeedApiKey && !input.pagespeedApiKey.startsWith("****")) {
        updateData.pagespeedApiKey = input.pagespeedApiKey;
      } else if (current?.pagespeedApiKey) {
        updateData.pagespeedApiKey = current.pagespeedApiKey;
      }

      if (input.hunterApiKey && !input.hunterApiKey.startsWith("****")) {
        updateData.hunterApiKey = input.hunterApiKey;
      } else if (current?.hunterApiKey) {
        updateData.hunterApiKey = current.hunterApiKey;
      }

      if (input.defaultMinRating !== undefined)
        updateData.defaultMinRating = String(input.defaultMinRating);
      if (input.defaultMinReviews !== undefined)
        updateData.defaultMinReviews = input.defaultMinReviews;
      if (input.defaultMaxPages !== undefined)
        updateData.defaultMaxPages = input.defaultMaxPages;
      if (input.defaultMaxAuditLeads !== undefined)
        updateData.defaultMaxAuditLeads = input.defaultMaxAuditLeads;
      if (input.defaultEnableWebsiteAudit !== undefined)
        updateData.defaultEnableWebsiteAudit = input.defaultEnableWebsiteAudit;
      if (input.defaultEnableEmailExtraction !== undefined)
        updateData.defaultEnableEmailExtraction = input.defaultEnableEmailExtraction;
      if (input.defaultEnableSocialExtraction !== undefined)
        updateData.defaultEnableSocialExtraction = input.defaultEnableSocialExtraction;
      if (input.ownerName !== undefined) updateData.ownerName = input.ownerName;
      if (input.ownerEmail !== undefined) updateData.ownerEmail = input.ownerEmail;
      if (input.agencyName !== undefined) updateData.agencyName = input.agencyName;

      await upsertUserSettings(updateData as Parameters<typeof upsertUserSettings>[0]);
      return { saved: true };
    }),
});

// ─── Dashboard router ─────────────────────────────────────────────────────────

const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    return getDashboardStats(ctx.user.id);
  }),
});

// ─── Export router (REST-style via tRPC) ──────────────────────────────────────

const exportRouter = router({
  excel: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const buffer = await generateExcelBuffer(input.campaignId);
      const base64 = buffer.toString("base64");
      return {
        base64,
        filename: `leads-${campaign.name.replace(/[^a-z0-9]/gi, "_")}-${input.campaignId}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }),

  csv: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignById(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const buffer = await generateCsvBuffer(input.campaignId);
      const base64 = buffer.toString("base64");
      return {
        base64,
        filename: `leads-${campaign.name.replace(/[^a-z0-9]/gi, "_")}-${input.campaignId}.csv`,
        mimeType: "text/csv",
      };
    }),
});

// ─── App router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  campaigns: campaignRouter,
  leads: leadsRouter,
  audit: auditRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;
