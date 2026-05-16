import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditResults,
  campaigns,
  InsertAuditResult,
  InsertCampaign,
  InsertLead,
  InsertUser,
  InsertUserSettings,
  leads,
  userSettings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(campaigns).values(data);
  return result.insertId as number;
}

export async function getCampaignsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.userId, userId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateCampaign(
  id: number,
  data: Partial<InsertCampaign>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

export async function deleteCampaign(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function createLeads(data: InsertLead[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.length === 0) return [];
  const [result] = await db.insert(leads).values(data);
  return result;
}

export async function getLeadsByCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.campaignId, campaignId));
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

// ─── Audit Results ────────────────────────────────────────────────────────────

export async function createAuditResults(data: InsertAuditResult[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.length === 0) return;
  await db.insert(auditResults).values(data);
}

export async function getAuditResultsByCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditResults)
    .where(eq(auditResults.campaignId, campaignId));
}

export async function getAuditResultByLead(leadId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(auditResults)
    .where(eq(auditResults.leadId, leadId))
    .limit(1);
  return result[0];
}

// ─── User Settings ────────────────────────────────────────────────────────────

export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertUserSettings(data: InsertUserSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Partial<InsertUserSettings> = { ...data };
  delete (updateSet as Record<string, unknown>).userId;
  await db
    .insert(userSettings)
    .values(data)
    .onDuplicateKeyUpdate({ set: updateSet });
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const userCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.userId, userId));

  const campaignIds = userCampaigns.map((c) => c.id);
  if (campaignIds.length === 0) {
    return {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalLeads: 0,
      auditedLeads: 0,
      highPriorityLeads: 0,
      leadsWithEmail: 0,
      leadsWithoutWebsite: 0,
      leadsWithImprovedWebsite: 0,
      lastCampaign: null,
    };
  }

  const allLeads = await db
    .select()
    .from(leads)
    .where(
      campaignIds.length === 1
        ? eq(leads.campaignId, campaignIds[0])
        : eq(leads.campaignId, campaignIds[0]) // simplified; full IN handled below
    );

  // Fetch all leads for all campaigns
  let allLeadsAll: typeof allLeads = [];
  for (const cid of campaignIds) {
    const batch = await db.select().from(leads).where(eq(leads.campaignId, cid));
    allLeadsAll = allLeadsAll.concat(batch);
  }

  let allAuditResults: Awaited<ReturnType<typeof getAuditResultsByCampaign>> = [];
  for (const cid of campaignIds) {
    const batch = await getAuditResultsByCampaign(cid);
    allAuditResults = allAuditResults.concat(batch);
  }

  const lastCampaign = userCampaigns.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0];

  return {
    totalCampaigns: userCampaigns.length,
    activeCampaigns: userCampaigns.filter((c) => c.status === "running").length,
    totalLeads: allLeadsAll.length,
    auditedLeads: allAuditResults.length,
    highPriorityLeads: allAuditResults.filter((r) => r.priority === "high").length,
    leadsWithEmail: allLeadsAll.filter((l) => l.email).length,
    leadsWithoutWebsite: allLeadsAll.filter((l) => !l.hasWebsite).length,
    leadsWithImprovedWebsite: allAuditResults.filter(
      (r) => r.scoreSeo < 60 || r.scoreSpeed < 60
    ).length,
    lastCampaign,
  };
}
