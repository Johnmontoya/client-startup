import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import course1 from "../../assets/courses-images/1.png";
import course2 from "../../assets/courses-images/2.png";
import course3 from "../../assets/courses-images/3.png";
import course4 from "../../assets/courses-images/4.png";
import course5 from "../../assets/courses-images/5.png";
import { AuthContext } from "../auth/AuthContext";

// Interfaz para los cursos
interface Course {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

// Interfaz para items seleccionados
interface SelectedItem {
  id: number;
  quantity: number;
}

// Interfaz para respuestas del API
interface CheckoutResponse {
  url: string;
  message?: string;
  purchasedCourseIds?: number[];
}

interface RefreshResponse {
  token: string;
}

const courses: Course[] = [
  {
    id: 1,
    name: "Learn About Kafka and Node.js",
    price: 30,
    imageUrl: course1,
    description: "Master message streaming with Kafka and Node.js integration"
  },
  { 
    id: 2, 
    name: "React, but with webpack", 
    price: 20, 
    imageUrl: course2,
    description: "Deep dive into React and webpack configuration"
  },
  {
    id: 3,
    name: "Learn About Terraform in Depth",
    price: 20,
    imageUrl: course3,
    description: "Infrastructure as Code with Terraform"
  },
  {
    id: 4,
    name: "Kubernetes and Docker for deployment",
    price: 30,
    imageUrl: course4,
    description: "Container orchestration and deployment strategies"
  },
  {
    id: 5,
    name: "Create your own Serverless web app",
    price: 40,
    imageUrl: course5,
    description: "Build scalable serverless applications"
  },
];

const Courses = () => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cargar items seleccionados del localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem("selectedItems");
    if (savedItems) {
      try {
        setSelectedItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Error loading saved items:", error);
        localStorage.removeItem("selectedItems");
      }
    }
  }, []);

  // Guardar items seleccionados en localStorage
  useEffect(() => {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Calcular el total
  const calculateTotal = (): number => {
    return selectedItems.reduce((total, item) => {
      const course = courses.find(c => c.id === item.id);
      return total + (course?.price || 0) * item.quantity;
    }, 0);
  };

  // Función para refrescar el token
  const refreshToken = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    
    if (!storedRefreshToken) {
      return null;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        }
      );

      if (response.ok) {
        const data: RefreshResponse = await response.json();
        localStorage.setItem("token", data.token);
        return data.token;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  const handlePayment = async () => {
    // Validar que haya items seleccionados
    if (selectedItems.length === 0) {
      setError("Please select at least one course");
      return;
    }

    // Validar autenticación
    if (!isAuthenticated) {
      alert("Please log in to purchase courses");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError('');

    let token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/checkout/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: selectedItems }),
        }
      );

      if (response.ok) {
        const data: CheckoutResponse = await response.json();
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else if (response.status === 401) {
        // Token expirado, intentar refrescar
        const newToken = await refreshToken();

        if (newToken) {
          // Reintentar con el nuevo token
          const retryResponse = await fetch(
            "http://localhost:3000/checkout/create-checkout-session",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
              body: JSON.stringify({ items: selectedItems }),
            }
          );

          if (retryResponse.ok) {
            const data: CheckoutResponse = await retryResponse.json();
            window.location.href = data.url;
          } else {
            const errorData: CheckoutResponse = await retryResponse.json();
            handlePaymentError(errorData);
          }
        } else {
          setError("Session expired. Please log in again.");
          navigate("/login");
        }
      } else {
        const errorData: CheckoutResponse = await response.json();
        handlePaymentError(errorData);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

   const handlePaymentError = (errorData: CheckoutResponse) => {
    if (errorData.purchasedCourseIds && errorData.purchasedCourseIds.length > 0) {
      const purchasedNames = errorData.purchasedCourseIds
        .map(id => courses.find(c => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      
      setError(`You have already purchased: ${purchasedNames}`);
    } else {
      setError(errorData.message || "Error processing payment. Please try again.");
    }
  };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const id = parseInt(value);
    
    setSelectedItems((prev) =>
      checked
        ? [...prev, { id, quantity: 1 }]
        : prev.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            Our Courses
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            All that you need to kickstart your career. Learn from industry experts.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col bg-[#001313] rounded-xl overflow-hidden shadow-lg shadow-green-300/20 hover:shadow-green-300/40 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Course image */}
              <div className="relative overflow-hidden h-48">
                <img
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  src={course.imageUrl}
                  alt={course.name}
                />
                <div className="absolute top-3 right-3 bg-green-300 text-black font-bold px-4 py-2 rounded-full">
                  ${course.price}
                </div>
              </div>

              {/* Course content */}
              <div className="flex-grow p-6">
                <h3 className="font-bold text-xl mb-3 text-gray-100 line-clamp-2">
                  {course.name}
                </h3>
                {course.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <Link to={`/course-details/${course.id}`}>
                  <button className="w-full border border-green-300 rounded-lg hover:bg-green-300 text-white hover:text-gray-900 py-2 px-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-300">
                    View Details
                  </button>
                </Link>
              </div>

              {/* Select checkbox */}
              <div className="px-6 pb-6">
                <label className="flex items-center justify-center bg-green-300 hover:bg-green-400 rounded-lg py-3 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 form-checkbox text-green-600 rounded focus:ring-2 focus:ring-green-300"
                    value={course.id}
                    onChange={handleChange}
                    checked={selectedItems.some((item) => item.id === course.id)}
                  />
                  <span className="ml-2 text-gray-900 font-semibold">
                    {selectedItems.some((item) => item.id === course.id) 
                      ? "Selected" 
                      : "Select Course"}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Payment section */}
        {selectedItems.length > 0 && (
          <div className="max-w-md mx-auto bg-[#001313] p-6 rounded-xl shadow-lg shadow-green-300/20">
            <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">
              Selected Courses ({selectedItems.length})
            </h3>
            <div className="space-y-2 mb-6">
              {selectedItems.map(item => {
                const course = courses.find(c => c.id === item.id);
                return course ? (
                  <div key={item.id} className="flex justify-between text-gray-300">
                    <span className="truncate mr-2">{course.name}</span>
                    <span className="font-semibold">${course.price}</span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold text-gray-100">
                <span>Total:</span>
                <span className="text-green-300">${calculateTotal()}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-300 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        )}

        {selectedItems.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg">Select courses to proceed to payment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;