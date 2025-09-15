import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Menu, Bell, BookOpen, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Role } from '../../types';


const Header: React.FC<{ setSidebarOpen: (open: boolean) => void; }> = ({ setSidebarOpen }) => {
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);


    return (
        <header className="relative flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-slate-700 items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
            <div className="flex items-center">
                 <button onClick={() => setSidebarOpen(true)} className="text-slate-500 dark:text-slate-300 focus:outline-none lg:hidden mr-4">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center text-lg font-bold text-slate-800 dark:text-white">
                    <BookOpen className="w-6 h-6 mr-2 text-blue-600"/>
                    <span>Sandarbh</span>
                    {isAdmin && <span className="ml-2 text-xs font-bold bg-orange-400 text-white px-2 py-0.5 rounded-full">Admin</span>}
                </div>
            </div>

            <div className="flex items-center space-x-5">
                 <button 
                    onClick={toggleTheme} 
                    className="p-1 rounded-full text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Toggle theme"
                 >
                    {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>
                <button className="p-1 rounded-full text-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white">
                    <Bell className="h-6 w-6" />
                </button>
                
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center space-x-2">
                        {user?.profilePictureUrl ? (
                            <img className="h-9 w-9 rounded-full object-cover" src={user.profilePictureUrl} alt={user.name || 'User avatar'} />
                        ) : (
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500">
                                <span className="text-sm font-medium leading-none text-white">
                                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </span>
                            </span>
                        )}
                        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
                    </button>
                    <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 z-10 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                        <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <UserIcon className="w-4 h-4 mr-2"/> Profile
                        </button>
                        <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                           <LogOut className="w-4 h-4 mr-2"/> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;