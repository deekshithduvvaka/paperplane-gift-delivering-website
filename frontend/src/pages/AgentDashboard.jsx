import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle, 
  Image as ImageIcon,
  Loader2,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import Modal from '../components/Modal';

export default function AgentDashboard() {
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' (Created/Picked Up/Out for Delivery) or 'completed' (Delivered/Failed)

  // Modals state
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isFailOpen, setIsFailOpen] = useState(false);

  // Form states
  const [statusNotes, setStatusNotes] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Failure form states
  const [failReason, setFailReason] = useState('Address Not Found');
  const [failNotes, setFailNotes] = useState('');
  const [failRetryDate, setFailRetryDate] = useState('');

  useEffect(() => {
    fetchAssignedDeliveries();
  }, [filter]);

  const fetchAssignedDeliveries = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/dispatches');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch deliveries');

      const all = data.dispatches || [];
      if (filter === 'active') {
        setDispatches(all.filter(d => ['Created', 'Picked Up', 'Out For Delivery'].includes(d.status)));
      } else {
        setDispatches(all.filter(d => ['Delivered', 'Failed'].includes(d.status)));
      }
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getNextStatusLabel = (status) => {
    if (status === 'Created') return 'Mark as Picked Up';
    if (status === 'Picked Up') return 'Mark as Out For Delivery';
    if (status === 'Out For Delivery') return 'Complete Delivery';
    return null;
  };

  const handleStatusAdvance = async (dispatch) => {
    // If next is Delivered, open the upload verification modal
    if (dispatch.status === 'Out For Delivery') {
      setSelectedDispatch(dispatch);
      setIsUpdateOpen(true);
      return;
    }

    const nextStatusMap = {
      'Created': 'Picked Up',
      'Picked Up': 'Out For Delivery'
    };
    const nextStatus = nextStatusMap[dispatch.status];

    setLoading(true);
    try {
      const response = await apiFetch(`/api/dispatches/${dispatch.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: nextStatus,
          notes: `Status advanced to ${nextStatus} by Agent.`
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to advance status');
      
      addToast(`Status advanced to '${nextStatus}'!`, 'success');
      fetchAssignedDeliveries();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle image attachment and validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type (JPG/PNG)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      addToast('Invalid file format. Only JPG and PNG images are allowed.', 'error');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File too large. Maximum size is 5MB.', 'error');
      return;
    }

    setUploadFile(file);
    
    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit delivery success
  const handleSubmitDelivered = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Proof of delivery photo is required.', 'error');
      return;
    }

    setUpdatingStatus(true);
    try {
      const formData = new FormData();
      formData.append('status', 'Delivered');
      formData.append('notes', statusNotes || 'Gift successfully delivered.');
      formData.append('proof_photo', uploadFile);

      const response = await apiFetch(`/api/dispatches/${selectedDispatch.id}/status`, {
        method: 'PUT',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to update status');

      addToast('Delivery completed successfully!', 'success');
      setIsUpdateOpen(false);
      setUploadFile(null);
      setImagePreview('');
      setStatusNotes('');
      fetchAssignedDeliveries();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Submit delivery failure
  const handleSubmitFailed = async (e) => {
    e.preventDefault();
    if (!failReason) {
      addToast('Please select a failure reason.', 'error');
      return;
    }

    if (failRetryDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      if (new Date(failRetryDate) <= today) {
        addToast('Retry date must be a future date.', 'error');
        return;
      }
    }

    setUpdatingStatus(true);
    try {
      const response = await apiFetch(`/api/dispatches/${selectedDispatch.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Failed',
          reason: failReason,
          notes: failNotes,
          retry_date: failRetryDate || null
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to log delivery failure');

      addToast('Delivery failure logged successfully.', 'warning');
      setIsFailOpen(false);
      setFailNotes('');
      setFailRetryDate('');
      fetchAssignedDeliveries();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Created': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      'Picked Up': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
      'Out For Delivery': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
      'Delivered': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      'Failed': 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
    };
    return badges[status] || 'bg-slate-100';
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto space-y-6 px-1">
      {/* Welcome Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-850 dark:text-slate-100">Welcome, {user.name}</h2>
        <p className="text-xs text-slate-400">Manage your active gift routes and log completions</p>
      </div>

      {/* Tab Selectors */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'active'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-850 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Active Routes
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-850 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          History Logs
        </button>
      </div>

      {/* List Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            <p className="text-xs text-slate-400 mt-2">Loading deliveries...</p>
          </div>
        ) : dispatches.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Truck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-400">No {filter} deliveries assigned to you.</p>
          </div>
        ) : (
          dispatches.map((d) => (
            <div
              key={d.id}
              className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl shadow-sm space-y-4 relative"
            >
              {/* Top row */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">{d.order_id}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    Scheduled: {d.scheduled_date}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${getStatusBadge(d.status)}`}>
                  {d.status}
                </span>
              </div>

              {/* Recipient details */}
              <div className="space-y-1 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.recipient_name}</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400 leading-normal flex items-start gap-1">
                  <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                  {d.delivery_address}
                </p>
              </div>

              {/* Notes */}
              {d.notes && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-brand-50/20 dark:bg-slate-900/40 p-2.5 rounded-lg border border-brand-100/30 dark:border-slate-800/20">
                  <strong>Notes:</strong> {d.notes}
                </div>
              )}

              {/* Actions row */}
              {filter === 'active' && (
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  
                  {/* Mark Failure Button (only when out for delivery) */}
                  {d.status === 'Out For Delivery' && (
                    <button
                      onClick={() => {
                        setSelectedDispatch(d);
                        setIsFailOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-450 font-bold text-xs px-3 py-2 rounded-xl transition-all active:scale-95 shrink-0"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Fail
                    </button>
                  )}

                  {/* Status Progression Button */}
                  <button
                    onClick={() => handleStatusAdvance(d)}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-md shadow-brand-500/5"
                  >
                    {getNextStatusLabel(d.status)}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Proof of Delivery Photo & Note Upload Modal */}
      <Modal isOpen={isUpdateOpen} onClose={() => { setIsUpdateOpen(false); setUploadFile(null); setImagePreview(''); }} title="Complete Delivery Verification" size="sm">
        <form onSubmit={handleSubmitDelivered} className="space-y-4">
          
          {/* File input and design */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Upload Proof Photo <span className="text-rose-500">*</span>
            </label>
            
            {imagePreview ? (
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center bg-slate-50 dark:bg-slate-950 group">
                <img
                  src={imagePreview}
                  alt="Proof Preview"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => { setUploadFile(null); setImagePreview(''); }}
                  className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-900 transition-all rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/30">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <span className="block text-xs font-bold text-slate-600 dark:text-slate-400">Click or Drag Image here</span>
                <span className="block text-[10px] text-slate-400 mt-1 uppercase tracking-wider">JPG, PNG up to 5MB</span>
              </div>
            )}
          </div>

          {/* Delivery Note input */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Delivery Notes</label>
            <input
              type="text"
              placeholder="e.g. Left package at front porch under mat."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => { setIsUpdateOpen(false); setUploadFile(null); setImagePreview(''); }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Confirm Delivery
            </button>
          </div>

        </form>
      </Modal>

      {/* Log Failed Attempt Modal */}
      <Modal isOpen={isFailOpen} onClose={() => { setIsFailOpen(false); setFailNotes(''); setFailRetryDate(''); }} title="Log Delivery Failure" size="sm">
        <form onSubmit={handleSubmitFailed} className="space-y-4">
          
          {/* Reason option */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Failure Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            >
              <option value="Address Not Found">Address Not Found</option>
              <option value="Recipient Unavailable">Recipient Unavailable</option>
              <option value="Rejected">Rejected</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Proposed Retry Date */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Proposed Retry Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={failRetryDate}
                onChange={(e) => setFailRetryDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">Must be a future date</span>
          </div>

          {/* Failure Notes */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Additional Notes</label>
            <textarea
              placeholder="e.g. Ring intercom but no response. Tried calling three times."
              value={failNotes}
              onChange={(e) => setFailNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => { setIsFailOpen(false); setFailNotes(''); setFailRetryDate(''); }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-rose-500/10"
            >
              {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              Log Failure Attempt
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
