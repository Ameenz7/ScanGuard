import { type Scan, type InsertScan, type ScanResult, type InsertScanResult, type Vulnerability, type InsertVulnerability, type SslAnalysis, type InsertSslAnalysis, type SecurityHeaders, type InsertSecurityHeaders, type CloudSecurityScan, type InsertCloudSecurityScan } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined>;
  addScanResult(result: InsertScanResult): Promise<ScanResult>;
  addVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  addSslAnalysis(sslAnalysis: InsertSslAnalysis): Promise<SslAnalysis>;
  addSecurityHeaders(securityHeaders: InsertSecurityHeaders): Promise<SecurityHeaders>;
  addCloudSecurityScan(cloudScan: InsertCloudSecurityScan): Promise<CloudSecurityScan>;
  getScanResults(scanId: string): Promise<ScanResult[]>;
  getVulnerabilities(scanId: string): Promise<Vulnerability[]>;
  getSslAnalysis(scanId: string): Promise<SslAnalysis | undefined>;
  getSecurityHeaders(scanId: string): Promise<SecurityHeaders | undefined>;
  getCloudSecurityScans(scanId: string): Promise<CloudSecurityScan[]>;
}

export class MemStorage implements IStorage {
  private scans: Map<string, Scan>;
  private scanResults: Map<string, ScanResult>;
  private vulnerabilities: Map<string, Vulnerability>;
  private sslAnalyses: Map<string, SslAnalysis>;
  private securityHeaders: Map<string, SecurityHeaders>;
  private cloudSecurityScans: Map<string, CloudSecurityScan>;

  constructor() {
    this.scans = new Map();
    this.scanResults = new Map();
    this.vulnerabilities = new Map();
    this.sslAnalyses = new Map();
    this.securityHeaders = new Map();
    this.cloudSecurityScans = new Map();
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

  async addSslAnalysis(sslAnalysis: InsertSslAnalysis): Promise<SslAnalysis> {
    const id = randomUUID();
    const ssl: SslAnalysis = { 
      ...sslAnalysis, 
      id,
      certificateExpiry: sslAnalysis.certificateExpiry ?? null,
      issuer: sslAnalysis.issuer ?? null,
      subject: sslAnalysis.subject ?? null,
      signatureAlgorithm: sslAnalysis.signatureAlgorithm ?? null,
      keySize: sslAnalysis.keySize ?? null,
      hasHSTS: sslAnalysis.hasHSTS ?? false,
      daysUntilExpiry: sslAnalysis.daysUntilExpiry ?? null,
      protocolVersions: sslAnalysis.protocolVersions ?? [],
      cipherSuites: sslAnalysis.cipherSuites ?? [],
      vulnerabilities: sslAnalysis.vulnerabilities ?? []
    };
    this.sslAnalyses.set(id, ssl);
    return ssl;
  }

  async getSslAnalysis(scanId: string): Promise<SslAnalysis | undefined> {
    return Array.from(this.sslAnalyses.values()).find(ssl => ssl.scanId === scanId);
  }

  async addSecurityHeaders(securityHeaders: InsertSecurityHeaders): Promise<SecurityHeaders> {
    const id = randomUUID();
    const headers: SecurityHeaders = { 
      ...securityHeaders, 
      id,
      hsts: securityHeaders.hsts ?? null,
      csp: securityHeaders.csp ?? null,
      xFrameOptions: securityHeaders.xFrameOptions ?? null,
      xContentTypeOptions: securityHeaders.xContentTypeOptions ?? null,
      xXSSProtection: securityHeaders.xXSSProtection ?? null,
      referrerPolicy: securityHeaders.referrerPolicy ?? null,
      permissionsPolicy: securityHeaders.permissionsPolicy ?? null,
      expectCT: securityHeaders.expectCT ?? null,
      crossOriginEmbedderPolicy: securityHeaders.crossOriginEmbedderPolicy ?? null,
      crossOriginOpenerPolicy: securityHeaders.crossOriginOpenerPolicy ?? null,
      crossOriginResourcePolicy: securityHeaders.crossOriginResourcePolicy ?? null,
      missingHeaders: securityHeaders.missingHeaders ?? [],
      weakHeaders: securityHeaders.weakHeaders ?? []
    };
    this.securityHeaders.set(id, headers);
    return headers;
  }

  async getSecurityHeaders(scanId: string): Promise<SecurityHeaders | undefined> {
    return Array.from(this.securityHeaders.values()).find(headers => headers.scanId === scanId);
  }

  async addCloudSecurityScan(cloudScan: InsertCloudSecurityScan): Promise<CloudSecurityScan> {
    const id = randomUUID();
    const scan: CloudSecurityScan = { 
      ...cloudScan, 
      id,
      region: cloudScan.region ?? null,
      configurationCheck: cloudScan.configurationCheck ?? null,
      findings: cloudScan.findings ?? [],
      remediationSteps: cloudScan.remediationSteps ?? [],
      scanDate: new Date()
    };
    this.cloudSecurityScans.set(id, scan);
    return scan;
  }

  async getCloudSecurityScans(scanId: string): Promise<CloudSecurityScan[]> {
    return Array.from(this.cloudSecurityScans.values()).filter(scan => scan.scanId === scanId);
  }
}

export const storage = new MemStorage();
