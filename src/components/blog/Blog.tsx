import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Interfaz para los atributos del blog
interface BlogAttributes {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

// Interfaz para el módulo markdown
interface MarkdownModule {
  html?: string;
  attributes?: BlogAttributes;
}

const Blog = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [attributes, setAttributes] = useState<BlogAttributes>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadMarkdown = async () => {
      if (!blogId) {
        setError('Blog ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const markdownModule = await import(`../../blogs/${blogId}.md`) as MarkdownModule;
        
        const htmlContent = markdownModule.html || '';
        setContent(htmlContent);
        
        setAttributes(markdownModule.attributes || {});
        setLoading(false);
      } catch (err) {
        console.error('Error loading blog:', err);
        setError('Blog not found. Please check the URL and try again.');
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [blogId]);

  // Componente de loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-300 border-solid mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading blog...</p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[#001313] p-8 rounded-lg shadow-lg shadow-red-300/20 max-w-md w-full text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Blog Not Found</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/blogs')}
            className="bg-green-300 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-[#001313] shadow-lg shadow-green-300/20 rounded-2xl p-6 md:p-10 hover:shadow-green-300/30 transition-shadow">
          {/* Header del blog */}
          <div className="mb-8 border-b border-gray-700 pb-6">
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {attributes.title || 'Untitled Blog'}
            </h1>
            
            {attributes.description && (
              <p className="text-gray-300 text-lg mb-4">
                {attributes.description}
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {attributes.author && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {attributes.author}
                </span>
              )}
              
              {attributes.date && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {attributes.date}
                </span>
              )}
            </div>

            {/* Tags */}
            {attributes.tags && attributes.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {attributes.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-green-300 text-black px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Contenido del blog */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="markdown-body text-gray-200 leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Estilos personalizados para elementos markdown
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                  a: ({node, ...props}) => <a className="text-green-300 hover:text-green-400 underline" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline ? (
                      <code className="bg-gray-800 text-green-300 px-2 py-1 rounded text-sm" {...props} />
                    ) : (
                      <code className="block bg-gray-800 text-green-300 p-4 rounded-lg overflow-x-auto" {...props} />
                    ),
                  ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-300 pl-4 italic text-gray-400 my-4" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Botón para volver */}
          <div className="mt-10 pt-6 border-t border-gray-700">
            <button
              onClick={() => navigate('/blogs')}
              className="bg-green-300 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;