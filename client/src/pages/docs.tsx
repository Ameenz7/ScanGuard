import { motion } from "framer-motion";
import { 
  Shield, Zap, Cloud, Lock, FileText, CheckCircle, AlertTriangle, 
  Globe, Server, Database, Wifi, Target, TrendingUp, Download,
  ArrowRight, Star, Award, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function DocsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: <Wifi className="w-8 h-8 text-blue-600" />,
      title: "Real Network Port Scanning",
      description: "Advanced TCP port scanning with real network connections and service detection",
      capabilities: [
        "Scan common ports (21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995)",
        "Real-time connection testing with timeout handling",
        "Service identification and fingerprinting",
        "Port state detection (open, closed, filtered)",
        "Risk level assessment for discovered services"
      ],
      badge: "Core Feature"
    },
    {
      icon: <Lock className="w-8 h-8 text-green-600" />,
      title: "SSL/TLS Certificate Analysis",
      description: "Comprehensive SSL/TLS security analysis with certificate validation and grading",
      capabilities: [
        "Real certificate validation and expiration checking",
        "SSL grade calculation (A+ to F rating system)",
        "Protocol version analysis (TLS 1.3, 1.2, etc.)",
        "Cipher suite evaluation and security assessment",
        "HSTS (HTTP Strict Transport Security) detection",
        "Certificate authority and chain validation",
        "Key size and signature algorithm analysis"
      ],
      badge: "Security Focus"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Security Headers Scanning",
      description: "Complete HTTP security headers analysis with compliance checking",
      capabilities: [
        "HSTS (Strict-Transport-Security) header analysis",
        "Content Security Policy (CSP) evaluation",
        "X-Frame-Options clickjacking protection check",
        "X-Content-Type-Options MIME sniffing protection",
        "X-XSS-Protection cross-site scripting defense",
        "Referrer-Policy privacy protection analysis",
        "Cross-Origin policies (COEP, COOP, CORP)",
        "Permissions Policy and Expect-CT evaluation"
      ],
      badge: "Web Security"
    },
    {
      icon: <Cloud className="w-8 h-8 text-orange-600" />,
      title: "Multi-Cloud Security Analysis",
      description: "Advanced cloud provider detection and security configuration analysis",
      capabilities: [
        "AWS services detection (S3, CloudFront, ELB, API Gateway)",
        "Azure resources analysis (Web Apps, Storage, Databases)",
        "Google Cloud Platform scanning (App Engine, Cloud Run)",
        "Cloud provider identification via DNS and patterns",
        "Resource type classification and region detection",
        "Compliance framework mapping (CIS, NIST, OWASP)",
        "Cloud-specific security best practice validation"
      ],
      badge: "Cloud Native"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      title: "Vulnerability Detection",
      description: "Intelligent vulnerability identification with risk assessment and remediation",
      capabilities: [
        "Common web vulnerabilities identification",
        "Service-specific security weakness detection",
        "Risk level classification (Low, Medium, High, Critical)",
        "CVSS scoring integration for standardized assessment",
        "Detailed remediation recommendations",
        "Compliance framework mapping",
        "False positive reduction through contextual analysis"
      ],
      badge: "Risk Assessment"
    },
    {
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      title: "Professional PDF Reports",
      description: "Comprehensive security reports with executive summaries and technical details",
      capabilities: [
        "Executive summary with key findings",
        "Detailed technical analysis sections",
        "Visual charts and security metrics",
        "Color-coded risk assessments",
        "Remediation priority recommendations",
        "Compliance status reporting",
        "Professional formatting for stakeholder sharing"
      ],
      badge: "Reporting"
    }
  ];

  const scanningProcess = [
    {
      step: "1",
      title: "URL Analysis",
      description: "Parse and validate target URL, extract hostname and protocol information"
    },
    {
      step: "2", 
      title: "Port Discovery",
      description: "Perform TCP port scanning to identify open services and potential attack vectors"
    },
    {
      step: "3",
      title: "SSL/TLS Evaluation", 
      description: "Analyze certificate validity, encryption strength, and TLS configuration"
    },
    {
      step: "4",
      title: "Security Headers Check",
      description: "Examine HTTP security headers for proper implementation and configuration"
    },
    {
      step: "5",
      title: "Cloud Security Analysis",
      description: "Detect cloud providers and analyze cloud-specific security configurations"
    },
    {
      step: "6",
      title: "Vulnerability Assessment",
      description: "Correlate findings to identify security vulnerabilities and calculate risk scores"
    },
    {
      step: "7",
      title: "Report Generation",
      description: "Compile comprehensive security report with actionable recommendations"
    }
  ];

  const securityStandards = [
    {
      name: "OWASP Top 10",
      description: "Web Application Security Risks",
      coverage: "Complete"
    },
    {
      name: "CIS Controls",
      description: "Critical Security Controls", 
      coverage: "Network & Web"
    },
    {
      name: "NIST Framework",
      description: "Cybersecurity Framework",
      coverage: "Identify & Protect"
    },
    {
      name: "ISO 27001",
      description: "Information Security Management",
      coverage: "Technical Controls"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation Header */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <Shield className="w-8 h-8 text-primary mr-3" />
                <span className="text-xl font-bold text-slate-900">SecureScan</span>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <Star className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">Professional Security Platform</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Complete Security Analysis
            <br />
            <span className="text-primary">Documentation</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive security scanning platform featuring real network analysis, SSL/TLS evaluation, 
            security headers assessment, and multi-cloud security analysis with professional reporting capabilities.
          </p>
        </motion.div>

        {/* Key Features Grid */}
        <motion.div className="mb-20" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Platform Capabilities</h2>
            <p className="text-lg text-slate-600">Advanced security analysis across multiple domains</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {feature.icon}
                        <div className="ml-4">
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {feature.badge}
                      </Badge>
                    </div>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {feature.capabilities.map((capability, capIndex) => (
                        <div key={capIndex} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scanning Process */}
        <motion.div className="mb-20" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Security Scanning Process</h2>
            <p className="text-lg text-slate-600">Step-by-step comprehensive security analysis workflow</p>
          </div>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/20"></div>
            <div className="space-y-8">
              {scanningProcess.map((process, index) => (
                <motion.div
                  key={index}
                  className="relative flex items-start"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    {process.step}
                  </div>
                  <div className="ml-8 bg-white p-6 rounded-lg shadow-md border border-slate-200 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{process.title}</h3>
                    <p className="text-slate-600">{process.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Security Standards Compliance */}
        <motion.div className="mb-20" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Security Standards Compliance</h2>
            <p className="text-lg text-slate-600">Aligned with industry-leading security frameworks</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityStandards.map((standard, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-lg">{standard.name}</CardTitle>
                    <p className="text-sm text-slate-600">{standard.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-green-100 text-green-800">
                      {standard.coverage}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div className="mb-20" variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Technical Specifications</h2>
            <p className="text-lg text-slate-600">Platform architecture and technical capabilities</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Server className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Network Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Port Range:</span>
                  <span className="font-medium">21-995</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Protocols:</span>
                  <span className="font-medium">TCP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Timeout:</span>
                  <span className="font-medium">5 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Concurrent:</span>
                  <span className="font-medium">Yes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Lock className="w-8 h-8 text-primary mb-2" />
                <CardTitle>SSL/TLS Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Protocols:</span>
                  <span className="font-medium">TLS 1.0-1.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Grading:</span>
                  <span className="font-medium">A+ to F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Certificate:</span>
                  <span className="font-medium">Full Chain</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">HSTS:</span>
                  <span className="font-medium">Detected</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <Cloud className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Cloud Providers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">AWS:</span>
                  <span className="font-medium">✓ Supported</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Azure:</span>
                  <span className="font-medium">✓ Supported</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">GCP:</span>
                  <span className="font-medium">✓ Supported</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Others:</span>
                  <span className="font-medium">✓ Supported</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-white"
          variants={itemVariants}
        >
          <Zap className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Infrastructure?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start your comprehensive security analysis today with professional-grade scanning and reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100">
                <Target className="w-5 h-5 mr-2" />
                Start Security Scan
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Download className="w-5 h-5 mr-2" />
              View Sample Report
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}