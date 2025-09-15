import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { LayoutDashboard, MessageSquareText, User, BookOpen, BarChart2, Users, X, Library } from 'lucide-react';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const studentNavLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: Library, label: 'Courses' },
    { to: '/profile', icon: User, label: 'Profile' },
];

const adminNavLinks = [
    { to: '/admin/dashboard', icon: BarChart2, label: 'Dashboard' },
    { to: '/admin/feedback', icon: MessageSquareText, label: 'All Feedback' },
    { to: '/admin/users', icon: Users, label: 'Manage Students' },
    { to: '/admin/courses', icon: BookOpen, label: 'Manage Courses' },
];

const NavItem: React.FC<{ to: string, icon: React.ElementType, label: string, onClick: () => void }> = ({ to, icon: Icon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={`flex items-center px-4 py-2.5 mt-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </NavLink>
    );
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const { user } = useAuth();
    const navLinks = user?.role === Role.ADMIN ? adminNavLinks : studentNavLinks;

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col`}>
                <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800">
                    {/* Placeholder for Logo from Header */}
                    <div className="lg:w-full"></div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 px-3 py-4">
                    {navLinks.map(link => (
                         <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} onClick={() => setSidebarOpen(false)}/>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;