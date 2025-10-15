import { useParams, useNavigate, Link } from "react-router-dom";
import course1 from "../../assets/courses-images/1.png";
import course2 from "../../assets/courses-images/2.png";
import course3 from "../../assets/courses-images/3.png";
import course4 from "../../assets/courses-images/4.png";
import course5 from "../../assets/courses-images/5.png";

// Interfaz para los detalles del curso
interface CourseDetail {
  id: number;
  course_name: string;
  syllabus: string;
  instructor_bio: string;
  prerequisites: string;
  price: number;
  duration?: string;
  level?: string;
  imageUrl: string;
  description?: string;
}

// Interfaz para el diccionario de cursos
interface CourseDetailsData {
  [key: string]: CourseDetail;
}

const courseDetailsData: CourseDetailsData = {
  "1": {
    id: 1,
    course_name: "Real-Time Data Streaming with Kafka & Node.js",
    syllabus: "Learn about Kafka Architecture, Use Kafkajs with Node.js, Build real-time streaming applications",
    instructor_bio: "John Doe is a seasoned Kafka expert with over 8 years of experience in distributed systems and real-time data processing.",
    prerequisites: "A little bit of Node.js knowledge, and your laptop. Yes, just that!",
    price: 30,
    duration: "3h 45m",
    level: "Intermediate",
    imageUrl: course1,
    description: "Master real-time data streaming with Apache Kafka and Node.js integration."
  },
  "2": {
    id: 2,
    course_name: "Create React App with Webpack",
    syllabus: "Enhance your app, advanced state management, custom webpack configuration, optimization techniques",
    instructor_bio: "Jane Smith is a leading React developer with expertise in modern frontend architecture and performance optimization.",
    prerequisites: "No Prerequisites. Let's just dive in!",
    price: 20,
    duration: "2h 30m",
    level: "Intermediate",
    imageUrl: course2,
    description: "Deep dive into React and webpack configuration for professional applications."
  },
  "3": {
    id: 3,
    course_name: "Learn about Terraform in Detail",
    syllabus: "Learn to create CI/CD pipelines, automate the deployment process, infrastructure as code best practices",
    instructor_bio: "Mike Johnson has over 10 years of Terraform experience and has helped numerous companies migrate to infrastructure as code.",
    prerequisites: "Just you and your laptop.",
    price: 20,
    duration: "4h 15m",
    level: "Intermediate",
    imageUrl: course3,
    description: "Master infrastructure as code with Terraform and automate your deployments."
  },
  "4": {
    id: 4,
    course_name: "Kubernetes and Docker for Deployment",
    syllabus: "Create clusters, learn the intricacies of K8s, container orchestration, deployment strategies",
    instructor_bio: "Emily Davis has built numerous containerized applications and specializes in Kubernetes architecture and best practices.",
    prerequisites: "A basic knowledge about Node.js. Just that.",
    price: 30,
    duration: "5h 20m",
    level: "Advanced",
    imageUrl: course4,
    description: "Master container orchestration with Kubernetes and Docker for production deployments."
  },
  "5": {
    id: 5,
    course_name: "Create Your First Serverless Web App",
    syllabus: "Use various AWS products like: S3 bucket, EC2, Lambda, API Gateway, and many more!",
    instructor_bio: "Chris Wilson is an AWS guru with multiple certifications and years of experience building scalable serverless applications.",
    prerequisites: "AWS account required.",
    price: 40,
    duration: "6h 10m",
    level: "Intermediate",
    imageUrl: course5,
    description: "Build scalable serverless applications using AWS services and best practices."
  }
};

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseDetails = id ? courseDetailsData[id] : null;

  if (!id || !courseDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <p className="text-gray-400 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-green-300 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-green-300 hover:text-green-400 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Courses
        </button>

        {/* Course header with image */}
        <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 overflow-hidden mb-8">
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={courseDetails.imageUrl}
              alt={courseDetails.course_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001313] via-transparent to-transparent"></div>
            
            {/* Price badge */}
            <div className="absolute top-4 right-4 bg-green-300 text-black font-bold px-6 py-3 rounded-full text-xl shadow-lg">
              ${courseDetails.price}
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Course title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              {courseDetails.course_name}
            </h1>

            {/* Course description */}
            {courseDetails.description && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {courseDetails.description}
              </p>
            )}

            {/* Course metadata */}
            <div className="flex flex-wrap gap-3 mb-8">
              {courseDetails.level && (
                <span className="flex items-center gap-2 bg-gray-800 text-gray-200 px-4 py-2 rounded-full text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {courseDetails.level}
                </span>
              )}
              {courseDetails.duration && (
                <span className="flex items-center gap-2 bg-gray-800 text-gray-200 px-4 py-2 rounded-full text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {courseDetails.duration}
                </span>
              )}
            </div>

            {/* Purchase button */}
            <Link to="/courses">
              <button className="w-full md:w-auto bg-green-300 hover:bg-green-400 text-black font-bold py-4 px-8 rounded-lg transition-all text-lg shadow-lg hover:shadow-green-300/50">
                Enroll Now - ${courseDetails.price}
              </button>
            </Link>
          </div>
        </div>

        {/* Course details sections */}
        <div className="space-y-6">
          {/* What will be covered */}
          <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              What Will Be Covered?
            </h3>
            <ul className="space-y-3">
              {courseDetails.syllabus.split(',').map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor */}
          <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Who is the Instructor?
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {courseDetails.instructor_bio}
            </p>
          </div>

          {/* Prerequisites */}
          <div className="bg-[#001313] rounded-xl shadow-lg shadow-green-300/20 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              What are the Prerequisites?
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {courseDetails.prerequisites}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-green-300/10 to-green-400/10 border border-green-300/30 rounded-xl p-6 md:p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-100 mb-3">
            Ready to Start Learning?
          </h3>
          <p className="text-gray-300 mb-6">
            Join thousands of students already enrolled in this course
          </p>
          <Link to="/courses">
            <button className="bg-green-300 hover:bg-green-400 text-black font-bold py-4 px-10 rounded-lg transition-all text-lg shadow-lg hover:shadow-green-300/50">
              Enroll Now for ${courseDetails.price}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;