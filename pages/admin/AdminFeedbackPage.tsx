import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Feedback, Course, User } from '../../types';
import { getFeedback, getCourses, getUsers } from '../../services/mockApiService';
import { summarizeFeedback } from '../../services/geminiService';
import { Star, Download, Sparkles } from 'lucide-react';

const AdminFeedbackPage: React.FC = () => {
    const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({ course: '', rating: '', student: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [feedbackData, coursesData, usersData] = await Promise.all([getFeedback(), getCourses(), getUsers()]);
                setAllFeedback(feedbackData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                setCourses(coursesData);
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredFeedback = useMemo(() => {
        return allFeedback.filter(f => 
            (filters.course ? f.courseId === filters.course : true) &&
            (filters.rating ? f.rating === parseInt(filters.rating) : true) &&
            (filters.student ? f.studentName.toLowerCase().includes(filters.student.toLowerCase()) : true)
        );
    }, [allFeedback, filters]);

    const paginatedFeedback = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFeedback.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFeedback, currentPage]);

    const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);

    const handleExportCSV = () => {
        const headers = ["ID", "Student Name", "Course Name", "Rating", "Message", "Date"];
        const rows = filteredFeedback.map(f => [f.id, f.studentName, f.courseName, f.rating, `"${f.message.replace(/"/g, '""')}"`, new Date(f.createdAt).toISOString()]);
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "feedback_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleSelectFeedback = (feedbackId: string) => {
        setSelectedFeedback(prev => 
            prev.includes(feedbackId) ? prev.filter(id => id !== feedbackId) : [...prev, feedbackId]
        );
    }
    
    const handleSummarize = async () => {
        const messagesToSummarize = allFeedback
            .filter(f => selectedFeedback.includes(f.id))
            .map(f => f.message);

        if (messagesToSummarize.length === 0) {
            alert("Please select at least one feedback entry to summarize.");
            return;
        }

        setIsSummarizing(true);
        setSummary('');
        try {
            const result = await summarizeFeedback(messagesToSummarize);
            setSummary(result);
        } catch (error) {
            console.error("Summarization failed", error);
            setSummary("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };


    if (loading) return (
         <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Feedback</h1>
                <button onClick={handleExportCSV} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors">
                    <Download className="w-5 h-5 mr-2" />
                    Export CSV
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                 <input type="text" placeholder="Filter by student name..." value={filters.student} onChange={e => setFilters({...filters, student: e.target.value})} className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                 <select value={filters.course} onChange={e => setFilters({...filters, course: e.target.value})} className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <select value={filters.rating} onChange={e => setFilters({...filters, rating: e.target.value})} className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">All Ratings</option>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1 && 's'}</option>)}
                 </select>
            </div>

            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">AI Feedback Summary</h2>
                    <button onClick={handleSummarize} disabled={isSummarizing || selectedFeedback.length === 0} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors">
                        <Sparkles className="w-5 h-5 mr-2" />
                        {isSummarizing ? 'Summarizing...' : `Summarize (${selectedFeedback.length}) Selected`}
                    </button>
                </div>
                 {summary && <div className="mt-4 p-4 bg-indigo-50 dark:bg-slate-700/50 rounded-md prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300"><p>{summary}</p></div>}
            </div>

             <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                           <tr>
                                <th className="px-6 py-3 text-left"><input type="checkbox" className="rounded" onChange={e => setSelectedFeedback(e.target.checked ? paginatedFeedback.map(f => f.id) : [])}/></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Date</th>
                           </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {paginatedFeedback.map((f, index) => (
                                <tr key={f.id} className={`${index % 2 !== 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''} ${selectedFeedback.includes(f.id) ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}>
                                    <td className="px-6 py-4"><input type="checkbox" className="rounded" checked={selectedFeedback.includes(f.id)} onChange={() => handleSelectFeedback(f.id)}/></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{f.studentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{f.courseName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 flex items-center">{[...Array(5)].map((_,i) => <Star key={i} className={`w-4 h-4 ${i < f.rating ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor"/>)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300 max-w-md"><p className="truncate">{f.message}</p></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(f.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-700 dark:text-slate-400">Showing {paginatedFeedback.length} of {filteredFeedback.length} results</span>
                <div className="flex items-center space-x-1">
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)} disabled={currentPage === page} className={`px-3 py-1 rounded-md text-sm ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{page}</button>
                     ))}
                </div>
            </div>

        </div>
    );
};

export default AdminFeedbackPage;