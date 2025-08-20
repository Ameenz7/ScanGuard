import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScanSchema } from "@shared/schema";
import rateLimit from "express-rate-limit";
import net from "net";
import { URL } from "url";
import { analyzeSslCertificate } from "./ssl-analyzer";
import { analyzeSecurityHeaders } from "./security-headers-analyzer";

// Rate limiting middleware
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 scan requests per windowMs
  message: { error: "Too many scan requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function scanPort(host: string, port: number, timeout: number = 3000): Promise<{
  port: number;
  state: string;
  service?: string;
  protocol: string;
}> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({
        port,
        state: 'open',
        service: getServiceName(port),
        protocol: 'tcp'
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        port,
        state: 'filtered',
        protocol: 'tcp'
      });
    });
    
    socket.on('error', () => {
      resolve({
        port,
        state: 'closed',
        protocol: 'tcp'
      });
    });
    
    socket.connect(port, host);
  });
}

function getServiceName(port: number): string {
  const services: { [key: number]: string } = {
    21: 'ftp',
    22: 'ssh',
    23: 'telnet',
    25: 'smtp',
    53: 'dns',
    80: 'http',
    110: 'pop3',
    143: 'imap',
    443: 'https',
    993: 'imaps',
    995: 'pop3s',
    3389: 'rdp',
    5432: 'postgresql',
    3306: 'mysql',
    6379: 'redis',
    27017: 'mongodb'
  };
  return services[port] || 'unknown';
}

function getRiskLevel(port: number, service: string): string {
  // Higher risk ports
  if ([21, 23, 513, 514, 515, 79, 111].includes(port)) return 'high';
  // Medium risk ports  
  if ([22, 3389, 5432, 3306, 6379, 27017].includes(port)) return 'medium';
  // Standard web ports are typically low risk
  if ([80, 443].includes(port)) return 'low';
  return 'medium';
}

function analyzeVulnerabilities(scanResults: any[]): any[] {
  const vulnerabilities = [];
  
  for (const result of scanResults) {
    if (result.state === 'open') {
      // Check for SSH
      if (result.port === 22) {
        vulnerabilities.push({
          title: 'SSH Service Exposed',
          description: 'SSH service is publicly accessible. Ensure strong authentication and consider restricting access.',
          severity: 'medium',
          recommendation: 'Use key-based authentication, disable root login, and consider IP whitelisting.'
        });
      }
      
      // Check for FTP
      if (result.port === 21) {
        vulnerabilities.push({
          title: 'FTP Service Detected',
          description: 'FTP service detected. FTP transmits credentials in plain text.',
          severity: 'high',
          recommendation: 'Replace FTP with SFTP or FTPS for secure file transfers.'
        });
      }
      
      // Check for Telnet
      if (result.port === 23) {
        vulnerabilities.push({
          title: 'Telnet Service Exposed',
          description: 'Telnet service detected. Telnet transmits data in plain text.',
          severity: 'high',
          recommendation: 'Replace Telnet with SSH for secure remote access.'
        });
      }
      
      // Check for databases
      if ([3306, 5432, 27017, 6379].includes(result.port)) {
        vulnerabilities.push({
          title: 'Database Service Exposed',
          description: `Database service on port ${result.port} is publicly accessible.`,
          severity: 'high',
          recommendation: 'Restrict database access to trusted networks only and ensure strong authentication.'
        });
      }
    }
  }
  
  return vulnerabilities;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new scan
  app.post("/api/scans", scanLimiter, async (req, res) => {
    try {
      const validatedData = insertScanSchema.parse(req.body);
      
      // Validate URL format
      try {
        new URL(validatedData.url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }
      
      const scan = await storage.createScan(validatedData);
      
      // Start scan asynchronously
      performScan(scan.id, validatedData.url).catch(console.error);
      
      res.json(scan);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  // Get scan status and results
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }

      const scanResults = await storage.getScanResults(scan.id);
      const vulnerabilities = await storage.getVulnerabilities(scan.id);
      const sslAnalysis = await storage.getSslAnalysis(scan.id);
      const securityHeaders = await storage.getSecurityHeaders(scan.id);

      res.json({
        ...scan,
        scanResults,
        vulnerabilities,
        sslAnalysis,
        securityHeaders
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  async function performScan(scanId: string, url: string) {
    try {
      await storage.updateScan(scanId, { status: "running" });
      
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;
      
      // Common ports to scan
      const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3389, 5432, 3306, 6379, 27017];
      
      const scanPromises = commonPorts.map(port => scanPort(hostname, port));
      const results = await Promise.all(scanPromises);
      
      // Store scan results
      for (const result of results) {
        if (result.state === 'open') {
          await storage.addScanResult({
            scanId,
            port: result.port,
            protocol: result.protocol,
            service: result.service || 'unknown',
            version: null,
            state: result.state,
            riskLevel: getRiskLevel(result.port, result.service || '')
          });
        }
      }
      
      // Analyze vulnerabilities
      const vulnerabilities = analyzeVulnerabilities(results.filter(r => r.state === 'open'));
      for (const vuln of vulnerabilities) {
        await storage.addVulnerability({
          scanId,
          ...vuln
        });
      }
      
      // Perform SSL/TLS analysis and Security Headers analysis for HTTP/HTTPS sites
      let sslAnalysis = null;
      let securityHeadersAnalysis = null;
      
      const httpsPort = results.find(r => r.port === 443 && r.state === 'open');
      const httpPort = results.find(r => r.port === 80 && r.state === 'open');
      
      if (httpsPort) {
        try {
          console.log(`Performing SSL analysis for ${url}`);
          sslAnalysis = await analyzeSslCertificate(url, scanId);
          await storage.addSslAnalysis(sslAnalysis);
        } catch (error) {
          console.error('SSL analysis failed:', error);
        }
      }
      
      // Analyze security headers for any HTTP/HTTPS site
      if (httpsPort || httpPort) {
        try {
          console.log(`Analyzing security headers for ${url}`);
          securityHeadersAnalysis = await analyzeSecurityHeaders(url, scanId);
          await storage.addSecurityHeaders(securityHeadersAnalysis);
        } catch (error) {
          console.error('Security headers analysis failed:', error);
        }
      }
      
      await storage.updateScan(scanId, { 
        status: "completed",
        completedAt: new Date(),
        results: { 
          totalPorts: results.length,
          openPorts: results.filter(r => r.state === 'open').length,
          vulnerabilities: vulnerabilities.length,
          sslAnalyzed: !!sslAnalysis,
          securityHeadersAnalyzed: !!securityHeadersAnalysis
        }
      });
      
    } catch (error) {
      await storage.updateScan(scanId, { 
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date()
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
