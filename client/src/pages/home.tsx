import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Wifi, Bug, Shield, Eye, FileText, Clock, 
  Lock, AlertTriangle, Search, Zap, Globe, Cpu
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScanForm } from "@/components/scan-form";
import { LoadingState } from "@/components/loading-state";
import { ScanResults } from "@/components/scan-results";
import { Card, CardContent } from "@/components/ui/card";
import type { Scan, ScanResult, Vulnerability } from "@shared/schema";

export default function Home() {
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanTarget, setScanTarget] = useState<string>("");

  const { data: scanData, isLoading } = useQuery<Scan & { scanResults: ScanResult[]; vulnerabilities: Vulnerability[] }>({
    queryKey: ["/api/scans", currentScanId],
    enabled: !!currentScanId,
    refetchInterval: (query) => {
      // Stop polling when scan is complete
      const data = query.state.data;
      return data?.status === "completed" || data?.status === "failed" ? false : 2000;
    },
  });

  const handleScanStarted = (scanId: string) => {
    setCurrentScanId(scanId);
  };

  // Update scan target when scan data changes
  useEffect(() => {
    if (scanData?.url && !scanTarget) {
      try {
        setScanTarget(new URL(scanData.url).hostname);
      } catch {
        setScanTarget(scanData.url);
      }
    }
  }, [scanData?.url, scanTarget]);

  const handleNewScan = () => {
    setCurrentScanId(null);
    setScanTarget("");
  };

  const features = [
    {
      icon: Wifi,
      title: "Port Scanning",
      description: "Identify open ports and services running on your target systems with comprehensive TCP/UDP scanning capabilities."
    },
    {
      icon: Bug,
      title: "Vulnerability Detection",
      description: "Detect common security vulnerabilities including outdated software, misconfigurations, and known CVEs."
    },
    {
      icon: Shield,
      title: "SSL/TLS Analysis",
      description: "Comprehensive SSL certificate validation, cipher suite analysis, and encryption strength assessment."
    },
    {
      icon: Eye,
      title: "Security Headers",
      description: "Analyze HTTP security headers and provide recommendations for improved web application security."
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate comprehensive PDF reports with executive summaries and technical details for stakeholders."
    },
    {
      icon: Clock,
      title: "Real-time Monitoring",
      description: "Continuous monitoring and alerts for security changes and newly discovered vulnerabilities."
    }
  ];

  const showLoadingState = currentScanId && scanData?.status === "running";
  const showResults = currentScanId && scanData?.status === "completed";

  // Professional floating icons data
  const floatingIcons = [
    { icon: Lock, delay: 0, x: "10%", y: "20%" },
    { icon: Shield, delay: 0.5, x: "85%", y: "15%" },
    { icon: AlertTriangle, delay: 1.0, x: "15%", y: "70%" },
    { icon: Search, delay: 1.5, x: "80%", y: "65%" },
    { icon: Zap, delay: 2.0, x: "50%", y: "10%" },
    { icon: Globe, delay: 2.5, x: "90%", y: "40%" },
    { icon: Cpu, delay: 3.0, x: "5%", y: "45%" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-white hero-gradient security-pattern overflow-hidden">
        {/* Professional Floating Icons */}
        {floatingIcons.map(({ icon: Icon, delay, x, y }, index) => (
          <motion.div
            key={index}
            className="absolute opacity-10 z-0 floating-icon"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ delay: delay, duration: 1 }}
          >
            <Icon className="w-8 h-8 text-primary" />
          </motion.div>
        ))}

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <motion.div
            className="absolute top-1/2 -left-20 w-60 h-60 bg-primary/3 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 20, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-8 pulse-glow"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6"
            >
              Professional Security
              <motion.span 
                className="text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {" "}Scanning Platform
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto"
            >
              Identify vulnerabilities, scan open ports, and secure your web applications with our comprehensive security analysis tools. Fast, reliable, and ethical scanning for professionals.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Link href="/docs">
                <Button variant="outline" size="lg" className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  View Documentation
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {!showLoadingState && !showResults && (
                <ScanForm onScanStarted={handleScanStarted} />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {showLoadingState && <LoadingState scanTarget={scanTarget} />}

      {/* Results */}
      {showResults && <ScanResults scan={scanData} onNewScan={handleNewScan} />}

      {/* Features Section */}
      {!showLoadingState && !showResults && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Comprehensive Security Analysis
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Our platform provides deep insights into your website's security posture with professional-grade scanning tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5, 
                    transition: { duration: 0.2 } 
                  }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 hover:border-primary/20 group">
                    <CardContent className="p-6">
                      <motion.div 
                        className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5
                        }}
                      >
                        <feature.icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
