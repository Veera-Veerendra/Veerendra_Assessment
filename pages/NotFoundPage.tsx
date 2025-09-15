import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-br from-indigo-500 to-orange-400 p-4">
            <div className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl shadow-lg border border-white/30">
                <AlertTriangle className="text-white mx-auto h-16 w-16" />
                <h1 className="text-6xl font-bold text-white mt-4">404</h1>
                <h2 className="text-3xl font-semibold text-white mt-2">Page Not Found</h2>
                <p className="text-white/80 mt-2 max-w-sm">Oops! The page you are looking for does not exist.</p>
                <Link to="/" className="mt-8 inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition shadow-md transform hover:scale-105">
                    Go back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;