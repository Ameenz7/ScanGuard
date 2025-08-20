import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import type { InsertSecurityHeaders } from '@shared/schema';

interface SecurityHeadersAnalysis {
  hsts?: {
    present: boolean;
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
    value?: string;
  };
  csp?: {
    present: boolean;
    directives: string[];
    value?: string;
    hasUnsafeInline?: boolean;
    hasUnsafeEval?: boolean;
  };
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXSSProtection?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  expectCT?: {
    present: boolean;
    maxAge?: number;
    enforce?: boolean;
    reportUri?: string;
    value?: string;
  };
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

export async function analyzeSecurityHeaders(url: string, scanId: string): Promise<InsertSecurityHeaders> {
  const hostname = new URL(url).hostname;
  
  try {
    console.log(`Analyzing security headers for ${url}`);
    const headers = await fetchSecurityHeaders(url);
    const analysis = analyzeHeaders(headers);
    const { score, grade } = calculateSecurityScore(analysis);
    const { missingHeaders, weakHeaders } = identifyIssues(analysis);
    
    return {
      scanId,
      hostname,
      hsts: analysis.hsts || null,
      csp: analysis.csp || null,
      xFrameOptions: analysis.xFrameOptions || null,
      xContentTypeOptions: analysis.xContentTypeOptions || null,
      xXSSProtection: analysis.xXSSProtection || null,
      referrerPolicy: analysis.referrerPolicy || null,
      permissionsPolicy: analysis.permissionsPolicy || null,
      expectCT: analysis.expectCT || null,
      crossOriginEmbedderPolicy: analysis.crossOriginEmbedderPolicy || null,
      crossOriginOpenerPolicy: analysis.crossOriginOpenerPolicy || null,
      crossOriginResourcePolicy: analysis.crossOriginResourcePolicy || null,
      securityScore: score,
      grade,
      missingHeaders,
      weakHeaders,
    };
  } catch (error) {
    console.error(`Security headers analysis failed for ${hostname}:`, error);
    
    return {
      scanId,
      hostname,
      hsts: null,
      csp: null,
      xFrameOptions: null,
      xContentTypeOptions: null,
      xXSSProtection: null,
      referrerPolicy: null,
      permissionsPolicy: null,
      expectCT: null,
      crossOriginEmbedderPolicy: null,
      crossOriginOpenerPolicy: null,
      crossOriginResourcePolicy: null,
      securityScore: 0,
      grade: 'F',
      missingHeaders: ['All security headers missing due to connection failure'],
      weakHeaders: [],
    };
  }
}

async function fetchSecurityHeaders(url: string): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'SecureScan Security Headers Analyzer'
      }
    };

    const req = client.request(options, (res) => {
      const headers: Record<string, string> = {};
      
      // Normalize header names to lowercase for consistent processing
      Object.keys(res.headers).forEach(key => {
        const value = res.headers[key];
        if (typeof value === 'string') {
          headers[key.toLowerCase()] = value;
        } else if (Array.isArray(value)) {
          headers[key.toLowerCase()] = value.join(', ');
        }
      });
      
      resolve(headers);
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function analyzeHeaders(headers: Record<string, string>): SecurityHeadersAnalysis {
  const analysis: SecurityHeadersAnalysis = {};
  
  // Analyze HSTS
  const hstsHeader = headers['strict-transport-security'];
  if (hstsHeader) {
    analysis.hsts = {
      present: true,
      value: hstsHeader,
      maxAge: extractMaxAge(hstsHeader),
      includeSubDomains: hstsHeader.toLowerCase().includes('includesubdomains'),
      preload: hstsHeader.toLowerCase().includes('preload')
    };
  } else {
    analysis.hsts = { present: false };
  }
  
  // Analyze CSP
  const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];
  if (cspHeader) {
    const directives = cspHeader.split(';').map(d => d.trim()).filter(d => d);
    analysis.csp = {
      present: true,
      value: cspHeader,
      directives,
      hasUnsafeInline: cspHeader.includes("'unsafe-inline'"),
      hasUnsafeEval: cspHeader.includes("'unsafe-eval'")
    };
  } else {
    analysis.csp = { present: false, directives: [] };
  }
  
  // Analyze other headers
  analysis.xFrameOptions = headers['x-frame-options'];
  analysis.xContentTypeOptions = headers['x-content-type-options'];
  analysis.xXSSProtection = headers['x-xss-protection'];
  analysis.referrerPolicy = headers['referrer-policy'];
  analysis.permissionsPolicy = headers['permissions-policy'] || headers['feature-policy'];
  
  // Analyze Expect-CT
  const expectCTHeader = headers['expect-ct'];
  if (expectCTHeader) {
    analysis.expectCT = {
      present: true,
      value: expectCTHeader,
      maxAge: extractMaxAge(expectCTHeader),
      enforce: expectCTHeader.toLowerCase().includes('enforce'),
      reportUri: extractReportUri(expectCTHeader)
    };
  } else {
    analysis.expectCT = { present: false };
  }
  
  // Cross-Origin headers
  analysis.crossOriginEmbedderPolicy = headers['cross-origin-embedder-policy'];
  analysis.crossOriginOpenerPolicy = headers['cross-origin-opener-policy'];
  analysis.crossOriginResourcePolicy = headers['cross-origin-resource-policy'];
  
  return analysis;
}

function calculateSecurityScore(analysis: SecurityHeadersAnalysis): { score: number; grade: string } {
  let score = 100;
  
  // HSTS (20 points)
  if (!analysis.hsts?.present) {
    score -= 20;
  } else {
    if (!analysis.hsts.maxAge || analysis.hsts.maxAge < 31536000) score -= 5; // Less than 1 year
    if (!analysis.hsts.includeSubDomains) score -= 3;
    if (!analysis.hsts.preload) score -= 2;
  }
  
  // CSP (25 points)
  if (!analysis.csp?.present) {
    score -= 25;
  } else {
    if (analysis.csp.hasUnsafeInline) score -= 8;
    if (analysis.csp.hasUnsafeEval) score -= 7;
    if (analysis.csp.directives.length < 3) score -= 5; // Very basic CSP
  }
  
  // X-Frame-Options (15 points)
  if (!analysis.xFrameOptions) {
    score -= 15;
  } else if (analysis.xFrameOptions.toLowerCase() === 'allowall') {
    score -= 10;
  }
  
  // X-Content-Type-Options (10 points)
  if (!analysis.xContentTypeOptions || analysis.xContentTypeOptions.toLowerCase() !== 'nosniff') {
    score -= 10;
  }
  
  // X-XSS-Protection (10 points)
  if (!analysis.xXSSProtection) {
    score -= 10;
  } else if (analysis.xXSSProtection === '0') {
    score -= 5;
  }
  
  // Referrer Policy (8 points)
  if (!analysis.referrerPolicy) {
    score -= 8;
  } else {
    const weakPolicies = ['unsafe-url', 'no-referrer-when-downgrade'];
    if (weakPolicies.includes(analysis.referrerPolicy.toLowerCase())) {
      score -= 4;
    }
  }
  
  // Cross-Origin policies (12 points total)
  if (!analysis.crossOriginEmbedderPolicy) score -= 4;
  if (!analysis.crossOriginOpenerPolicy) score -= 4;
  if (!analysis.crossOriginResourcePolicy) score -= 4;
  
  score = Math.max(0, score);
  
  // Calculate grade
  let grade = 'F';
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 65) grade = 'C';
  else if (score >= 50) grade = 'D';
  
  return { score, grade };
}

