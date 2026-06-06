import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  LogOut, 
  User, 
  Shield,
  Truck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminMenu = [
    { id: 'dashboard', name: 'Deliveries', icon: LayoutDashboard },
    { id: 'dispatch', name: 'New Dispatch', icon: PlusCircle },
    { id: 'reports', name: 'Reports', icon: BarChart3 }
  ];

  const agentMenu = [
    { id: 'dashboard', name: 'My Deliveries', icon: Truck }
  ];

  const menuItems = user.role === 'admin' ? adminMenu : agentMenu;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 transition-colors duration-300">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="bg-brand-500 text-white p-2 rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center">
          <Send className="h-5 w-5 rotate-45 transform -translate-y-0.5 translate-x-0.5" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight font-sans text-gradient">Paper Plane</h1>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block -mt-1">Logistics</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Status Profile Card */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            {user.role === 'admin' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-100">{user.name}</p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
              {user.role}
            </span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout Account
        </button>
      </div>
    </aside>
  );
}
