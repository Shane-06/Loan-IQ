import React, { useState, useEffect } from 'react';
import { modelMetricsAPI, applicationsAPI } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { ShieldCheck, ShieldAlert, Award, FileSpreadsheet, RefreshCw, BarChart2, Calendar, FileText, Search } from 'lucide-react';
import Button from '../components/ui/Button';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const [metricsRes, healthRes, appsRes] = await Promise.all([
          modelMetricsAPI.getMetrics(),
          modelMetricsAPI.getHealth(),
          applicationsAPI.getAllHistory()
        ]);
        setMetrics(metricsRes);
        setHealth(healthRes);
        setApplications(appsRes);
      } catch (err) {
        console.error("Failed to load admin dashboard: ", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePrintReport = (app) => {
    // Open a printable window displaying a formal underwriting report
    const printWindow = window.open('', '_blank');
    const cibilStatus = app.cibil_score >= 750 ? 'Excellent' : app.cibil_score >= 650 ? 'Good' : app.cibil_score >= 550 ? 'Fair' : 'Poor';
    
    const utilization = typeof app.credit_utilization_ratio === 'number' ? app.credit_utilization_ratio : 0.3;
    const defaults = typeof app.previous_defaults === 'number' ? app.previous_defaults : 0;
    const emi = typeof app.monthly_emi === 'number' ? app.monthly_emi : 0;
    const dtiRatio = (emi + (app.loan_amount / (app.loan_term * 12))) / ((app.income_annum || 1) / 12);

    const htmlContent = `
      <html>
        <head>
          <title>Loan-IQ - Loan Underwriting Report #${app.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: 900; color: #2563eb; }
            .title { font-size: 14px; text-transform: uppercase; font-weight: 700; color: #f43f5e; text-align: right; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 12px; text-transform: uppercase; font-weight: 800; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 15px; }
            .grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 15px; }
            .item { font-size: 13px; }
            .label { font-weight: 600; color: #64748b; }
            .value { font-weight: 700; color: #0f172a; margin-top: 2px; }
            .badge { display: inline-block; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; }
            .badge-approved { background-color: #dcfce7; color: #15803d; }
            .badge-rejected { background-color: #fee2e2; color: #b91c1c; }
            .factors-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .factors-table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 12px; color: #64748b; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
            .factors-table td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Loan<span style="color: #f43f5e;">IQ</span></div>
            <div class="title">Official Underwriting Report</div>
          </div>
          
          <div class="section">
            <div class="section-title">Application Metadata</div>
            <div class="grid">
              <div class="item"><div class="label">Application ID</div><div class="value">#${app.id}</div></div>
              <div class="item"><div class="label">Date Created</div><div class="value">${new Date(app.created_at).toLocaleString()}</div></div>
              <div class="item"><div class="label">Applicant User ID</div><div class="value">#${app.user_id}</div></div>
              <div class="item">
                <div class="label">Underwriting Decision</div>
                <div class="value" style="margin-top: 5px;">
                  <span class="badge ${app.prediction_result === 1 ? 'badge-approved' : 'badge-rejected'}">
                    ${app.prediction_result === 1 ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Borrower Risk Metrics</div>
            <div class="grid">
              <div class="item"><div class="label">Bureau CIBIL Score</div><div class="value">${app.cibil_score} (${cibilStatus})</div></div>
              <div class="item"><div class="label">Annual Income</div><div class="value">INR ${app.income_annum.toLocaleString()}</div></div>
              <div class="item"><div class="label">Requested Loan Amount</div><div class="value">INR ${app.loan_amount.toLocaleString()}</div></div>
              <div class="item"><div class="label">Loan Term</div><div class="value">${app.loan_term} Years</div></div>
              <div class="item"><div class="label">Credit Utilization Ratio</div><div class="value">${(utilization * 100).toFixed(1)}%</div></div>
              <div class="item"><div class="label">Previous Defaults</div><div class="value">${defaults}</div></div>
              <div class="item"><div class="label">Monthly Existing EMI</div><div class="value">INR ${emi.toLocaleString()}</div></div>
              <div class="item"><div class="label">Calculated Debt-to-Income (DTI)</div><div class="value">${(dtiRatio * 100).toFixed(1)}%</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Asset Liquidity Ratios</div>
            <div class="grid">
              <div class="item"><div class="label">Residential Assets</div><div class="value">INR ${app.residential_assets_value.toLocaleString()}</div></div>
              <div class="item"><div class="label">Commercial Assets</div><div class="value">INR ${app.commercial_assets_value.toLocaleString()}</div></div>
              <div class="item"><div class="label">Luxury Assets</div><div class="value">INR ${app.luxury_assets_value.toLocaleString()}</div></div>
              <div class="item"><div class="label">Bank Cash/Bonds</div><div class="value">INR ${app.bank_asset_value.toLocaleString()}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Explainable AI (Decision Weight Contributions)</div>
            <table class="factors-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Decision Factor</th>
                  <th>Reported Value</th>
                  <th>Model Weight %</th>
                </tr>
              </thead>
              <tbody>
                ${app.explanation_data?.slice(0, 5).map((fact, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${fact.feature.replace(/_/g, ' ').toUpperCase()}</strong></td>
                    <td>${fact.value.toLocaleString()}</td>
                    <td>${fact.importance_pct}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Loan-IQ Decision Core. Cryptographically Signed Token Session. All prediction logs are archived.
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-mesh flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-hdfc-blue border-t-transparent"></div>
        <p className="text-sm font-semibold text-hdfc-gray-300 dark:text-slate-400">Loading model health parameters...</p>
      </div>
    );
  }

  // Filter application rows
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.id.toString().includes(searchQuery) ||
      app.user_id.toString().includes(searchQuery) ||
      app.cibil_score.toString().includes(searchQuery);
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'approved') return matchesSearch && app.prediction_result === 1;
    if (statusFilter === 'rejected') return matchesSearch && app.prediction_result === 0;
    
    return matchesSearch;
  });

  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)] p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-hdfc-gray-900 dark:text-white tracking-tight leading-none">
              Model Control & Health Workspace
            </h2>
            <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 mt-1">
              Verify Random Forest pipeline constraints, check for fitting boundaries, and print formal underwriting folders
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1.5">
            <RefreshCw size={14} /> Reload Workspace
          </Button>
        </div>

        {/* Health Status banner */}
        {health && (
          <Card className={`border shadow-sm ${
            health.status === 'HEALTHY' 
              ? 'border-green-300/40 bg-green-500/5 dark:border-green-900/30' 
              : 'border-yellow-300/40 bg-yellow-500/5 dark:border-yellow-900/30'
          }`}>
            <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  health.status === 'HEALTHY' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {health.status === 'HEALTHY' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                  <h4 className={`text-md font-bold leading-none ${
                    health.status === 'HEALTHY' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    AI Pipeline Status: {health.status}
                  </h4>
                  <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                    {health.issues.length === 0 
                      ? "Random Forest hyperparameter thresholds align within healthy training ranges. No severe overfitting gap or underfitting detected."
                      : `Alert flagged during runtime: ${health.issues.join(', ')}. Check parameter spreads.`
                    }
                  </p>
                </div>
              </div>
              
              {health.issues.length > 0 && (
                <div className="flex flex-col gap-2 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-yellow-200 dark:border-yellow-900 text-xxs leading-relaxed font-mono w-full md:w-80">
                  <span className="font-bold text-yellow-600 dark:text-yellow-500">Pipeline Recommendations:</span>
                  <span>- Reduce tree depth bounds</span>
                  <span>- Increase leaf nodes criteria</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Model Accuracy Statistics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="border border-white/50 dark:border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-hdfc-blue/10 text-hdfc-blue dark:text-hdfc-blue-glow rounded-xl">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                    Test Set Accuracy
                  </p>
                  <h3 className="text-2xl font-extrabold text-hdfc-gray-900 dark:text-white leading-none">
                    {(metrics.evaluation_metrics.accuracy * 100).toFixed(2)}%
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/50 dark:border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                    Test ROC-AUC
                  </p>
                  <h3 className="text-2xl font-extrabold text-hdfc-gray-900 dark:text-white leading-none">
                    {metrics.evaluation_metrics.roc_auc.toFixed(4)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/50 dark:border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                    CV Mean Score
                  </p>
                  <h3 className="text-2xl font-extrabold text-hdfc-gray-900 dark:text-white leading-none">
                    {(metrics.evaluation_metrics.cv_mean * 100).toFixed(2)}%
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/50 dark:border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                    Model Version Date
                  </p>
                  <h3 className="text-md font-extrabold text-hdfc-gray-900 dark:text-white leading-none truncate w-36 mt-1">
                    {metrics.timestamp}
                  </h3>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* Application History Log List */}
        <Card className="border border-white/50 dark:border-white/5 shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>System Audit Trails</CardTitle>
              <CardDescription>Search and print all loan decisions generated by our AI cores</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hdfc-gray-300 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="ID, User, CIBIL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-xl bg-white dark:bg-slate-900 border-hdfc-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-hdfc-blue focus:border-transparent transition-all w-full sm:w-48"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 border-hdfc-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-hdfc-blue transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-xs text-hdfc-gray-300 dark:text-slate-400">
                No underwriting files found matching the search criteria.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-hdfc-gray-50/50 dark:bg-slate-800/20 text-xxs font-bold text-hdfc-gray-300 dark:text-slate-400 uppercase border-b border-hdfc-gray-100 dark:border-slate-800">
                    <th className="py-4 px-6">App ID</th>
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">CIBIL Score</th>
                    <th className="py-4 px-6">Income</th>
                    <th className="py-4 px-6">Loan Amt</th>
                    <th className="py-4 px-6">Prob</th>
                    <th className="py-4 px-6">Decision</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hdfc-gray-100 dark:divide-slate-800 text-xs">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-hdfc-gray-100/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 px-6 font-semibold">#{app.id}</td>
                      <td className="py-4 px-6">#{app.user_id}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold">{app.cibil_score}</span>
                      </td>
                      <td className="py-4 px-6">INR {app.income_annum.toLocaleString()}</td>
                      <td className="py-4 px-6 font-medium">INR {app.loan_amount.toLocaleString()}</td>
                      <td className="py-4 px-6">{(app.approval_probability * 100).toFixed(1)}%</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.prediction_result === 1 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {app.loan_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1.5 ml-auto text-xxs font-bold text-hdfc-blue dark:text-hdfc-blue-glow"
                          onClick={() => handlePrintReport(app)}
                        >
                          <FileText size={12} /> Print Folder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;
