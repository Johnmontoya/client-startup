import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../auth/AuthContext";
import NavIcon from "../../assets/logo.png";

const Navigation = () => {
  const { isAuthenticated, hasPurchasedCourses, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      setIsOpen(false); // Cierra el menú móvil si está abierto
      navigate("/login");
      alert("You have been logged out");
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#3434342f] bg-opacity-50 backdrop-blur-xl fixed w-full z-10">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img src={NavIcon} alt="Logo" className="h-16 w-12" />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center">
          <Link to="/" className="text-white hover:text-green-300 mx-4">
            Home
          </Link>
          <Link to="/blogs" className="text-white hover:text-green-300 mx-4">
            Blogs
          </Link>
          <Link to="/courses" className="text-white hover:text-green-300 mx-4">
            Courses
          </Link>
          <Link to="/team" className="text-white hover:text-green-300 mx-4">
            Meet Team
          </Link>
          {isAuthenticated ? (
            <>
              {hasPurchasedCourses && (
                <Link
                  to="/my-courses"
                  className="text-white hover:text-green-300 mx-4"
                >
                  My Courses
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-white hover:text-green-300 mx-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-white hover:text-green-300 mx-4"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-white hover:text-green-300 mx-4"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-white hover:text-green-300"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-[#3434344f] bg-opacity-50 backdrop-blur-xl p-10">
          <Link
            to="/"
            className="text-white hover:text-green-300 mx-4 my-4"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            to="/blogs"
            className="text-white hover:text-green-300 mx-4 my-4"
            onClick={toggleMenu}
          >
            Blogs
          </Link>
          <Link
            to="/courses"
            className="text-white hover:text-green-300 mx-4 my-4"
            onClick={toggleMenu}
          >
            Courses
          </Link>
          <Link
            to="/team"
            className="text-white hover:text-green-300 mx-4 my-4"
            onClick={toggleMenu}
          >
            Meet Team
          </Link>
          {isAuthenticated ? (
            <>
              {hasPurchasedCourses && (
                <Link
                  to="/my-courses"
                  className="text-white hover:text-green-300 mx-4 my-4"
                  onClick={toggleMenu}
                >
                  My Courses
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-white hover:text-green-300 mx-4 my-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-white hover:text-green-300 mx-4 my-4"
                onClick={toggleMenu}
              >
                Register
              </Link>
              <Link
                to="/login"
                className="text-white hover:text-green-300 mx-4 my-4"
                onClick={toggleMenu}
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;