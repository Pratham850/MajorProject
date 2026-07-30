import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    Menu,
    Bell,
    Search,
    FileText,
    LogOut,
    X,
    Sun,
    Moon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/toast';
import { useNavigation } from '@/context/NavigationContext';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { navGroups } = useNavigation();

    const handleLogout = () => {
        logout();
        toast.info('Secure session terminated successfully.', 'Logged Out');
        navigate('/login');
    };

    const handleToggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        toggleTheme();
        toast.success(`Switched to ${nextTheme} mode!`, 'Theme Preference Saved');
    };

    const navItems = navGroups.flatMap((group) => group.items);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-200 antialiased font-sans transition-colors duration-300">
            {/* Keyboard Skip Link */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-primary-600 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all text-xs"
            >
                Skip to main content
            </a>

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 transform transition-transform duration-300 ease-in-out shadow-sm dark:shadow-slate-950/20
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0
                `}
                aria-label="Sidebar Navigation"
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800/60">
                        <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-200 dark:shadow-none">
                                <FileText className="text-white w-4.5 h-4.5" />
                            </div>
                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">HealthShare</span>
                        </div>
                        {/* Mobile Sidebar Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500"
                            aria-label="Close sidebar"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
                        {navItems.map((item) => {
                            if (item.isLogout || item.path === '/logout') {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={handleLogout}
                                        className="flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                    >
                                        <item.icon className="w-5 h-5 text-rose-500" />
                                        <span className="text-xs">{item.label}</span>
                                    </button>
                                );
                            }

                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                                        isActive
                                            ? 'bg-primary-50/70 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 font-semibold'
                                    }`}
                                >
                                    <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                                    <span className="text-xs">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-50 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3.5 w-full px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all duration-200 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                        >
                            <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors" />
                            <span className="text-xs">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Layout */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800/80 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm/50 transition-colors duration-300">
                    <button
                        className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar menu"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search Field */}
                    <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800/40 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary-50 dark:focus-within:ring-primary-950/30 transition-all">
                        <Search className="text-slate-400 dark:text-slate-500 w-4 h-4 mr-2" />
                        <label htmlFor="search-input" className="sr-only">Search health records</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search health records..."
                            className="bg-transparent border-none focus:outline-none text-xs w-full text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold"
                        />
                    </div>

                    {/* Toolbar Icons & Profile */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={handleToggleTheme}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <button 
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            aria-label="View 2 unread notifications"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
                        </button>

                        <div className="flex items-center gap-3.5 border-l pl-4 border-slate-100 dark:border-slate-800">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user?.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold capitalize mt-0.5 tracking-wider">{user?.role}</p>
                            </div>
                            <div 
                                className="w-9.5 h-9.5 bg-gradient-to-tr from-primary-100 to-indigo-100 dark:from-primary-950 dark:to-indigo-950 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-black border border-primary-200/50 dark:border-primary-800 shadow-sm"
                                aria-hidden="true"
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Landmark Area */}
                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto p-4 md:p-8 focus:outline-none"
                    tabIndex={-1}
                >
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default DashboardLayout;
