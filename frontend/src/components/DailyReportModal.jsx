import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Download, Calendar, FileSpreadsheet, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { apiFetch } from '../utils/api';

export default function DailyReportModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [date, isOpen]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/reports/daily?date=${date}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch report');
      setRecords(data.records || []);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (records.length === 0) {
      addToast('No records available to export for this date.', 'warning');
      return;
    }

    const headers = [
      'Order ID',
      'Recipient Name',
      'Delivery Address',
      'Agent Assigned',
      'Scheduled Date',
      'Current Status',
      'Last Updated',
      'Notes'
    ];

    const rows = records.map(r => [
      r.order_id,
      r.recipient_name,
      r.delivery_address.replace(/"/g, '""'), // escape quotes
      r.agent_name || 'Unassigned',
      r.scheduled_date,
      r.status,
      new Date(r.last_updated).toLocaleString(),
      (r.notes || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PaperPlane_Report_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`CSV report downloaded for ${date}`, 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Daily Dispatch Report" size="lg">
      <div className="space-y-6">
        {/* Date Selector Banner */}
        <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Delivery Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleDownloadCSV}
            disabled={loading || records.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Report Preview */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Report Preview ({records.length} deliveries)
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
              <p className="text-sm text-slate-400 mt-2">Generating preview data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400">No dispatches scheduled on this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[300px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Agent</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="p-3 font-bold">{r.order_id}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{r.recipient_name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{r.agent_name || 'Unassigned'}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          r.status === 'Created' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          r.status === 'Picked Up' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                          r.status === 'Out For Delivery' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                          r.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
