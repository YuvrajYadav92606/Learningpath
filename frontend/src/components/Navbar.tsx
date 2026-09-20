import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, Map, BarChart2, User, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

const navItems = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/dashboard', icon: BarChart2, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const { profile, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/chat" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">LearnAI</span>
          </NavLink>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-sm">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">{profile.name}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden gap-1 pb-2 overflow-x-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
