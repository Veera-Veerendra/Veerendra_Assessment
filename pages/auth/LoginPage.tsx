import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { BookOpen } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('student@example.com');
    const [password, setPassword] = useState('Student@123!');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || (user?.role === Role.ADMIN ? '/admin/dashboard' : '/dashboard');

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            navigate(from, { replace: true, state: { message: 'Login successful! Welcome back.' } });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex flex-col items-center space-y-3 mb-6">
                        <div className="bg-blue-600 p-3 rounded-full text-white">
                           <BookOpen className="w-8 h-8"/>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 text-center">Welcome Back</h1>
                        <p className="text-slate-500 text-sm">Sign in to your Sandarbh account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div>
                             <label htmlFor="password"  className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 mt-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    
                     <p className="text-sm text-center text-slate-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>

                    <div className="mt-6 p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
                        <h4 className="font-bold mb-1">Demo Credentials:</h4>
                        <p><b>Student:</b> student@example.com / Student@123!</p>
                        <p><b>Admin:</b> admin@example.com / Admin@123!</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;