function identifyIssues(analysis: SecurityHeadersAnalysis): { 
  missingHeaders: string[]; 
  weakHeaders: string[] 
} {
  const missingHeaders: string[] = [];
  const weakHeaders: string[] = [];
  
  // Check for missing headers
  if (!analysis.hsts?.present) missingHeaders.push('Strict-Transport-Security');
  if (!analysis.csp?.present) missingHeaders.push('Content-Security-Policy');
  if (!analysis.xFrameOptions) missingHeaders.push('X-Frame-Options');
  if (!analysis.xContentTypeOptions) missingHeaders.push('X-Content-Type-Options');
  if (!analysis.xXSSProtection) missingHeaders.push('X-XSS-Protection');
  if (!analysis.referrerPolicy) missingHeaders.push('Referrer-Policy');
  if (!analysis.crossOriginEmbedderPolicy) missingHeaders.push('Cross-Origin-Embedder-Policy');
  if (!analysis.crossOriginOpenerPolicy) missingHeaders.push('Cross-Origin-Opener-Policy');
  if (!analysis.crossOriginResourcePolicy) missingHeaders.push('Cross-Origin-Resource-Policy');
  
  // Check for weak configurations
  if (analysis.hsts?.present && (!analysis.hsts.maxAge || analysis.hsts.maxAge < 31536000)) {
    weakHeaders.push('HSTS max-age is less than 1 year');
  }
  
  if (analysis.csp?.present) {
    if (analysis.csp.hasUnsafeInline) weakHeaders.push("CSP allows 'unsafe-inline'");
    if (analysis.csp.hasUnsafeEval) weakHeaders.push("CSP allows 'unsafe-eval'");
  }
  
  if (analysis.xFrameOptions === 'ALLOWALL') {
    weakHeaders.push('X-Frame-Options set to ALLOWALL');
  }
  
  if (analysis.xXSSProtection === '0') {
    weakHeaders.push('X-XSS-Protection disabled');
  }
  
  return { missingHeaders, weakHeaders };
}

function extractMaxAge(headerValue: string): number | undefined {
  const match = headerValue.match(/max-age=(\d+)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractReportUri(headerValue: string): string | undefined {
  const match = headerValue.match(/report-uri="([^"]+)"/i);
  return match ? match[1] : undefined;
}