import React, { useState, useEffect, useCallback } from 'react';
import { Course } from '../../types';
import { getCourses, addCourse, updateCourse, deleteCourse as deleteCourseApi } from '../../services/mockApiService';
import { generateCourseDescription } from '../../services/geminiService';
import { Edit, Trash2, PlusCircle, Sparkles, PlayCircle } from 'lucide-react';

const CourseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (course: Omit<Course, 'id' | 'createdAt'>) => void;
    initialData?: Course | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    useEffect(() => {
        if(initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setVideoUrl(initialData.videoUrl || '');
        } else {
            setName('');
            setDescription('');
            setVideoUrl('');
        }
    }, [initialData, isOpen]);

    const handleGenerateDesc = async () => {
        if(!name) {
            alert('Please enter a course name first.');
            return;
        }
        setIsGenerating(true);
        try {
            const desc = await generateCourseDescription(name);
            setDescription(desc);
        } catch(error) {
            console.error("Failed to generate description", error);
            alert("Could not generate description.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">{initialData ? 'Edit Course' : 'Add Course'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, description, videoUrl }); }}>
                    <div className="mb-4">
                        <label className="block text-slate-700 dark:text-slate-300 mb-2">Course Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                     <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                           <label className="block text-slate-700 dark:text-slate-300">Description</label>
                           <button type="button" onClick={handleGenerateDesc} disabled={isGenerating || !name} className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                             <Sparkles className="w-4 h-4 mr-1"/> {isGenerating ? 'Generating...' : 'Generate with AI'}
                           </button>
                        </div>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-700 dark:text-slate-300 mb-2">Video URL (Optional)</label>
                        <input value={videoUrl} placeholder="e.g., https://www.youtube.com/watch?v=..." onChange={e => setVideoUrl(e.target.value)} className="w-full p-2.5 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-colors">Save Course</button>
                    </div>
                </form>
             </div>
        </div>
    );
};


const AdminCoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const coursesData = await getCourses();
            setCourses(coursesData);
        } catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleModalSubmit = async (data: Omit<Course, 'id'|'createdAt'>) => {
        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, data);
            } else {
                await addCourse(data);
            }
            fetchCourses();
        } catch (error) {
            console.error("Failed to save course", error);
        } finally {
            setIsModalOpen(false);
            setEditingCourse(null);
        }
    };

    const handleDelete = async (courseId: string) => {
        if(window.confirm('Are you sure you want to delete this course? This may affect existing feedback.')) {
            try {
                await deleteCourseApi(courseId);
                fetchCourses();
            } catch(error) {
                console.error("Failed to delete course", error);
            }
        }
    };
    
    if (loading) return (
         <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Courses</h1>
                 <button onClick={() => { setEditingCourse(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all transform hover:scale-105">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Course
                </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {courses.map((course, index) => (
                                <tr key={course.id} className={`${index % 2 !== 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                        <div className="flex items-center">
                                            {course.videoUrl && <PlayCircle className="w-5 h-5 mr-2 text-indigo-500" />}
                                            <span>{course.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300 max-w-lg"><p className="truncate">{course.description}</p></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => { setEditingCourse(course); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"><Edit className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"><Trash2 className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                </div>
            </div>

            <CourseModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCourse(null); }}
                onSubmit={handleModalSubmit}
                initialData={editingCourse}
            />
        </div>
    );
};

export default AdminCoursesPage;