import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getUsers, getFeedback, getCourses } from '../../services/mockApiService';
import { Users, MessageSquare, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-4 rounded-full mr-4">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
    const location = useLocation();
    const [stats, setStats] = useState({ users: 0, feedback: 0, courses: 0 });
    const [ratingData, setRatingData] = useState<{ name: string; averageRating: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(location.state?.message || '');

     useEffect(() => {
        if (location.state?.message) {
            window.history.replaceState({}, document.title)
             const timer = setTimeout(() => setToastMessage(''), 5000);
             return () => clearTimeout(timer);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [users, feedback, courses] = await Promise.all([getUsers(), getFeedback(), getCourses()]);
                
                setStats({ users: users.length, feedback: feedback.length, courses: courses.length });
                
                const courseRatings: { [key: string]: { total: number; count: number } } = {};
                courses.forEach(c => {
                    courseRatings[c.id] = { total: 0, count: 0 };
                });

                feedback.forEach(f => {
                    if(courseRatings[f.courseId]) {
                        courseRatings[f.courseId].total += f.rating;
                        courseRatings[f.courseId].count += 1;
                    }
                });

                const chartData = courses.map(course => ({
                    name: course.name.length > 15 ? course.name.substring(0,15) + '...' : course.name,
                    averageRating: courseRatings[course.id].count > 0 ? parseFloat((courseRatings[course.id].total / courseRatings[course.id].count).toFixed(2)) : 0,
                }));
                
                setRatingData(chartData);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
         <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Students" value={stats.users} icon={Users} />
                <StatCard title="Total Feedback" value={stats.feedback} icon={MessageSquare} />
                <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Average Rating per Course</h2>
                <div style={{ width: '100%', height: 400 }}>
                     <ResponsiveContainer>
                        <BarChart data={ratingData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700"/>
                            <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 5]} stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                    borderColor: 'rgba(51, 65, 85, 1)',
                                    color: '#f1f5f9',
                                    borderRadius: '0.75rem' 
                                }}
                                cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar dataKey="averageRating" name="Average Rating" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;