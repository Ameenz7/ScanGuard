import { useState } from "react";
import { Globe, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScanFormProps {
  onScanStarted: (scanId: string) => void;
}

export function ScanForm({ onScanStarted }: ScanFormProps) {
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !consent) {
      toast({
        title: "Missing Information",
        description: "Please enter a URL and confirm you have permission to scan it.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest("POST", "/api/scans", { url });
      const scan = await response.json();
      
      toast({
        title: "Scan Started",
        description: "Your security scan has been initiated. Results will appear below.",
      });
      
      onScanStarted(scan.id);
      setUrl("");
      setConsent(false);
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to start scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 animated-border pulse-glow">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Start Your Security Scan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="url" className="text-sm font-medium text-slate-700 mb-2">Website URL</Label>
            <div className="relative">
              <Input 
                type="url" 
                id="url" 
                name="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 pr-12 text-lg"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">Enter the complete URL including https://</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Info className="w-5 h-5 text-primary mt-0.5" />
              </div>
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">Ethical Scanning Notice</p>
                <p>By proceeding, you confirm that you own this website or have explicit permission to scan it. Our scans are rate-limited and non-intrusive.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox 
              id="consent" 
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              required
            />
            <Label htmlFor="consent" className="text-sm text-slate-700">
              I confirm I have permission to scan this website
            </Label>
          </div>

          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 font-semibold flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>{isSubmitting ? "Starting Scan..." : "Start Security Scan"}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
