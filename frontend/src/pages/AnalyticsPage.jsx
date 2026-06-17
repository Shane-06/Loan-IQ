import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Landmark, TrendingUp, Users, Calendar, Award, AlertCircle, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import Button from '../components/ui/Button';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await analyticsAPI.getAnalytics();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to retrieve analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-mesh flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-hdfc-blue border-t-transparent"></div>
        <p className="text-sm font-semibold text-hdfc-gray-300 dark:text-slate-400">Aggregating portfolio statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-mesh flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-300/40 bg-red-500/5 text-center">
          <CardHeader className="flex flex-col items-center">
            <AlertCircle className="text-hdfc-red mb-2" size={36} />
            <CardTitle className="text-md">Analytics Load Failure</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="danger" size="sm" onClick={fetchAnalytics} className="flex items-center gap-1.5">
              <RefreshCw size={14} /> Retry Load
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (val) => {
    if (val >= 10000000) return `INR ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `INR ${(val / 100000).toFixed(2)} L`;
    return `INR ${val.toLocaleString()}`;
  };

  // Pie chart colors
  const approvalPieData = [
    { name: 'Approved', value: data.approved_applications },
    { name: 'Rejected', value: data.rejected_applications },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  // Educational map rates
  const educationChartData = Object.entries(data.approval_by_education).map(([edu, rate]) => ({
    category: edu === 'graduate' ? 'Graduate' : 'Undergraduate',
    'Approval Rate': parseFloat((rate * 100).toFixed(1)),
  }));

  // Employment map rates
  const employmentChartData = Object.entries(data.approval_by_employment).map(([emp, rate]) => ({
    category: emp === 'yes' ? 'Self Employed' : 'Salaried Professional',
    'Approval Rate': parseFloat((rate * 100).toFixed(1)),
  }));

  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)] p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-hdfc-gray-900 dark:text-white tracking-tight leading-none">
              Portfolio Analytics Dashboard
            </h2>
            <p className="text-xs text-hdfc-gray-300 dark:text-slate-400 mt-1">
              Consolidated real-time analytics mapping risk indices, approval metrics, and credit spreads
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="flex items-center gap-1.5">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card className="border border-white/50 dark:border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-hdfc-blue/10 text-hdfc-blue dark:text-hdfc-blue-glow rounded-xl">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                  Total Submissions
                </p>
                <h3 className="text-2xl font-extrabold text-hdfc-gray-900 dark:text-white leading-none">
                  {data.total_applications}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/50 dark:border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                  Approval Rate
                </p>
                <h3 className="text-2xl font-extrabold text-green-500 leading-none">
                  {(data.approval_rate * 100).toFixed(1)}%
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/50 dark:border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                  Avg CIBIL Rating
                </p>
                <h3 className="text-2xl font-extrabold text-hdfc-gray-900 dark:text-white leading-none">
                  {data.average_cibil_score.toFixed(0)}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/50 dark:border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] text-hdfc-gray-300 dark:text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                  Avg Request Size
                </p>
                <h3 className="text-2xl font-extrabold text-hdfc-gray-900 dark:text-white leading-none">
                  {formatCurrency(data.average_loan_amount)}
                </h3>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Charts Grid Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Approval Ratio (Pie) */}
          <Card className="col-span-1 border border-white/50 dark:border-white/5">
            <CardHeader>
              <CardTitle>Approval vs Rejection Ratio</CardTitle>
              <CardDescription>Breakdown of loan underwriting decisions</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {approvalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Applications']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Volume Trends (Area) */}
          <Card className="col-span-1 lg:col-span-2 border border-white/50 dark:border-white/5">
            <CardHeader>
              <CardTitle>Application Volume Trends</CardTitle>
              <CardDescription>Cumulative and approved files processed over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_trends}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004c8f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#004c8f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Total Applications" stroke="#004c8f" fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="approved" name="Approved Applications" stroke="#22c55e" fillOpacity={1} fill="url(#colorApproved)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Charts Grid Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CIBIL Buckets Approval Rate */}
          <Card className="border border-white/50 dark:border-white/5">
            <CardHeader>
              <CardTitle>Approval Rate by CIBIL Bracket</CardTitle>
              <CardDescription>Performance mapping across borrower credit categories</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cibil_stats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="bucket" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tickFormatter={(val) => `${val * 100}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Approval Rate']} />
                  <Bar dataKey="approval_rate" fill="#004c8f" radius={[4, 4, 0, 0]} name="Approval Rate">
                    {data.cibil_stats.map((entry, index) => {
                      let color = '#ef4444'; // poor red
                      if (entry.bucket.includes('Excellent')) color = '#22c55e'; // excellent green
                      else if (entry.bucket.includes('Good')) color = '#3b82f6'; // good blue
                      else if (entry.bucket.includes('Fair')) color = '#eab308'; // fair yellow
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Social Demographics Rates */}
          <Card className="border border-white/50 dark:border-white/5">
            <CardHeader>
              <CardTitle>Demographic Approval Spreads</CardTitle>
              <CardDescription>Approval rates compared by education level and employment type</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationChartData}>
                    <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tickFormatter={(val) => `${val}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Approval Rate']} />
                    <Bar dataKey="Approval Rate" fill="#004c8f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employmentChartData}>
                    <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tickFormatter={(val) => `${val}%`} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Approval Rate']} />
                    <Bar dataKey="Approval Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
