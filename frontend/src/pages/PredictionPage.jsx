import React, { useState } from 'react';
import { predictionAPI } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { CheckCircle2, XCircle, ChevronRight, HelpCircle, Landmark, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const PredictionPage = () => {
  const [formData, setFormData] = useState({
    no_of_dependents: 0,
    education: 'graduate',
    self_employed: 'no',
    income_annum: '',
    loan_amount: '',
    loan_term: 10,
    cibil_score: 700,
    credit_utilization_ratio: 0.3,
    previous_defaults: 0,
    monthly_emi: 10000,
    residential_assets_value: '',
    commercial_assets_value: '',
    luxury_assets_value: '',
    bank_asset_value: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    // Cast validation inputs precisely to the expected FastAPI type schemas
    const payload = {
      no_of_dependents: parseInt(formData.no_of_dependents, 10),
      education: formData.education,
      self_employed: formData.self_employed,
      income_annum: parseFloat(formData.income_annum || 0),
      loan_amount: parseFloat(formData.loan_amount || 0),
      loan_term: parseInt(formData.loan_term, 10),
      cibil_score: parseInt(formData.cibil_score, 10),
      credit_utilization_ratio: parseFloat(formData.credit_utilization_ratio || 0.3),
      previous_defaults: parseInt(formData.previous_defaults || 0, 10),
      monthly_emi: parseFloat(formData.monthly_emi || 0),
      residential_assets_value: parseFloat(formData.residential_assets_value || 0),
      commercial_assets_value: parseFloat(formData.commercial_assets_value || 0),
      luxury_assets_value: parseFloat(formData.luxury_assets_value || 0),
      bank_asset_value: parseFloat(formData.bank_asset_value || 0),
    };

    try {
      const data = await predictionAPI.predict(payload);
      setResult(data);
      // Scroll to result smoothly
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  // Human-readable feature naming map
  const featureLabelMap = {
    cibil_score: 'CIBIL Credit Score',
    loan_term: 'Loan Term',
    loan_income_ratio: 'Loan-to-Income Ratio',
    credit_strength: 'Credit Strength Metric',
    debt_risk_index: 'Debt Risk Index',
    total_assets: 'Total Assets Valuation',
    asset_to_loan_ratio: 'Asset-to-Loan Coverage',
    income_annum: 'Annual Income',
    loan_amount: 'Requested Loan Amount',
    credit_utilization_ratio: 'Credit Utilization Ratio',
    previous_defaults: 'Previous Bureau Defaults',
    monthly_emi: 'Existing Monthly EMI',
    debt_to_income_ratio: 'Debt-to-Income (DTI) Ratio',
    residential_assets_value: 'Residential Assets',
    commercial_assets_value: 'Commercial Assets',
    luxury_assets_value: 'Luxury Assets',
    bank_asset_value: 'Bank Deposits/Bonds',
    no_of_dependents: 'Dependents Count',
    education: 'Education Status',
    self_employed: 'Self Employment',
  };

  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)] p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Form Container */}
        <div className="flex-1">
          <Card className="shadow-lg border border-white/50 dark:border-white/5">
            <CardHeader className="border-b border-hdfc-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-hdfc-blue/10 text-hdfc-blue dark:text-hdfc-blue-glow rounded-xl flex items-center justify-center">
                  <Landmark size={20} />
                </div>
                <div>
                  <CardTitle>AI Loan Application Underwriter</CardTitle>
                  <CardDescription>Provide details below to calculate approval probability using our Random Forest classifier</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="mt-4">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <Info size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* 1. Core Profile */}
                <div>
                  <h4 className="text-xs font-bold text-hdfc-blue dark:text-hdfc-blue-glow uppercase tracking-wider mb-4 border-b border-hdfc-gray-100 dark:border-slate-800/50 pb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> 1. Applicant Profile & Terms
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      label="Dependents Count"
                      type="number"
                      min="0"
                      max="15"
                      value={formData.no_of_dependents}
                      onChange={(e) => handleInputChange('no_of_dependents', e.target.value)}
                      required
                    />
                    <Select
                      label="Education Status"
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      options={[
                        { label: 'Graduate', value: 'graduate' },
                        { label: 'Not Graduate', value: 'not graduate' },
                      ]}
                      required
                    />
                    <Select
                      label="Self Employed"
                      value={formData.self_employed}
                      onChange={(e) => handleInputChange('self_employed', e.target.value)}
                      options={[
                        { label: 'No (Salaried)', value: 'no' },
                        { label: 'Yes (Business Owner)', value: 'yes' },
                      ]}
                      required
                    />
                    <Input
                      label="Loan Term (Years)"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.loan_term}
                      onChange={(e) => handleInputChange('loan_term', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 2. Financial Metrics */}
                <div>
                  <h4 className="text-xs font-bold text-hdfc-blue dark:text-hdfc-blue-glow uppercase tracking-wider mb-4 border-b border-hdfc-gray-100 dark:border-slate-800/50 pb-1.5 flex items-center gap-1.5">
                    <TrendingUp size={14} /> 2. Credit Strength & Request
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Annual Income (INR)"
                      type="number"
                      min="0"
                      placeholder="e.g. 5000000"
                      value={formData.income_annum}
                      onChange={(e) => handleInputChange('income_annum', e.target.value)}
                      required
                    />
                    <Input
                      label="CIBIL Bureau Score (300-900)"
                      type="number"
                      min="300"
                      max="900"
                      placeholder="e.g. 750"
                      value={formData.cibil_score}
                      onChange={(e) => handleInputChange('cibil_score', e.target.value)}
                      required
                    />
                    <Input
                      label="Requested Loan Amount (INR)"
                      type="number"
                      min="0"
                      placeholder="e.g. 2000000"
                      value={formData.loan_amount}
                      onChange={(e) => handleInputChange('loan_amount', e.target.value)}
                      required
                    />
                    <Input
                      label="Credit Utilization Ratio (0.0 - 1.5)"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1.5"
                      placeholder="e.g. 0.30"
                      value={formData.credit_utilization_ratio}
                      onChange={(e) => handleInputChange('credit_utilization_ratio', e.target.value)}
                      required
                    />
                    <Select
                      label="Previous Bureau Defaults"
                      value={formData.previous_defaults}
                      onChange={(e) => handleInputChange('previous_defaults', e.target.value)}
                      options={[
                        { label: '0 Defaults', value: '0' },
                        { label: '1 Default', value: '1' },
                        { label: '2 Defaults', value: '2' },
                        { label: '3 Defaults', value: '3' },
                        { label: '4 Defaults', value: '4' },
                        { label: '5 Defaults', value: '5' },
                      ]}
                      required
                    />
                    <Input
                      label="Existing Monthly EMI (INR)"
                      type="number"
                      min="0"
                      placeholder="e.g. 10000"
                      value={formData.monthly_emi}
                      onChange={(e) => handleInputChange('monthly_emi', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 3. Assets Declarations */}
                <div>
                  <h4 className="text-xs font-bold text-hdfc-blue dark:text-hdfc-blue-glow uppercase tracking-wider mb-4 border-b border-hdfc-gray-100 dark:border-slate-800/50 pb-1.5 flex items-center gap-1.5">
                    <Landmark size={14} /> 3. Collateral & Asset Valuation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      label="Residential Assets"
                      type="number"
                      min="0"
                      placeholder="e.g. 4000000"
                      value={formData.residential_assets_value}
                      onChange={(e) => handleInputChange('residential_assets_value', e.target.value)}
                      required
                    />
                    <Input
                      label="Commercial Assets"
                      type="number"
                      min="0"
                      placeholder="e.g. 1500000"
                      value={formData.commercial_assets_value}
                      onChange={(e) => handleInputChange('commercial_assets_value', e.target.value)}
                      required
                    />
                    <Input
                      label="Luxury Assets"
                      type="number"
                      min="0"
                      placeholder="e.g. 2000000"
                      value={formData.luxury_assets_value}
                      onChange={(e) => handleInputChange('luxury_assets_value', e.target.value)}
                      required
                    />
                    <Input
                      label="Bank Cash & Deposits"
                      type="number"
                      min="0"
                      placeholder="e.g. 3000000"
                      value={formData.bank_asset_value}
                      onChange={(e) => handleInputChange('bank_asset_value', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-hdfc-gray-100 dark:border-slate-800/50 pt-4 mt-2">
                  <span className="text-xxs text-hdfc-gray-300 dark:text-slate-400 max-w-sm flex items-start gap-1">
                    <HelpCircle size={14} className="shrink-0 text-hdfc-blue" />
                    Completing this form logs the parameters as a secure underwriting application record.
                  </span>
                  <Button
                    type="submit"
                    variant="accent"
                    isLoading={isLoading}
                    className="flex items-center gap-2"
                  >
                    Submit Underwriting <ChevronRight size={16} />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results / Help Sidebar */}
        <div id="result-section" className="w-full lg:w-[420px] shrink-0">
          {result ? (
            <Card className={`border shadow-lg animate-fade-in-up duration-500 ${
              result.prediction_result === 1 
                ? 'border-green-300/40 bg-green-500/5 dark:border-green-900/30' 
                : 'border-red-300/40 bg-red-500/5 dark:border-red-900/30'
            }`}>
              <CardHeader className="pb-3 text-center border-b border-hdfc-gray-100 dark:border-slate-800/50 flex flex-col items-center">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-3 shadow-md ${
                  result.prediction_result === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {result.prediction_result === 1 ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                </div>
                <CardTitle className="text-lg">Loan {result.loan_status}</CardTitle>
                <CardDescription>Prediction generated by Random Forest classifier</CardDescription>
              </CardHeader>
              
              <CardContent className="mt-4 flex flex-col gap-6">
                
                {/* Gauge Probability */}
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-dashed border-hdfc-gray-200 dark:border-slate-800">
                    <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-inner">
                      <span className={`text-3xl font-extrabold leading-none ${
                        result.prediction_result === 1 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(result.approval_probability * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Approval Prob
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-hdfc-gray-100 dark:border-slate-800 text-xs text-hdfc-gray-800 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line shadow-sm">
                  {result.decision_message}
                </div>

                {/* Weight Chart (Recharts) */}
                <div>
                  <h5 className="text-xxs font-bold text-hdfc-gray-300 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Feature Contributions (Top Factors)
                  </h5>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={result.explanation.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="feature" 
                          type="category" 
                          tickFormatter={(f) => featureLabelMap[f] || f}
                          width={120}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                          formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Weight']}
                        />
                        <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                          {result.explanation.slice(0, 5).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={result.prediction_result === 1 ? '#22c55e' : '#ef4444'} 
                              fillOpacity={1 - index * 0.15} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : (
            <Card className="border shadow-md border-hdfc-gray-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
              <CardHeader className="text-center pb-2 flex flex-col items-center">
                <div className="h-12 w-12 rounded-xl bg-hdfc-blue/5 text-hdfc-blue dark:text-hdfc-blue-glow flex items-center justify-center mb-3">
                  <ShieldCheck size={24} />
                </div>
                <CardTitle className="text-md">Decision Workspace</CardTitle>
                <CardDescription>Submit the application form to evaluate model outputs</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8 text-xs text-hdfc-gray-300 dark:text-slate-400 max-w-xs mx-auto">
                Our Random Forest classifier analyzes CIBIL ratings and asset liquidity distributions to deliver instant underwriter decisions.
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default PredictionPage;
