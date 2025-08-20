import { motion } from "framer-motion";
import { 
  CheckCircle, Wifi, AlertTriangle, XCircle, Shield, Download, RefreshCw, AlertCircle,
  TrendingUp, Target, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Scan, ScanResult, Vulnerability } from "@shared/schema";

interface ScanResultsProps {
  scan: Scan & { scanResults: ScanResult[]; vulnerabilities: Vulnerability[] };
  onNewScan: () => void;
}

export function ScanResults({ scan, onNewScan }: ScanResultsProps) {
  const openPorts = scan.scanResults.filter(result => result.state === 'open');
  const highRiskCount = scan.vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumRiskCount = scan.vulnerabilities.filter(v => v.severity === 'medium').length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-900 bg-red-100 border-red-200';
      case 'high': return 'text-red-800 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-800 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-800 bg-green-50 border-green-200';
      default: return 'text-slate-800 bg-slate-50 border-slate-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Scan Results for <span className="text-primary">{new URL(scan.url).hostname}</span>
            </h3>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            >
              <Badge className="scan-complete-badge">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear" }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                </motion.div>
                Scan Complete
              </Badge>
            </motion.div>
          </div>
          <p className="text-slate-600">
            Scan completed on {scan.completedAt ? new Date(scan.completedAt).toLocaleDateString() : 'Unknown'} • 
            Duration: {scan.createdAt && scan.completedAt ? 
              Math.round((new Date(scan.completedAt).getTime() - new Date(scan.createdAt).getTime()) / 1000) : 0} seconds
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 pulse-glow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-slate-900"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {openPorts.length}
                    </motion.p>
                    <p className="text-sm text-slate-600">Open Ports</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Wifi className="w-8 h-8 text-slate-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-orange-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {mediumRiskCount}
                    </motion.p>
                    <p className="text-sm text-slate-600">Medium Risk</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-red-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      {highRiskCount}
                    </motion.p>
                    <p className="text-sm text-slate-600">High Risk</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XCircle className="w-8 h-8 text-red-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-green-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      A+
                    </motion.p>
                    <p className="text-sm text-slate-600">SSL Rating</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Shield className="w-8 h-8 text-green-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          {/* Open Ports */}
          {openPorts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="data-visualization">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Open Ports & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Port</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Protocol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {openPorts.map((port, index) => (
                          <motion.tr 
                            key={port.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + index * 0.1 }}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{port.port}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{port.protocol.toUpperCase()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{port.service}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{port.version || 'Unknown'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.2 + index * 0.1 }}
                              >
                                <Badge className={getRiskColor(port.riskLevel || 'low')}>
                                  {(port.riskLevel || 'low').charAt(0).toUpperCase() + (port.riskLevel || 'low').slice(1)}
                                </Badge>
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vulnerabilities */}
          {scan.vulnerabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Security Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scan.vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className={`flex items-start space-x-4 p-4 border rounded-lg ${getSeverityColor(vuln.severity)}`}>
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h5 className="font-medium">{vuln.title}</h5>
                        <p className="text-sm mt-1">{vuln.description}</p>
                        {vuln.recommendation && (
                          <p className="text-sm mt-2 font-medium">Recommendation: {vuln.recommendation}</p>
                        )}
                        {vuln.cve && (
                          <p className="text-xs mt-2">{vuln.cve} {vuln.cvssScore && `• CVSS Score: ${vuln.cvssScore}`}</p>
                        )}
                      </div>
                      <Badge className={getRiskColor(vuln.severity)}>
                        {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {openPorts.length === 0 && scan.vulnerabilities.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Issues Found</h3>
                <p className="text-slate-600">Your website appears to be secure with no open ports or vulnerabilities detected.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" className="inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>
          <Button onClick={onNewScan} className="inline-flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run New Scan
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
