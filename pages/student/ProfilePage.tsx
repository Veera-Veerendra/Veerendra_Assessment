import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/mockApiService';
import { User } from '../../types';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user, login } = useAuth(); // Re-login to update context
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: ''
    });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                address: user.address || ''
            });
            setPreview(user.profilePictureUrl || null);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage('');

        try {
            // In a real app, you'd upload the file and get a URL.
            // Here, we'll simulate it by using the FileReader preview URL.
            const updatedData: Partial<User> = {
                ...formData,
                profilePictureUrl: preview || user.profilePictureUrl,
            };
            
            await updateUserProfile(user.id, updatedData);
            
            // Re-login to refresh user context. A real app might return the updated user or a new token.
            await login({email: user.email, password: "password"}); // Using a placeholder for demo

            setMessage('Profile updated successfully!');
            setIsSuccess(true);

        } catch (error) {
            setMessage('Failed to update profile.');
            setIsSuccess(false);
            console.error(error);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };
    
    if (!user) return <div>Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Profile Settings</h1>
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl">
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            {preview ? (
                                <img className="h-24 w-24 rounded-full object-cover ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-blue-500" src={preview} alt="Profile" />
                            ) : (
                                <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-offset-2 dark:ring-offset-slate-800 ring-blue-500">
                                    <span className="text-3xl font-medium leading-none text-white">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </span>
                                </span>
                            )}
                            <div>
                                <label htmlFor="profile-picture" className="cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2">
                                    <UploadCloud className="w-5 h-5"/>
                                    <span>Change Picture</span>
                                </label>
                                <input id="profile-picture" type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">PNG or JPG. Recommended 200x200px.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email (read-only)</label>
                                <input type="email" value={user.email} readOnly className="mt-1 w-full p-2.5 border rounded-md bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="mt-1 w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 rounded-b-xl flex justify-between items-center">
                        <div>
                            {message && (
                                <div className={`flex items-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                    {isSuccess ? <CheckCircle className="w-4 h-4 mr-2"/> : <AlertCircle className="w-4 h-4 mr-2"/>}
                                    {message}
                                 </div>
                            )}
                        </div>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors transform hover:scale-105">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;