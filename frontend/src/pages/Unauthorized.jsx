import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized({ onBackToDashboard }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/30 shadow-lg shadow-rose-100/10">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Access Restricted</h2>
      <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
        You do not have the required permissions to view this dashboard page. Please log in with a different account.
      </p>
      <button
        onClick={onBackToDashboard}
        className="mt-6 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
      >
        Go to Home Dashboard
      </button>
    </div>
  );
}
