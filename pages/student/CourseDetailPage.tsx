import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course } from '../../types';
import { getCourseById } from '../../services/mockApiService';
import { ArrowLeft, VideoOff } from 'lucide-react';

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                setError('Course ID is missing.');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const courseData = await getCourseById(courseId);
                if (courseData) {
                    setCourse(courseData);
                } else {
                    setError('Course not found.');
                }
            } catch (err) {
                setError('Failed to fetch course details.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const getYouTubeEmbedUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            let videoId = urlObj.searchParams.get('v');
            if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.slice(1);
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        } catch (e) {
            return null; // Invalid URL
        }
    };
    
    const embedUrl = course?.videoUrl ? getYouTubeEmbedUrl(course.videoUrl) : null;

    if (loading) return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-red-500">{error}</h2>
            <Link to="/courses" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
            </Link>
        </div>
    );
    
    if (!course) return null;

    return (
        <div>
            <Link to="/courses" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course Catalog
            </Link>

            <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden">
                {embedUrl ? (
                    <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={embedUrl}
                            title={course.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : course.videoUrl ? ( // Handle cases where URL is present but not a valid YouTube link
                     <div className="bg-slate-100 dark:bg-slate-700 aspect-video flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <VideoOff className="w-12 h-12 mx-auto" />
                            <p className="mt-2 font-semibold">Video not available</p>
                            <p className="text-sm">The provided video link could not be embedded.</p>
                        </div>
                    </div>
                ): null}

                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">{course.name}</h1>
                    <p className="mt-4 text-base text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{course.description}</p>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
