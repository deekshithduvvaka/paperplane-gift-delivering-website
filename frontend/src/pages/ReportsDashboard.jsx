import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Loader2, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Package,
  Activity
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function ReportsDashboard() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, delivered: 0, failed: 0, pending: 0 });
  const [statusDist, setStatusDist] = useState([]);
  const [agentPerf, setAgentPerf] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [token]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all reports simultaneously
      const [sumRes, distRes, perfRes] = await Promise.all([
        fetch('/api/reports/summary', { headers }),
        fetch('/api/reports/status-distribution', { headers }),
        fetch('/api/reports/agent-performance', { headers })
      ]);

      const sumData = await sumRes.json();
      const distData = await distRes.json();
      const perfData = await perfRes.json();

      if (!sumRes.ok) throw new Error(sumData.error || 'Failed to fetch summary');
      if (!distRes.ok) throw new Error(distData.error || 'Failed to fetch status distribution');
      if (!perfRes.ok) throw new Error(perfData.error || 'Failed to fetch agent performance');

      setSummary(sumData);
      setStatusDist(distData);
      setAgentPerf(perfData);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400 mt-3 font-semibold">Compiling logistics reports...</p>
      </div>
    );
  }

  // Formatting data for the Delivery Success Rate donut chart
  const successRateData = [
    { name: 'Delivered', value: summary.delivered, color: '#10b981' },
    { name: 'Failed', value: summary.failed, color: '#f43f5e' },
    { name: 'Pending', value: summary.pending, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  // Default fallback if no deliveries exist yet
  const hasData = summary.total > 0;
  const pieData = hasData ? successRateData : [{ name: 'No Data', value: 1, color: '#94a3b8' }];

  // Compute success percentage
  const successPercent = hasData 
    ? Math.round((summary.delivered / (summary.delivered + summary.failed || 1)) * 100) 
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-slate-100 font-sans">Analytics & Reports</h2>
        <p className="text-xs text-slate-400">Audit courier delivery efficiency and parcel status flows</p>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Shipments" 
          value={summary.total} 
          icon={Package} 
          color="gray"
        />
        <StatCard 
          title="Delivered Successfully" 
          value={summary.delivered} 
          icon={CheckCircle2} 
          color="green" 
          trend={`${successPercent}% success`}
        />
        <StatCard 
          title="Failed Attempts" 
          value={summary.failed} 
          icon={AlertTriangle} 
          color="red"
        />
        <StatCard 
          title="Pending Shipments" 
          value={summary.pending} 
          icon={Activity} 
          color="blue"
        />
      </div>

      {/* Charts Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Success Rate Donut Panel */}
        <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col h-[380px]">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1">Delivery Success Rate</h3>
          <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider font-semibold">Delivered vs Failed attempts ratio</p>
          
          <div className="flex-1 relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center percentage indicator */}
            {hasData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{successPercent}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Success</span>
              </div>
            )}
          </div>

          {/* Color Legend row */}
          <div className="flex justify-center gap-4 text-xs font-bold mt-2 shrink-0">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-650 dark:text-slate-400">{item.name} {hasData && `(${item.value})`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution Bar Panel */}
        <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col lg:col-span-2 h-[380px]">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1">Status Distribution</h3>
          <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider font-semibold font-sans">Number of parcels in each transit status</p>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDist} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false} 
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Parcels">
                  {statusDist.map((entry, index) => {
                    const colors = {
                      'Created': '#64748b',
                      'Picked Up': '#3b82f6',
                      'Out For Delivery': '#f59e0b',
                      'Delivered': '#10b981',
                      'Failed': '#f43f5e'
                    };
                    return <Cell key={`cell-${index}`} fill={colors[entry.status] || '#cbd5e1'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance Panel */}
        <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col lg:col-span-3 h-[380px]">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-1">Agent Performance Metrics</h3>
          <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-wider font-semibold font-sans">Shipment completion and failures grouped by courier</p>
          
          <div className="flex-1 min-h-0">
            {agentPerf.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-xs text-slate-400">No agents registered to analyze.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerf} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="agent_name" 
                    tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                  <Bar dataKey="delivered" stackId="a" fill="#10b981" name="Delivered" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#3b82f6" name="Pending" />
                  <Bar dataKey="failed" stackId="a" fill="#f43f5e" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
