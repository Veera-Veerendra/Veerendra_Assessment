import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Role } from '../../types';
import { getUsers as getUsersApi, updateUserProfile, deleteUser as deleteUserApi } from '../../services/mockApiService';
import { ShieldCheck, ShieldOff, Trash2, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';


const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonClass?: string;
    confirmButtonText?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonClass = 'bg-red-600 hover:bg-red-700', confirmButtonText = 'Confirm' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex items-center">
                    <div className={`mr-4 p-2 rounded-full ${confirmButtonClass.replace('hover:bg', 'bg').replace('-600', '-100').replace('-700', '-100')} dark:bg-opacity-20`}>
                        <AlertTriangle className={`w-6 h-6 ${confirmButtonClass.replace('bg-', 'text-').replace('hover:bg-', 'text-')}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-md shadow-sm transition-colors ${confirmButtonClass}`}>{confirmButtonText}</button>
                </div>
            </div>
        </div>
    );
};


const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user: currentUser } = useAuth();
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        user: User | null;
        action: 'block' | 'delete' | null;
    }>({ isOpen: false, user: null, action: null });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersData = await getUsersApi();
            if (currentUser) {
                 setUsers(usersData.filter(u => u.id !== currentUser.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const openModal = (user: User, action: 'block' | 'delete') => {
        setModalState({ isOpen: true, user, action });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, user: null, action: null });
    };
    
    const handleConfirmAction = async () => {
        if (!modalState.user || !modalState.action) return;

        try {
            if (modalState.action === 'block') {
                await updateUserProfile(modalState.user.id, { isBlocked: !modalState.user.isBlocked });
            } else if (modalState.action === 'delete') {
                await deleteUserApi(modalState.user.id);
            }
            fetchUsers();
        } catch (error) {
            console.error(`Failed to ${modalState.action} user`, error);
        } finally {
            closeModal();
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const modalContent = useMemo(() => {
        if (!modalState.user || !modalState.action) {
            return { title: '', message: '', confirmButtonClass: '', confirmButtonText: '' };
        }
        
        if (modalState.action === 'block') {
            const actionText = modalState.user.isBlocked ? 'Unblock' : 'Block';
            const confirmClass = modalState.user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700';
            return {
                title: `Confirm User ${actionText}`,
                message: `Are you sure you want to ${actionText.toLowerCase()} the user "${modalState.user.name}"?`,
                confirmButtonClass: confirmClass,
                confirmButtonText: actionText,
            };
        }
        
        if (modalState.action === 'delete') {
            return {
                title: 'Confirm User Deletion',
                message: `Are you sure you want to permanently delete the user "${modalState.user.name}"? This action cannot be undone.`,
                confirmButtonClass: 'bg-red-600 hover:bg-red-700',
                confirmButtonText: 'Delete',
            };
        }

        return { title: '', message: '', confirmButtonClass: '', confirmButtonText: '' };
    }, [modalState]);


    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );


    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Users</h1>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="w-5 h-5 text-slate-400" />
                    </span>
                    <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-64 p-2 pl-10 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id} className={`${index % 2 !== 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {user.profilePictureUrl ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.profilePictureUrl} alt={user.name}/>
                                            ) : (
                                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500">
                                                    <span className="text-sm font-medium leading-none text-white">
                                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                    </span>
                                                </span>
                                            )}
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${user.role === Role.ADMIN ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => openModal(user, 'block')} className={`p-1 rounded-full transition-colors ${user.isBlocked ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50' : 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'}`} title={user.isBlocked ? 'Unblock' : 'Block'}>
                                            {user.isBlocked ? <ShieldCheck className="w-5 h-5"/> : <ShieldOff className="w-5 h-5"/>}
                                        </button>
                                        <button onClick={() => openModal(user, 'delete')} className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 p-1 rounded-full transition-colors" title="Delete"><Trash2 className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            </div>
            
            <ConfirmationModal 
                isOpen={modalState.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirmAction}
                title={modalContent.title}
                message={modalContent.message}
                confirmButtonClass={modalContent.confirmButtonClass}
                confirmButtonText={modalContent.confirmButtonText}
            />
        </div>
    );
};

export default AdminUsersPage;