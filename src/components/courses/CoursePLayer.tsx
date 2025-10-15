import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Interfaz para los detalles del curso
interface CourseDetails {
  id: number;
  name: string;
  description?: string;
  vimeoVideoId?: string;
  syllabus?: string;
  instructor_bio?: string;
  testimonials?: string;
  duration?: string;
  level?: string;
}

// Interfaz para refresh token
interface RefreshTokenResponse {
  token: string;
}

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Función para refrescar el token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post<RefreshTokenResponse>(
        'https://fewvlearns-kimy.onrender.com/auth/refresh',
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

  // Función para obtener los detalles del curso
  const fetchCourseDetails = async () => {
    if (!courseId) {
      setError('Course ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to view this course');
        navigate('/login');
        return;
      }

      const response = await axios.get<CourseDetails>(
        `http://localhost:3000/course-content/${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setVideoId(response.data.vimeoVideoId || null);
      setCourseDetails(response.data);
    } catch (error: any) {
      console.error('Error fetching course details:', error);

      // Si el token expiró (401 o 403), intentar refrescarlo
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        try {
          const newToken = await refreshToken();
          
          if (newToken) {
            // Reintentar con el nuevo token
            const response = await axios.get<CourseDetails>(
              `http://localhost:3000/course-content/${courseId}`,
              {
                headers: {
                  'Authorization': `Bearer ${newToken}`
                }
              }
            );

            setVideoId(response.data.vimeoVideoId || null);
            setCourseDetails(response.data);
          } else {
            setError('Session expired. Please log in again.');
            navigate('/login');
          }
        } catch (refreshError) {
          console.error('Error refreshing token and fetching course:', refreshError);
          setError('Error refreshing session. Please log in again.');
          navigate('/login');
        }
      } else if (error.response && error.response.status === 404) {
        setError('Course not found. You may not have access to this course.');
      } else {
        setError('Error loading course details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-300 border-solid mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading course...</p>
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
              onClick={() => fetchCourseDetails()}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/my-courses')}
          className="flex items-center gap-2 text-green-300 hover:text-green-400 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to My Courses
        </button>

        {/* Video player */}
        <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 overflow-hidden mb-8">
          {videoId ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://player.vimeo.com/video/${videoId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Course Video"
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-400">No video available for this course</p>
              </div>
            </div>
          )}
        </div>

        {/* Course details */}
        {courseDetails && (
          <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 p-6 md:p-10">
            {/* Course header */}
            <div className="border-b border-gray-700 pb-6 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                {courseDetails.name}
              </h1>
              
              {/* Course metadata */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {courseDetails.level && (
                  <span className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {courseDetails.level}
                  </span>
                )}
                {courseDetails.duration && (
                  <span className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {courseDetails.duration}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {courseDetails.description && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">{courseDetails.description}</p>
              </div>
            )}

            {/* Syllabus */}
            {courseDetails.syllabus && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Syllabus
                </h3>
                <ul className="space-y-2">
                  {courseDetails.syllabus.split('\n').filter(item => item.trim()).map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-green-300 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor bio */}
            {courseDetails.instructor_bio && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Instructor
                </h3>
                <p className="text-gray-300 leading-relaxed">{courseDetails.instructor_bio}</p>
              </div>
            )}

            {/* Testimonials */}
            {courseDetails.testimonials && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Student Testimonials
                </h3>
                <div className="space-y-4">
                  {courseDetails.testimonials.split('\n').filter(item => item.trim()).map((item, index) => (
                    <div key={index} className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-green-300">
                      <p className="text-gray-300 italic">"{item}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;