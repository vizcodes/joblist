import React from 'react';
import { LayoutDashboard, Briefcase, Settings, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const CustomNavLink = ({ to, icon: Icon, label, active }) => {
  const baseClasses = "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all";
  const activeClasses = "bg-blue-50 text-blue-600";
  const inactiveClasses = "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

  return (
    <NavLink
      to={to}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      end={to === "/"}
    >
      {Icon && <Icon size={20} />}
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3 text-blue-600">
          <Briefcase size={28} />
          <span className="text-xl font-bold tracking-tight text-slate-900">JobTrack</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="flex flex-col gap-2">
          <li><CustomNavLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} /></li>
          <li><CustomNavLink to="/jobs" icon={Briefcase} label="Applications" active={location.pathname === '/jobs'} /></li>
          <li><CustomNavLink to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} /></li>
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <a
          href="http://localhost:3001/api/auth/google"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 mb-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Connect Gmail
        </a>
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
