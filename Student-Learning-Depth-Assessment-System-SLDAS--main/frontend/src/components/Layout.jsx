import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  ChevronDown,
  PieChart,
  ShieldCheck,
  Moon,
  Sun,
  Users
} from 'lucide-react';

const Sidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
  const menuItems = user?.role === 'admin' ? [
    { name: 'User Management', icon: Users, path: '/system-admin' },
  ] : user?.role === 'faculty' ? [
    { name: 'Faculty Dashboard', icon: ShieldCheck, path: '/faculty' },
    { name: 'Reports', icon: PieChart, path: '/results' },
  ] : [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Analytics', icon: PieChart, path: '/results' },
  ];

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SLDAS</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
            {user?.name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || user?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Navbar = ({ user, setUser, setSidebarOpen, theme, toggleTheme }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 w-full flex items-center justify-between px-4 md:px-8 transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 relative transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || user?.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-1"></div>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children, user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 flex transition-colors">
      <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <Navbar user={user} setUser={setUser} setSidebarOpen={setSidebarOpen} theme={theme} toggleTheme={toggleTheme} />
        <main className="p-4 md:p-8 flex-1 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
