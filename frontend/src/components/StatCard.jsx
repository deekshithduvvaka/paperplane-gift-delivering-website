import React from 'react';

export default function StatCard({ title, value, icon: Icon, color, trend }) {
  const colorMap = {
    gray: 'from-slate-500/10 to-slate-500/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
    orange: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
    green: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
    red: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40'
  };

  const currentClass = colorMap[color] || colorMap.gray;

  return (
    <div className={`glass-card border p-6 rounded-2xl bg-gradient-to-br ${currentClass} shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold mt-1 tracking-tight text-slate-800 dark:text-slate-100">{value}</h3>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-850 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {trend}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">vs target</span>
        </div>
      )}
    </div>
  );
}
