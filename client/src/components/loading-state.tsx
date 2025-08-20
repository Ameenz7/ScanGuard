import { motion } from "framer-motion";

interface LoadingStateProps {
  scanTarget: string;
}

export function LoadingState({ scanTarget }: LoadingStateProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 pulse-glow">
        <div className="text-center">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <motion.div 
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Security Scan in Progress</h3>
          <p className="text-slate-600 mb-6">
            Analyzing <span className="font-medium text-slate-900">{scanTarget}</span> for security vulnerabilities...
          </p>
          
          <div className="max-w-md mx-auto">
            <motion.div 
              className="bg-slate-200 rounded-full h-3 mb-4 overflow-hidden security-grid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full relative"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 30, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute right-0 top-0 h-full w-2 bg-white/30 rounded-full"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-2"
            >
              <p className="text-sm text-slate-500">Scanning ports and analyzing security headers...</p>
              <motion.div 
                className="flex justify-center space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
