import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  Clock, 
  MapPin, 
  FileImage,
  AlertTriangle,
  History,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import Modal from '../components/Modal';
import DailyReportModal from '../components/DailyReportModal';

export default function AdminDashboard({ onNavigateToCreate }) {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [dispatches, setDispatches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search, Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Detail Modal State
  const [selectedId, setSelectedId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Daily Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Re-attempt reschedule form state
  const [retryDate, setRetryDate] = useState('');
  const [retryStatus, setRetryStatus] = useState('Created');
  const [retryNotes, setRetryNotes] = useState('');
  const [submittingRetry, setSubmittingRetry] = useState(false);

  useEffect(() => {
    fetchDispatches();
  }, [search, statusFilter, dateFilter, agentFilter, page]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setAgents(data.agents || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, [token]);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        search,
        status: statusFilter,
        scheduled_date: dateFilter,
        agent_id: agentFilter
      });

      const response = await fetch(`/api/dispatches?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to load dispatches');
      
      setDispatches(data.dispatches || []);
      setPagination(data.pagination || { totalPages: 1, total: 0 });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setSelectedId(id);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/dispatches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch details');
      setDetailData(data);
    } catch (error) {
      addToast(error.message, 'error');
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!retryDate) {
      addToast('Please select a future retry date.', 'error');
      return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(retryDate) <= today) {
      addToast('Retry date must be a future date.', 'error');
      return;
    }

    setSubmittingRetry(true);
    try {
      const response = await fetch(`/api/dispatches/${selectedId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: retryStatus,
          retry_date: retryDate,
          notes: retryNotes || 'Rescheduled retry attempt by Admin.'
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to reschedule');

      addToast('Delivery successfully rescheduled!', 'success');
      setRetryDate('');
      setRetryNotes('');
      // Reload details and main lists
      handleOpenDetail(selectedId);
      fetchDispatches();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSubmittingRetry(false);
    }
  };

  // Helper to resolve status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      'Created': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      'Picked Up': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/30',
      'Out For Delivery': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/30',
      'Delivered': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30',
      'Failed': 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-100 dark:border-rose-900/30'
    };
    return badges[status] || badges['Created'];
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Dispatches Hub</h2>
          <p className="text-xs text-slate-400">Manage, assign, and audit Paper Plane gift deliveries in real time</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 font-bold text-xs text-slate-750 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 transition-all active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Daily Report
          </button>
          <button
            onClick={onNavigateToCreate}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-xs text-white shadow-lg shadow-brand-500/10 transition-all hover:scale-105 active:scale-95"
          >
            Create Dispatch
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, recipient, address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          
          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Created">Created</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Date filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Agent filter */}
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={agentFilter}
              onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            >
              <option value="">All Agents</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {(search || statusFilter || dateFilter || agentFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setDateFilter('');
                setAgentFilter('');
                setPage(1);
                addToast('Filters cleared', 'info');
              }}
              className="text-xs font-bold text-brand-500 hover:text-brand-600 px-2 py-1"
            >
              Reset
            </button>
          )}

        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
            <p className="text-sm text-slate-400 mt-3 font-medium">Fetching dispatches...</p>
          </div>
        ) : dispatches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">No dispatches found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Recipient Name</th>
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dispatches.map((d) => (
                  <tr 
                    key={d.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all cursor-pointer group"
                    onClick={() => handleOpenDetail(d.id)}
                  >
                    <td className="p-4 pl-6 font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-brand-500 transition-colors">
                      {d.order_id}
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {d.recipient_name}
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">
                        {(d.agent_name || 'U').charAt(0)}
                      </div>
                      {d.agent_name || <span className="text-rose-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs border ${getStatusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
                      {d.scheduled_date}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(d.last_updated).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDetail(d.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:border-brand-200 dark:hover:border-brand-900/50 bg-white dark:bg-slate-900 transition-all hover:scale-105 active:scale-95"
                        aria-label="View dispatch details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page <strong className="text-slate-700 dark:text-slate-350">{page}</strong> of <strong className="text-slate-700 dark:text-slate-350">{pagination.totalPages}</strong> ({pagination.total} entries)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dispatch Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailData(null);
        }}
        title={detailData ? `Order: ${detailData.dispatch.order_id}` : 'Loading Dispatch Details...'}
        size="lg"
      >
        {loadingDetail ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
            <p className="text-sm text-slate-400 mt-3">Fetching delivery details...</p>
          </div>
        ) : detailData ? (
          <div className="space-y-6">
            {/* Header info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-500" />
                  Recipient & Destination
                </p>
                <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">{detailData.dispatch.recipient_name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{detailData.dispatch.delivery_address}</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-brand-500" />
                  Courier Assigned
                </p>
                {detailData.dispatch.agent_name ? (
                  <>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">{detailData.dispatch.agent_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{detailData.dispatch.agent_email}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">{detailData.dispatch.agent_phone}</p>
                  </>
                ) : (
                  <span className="text-sm italic text-rose-500 font-bold">Courier not assigned.</span>
                )}
              </div>
            </div>

            {/* If Failed: Show failure box and Admin Re-attempt controls */}
            {detailData.dispatch.status === 'Failed' && (
              <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-300">Delivery Attempt Failed</h4>
                    {detailData.failedAttempts && detailData.failedAttempts.length > 0 && (
                      <div className="mt-2 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                        <p><strong>Reason:</strong> {detailData.failedAttempts[0].reason}</p>
                        <p><strong>Notes:</strong> {detailData.failedAttempts[0].notes || 'No description provided'}</p>
                        <p><strong>Proposed Retry Date:</strong> {detailData.failedAttempts[0].retry_date || 'Unspecified'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reschedule Resubmission form */}
                <form onSubmit={handleReschedule} className="pt-4 border-t border-rose-200/50 dark:border-rose-900/50 space-y-3">
                  <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-widest">Reschedule / Re-Attempt Delivery</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">New Attempt Date</label>
                      <input
                        type="date"
                        value={retryDate}
                        onChange={(e) => setRetryDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Initial Status</label>
                      <select
                        value={retryStatus}
                        onChange={(e) => setRetryStatus(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
                      >
                        <option value="Created">Created (Reset to dispatch hub)</option>
                        <option value="Picked Up">Picked Up (With current agent)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Reschedule Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Scheduled re-attempt. Recipient confirmed they will be home."
                      value={retryNotes}
                      onChange={(e) => setRetryNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRetry}
                    className="flex items-center gap-1.5 bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submittingRetry ? 'Rescheduling...' : 'Re-Attempt Delivery'}
                  </button>
                </form>
              </div>
            )}

            {/* If Delivered: Show proof of delivery image */}
            {detailData.dispatch.status === 'Delivered' && detailData.proof && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileImage className="h-3.5 w-3.5 text-emerald-500" />
                  Proof of Delivery Photo
                </p>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-56 flex items-center justify-center">
                  <img
                    src={detailData.proof.image_url}
                    alt="Proof of Delivery"
                    className="max-h-56 max-w-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Uploaded at: {new Date(detailData.proof.uploaded_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Status History Logs Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <History className="h-4 w-4" />
                Transit Logs & Timeline
              </h4>
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-850">
                {detailData.history.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                      log.status === 'Created' ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500' :
                      log.status === 'Picked Up' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-900/30 text-blue-500' :
                      log.status === 'Out For Delivery' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900/30 text-amber-500' :
                      log.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900/30 text-emerald-500' :
                      'bg-rose-50 border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/30 text-rose-500'
                    }`}>
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 bg-slate-50/30 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{log.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{log.notes}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1.5 font-medium">
                        Updated by: {log.updated_by_name || 'System'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Daily CSV Report Generator Modal */}
      <DailyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
