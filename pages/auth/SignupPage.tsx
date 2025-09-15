import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen } from 'lucide-react';


const SignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return regex.test(password);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!validatePassword(password)) {
            setError("Password must be at least 8 characters long, with one number and one special character.");
            return;
        }
        
        setLoading(true);
        try {
            await signup({ name, email, password });
            navigate('/dashboard', { state: { message: 'Account created successfully! Welcome.' } });
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
                        <h1 className="text-2xl font-bold text-slate-800 text-center">Create an Account</h1>
                        <p className="text-slate-500 text-sm">Join the Sandarbh community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                            <label htmlFor="name"  className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                           <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>
                        <div>
                            <label htmlFor="email"  className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                            <p className="mt-1 text-xs text-slate-500">Min 8 characters, 1 number, 1 special character.</p>
                        </div>
                        <div>
                            <label htmlFor="confirm-password"  className="block text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                            <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 mt-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                     <p className="text-sm text-center text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;