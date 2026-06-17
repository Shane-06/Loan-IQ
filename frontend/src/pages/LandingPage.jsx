import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Award, ChevronRight, Zap, PieChart, Landmark } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)] flex flex-col justify-between transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center flex-grow flex flex-col justify-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-hdfc-blue/10 dark:bg-hdfc-blue-glow/20 border border-hdfc-blue/20 dark:border-hdfc-blue-glow/30 text-hdfc-blue dark:text-hdfc-blue-glow text-xs font-bold tracking-wider uppercase mb-8 mx-auto animate-fade-in-up">
          <Award size={14} /> Production-Ready AI Engine
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-hdfc-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-none mb-6 animate-fade-in-up">
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-hdfc-blue to-hdfc-blue-light dark:from-hdfc-blue-glow dark:to-blue-400">Loan-IQ</span> System
        </h1>

        {/* Hero Description */}
        <p className="text-md sm:text-lg text-hdfc-gray-300 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Experience instant loan underwriting decisions powered by a custom-tuned Random Forest machine learning pipeline. 
          Get real-time feedback with explainable AI breakdowns of your CIBIL score and asset evaluations.
        </p>

        {/* Hero Call to Action */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/predict">
                <Button variant="accent" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                  Apply for Loan <ChevronRight size={18} />
                </Button>
              </Link>
              <Link to="/analytics">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Analytics
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/register">
                <Button variant="accent" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                  Get Started <ChevronRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In to Portal
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Performance Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { label: 'Model Accuracy', value: '96.26%' },
            { label: 'Decision Latency', value: '< 50ms' },
            { label: 'ROC-AUC Score', value: '0.9531' },
            { label: 'Cross-Validation Fold', value: '5-Fold' }
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center"
            >
              <span className="text-2xl sm:text-3xl font-extrabold text-hdfc-blue dark:text-hdfc-blue-glow mb-1 leading-none">
                {stat.value}
              </span>
              <span className="text-xxs font-bold text-hdfc-gray-300 dark:text-slate-400 uppercase tracking-widest mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Features Grid Section */}
      <div className="bg-white/50 dark:bg-slate-900/40 border-t border-hdfc-gray-100 dark:border-slate-800 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className="h-12 w-12 rounded-xl bg-hdfc-blue/10 dark:bg-hdfc-blue-glow/20 text-hdfc-blue dark:text-hdfc-blue-glow flex items-center justify-center shadow-inner">
                <Zap size={22} className="animate-pulse" />
              </div>
              <h3 className="text-md font-bold text-hdfc-gray-900 dark:text-white leading-tight">
                Explainable AI (XAI)
              </h3>
              <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 leading-relaxed">
                No black boxes. For each decision, view custom feature contribution breakdowns mapping out exactly how CIBIL scores and assets weighted the outcome.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className="h-12 w-12 rounded-xl bg-hdfc-red/10 dark:bg-hdfc-red/20 text-hdfc-red flex items-center justify-center shadow-inner">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-md font-bold text-hdfc-gray-900 dark:text-white leading-tight">
                Data Validation & Cleaning
              </h3>
              <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 leading-relaxed">
                Automatic detection of outlier valuations using IQR/Z-score thresholds, CIBIL range constraints, and missing value checks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shadow-inner">
                <PieChart size={22} />
              </div>
              <h3 className="text-md font-bold text-hdfc-gray-900 dark:text-white leading-tight">
                Interactive Analytics
              </h3>
              <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 leading-relaxed">
                Track approval volumes, average loan requests, term frequencies, and credit score statistics over time in responsive graphs.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xxs text-hdfc-gray-300 dark:text-slate-500 border-t border-hdfc-gray-100 dark:border-slate-800 transition-colors duration-300">
        &copy; {new Date().getFullYear()} Loan-IQ (HDFC Bank AI Engine). Secure Underwriting Platform. Authorized Access Only.
      </footer>

    </div>
  );
};

export default LandingPage;
