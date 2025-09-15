import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import { getCourses } from '../../services/mockApiService';
import { Search, Book, PlayCircle } from 'lucide-react';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const getKeywordsForCourse = (courseName: string): string => {
    // Reusing the same image generator function from dashboard for consistency
    const lowerCaseName = courseName.toLowerCase();
    let keywords = 'technology,learning,code';
    if (lowerCaseName.includes('react')) keywords = 'react,javascript,web,ui';
    else if (lowerCaseName.includes('css')) keywords = 'css,web design,stylesheet,layout';
    else if (lowerCaseName.includes('node.js')) keywords = 'nodejs,backend,server,javascript';
    else if (lowerCaseName.includes('web')) keywords = 'web,development,html,internet';
    else if (lowerCaseName.includes('database')) keywords = 'database,sql,server,data';
    else if (lowerCaseName.includes('python')) keywords = 'python,programming,data science';
    else if (lowerCaseName.includes('design')) keywords = 'design,ui,ux,interface';
    else if (lowerCaseName.includes('data science')) keywords = 'data,analytics,chart,graph';
    else if (lowerCaseName.includes('project management')) keywords = 'agile,scrum,team,collaboration';
    
    const specificKeywords = lowerCaseName.replace(/introduction to|for beginners|advanced|fundamentals|mastering/g, '').trim().replace(/ /g, ',');
    
    return `https://source.unsplash.com/400x300/?${keywords},${specificKeywords}`;
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <Link to={`/courses/${course.id}`} className="block bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative">
            <img src={getKeywordsForCourse(course.name)} alt={course.name} className="w-full h-40 object-cover" />
            {course.videoUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/80" />
                </div>
            )}
        </div>
        <div className="p-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">{course.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 h-10 overflow-hidden text-ellipsis">{course.description}</p>
        </div>
    </Link>
);

const CoursesPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const coursesData = await getCourses();
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        if (!debouncedSearchTerm) return courses;
        
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        return courses.filter(course => 
            course.name.toLowerCase().includes(lowercasedTerm) ||
            course.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [courses, debouncedSearchTerm]);

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Course Catalog</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Explore and find courses to provide feedback on.</p>
            </div>
            
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-400" />
                </span>
                <input
                    type="text"
                    placeholder="Search by course name or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 pl-10 border rounded-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
            </div>

            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Book className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-xl font-semibold text-slate-800 dark:text-white">No Courses Found</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};

export default CoursesPage;