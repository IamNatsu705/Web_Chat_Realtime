import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert, Home } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Quản lý Users', icon: Users, end: false },
    { to: '/admin/posts', label: 'Quản lý Posts', icon: FileText, end: false },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-7 h-7 text-indigo-400" />
            <div>
              <p className="text-lg font-bold text-white tracking-tight">PTIT Social</p>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 mx-4 mt-4 bg-slate-800 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-0.5">Đăng nhập với tư cách</p>
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 mt-1">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Điều hướng</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-indigo-500 transition-colors" title="Về trang chính">
              <Home className="w-5 h-5" />
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <h1 className="text-sm font-medium text-gray-600">Hệ thống quản trị</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">Đang hoạt động</span>
          </div>
        </div>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
