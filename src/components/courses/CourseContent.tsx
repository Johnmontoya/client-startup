import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Interfaz para el contenido del curso
interface CourseContentData {
  id: number;
  name: string;
  description?: string;
  videoUrl?: string;
  modules?: CourseModule[];
  duration?: string;
  instructor?: string;
}

interface CourseModule {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  videoUrl?: string;
}

// Interfaz para refresh token
interface RefreshTokenResponse {
  token: string;
}

const CourseContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseContentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentVideo, setCurrentVideo] = useState<string>('');

  // Función para refrescar el token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<RefreshTokenResponse>(
        'http://localhost:3000/auth/refresh',
        { refreshToken: storedRefreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const newToken = response.data.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }
  };

  // Función para obtener el contenido del curso
  const fetchCourseContent = async () => {
    if (!id) {
      setError('Course ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to view course content');
        navigate('/login');
        return;
      }

      const response = await axios.get<CourseContentData>(
        `http://localhost:3000/course-content/course-content/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        }
      );

      setCourse(response.data);
      
      // Establecer el primer video como predeterminado
      if (response.data.videoUrl) {
        setCurrentVideo(response.data.videoUrl);
      } else if (response.data.modules && response.data.modules.length > 0) {
        const firstLesson = response.data.modules[0].lessons[0];
        if (firstLesson?.videoUrl) {
          setCurrentVideo(firstLesson.videoUrl);
        }
      }
    } catch (error: any) {
      console.error('Error fetching course content:', error);

      // Si el token expiró (401 o 403), intentar refrescarlo
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        try {
          const newToken = await refreshToken();
          
          if (newToken) {
            // Reintentar con el nuevo token
            const response = await axios.get<CourseContentData>(
              `http://localhost:3000/course-content/course-content/${id}`,
              {
                headers: { 
                  Authorization: `Bearer ${newToken}` 
                },
              }
            );

            setCourse(response.data);
            
            if (response.data.videoUrl) {
              setCurrentVideo(response.data.videoUrl);
            }
          } else {
            setError('Session expired. Please log in again.');
            navigate('/login');
          }
        } catch (refreshError) {
          console.error('Error refreshing token and fetching course:', refreshError);
          setError('Error refreshing session. Please log in again.');
          navigate('/login');
        }
      } else {
        setError('Error loading course content. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseContent();
  }, [id]);

  // Función para cambiar el video actual
  const handleVideoChange = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-300 border-solid mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[#001313] p-8 rounded-lg shadow-lg shadow-red-300/20 max-w-md w-full text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Course</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchCourseContent()}
              className="bg-green-300 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/my-courses')}
              className="border border-green-300 hover:bg-green-300 text-white hover:text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-300 text-xl mb-6">Course not found</p>
          <button
            onClick={() => navigate('/my-courses')}
            className="bg-green-300 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-courses')}
            className="flex items-center gap-2 text-green-300 hover:text-green-400 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to My Courses
          </button>

          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            {course.name}
          </h1>
          
          {/* Course metadata */}
          <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
            {course.instructor && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {course.instructor}
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {course.duration}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video player - Main content */}
          <div className="lg:col-span-2">
            <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 overflow-hidden">
              {currentVideo ? (
                <video 
                  src={currentVideo} 
                  controls 
                  className="w-full aspect-video bg-black"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-400">No video available</p>
                </div>
              )}

              {/* Course description */}
              {course.description && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-100 mb-3">About this course</h2>
                  <p className="text-gray-300 leading-relaxed">{course.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Course modules */}
          <div className="lg:col-span-1">
            <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Course Content</h2>
              
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border-b border-gray-700 pb-4 last:border-0">
                      <h3 className="font-semibold text-green-300 mb-2">
                        {module.title}
                      </h3>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              onClick={() => lesson.videoUrl && handleVideoChange(lesson.videoUrl)}
                              disabled={!lesson.videoUrl}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                currentVideo === lesson.videoUrl
                                  ? 'bg-green-300 text-black'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-green-300'
                              } ${!lesson.videoUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{lesson.title}</div>
                                  {lesson.duration && (
                                    <div className="text-xs opacity-75 mt-1">{lesson.duration}</div>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No modules available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContent;