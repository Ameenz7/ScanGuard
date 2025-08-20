import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull(),
  port: integer("port").notNull(),
  protocol: text("protocol").notNull(),
  service: text("service"),
  version: text("version"),
  state: text("state").notNull(), // open, closed, filtered
  riskLevel: text("risk_level").default("low"), // low, medium, high, critical
});

export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  cve: text("cve"),
  cvssScore: text("cvss_score"),
  recommendation: text("recommendation"),
});

export const insertScanSchema = createInsertSchema(scans).pick({
  url: true,
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true,
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;
export type ScanResult = typeof scanResults.$inferSelect;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
