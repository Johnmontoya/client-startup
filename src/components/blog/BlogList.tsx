import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Interfaz para el tipo de blog
interface Blog {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const blogFiles: Blog[] = [
      { 
        id: 'generate-jwt', 
        title: 'FEWV Seconds of Learning How to Generate a JWT?', 
        description: 'Learn how to generate a JSON Web Token (JWT) in just a few seconds.', 
        tags: ['React', 'JavaScript'] 
      },
      { 
        id: 'learn-docker', 
        title: 'FEWV Seconds of Learning How to Containerize?', 
        description: 'Learn how to containerize your applications using Docker.', 
        tags: ['Docker', 'Node.js'] 
      },
      { 
        id: 'learn-figma-react', 
        title: 'FEWV Seconds of Learning Convert Figma to React?', 
        description: 'Learn how to convert Figma designs to React components.', 
        tags: ['Figma', 'React.js'] 
      },
      { 
        id: 'k8s-basics', 
        title: 'Learn Kubernetes Basics in Just a Few Seconds', 
        description: 'Get started with Kubernetes and learn the basics in just a few seconds.', 
        tags: ['K8s', 'Node.js'] 
      },
    ];
    setBlogs(blogFiles);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-36">
        <h1 className="text-5xl font-bold mb-6 text-center text-gray-100">
          Our Blogs
        </h1>
        <p className="text-lg text-gray-300 text-center max-w-2xl mx-auto mb-16">
          Read our latest blogs and learn new skills in just a few seconds.
        </p>
        
        <ul className="space-y-6 max-w-4xl mx-auto">
          {blogs.map((blog) => ( 
            <li 
              key={blog.id} 
              className="bg-[#001313] p-6 md:p-8 rounded-lg shadow-md shadow-green-300/20 hover:shadow-green-300/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <Link 
                  to={`/blog/${blog.id}`} 
                  className="text-gray-100 hover:text-green-400 text-xl md:text-2xl font-semibold transition-colors flex-1"
                >
                  {blog.title}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-green-300 text-black px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-400 mt-4 leading-relaxed">
                {blog.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlogList;