import { AuthProvider } from './components/auth/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import HomePage from './HomePage'; // Asegúrate de crear este componente
import PrivateRoute from './components/auth/PrivateRoute';
import BlogList from './components/blog/BlogList';
import Blog from './components/blog/Blog';
import Team from './Team';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Courses from './components/courses/Courses';
import CourseContent from './components/courses/CourseContent';
import CoursePlayer from './components/courses/CoursePLayer';
import Success from './components/auth/Success';
import MyCourses from './components/courses/MyCourses';
import CourseDetails from './components/courses/CourseDetails';
import './app.css';
import Footer from './components/common/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path="/blogs" element={<PrivateRoute element={<BlogList />} />} />
            <Route path="/blog/:blogId" element={<PrivateRoute element={<Blog />} />} />
            <Route path="/team" element={<Team />} />
            <Route path='/register' element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/my-courses" element={<PrivateRoute element={<MyCourses />} />} />
            <Route path='/course-details/:id' element={<CourseDetails />} />
            <Route path="/start-course/:id" element={<PrivateRoute element={<CourseContent />} />} />
            <Route path="/course-player/:courseId" element={<PrivateRoute element={<CoursePlayer />} />} />
            <Route path="/success" element={<Success />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
