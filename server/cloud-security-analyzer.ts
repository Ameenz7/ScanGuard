import { URL } from 'url';
import * as dns from 'dns';
import { promisify } from 'util';
import type { InsertCloudSecurityScan } from '@shared/schema';

const dnsLookup = promisify(dns.lookup);
const dnsReverse = promisify(dns.reverse);

interface CloudProvider {
  name: string;
  patterns: RegExp[];
  ipRanges?: string[];
  detectFromDNS?: (hostname: string) => Promise<boolean>;
}

interface CloudSecurityFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  complianceFramework?: string[];
}

interface CloudResourceAnalysis {
  provider: string;
  resourceType: string;
  resourceId: string;
  region?: string;
  findings: CloudSecurityFinding[];
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Cloud provider detection patterns
const CLOUD_PROVIDERS: CloudProvider[] = [
  {
    name: 'aws',
    patterns: [
      /\.amazonaws\.com$/,
      /\.aws\.com$/,
      /.*\.elasticbeanstalk\.com$/,
      /.*\.elb\.amazonaws\.com$/,
      /.*\.s3\.amazonaws\.com$/,
      /.*\.cloudfront\.net$/,
      /.*\.execute-api\..*\.amazonaws\.com$/
    ]
  },
  {
    name: 'azure',
    patterns: [
      /\.azure\.com$/,
      /\.azurewebsites\.net$/,
      /\.windows\.net$/,
      /\.cloudapp\.net$/,
      /\.azureedge\.net$/,
      /\.azurecontainer\.io$/,
      /\.database\.windows\.net$/
    ]
  },
  {
    name: 'gcp',
    patterns: [
      /\.googleapis\.com$/,
      /\.googleusercontent\.com$/,
      /\.appspot\.com$/,
      /\.cloudfunctions\.net$/,
      /\.run\.app$/,
      /\.storage\.googleapis\.com$/,
      /.*\.googlehosted\.com$/
    ]
  },
  {
    name: 'digitalocean',
    patterns: [
      /\.digitaloceanspaces\.com$/,
      /.*\.ondigitalocean\.app$/,
      /.*\.do\.dev$/
    ]
  },
  {
    name: 'cloudflare',
    patterns: [
      /\.cloudflare\.com$/,
      /.*\.workers\.dev$/,
      /.*\.pages\.dev$/
    ]
  },
  {
    name: 'vercel',
    patterns: [
      /.*\.vercel\.app$/,
      /.*\.now\.sh$/
    ]
  },
  {
    name: 'netlify',
    patterns: [
      /.*\.netlify\.app$/,
      /.*\.netlify\.com$/
    ]
  }
];

export async function analyzeCloudSecurity(url: string, scanId: string): Promise<InsertCloudSecurityScan[]> {
  try {
    console.log(`Analyzing cloud security for ${url}`);
    
    const hostname = new URL(url).hostname;
    const cloudInfo = await detectCloudProvider(hostname);
    
    if (!cloudInfo) {
      console.log(`No cloud provider detected for ${hostname}`);
      return [];
    }
    
    console.log(`Detected cloud provider: ${cloudInfo.provider}`);
    
    const analysis = await performCloudSecurityAnalysis(cloudInfo, hostname, url);
    
    return [{
      scanId,
      cloudProvider: analysis.provider,
      resourceType: analysis.resourceType,
      resourceId: analysis.resourceId,
      region: analysis.region || null,
      configurationCheck: analysis.findings.map(f => ({
        id: f.id,
        severity: f.severity,
        title: f.title,
        description: f.description,
        complianceFramework: f.complianceFramework || []
      })),
      complianceFramework: 'CIS',
      findings: analysis.findings,
      riskLevel: analysis.riskLevel,
      remediationSteps: analysis.findings.map(f => f.recommendation),
      score: analysis.score
    }];
    
  } catch (error) {
    console.error(`Cloud security analysis failed:`, error);
    return [];
  }
}

async function detectCloudProvider(hostname: string): Promise<{ provider: string; resourceType: string } | null> {
  // Check against known patterns
  for (const provider of CLOUD_PROVIDERS) {
    for (const pattern of provider.patterns) {
      if (pattern.test(hostname)) {
        const resourceType = inferResourceType(hostname, provider.name);
        return { provider: provider.name, resourceType };
      }
    }
  }
  
  // Try DNS-based detection for cloud providers
  try {
    const ip = await dnsLookup(hostname);
    const reverseHostnames = await dnsReverse(ip.address);
    
    for (const reverseHostname of reverseHostnames) {
      for (const provider of CLOUD_PROVIDERS) {
        for (const pattern of provider.patterns) {
          if (pattern.test(reverseHostname)) {
            const resourceType = inferResourceType(reverseHostname, provider.name);
            return { provider: provider.name, resourceType };
          }
        }
      }
    }
  } catch (error) {
    // DNS lookup failed, continue with other detection methods
  }
  
  return null;
}

function inferResourceType(hostname: string, provider: string): string {
  // AWS resource type detection
  if (provider === 'aws') {
    if (hostname.includes('s3')) return 'storage';
    if (hostname.includes('elb') || hostname.includes('loadbalancer')) return 'loadbalancer';
    if (hostname.includes('rds')) return 'database';
    if (hostname.includes('cloudfront')) return 'cdn';
    if (hostname.includes('execute-api')) return 'api-gateway';
    if (hostname.includes('elasticbeanstalk')) return 'application';
    return 'compute';
  }
  
  // Azure resource type detection
  if (provider === 'azure') {
    if (hostname.includes('azurewebsites')) return 'webapp';
    if (hostname.includes('database')) return 'database';
    if (hostname.includes('storage')) return 'storage';
    if (hostname.includes('cloudapp')) return 'compute';
    if (hostname.includes('azureedge')) return 'cdn';
    return 'application';
  }
  
  // GCP resource type detection
  if (provider === 'gcp') {
    if (hostname.includes('storage')) return 'storage';
    if (hostname.includes('appspot')) return 'appengine';
    if (hostname.includes('cloudfunctions')) return 'functions';
    if (hostname.includes('run.app')) return 'cloudrun';
    return 'compute';
  }
  
  // Default to application for other providers
  return 'application';
}

async function performCloudSecurityAnalysis(
  cloudInfo: { provider: string; resourceType: string }, 
  hostname: string, 
  url: string
): Promise<CloudResourceAnalysis> {
  
  const findings: CloudSecurityFinding[] = [];
  let score = 100;
  
  // Provider-specific security checks
  switch (cloudInfo.provider) {
    case 'aws':
      findings.push(...await analyzeAWSResource(cloudInfo.resourceType, hostname, url));
      break;
    case 'azure':
      findings.push(...await analyzeAzureResource(cloudInfo.resourceType, hostname, url));
      break;
    case 'gcp':
      findings.push(...await analyzeGCPResource(cloudInfo.resourceType, hostname, url));
      break;
    default:
      findings.push(...await analyzeGenericCloudResource(cloudInfo.resourceType, hostname, url));
  }
  
  // Calculate score based on findings
  findings.forEach(finding => {
    switch (finding.severity) {
      case 'critical': score -= 25; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 10; break;
      case 'low': score -= 5; break;
    }
  });
  
  score = Math.max(0, score);
  
  // Determine overall risk level
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (criticalCount > 0) riskLevel = 'critical';
  else if (highCount > 2) riskLevel = 'high';
  else if (highCount > 0 || findings.filter(f => f.severity === 'medium').length > 3) riskLevel = 'medium';
  
  return {
    provider: cloudInfo.provider,
    resourceType: cloudInfo.resourceType,
    resourceId: hostname,
    region: extractRegion(hostname, cloudInfo.provider),
    findings,
    score,
    riskLevel
  };
}

async function analyzeAWSResource(resourceType: string, hostname: string, url: string): Promise<CloudSecurityFinding[]> {
  const findings: CloudSecurityFinding[] = [];
  
  // Check for S3 bucket security
  if (resourceType === 'storage' && hostname.includes('s3')) {
    findings.push({
      id: 'aws-s3-public-access',
      severity: 'high',
      title: 'S3 Bucket Public Access',
      description: 'S3 bucket appears to be publicly accessible via direct URL',
      recommendation: 'Review bucket policy and ACLs. Implement least privilege access and consider using CloudFront for public content.',
      complianceFramework: ['CIS', 'AWS-Foundational']
    });
  }
  
  // Check for CloudFront security headers
  if (resourceType === 'cdn' && hostname.includes('cloudfront')) {
    findings.push({
      id: 'aws-cloudfront-security-headers',
      severity: 'medium',
      title: 'CloudFront Security Headers',
      description: 'Verify that CloudFront distribution includes security headers',
      recommendation: 'Configure CloudFront to add security headers like HSTS, CSP, X-Content-Type-Options',
      complianceFramework: ['OWASP', 'CIS']
    });
  }
  
  // Check for ALB/ELB security
  if (resourceType === 'loadbalancer') {
    findings.push({
      id: 'aws-elb-ssl-policy',
      severity: 'medium',
      title: 'Load Balancer SSL Policy',
      description: 'Ensure load balancer uses strong SSL/TLS policy',
      recommendation: 'Configure ELB to use predefined security policy ELBSecurityPolicy-TLS-1-2-2017-01 or newer',
      complianceFramework: ['CIS', 'PCI-DSS']
    });
  }
  
  return findings;
}

async function analyzeAzureResource(resourceType: string, hostname: string, url: string): Promise<CloudSecurityFinding[]> {
  const findings: CloudSecurityFinding[] = [];
  
  if (resourceType === 'webapp') {
    findings.push({
      id: 'azure-webapp-https',
      severity: 'high',
      title: 'Azure Web App HTTPS Enforcement',
      description: 'Verify HTTPS-only access is enforced for Azure Web App',
      recommendation: 'Enable "HTTPS Only" setting in Azure portal and redirect HTTP to HTTPS',
      complianceFramework: ['CIS', 'Azure-Security-Benchmark']
    });
    
    findings.push({
      id: 'azure-webapp-managed-identity',
      severity: 'medium',
      title: 'Managed Identity Configuration',
      description: 'Consider using Azure Managed Identity for secure resource access',
      recommendation: 'Enable system-assigned managed identity to eliminate stored credentials',
      complianceFramework: ['Azure-Security-Benchmark']
    });
  }
  
  if (resourceType === 'storage') {
    findings.push({
      id: 'azure-storage-access',
      severity: 'high',
      title: 'Azure Storage Account Security',
      description: 'Review storage account access configuration',
      recommendation: 'Disable public blob access and use private endpoints where possible',
      complianceFramework: ['CIS', 'Azure-Security-Benchmark']
    });
  }
  
  return findings;
}

async function analyzeGCPResource(resourceType: string, hostname: string, url: string): Promise<CloudSecurityFinding[]> {
  const findings: CloudSecurityFinding[] = [];
  
  if (resourceType === 'appengine') {
    findings.push({
      id: 'gcp-appengine-security',
      severity: 'medium',
      title: 'App Engine Security Configuration',
      description: 'Review App Engine security settings and IAM policies',
      recommendation: 'Implement least privilege IAM roles and enable audit logging',
      complianceFramework: ['CIS', 'GCP-Security-Benchmark']
    });
  }
  
  if (resourceType === 'storage') {
    findings.push({
      id: 'gcp-storage-bucket-policy',
      severity: 'high',
      title: 'Cloud Storage Bucket Policy',
      description: 'Verify bucket access controls and public access prevention',
      recommendation: 'Enable uniform bucket-level access and review bucket IAM policies',
      complianceFramework: ['CIS', 'GCP-Security-Benchmark']
    });
  }
  
  if (resourceType === 'cloudrun') {
    findings.push({
      id: 'gcp-cloudrun-auth',
      severity: 'medium',
      title: 'Cloud Run Authentication',
      description: 'Ensure proper authentication is configured for Cloud Run services',
      recommendation: 'Configure IAM authentication and avoid allowing unauthenticated access',
      complianceFramework: ['GCP-Security-Benchmark']
    });
  }
  
  return findings;
}

async function analyzeGenericCloudResource(resourceType: string, hostname: string, url: string): Promise<CloudSecurityFinding[]> {
  const findings: CloudSecurityFinding[] = [];
  
  // Generic cloud security checks
  findings.push({
    id: 'cloud-https-enforcement',
    severity: 'medium',
    title: 'HTTPS Enforcement',
    description: 'Verify that HTTPS is properly enforced for cloud resources',
    recommendation: 'Configure automatic HTTPS redirect and use strong TLS configuration',
    complianceFramework: ['OWASP', 'General']
  });
  
  findings.push({
    id: 'cloud-access-logging',
    severity: 'low',
    title: 'Access Logging',
    description: 'Ensure comprehensive access logging is enabled',
    recommendation: 'Enable access logs and integrate with SIEM for monitoring',
    complianceFramework: ['General']
  });
  
  return findings;
}

function extractRegion(hostname: string, provider: string): string | undefined {
  // AWS region extraction
  if (provider === 'aws') {
    const awsRegionMatch = hostname.match(/([a-z]{2}-[a-z]+-\d)/);
    return awsRegionMatch ? awsRegionMatch[1] : undefined;
  }
  
  // Azure region extraction
  if (provider === 'azure') {
    const azureRegionMatch = hostname.match(/(eastus|westus|centralus|northeurope|westeurope|southeastasia|eastasia)/);
    return azureRegionMatch ? azureRegionMatch[1] : undefined;
  }
  
  // GCP region extraction
  if (provider === 'gcp') {
    const gcpRegionMatch = hostname.match(/(us-central1|us-east1|us-west1|europe-west1|asia-east1)/);
    return gcpRegionMatch ? gcpRegionMatch[1] : undefined;
  }
  
  return undefined;
}