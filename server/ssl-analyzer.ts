import * as tls from 'tls';
import * as https from 'https';
import { URL } from 'url';
import type { InsertSslAnalysis } from '@shared/schema';

interface CertificateInfo {
  subject: any;
  issuer: any;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  serialNumber: string;
  sigalg: string;
  bits?: number;
}

interface SSLLabsGrade {
  grade: string;
  score: number;
  vulnerabilities: string[];
}

export async function analyzeSslCertificate(url: string, scanId: string): Promise<InsertSslAnalysis> {
  const hostname = new URL(url).hostname;
  
  try {
    // Get certificate information
    const certInfo = await getCertificateInfo(hostname);
    
    // Analyze SSL/TLS configuration
    const sslConfig = await analyzeSslConfiguration(hostname);
    
    // Calculate grade and score
    const gradeInfo = calculateSslGrade(certInfo, sslConfig);
    
    // Check for HSTS
    const hasHSTS = await checkHSTS(hostname);
    
    const expiryDate = new Date(certInfo.valid_to);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      scanId,
      hostname,
      certificateValid: expiryDate > now,
      certificateExpiry: expiryDate,
      issuer: formatCertificateField(certInfo.issuer),
      subject: formatCertificateField(certInfo.subject),
      signatureAlgorithm: certInfo.sigalg,
      keySize: certInfo.bits || null,
      protocolVersions: sslConfig.supportedProtocols,
      cipherSuites: sslConfig.supportedCiphers,
      grade: gradeInfo.grade,
      hasHSTS,
      vulnerabilities: gradeInfo.vulnerabilities,
      score: gradeInfo.score,
      daysUntilExpiry,
    };
  } catch (error) {
    console.error(`SSL analysis failed for ${hostname}:`, error);
    
    // Return a basic failed analysis
    return {
      scanId,
      hostname,
      certificateValid: false,
      certificateExpiry: null,
      issuer: 'Unknown',
      subject: 'Unknown',
      signatureAlgorithm: 'Unknown',
      keySize: null,
      protocolVersions: [],
      cipherSuites: [],
      grade: 'F',
      hasHSTS: false,
      vulnerabilities: ['SSL/TLS connection failed'],
      score: 0,
      daysUntilExpiry: null,
    };
  }
}

function getCertificateInfo(hostname: string): Promise<CertificateInfo> {
  return new Promise((resolve, reject) => {
    const options = {
      host: hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false, // Allow self-signed certificates for analysis
    };

    const req = https.request(options, (res) => {
      const socket = res.socket as any; // Cast to any to access TLS-specific methods
      const certificate = socket.getPeerCertificate?.(true);
      if (!certificate || Object.keys(certificate).length === 0) {
        reject(new Error('No certificate found'));
        return;
      }
      resolve(certificate as CertificateInfo);
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('SSL connection timeout'));
    });

    req.end();
  });
}

async function analyzeSslConfiguration(hostname: string): Promise<{
  supportedProtocols: string[];
  supportedCiphers: string[];
}> {
  const supportedProtocols: string[] = [];
  const supportedCiphers: string[] = [];

  // Test different TLS versions
  const protocolsToTest = ['TLSv1.3', 'TLSv1.2', 'TLSv1.1', 'TLSv1'];
  
  for (const protocol of protocolsToTest) {
    try {
      const isSupported = await testTlsProtocol(hostname, protocol);
      if (isSupported) {
        supportedProtocols.push(protocol);
      }
    } catch (error) {
      // Protocol not supported
    }
  }

  // Get cipher suites (simplified - in production would test individual ciphers)
  try {
    const ciphers = await getCipherSuites(hostname);
    supportedCiphers.push(...ciphers);
  } catch (error) {
    // Unable to get cipher information
  }

  return { supportedProtocols, supportedCiphers };
}

function testTlsProtocol(hostname: string, protocol: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      secureProtocol: `${protocol.replace('v', 'v1_').replace('.', '_')}_method`,
      rejectUnauthorized: false,
    });

    socket.on('secureConnect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function getCipherSuites(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      rejectUnauthorized: false,
    });

    socket.on('secureConnect', () => {
      const cipher = socket.getCipher();
      socket.destroy();
      resolve(cipher ? [cipher.name] : []);
    });

    socket.on('error', () => {
      resolve([]);
    });

    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve([]);
    });
  });
}

async function checkHSTS(hostname: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.request({
      hostname,
      port: 443,
      path: '/',
      method: 'HEAD',
    }, (res) => {
      const hstsHeader = res.headers['strict-transport-security'];
      resolve(!!hstsHeader);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function calculateSslGrade(certInfo: CertificateInfo, sslConfig: any): SSLLabsGrade {
  let score = 100;
  const vulnerabilities: string[] = [];
  
  // Certificate validation
  const expiryDate = new Date(certInfo.valid_to);
  const now = new Date();
  
  if (expiryDate <= now) {
    score -= 50;
    vulnerabilities.push('Certificate has expired');
  } else {
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 30) {
      score -= 20;
      vulnerabilities.push('Certificate expires soon (less than 30 days)');
    }
  }
  
  // Key size analysis
  if (certInfo.bits && certInfo.bits < 2048) {
    score -= 30;
    vulnerabilities.push('Weak key size (less than 2048 bits)');
  }
  
  // Signature algorithm
  if (certInfo.sigalg && certInfo.sigalg.toLowerCase().includes('sha1')) {
    score -= 20;
    vulnerabilities.push('Weak signature algorithm (SHA-1)');
  }
  
  // Protocol support
  if (sslConfig.supportedProtocols.includes('TLSv1') || sslConfig.supportedProtocols.includes('TLSv1.1')) {
    score -= 15;
    vulnerabilities.push('Supports deprecated TLS versions');
  }
  
  if (!sslConfig.supportedProtocols.includes('TLSv1.3')) {
    score -= 10;
    vulnerabilities.push('TLS 1.3 not supported');
  }
  
  // Determine grade based on score
  let grade = 'F';
  if (score >= 95) grade = 'A+';
  else if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  
  return { grade, score: Math.max(0, score), vulnerabilities };
}

function formatCertificateField(field: any): string {
  if (!field) return 'Unknown';
  
  if (typeof field === 'string') return field;
  
  // Format common certificate fields
  const parts: string[] = [];
  if (field.CN) parts.push(`CN=${field.CN}`);
  if (field.O) parts.push(`O=${field.O}`);
  if (field.OU) parts.push(`OU=${field.OU}`);
  if (field.C) parts.push(`C=${field.C}`);
  
  return parts.length > 0 ? parts.join(', ') : JSON.stringify(field);
}