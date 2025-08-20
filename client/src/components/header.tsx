import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header 
      className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Shield className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-semibold text-slate-900">SecureScan</span>
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Documentation</a>
            <a href="#" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Support</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Sign In</Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
