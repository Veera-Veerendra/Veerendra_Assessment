import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Feedback, Course } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getFeedbackForStudent, getCourses, addFeedback, updateFeedback, deleteFeedback as deleteFeedbackApi } from '../../services/mockApiService';
import { Edit, Trash2, PlusCircle, Star, MessageSquare, Book, Award, Clock, ArrowLeft, Info, CheckCircle } from 'lucide-react';

// Toast Notification Component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-5 right-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-lg rounded-lg p-4 flex items-center z-50 animate-fade-in-up">
            <CheckCircle className="text-green-500 mr-3" />
            <div>
                <p className="font-bold">Login successful</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Welcome back!</p>
            </div>
        </div>
    );
};


const StatCard: React.FC<{ title: string; value: string | number; subtitle: string; icon: React.ElementType }> = ({ title, value, subtitle, icon: Icon }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md flex items-start justify-between">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
             <Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </div>
    </div>
);

const getKeywordsForCourse = (courseName: string): string => {
    const lowerCaseName = courseName.toLowerCase();
    let keywords = 'technology,learning,code'; // default keywords
    if (lowerCaseName.includes('react')) keywords = 'react,javascript,web,ui';
    else if (lowerCaseName.includes('css')) keywords = 'css,web design,stylesheet,layout';
    else if (lowerCaseName.includes('node.js')) keywords = 'nodejs,backend,server,javascript';
    else if (lowerCaseName.includes('web')) keywords = 'web,development,html,internet';
    else if (lowerCaseName.includes('database')) keywords = 'database,sql,server,data';
    else if (lowerCaseName.includes('python')) keywords = 'python,programming,data science';
    
    // Use the course name itself for more specific images, removing common words
    const specificKeywords = lowerCaseName.replace(/introduction to|for beginners|advanced/g, '').trim().replace(/ /g, ',');
    
    return `https://source.unsplash.com/400x300/?${keywords},${specificKeywords}`;
};


const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(location.state?.message || '');

    const fetchStudentData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [feedbackData, coursesData] = await Promise.all([
                getFeedbackForStudent(user.id),
                getCourses()
            ]);
            setFeedbackList(feedbackData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setCourses(coursesData);
        } catch (error) {
            console.error("Failed to fetch student data", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);
    
    // Clear toast message from location state after showing it
    useEffect(() => {
        if (location.state?.message) {
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    const stats = useMemo(() => {
        const reviewedCount = feedbackList.length;
        const totalCourses = courses.length;
        const averageRating = reviewedCount > 0 
            ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / reviewedCount).toFixed(1)
            : 'N/A';
        const pendingReviews = totalCourses - reviewedCount;

        return { reviewedCount, totalCourses, averageRating, pendingReviews };
    }, [feedbackList, courses]);

    const availableCourses = useMemo(() => {
        const reviewedCourseIds = new Set(feedbackList.map(f => f.courseId));
        return courses.filter(c => !reviewedCourseIds.has(c.id));
    }, [feedbackList, courses]);

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user?.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Svānubhavam pāṭhānām sājjhā kṛtvā anyeṣām śikṣāyāḥ sāhāyyaṁ kuruta.</p>
            </div>
            
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="My Feedback" value={stats.reviewedCount} subtitle="+3 from last month" icon={MessageSquare} />
                <StatCard title="Courses Reviewed" value={stats.reviewedCount} subtitle={`Out of ${stats.totalCourses} enrolled`} icon={Book} />
                <StatCard title="Average Rating" value={stats.averageRating} subtitle="Across all reviews" icon={Award} />
                <StatCard title="Pending Reviews" value={stats.pendingReviews} subtitle="Courses awaiting feedback" icon={Clock} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Recent Feedback</h2>
                    <div className="space-y-4">
                        {feedbackList.slice(0, 3).map((f, index) => (
                            <div key={f.id} className={`p-4 rounded-lg ${index > 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-200">{f.courseName}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">"{f.message || 'No comment provided.'}"</p>
                                    </div>
                                    <div className="flex items-center space-x-1 text-yellow-400 flex-shrink-0">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < f.rating ? 'currentColor' : 'none'} className={i < f.rating ? '' : 'text-slate-300 dark:text-slate-600'}/>)}
                                    </div>
                                </div>
                                 <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{new Date(f.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                        {feedbackList.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-center py-8">No feedback submitted yet.</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Available Courses</h2>
                    <div className="flex-grow">
                        {availableCourses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {availableCourses.slice(0, 2).map(course => (
                                    <div key={course.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden shadow-sm transition-transform hover:scale-105 duration-300">
                                        <img src={getKeywordsForCourse(course.name)} alt={course.name} className="w-full h-32 object-cover" />
                                        <div className="p-3">
                                            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{course.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{course.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                               <p className="text-slate-500 dark:text-slate-400 text-center py-8">All courses reviewed!</p>
                            </div>
                        )}
                    </div>
                    <Link to="/courses" className="mt-4 text-center w-full block bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        View All Courses
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default StudentDashboard;