import jsPDF from 'jspdf';
import type { Scan, ScanResult, Vulnerability, SslAnalysis, SecurityHeaders } from '@shared/schema';

export function generatePDFReport(scan: Scan & { scanResults: ScanResult[]; vulnerabilities: Vulnerability[]; sslAnalysis?: SslAnalysis; securityHeaders?: SecurityHeaders }) {
  try {
    console.log('Starting PDF generation for scan:', scan.id);
    const doc = new jsPDF();
    const hostname = new URL(scan.url).hostname;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(44, 82, 130);
  doc.text('SecureScan Security Report', 20, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Target information
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Scan Target', 20, 50);
  
  doc.setFontSize(12);
  doc.text(`URL: ${scan.url}`, 20, 60);
  doc.text(`Hostname: ${hostname}`, 20, 70);
  doc.text(`Scan Date: ${scan.completedAt ? new Date(scan.completedAt).toLocaleDateString() : 'Unknown'}`, 20, 80);
  
  const duration = scan.createdAt && scan.completedAt ? 
    Math.round((new Date(scan.completedAt).getTime() - new Date(scan.createdAt).getTime()) / 1000) : 0;
  doc.text(`Duration: ${duration} seconds`, 20, 90);
  
  // Executive Summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 20, 110);
  
  const openPorts = scan.scanResults.filter(result => result.state === 'open');
  const highRiskCount = scan.vulnerabilities.filter(v => v.severity === 'high').length;
  const mediumRiskCount = scan.vulnerabilities.filter(v => v.severity === 'medium').length;
  const lowRiskCount = scan.vulnerabilities.filter(v => v.severity === 'low').length;
  
  doc.setFontSize(12);
  let yPos = 120;
  doc.text(`• Total Open Ports: ${openPorts.length}`, 30, yPos);
  yPos += 10;
  doc.text(`• High Risk Issues: ${highRiskCount}`, 30, yPos);
  yPos += 10;
  doc.text(`• Medium Risk Issues: ${mediumRiskCount}`, 30, yPos);
  yPos += 10;
  doc.text(`• Low Risk Issues: ${lowRiskCount}`, 30, yPos);
  yPos += 20;
  
  // Open Ports Section
  if (openPorts.length > 0) {
    doc.setFontSize(16);
    doc.text('Open Ports & Services', 20, yPos);
    yPos += 15;
    
    // Create simple table manually
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Port', 25, yPos);
    doc.text('Protocol', 55, yPos);
    doc.text('Service', 85, yPos);
    doc.text('Version', 125, yPos);
    doc.text('Risk Level', 165, yPos);
    yPos += 8;
    
    // Draw header line
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    
    openPorts.forEach(port => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(port.port.toString(), 25, yPos);
      doc.text(port.protocol.toUpperCase(), 55, yPos);
      doc.text(port.service || 'Unknown', 85, yPos);
      doc.text(port.version || 'Unknown', 125, yPos);
      doc.text((port.riskLevel || 'low').charAt(0).toUpperCase() + (port.riskLevel || 'low').slice(1), 165, yPos);
      yPos += 8;
    });
    
    yPos += 10;
  }
  
  // SSL/TLS Certificate Analysis
  if (scan.sslAnalysis) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.text('SSL/TLS Certificate Analysis', 20, yPos);
    yPos += 15;
    
    // SSL Grade box
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SSL Grade:', 25, yPos);
    
    // Color-coded grade
    const gradeColor = scan.sslAnalysis.grade === 'A+' || scan.sslAnalysis.grade === 'A' ? [34, 197, 94] :
                      scan.sslAnalysis.grade === 'B' ? [234, 179, 8] :
                      scan.sslAnalysis.grade === 'C' ? [249, 115, 22] : [239, 68, 68];
    doc.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
    doc.text(scan.sslAnalysis.grade, 70, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    
    // Certificate details
    doc.text(`Certificate Valid: ${scan.sslAnalysis.certificateValid ? 'Yes' : 'No'}`, 25, yPos);
    yPos += 6;
    
    if (scan.sslAnalysis.daysUntilExpiry !== null) {
      doc.text(`Days until expiry: ${scan.sslAnalysis.daysUntilExpiry}`, 25, yPos);
      yPos += 6;
    }
    
    if (scan.sslAnalysis.keySize) {
      doc.text(`Key Size: ${scan.sslAnalysis.keySize} bits`, 25, yPos);
      yPos += 6;
    }
    
    if (scan.sslAnalysis.signatureAlgorithm) {
      doc.text(`Signature Algorithm: ${scan.sslAnalysis.signatureAlgorithm}`, 25, yPos);
      yPos += 6;
    }
    
    doc.text(`HSTS: ${scan.sslAnalysis.hasHSTS ? 'Enabled' : 'Disabled'}`, 25, yPos);
    yPos += 6;
    
    doc.text(`Security Score: ${scan.sslAnalysis.score}/100`, 25, yPos);
    yPos += 10;
    
    // SSL Vulnerabilities
    if (Array.isArray(scan.sslAnalysis.vulnerabilities) && scan.sslAnalysis.vulnerabilities.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('SSL/TLS Vulnerabilities:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
      
      scan.sslAnalysis.vulnerabilities.forEach((vuln) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${vuln}`, 30, yPos);
        yPos += 6;
      });
    }
    
    yPos += 15;
  }
  
  // Security Headers Analysis
  if (scan.securityHeaders) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Security Headers Analysis', 20, yPos);
    yPos += 15;
    
    // Security Headers Grade and Score
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Security Grade:', 25, yPos);
    
    const headerGradeColor = scan.securityHeaders.grade === 'A+' || scan.securityHeaders.grade === 'A' ? [34, 197, 94] :
                            scan.securityHeaders.grade === 'B' ? [234, 179, 8] :
                            scan.securityHeaders.grade === 'C' ? [249, 115, 22] : [239, 68, 68];
    doc.setTextColor(headerGradeColor[0], headerGradeColor[1], headerGradeColor[2]);
    doc.text(scan.securityHeaders.grade, 80, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`(${scan.securityHeaders.securityScore}/100)`, 95, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 12;
    
    // Security Headers Status
    doc.setFont('helvetica', 'bold');
    doc.text('Security Headers Status:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    
    const headers = [
      { name: 'HSTS', present: !!scan.securityHeaders.hsts },
      { name: 'Content Security Policy', present: !!scan.securityHeaders.csp },
      { name: 'X-Frame-Options', present: !!scan.securityHeaders.xFrameOptions },
      { name: 'X-Content-Type-Options', present: !!scan.securityHeaders.xContentTypeOptions },
      { name: 'Referrer-Policy', present: !!scan.securityHeaders.referrerPolicy }
    ];
    
    headers.forEach(header => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${header.name}:`, 30, yPos);
      doc.setTextColor(header.present ? 34 : 239, header.present ? 197 : 68, header.present ? 94 : 68);
      doc.text(header.present ? 'Present' : 'Missing', 120, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    });
    
    yPos += 8;
    
    // Missing Headers
    if (Array.isArray(scan.securityHeaders.missingHeaders) && scan.securityHeaders.missingHeaders.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Missing Security Headers:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
      
      scan.securityHeaders.missingHeaders.forEach((header) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${header}`, 30, yPos);
        yPos += 6;
      });
      yPos += 6;
    }
    
    // Weak Configurations
    if (Array.isArray(scan.securityHeaders.weakHeaders) && scan.securityHeaders.weakHeaders.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Weak Configurations:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
      
      scan.securityHeaders.weakHeaders.forEach((issue) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${issue}`, 30, yPos);
        yPos += 6;
      });
    }
    
    yPos += 15;
  }
  
  // Vulnerabilities
  if (scan.vulnerabilities.length > 0) {
    doc.setFontSize(16);
    doc.text('Security Vulnerabilities', 20, yPos);
    yPos += 15;
    
    scan.vulnerabilities.forEach((vuln, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${vuln.title}`, 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Severity badge
      const severityColor: [number, number, number] = vuln.severity === 'high' ? [220, 53, 69] : 
                           vuln.severity === 'medium' ? [255, 193, 7] : [40, 167, 69];
      doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.text(`Severity: ${vuln.severity.toUpperCase()}`, 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
      
      // Description
      const descriptionLines = doc.splitTextToSize(vuln.description, 170);
      doc.text(descriptionLines, 20, yPos);
      yPos += descriptionLines.length * 5 + 5;
      
      // Recommendation
      if (vuln.recommendation) {
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 5;
        const recLines = doc.splitTextToSize(vuln.recommendation, 170);
        doc.text(recLines, 20, yPos);
        yPos += recLines.length * 5 + 10;
      }
      
      // CVE information
      if (vuln.cve || vuln.cvssScore) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        if (vuln.cve) doc.text(`CVE: ${vuln.cve}`, 20, yPos);
        if (vuln.cvssScore) doc.text(`CVSS Score: ${vuln.cvssScore}`, 100, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 15;
      }
    });
  }
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by SecureScan - Professional Security Analysis', 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, 170, 285);
  }
  
    // Download the PDF
    const fileName = `SecureScan_Report_${hostname}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Saving PDF with filename:', fileName);
    doc.save(fileName);
    console.log('PDF generation completed successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Sorry, there was an error generating the PDF report. Please try again.');
  }
}