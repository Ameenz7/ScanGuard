import { type Scan, type InsertScan, type ScanResult, type InsertScanResult, type Vulnerability, type InsertVulnerability } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined>;
  addScanResult(result: InsertScanResult): Promise<ScanResult>;
  addVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  getScanResults(scanId: string): Promise<ScanResult[]>;
  getVulnerabilities(scanId: string): Promise<Vulnerability[]>;
}

export class MemStorage implements IStorage {
  private scans: Map<string, Scan>;
  private scanResults: Map<string, ScanResult>;
  private vulnerabilities: Map<string, Vulnerability>;

  constructor() {
    this.scans = new Map();
    this.scanResults = new Map();
    this.vulnerabilities = new Map();
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      ...insertScan,
      id,
      status: "pending",
      results: null,
      createdAt: new Date(),
      completedAt: null,
      errorMessage: null,
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) return undefined;
    
    const updatedScan = { ...scan, ...updates };
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  async addScanResult(result: InsertScanResult): Promise<ScanResult> {
    const id = randomUUID();
    const scanResult: ScanResult = { 
      ...result, 
      id,
      version: result.version ?? null,
      service: result.service ?? null,
      riskLevel: result.riskLevel ?? null
    };
    this.scanResults.set(id, scanResult);
    return scanResult;
  }

  async addVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const vuln: Vulnerability = { 
      ...vulnerability, 
      id,
      cve: vulnerability.cve ?? null,
      cvssScore: vulnerability.cvssScore ?? null,
      recommendation: vulnerability.recommendation ?? null
    };
    this.vulnerabilities.set(id, vuln);
    return vuln;
  }

  async getScanResults(scanId: string): Promise<ScanResult[]> {
    return Array.from(this.scanResults.values()).filter(result => result.scanId === scanId);
  }

  async getVulnerabilities(scanId: string): Promise<Vulnerability[]> {
    return Array.from(this.vulnerabilities.values()).filter(vuln => vuln.scanId === scanId);
  }
}

export const storage = new MemStorage();
