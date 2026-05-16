import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Campaigns ───────────────────────────────────────────────────────────────

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  zones: json("zones").$type<string[]>(),
  sectors: json("sectors").$type<string[]>(),
  searchRadius: int("searchRadius").default(5000).notNull(),
  minRating: decimal("minRating", { precision: 3, scale: 1 }).default("4.0").notNull(),
  minReviews: int("minReviews").default(75).notNull(),
  maxPages: int("maxPages").default(1).notNull(),
  onlyWithoutWebsite: boolean("onlyWithoutWebsite").default(false).notNull(),
  checkWebsiteStatus: boolean("checkWebsiteStatus").default(false).notNull(),
  enableWebsiteAudit: boolean("enableWebsiteAudit").default(true).notNull(),
  enablePagespeed: boolean("enablePagespeed").default(false).notNull(),
  enableEmailExtraction: boolean("enableEmailExtraction").default(true).notNull(),
  enableSocialExtraction: boolean("enableSocialExtraction").default(true).notNull(),
  maxAuditLeads: int("maxAuditLeads").default(100).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "error"])
    .default("pending")
    .notNull(),
  progress: int("progress").default(0).notNull(),
  currentStep: varchar("currentStep", { length: 255 }),
  totalLeads: int("totalLeads").default(0).notNull(),
  auditedLeads: int("auditedLeads").default(0).notNull(),
  logs: json("logs").$type<string[]>(),
  outputExcelKey: varchar("outputExcelKey", { length: 500 }),
  outputCsvKey: varchar("outputCsvKey", { length: 500 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  sector: varchar("sector", { length: 255 }),
  zone: varchar("zone", { length: 255 }),
  address: text("address"),
  phone: varchar("phone", { length: 64 }),
  website: varchar("website", { length: 500 }),
  email: varchar("email", { length: 320 }),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: int("reviewCount").default(0),
  hasWebsite: boolean("hasWebsite").default(false),
  websiteStatus: varchar("websiteStatus", { length: 64 }),
  facebook: varchar("facebook", { length: 500 }),
  instagram: varchar("instagram", { length: 500 }),
  linkedin: varchar("linkedin", { length: 500 }),
  twitter: varchar("twitter", { length: 500 }),
  googlePlaceId: varchar("googlePlaceId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Audit Results ────────────────────────────────────────────────────────────

export const auditResults = mysqlTable("audit_results", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull().unique(),
  campaignId: int("campaignId").notNull(),
  scoreSeo: int("scoreSeo").default(0).notNull(),
  scoreSpeed: int("scoreSpeed").default(0).notNull(),
  scoreContact: int("scoreContact").default(0).notNull(),
  scoreSocial: int("scoreSocial").default(0).notNull(),
  scoreTotal: int("scoreTotal").default(0).notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("low").notNull(),
  temperature: mysqlEnum("temperature", ["hot", "warm", "cold"]).default("cold").notNull(),
  detectedIssues: json("detectedIssues").$type<string[]>(),
  recommendedAction: text("recommendedAction"),
  pagespeedScore: int("pagespeedScore"),
  loadTimeMs: int("loadTimeMs"),
  hasMeta: boolean("hasMeta").default(false),
  hasH1: boolean("hasH1").default(false),
  hasSitemap: boolean("hasSitemap").default(false),
  hasHttps: boolean("hasHttps").default(false),
  isMobileFriendly: boolean("isMobileFriendly").default(false),
  emailsFound: json("emailsFound").$type<string[]>(),
  phonesFound: json("phonesFound").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditResult = typeof auditResults.$inferSelect;
export type InsertAuditResult = typeof auditResults.$inferInsert;

// ─── User Settings ────────────────────────────────────────────────────────────

export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  googlePlacesApiKey: varchar("googlePlacesApiKey", { length: 500 }),
  pagespeedApiKey: varchar("pagespeedApiKey", { length: 500 }),
  hunterApiKey: varchar("hunterApiKey", { length: 500 }),
  defaultMinRating: decimal("defaultMinRating", { precision: 3, scale: 1 }).default("4.0"),
  defaultMinReviews: int("defaultMinReviews").default(75),
  defaultMaxPages: int("defaultMaxPages").default(1),
  defaultMaxAuditLeads: int("defaultMaxAuditLeads").default(100),
  defaultEnableWebsiteAudit: boolean("defaultEnableWebsiteAudit").default(true),
  defaultEnableEmailExtraction: boolean("defaultEnableEmailExtraction").default(true),
  defaultEnableSocialExtraction: boolean("defaultEnableSocialExtraction").default(true),
  ownerName: varchar("ownerName", { length: 255 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  agencyName: varchar("agencyName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
