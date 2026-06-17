import React, { useState, useEffect } from 'react';
import { applicationsAPI } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Landmark, Clock, FileText, Search, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const HistoryPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await applicationsAPI.getMyHistory();
      setApplications(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load application history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
            <div class="title">Personal Underwriting Folder</div>
          </div>
          
          <div class="section">
            <div class="section-title">Application Metadata</div>
            <div class="grid">
              <div class="item"><div class="label">Application ID</div><div class="value">#${app.id}</div></div>
              <div class="item"><div class="label">Date Created</div><div class="value">${new Date(app.created_at).toLocaleString()}</div></div>
              <div class="item"><div class="label">Applicant User ID</div><div class="value">#${app.user_id}</div></div>
              <div class="item">
                <div class="label">Decision Status</div>
                <div class="value" style="margin-top: 5px;">
                  <span class="badge ${app.prediction_result === 1 ? 'badge-approved' : 'badge-rejected'}">
                    ${app.prediction_result === 1 ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Financial Details</div>
            <div class="grid">
              <div class="item"><div class="label">CIBIL Bureau Rating</div><div class="value">${app.cibil_score} (${cibilStatus})</div></div>
              <div class="item"><div class="label">Annual Income</div><div class="value">INR ${app.income_annum.toLocaleString()}</div></div>
              <div class="item"><div class="label">Requested Amount</div><div class="value">INR ${app.loan_amount.toLocaleString()}</div></div>
              <div class="item"><div class="label">Loan Term</div><div class="value">${app.loan_term} Years</div></div>
              <div class="item"><div class="label">Credit Utilization Ratio</div><div class="value">${(utilization * 100).toFixed(1)}%</div></div>
              <div class="item"><div class="label">Previous Defaults</div><div class="value">${defaults}</div></div>
              <div class="item"><div class="label">Monthly Existing EMI</div><div class="value">INR ${emi.toLocaleString()}</div></div>
              <div class="item"><div class="label">Calculated Debt-to-Income (DTI)</div><div class="value">${(dtiRatio * 100).toFixed(1)}%</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Declared Assets Value</div>
            <div class="grid">
              <div class="item"><div class="label">Residential Assets</div><div class="value">INR ${app.residential_assets_value.toLocaleString()}</div></div>
              <div class="item"><div class="label">Commercial Assets</div><div class="value">INR ${app.commercial_assets_value.toLocaleString()}</div></div>
              <div class="item"><div class="label">Luxury Assets</div><div class="value">INR ${app.luxury_assets_value.toLocaleString()}</div></div>
              <div class="item"><div class="label">Bank Deposits</div><div class="value">INR ${app.bank_asset_value.toLocaleString()}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Explainable Decision Factors</div>
            <table class="factors-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Decision Factor</th>
                  <th>Value</th>
                  <th>Relative Weight</th>
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
        <p className="text-sm font-semibold text-hdfc-gray-300 dark:text-slate-400">Loading your history folder...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-mesh flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-300/40 bg-red-500/5 text-center">
          <CardHeader className="flex flex-col items-center">
            <AlertCircle className="text-hdfc-red mb-2" size={36} />
            <CardTitle className="text-md">Failed to Load History</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="danger" size="sm" onClick={fetchHistory} className="flex items-center gap-1.5">
              <RefreshCw size={14} /> Retry Load
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredApps = applications.filter((app) => 
    app.id.toString().includes(searchQuery) ||
    app.cibil_score.toString().includes(searchQuery) ||
    app.loan_amount.toString().includes(searchQuery)
  );

  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)] p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-hdfc-gray-900 dark:text-white tracking-tight leading-none">
              Your Application History
            </h2>
            <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 mt-1">
              Browse previous submissions and access underwriter logs
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} className="flex items-center gap-1.5">
            <RefreshCw size={14} /> Refresh List
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hdfc-gray-300 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, CIBIL, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 border rounded-xl bg-white dark:bg-slate-900 border-hdfc-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-hdfc-blue focus:border-transparent transition-all w-full"
          />
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <Card className="border border-white/50 dark:border-white/5 shadow-sm text-center py-12">
            <div className="h-12 w-12 rounded-xl bg-hdfc-blue/5 text-hdfc-blue flex items-center justify-center mx-auto mb-3">
              <Clock size={24} />
            </div>
            <h4 className="text-sm font-semibold text-hdfc-gray-900 dark:text-white">No applications found</h4>
            <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
              {searchQuery ? "Try altering search inputs." : "You haven't submitted any loan applications yet."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <Card key={app.id} className="border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start pb-3">
                  <div>
                    <CardTitle className="text-md">Application #{app.id}</CardTitle>
                    <CardDescription>{new Date(app.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    app.prediction_result === 1 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {app.loan_status}
                  </span>
                </CardHeader>
                
                <CardContent className="text-xs flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 border-b border-hdfc-gray-100 dark:border-slate-800/50 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-hdfc-gray-300 dark:text-slate-500 uppercase block">CIBIL Score</span>
                      <span className="font-semibold text-sm">{app.cibil_score}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-hdfc-gray-300 dark:text-slate-500 uppercase block">Term</span>
                      <span className="font-semibold text-sm">{app.loan_term} Years</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-hdfc-gray-300 dark:text-slate-500 uppercase block">Loan Amount</span>
                      <span className="font-bold text-hdfc-blue dark:text-hdfc-blue-glow">INR {app.loan_amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-hdfc-gray-300 dark:text-slate-500 uppercase block text-right">Probability</span>
                      <span className="font-bold text-right block">{(app.approval_probability * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 flex items-center justify-center gap-1.5"
                    onClick={() => handlePrintReport(app)}
                  >
                    <FileText size={14} /> Print Formal Folder
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;
