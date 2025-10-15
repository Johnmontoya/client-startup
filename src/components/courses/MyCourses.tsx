import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import images
import course1 from "../../assets/courses-images/1.png";
import course2 from "../../assets/courses-images/2.png";
import course3 from "../../assets/courses-images/3.png";
import course4 from "../../assets/courses-images/4.png";
import course5 from "../../assets/courses-images/5.png";

// Interfaz para los cursos
interface Course {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

// Interfaz para la respuesta de refresh token
interface RefreshTokenResponse {
  token: string;
}

// Map de imágenes de cursos
const imageMap: Record<string, string> = {
  "Learn About Kafka and Node.js": course1,
  "React, but with webpack": course2,
  "Learn About Terraform in Depth": course3,
  "Kubernetes and Docker for deployment": course4,
  "Create your own Serverless web app": course5,
};

const MyCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Función para refrescar el token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post<RefreshTokenResponse>(
        "http://localhost:3000/auth/refresh",
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      return newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return null;
    }
  };

  // Función para eliminar cursos duplicados
  const removeDuplicates = (courses: Course[]): Course[] => {
    const uniqueCourses: Course[] = [];
    const courseIds = new Set<number>();

    for (const course of courses) {
      if (!courseIds.has(course.id)) {
        uniqueCourses.push(course);
        courseIds.add(course.id);
      }
    }

    return uniqueCourses;
  };

  // Función para obtener cursos comprados
  const fetchPurchasedCourses = async () => {
    setLoading(true);
    setError('');

    try {
      let token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your courses");
        navigate("/login");
        return;
      }

      const response = await axios.get<Course[]>(
        "http://localhost:3000/purchased/purchased-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const uniqueCourses = removeDuplicates(response.data);
      setCourses(uniqueCourses);
    } catch (error: any) {
      // Si el token expiró (401 o 403), intentar refrescarlo
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        try {
          const newToken = await refreshToken();
          
          if (newToken) {
            // Reintentar con el nuevo token
            const response = await axios.get<Course[]>(
              "http://localhost:3000/purchased/purchased-courses",
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
            
            const uniqueCourses = removeDuplicates(response.data);
            setCourses(uniqueCourses);
          } else {
            setError("Session expired. Please log in again.");
            navigate("/login");
          }
        } catch (refreshError) {
          console.error("Error refreshing token and fetching courses:", refreshError);
          setError("Error refreshing session. Please log in again.");
          navigate("/login");
        }
      } else {
        console.error("Error fetching purchased courses:", error);
        setError("Error loading your courses. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  const handleCourseClick = (courseId: number) => {
    navigate(`/course-player/${courseId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-300 border-solid mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your courses...</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => fetchPurchasedCourses()}
            className="bg-green-300 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Your Purchased Courses 🎉
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Gear up your development skills to the next level with these mind-blowing courses
          </p>
        </div>

        {/* Courses grid */}
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-300 text-xl mb-6">
              You haven't purchased any courses yet
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="bg-green-300 hover:bg-green-400 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[#001313] overflow-hidden rounded-xl shadow-lg shadow-green-300/20 hover:shadow-green-300/40 transform transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                {/* Course image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={imageMap[course.name] || course1}
                    alt={course.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-green-300 text-black px-6 py-2 rounded-full font-semibold">
                      Start Learning
                    </div>
                  </div>
                </div>

                {/* Course content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-green-300 group-hover:text-green-400 mb-3 transition-colors line-clamp-2">
                    {course.name}
                  </h2>
                  {course.description && (
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Progress indicator (opcional - puedes agregar lógica de progreso después) */}
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>Click to view course</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats section (opcional) */}
        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-[#001313] px-6 py-3 rounded-full shadow-lg shadow-green-300/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-200 font-medium">
                You have {courses.length} {courses.length === 1 ? 'course' : 'courses'} enrolled
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyCourses;