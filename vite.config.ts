import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { plugin as markdown, Mode } from 'vite-plugin-markdown';
import markdownIt from 'markdown-it';
import type MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// Función helper para escapar HTML
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Configuración de markdown-it con sintaxis highlighting
const md: MarkdownIt = markdownIt({
  html: true, // Permite HTML tags en el markdown
  linkify: true, // Convierte URLs automáticamente en links
  typographer: true, // Habilita transformaciones tipográficas
  breaks: true, // Convierte saltos de línea en <br>
  highlight: (code: string, lang: string) => {
    // Si el lenguaje está especificado y es válido
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${
          hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (error) {
        console.error('Error highlighting code:', error);
      }
    }

    // Fallback para código sin lenguaje especificado
    return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`;
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    markdown({
      mode: [Mode.HTML], // Usa el enum Mode para mejor tipado
      markdownIt: md
    })
  ],
  
  // Optimizaciones de build
  build: {
    // Aumenta el límite de advertencia de chunks
    chunkSizeWarningLimit: 1000,
    
    // Optimiza la división de código
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa las librerías grandes en chunks individuales
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-raw'],
          'highlight-vendor': ['highlight.js'],
        }
      }
    }
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 5173, // Puerto personalizado (opcional)
    open: true, // Abre el navegador automáticamente
    cors: true, // Habilita CORS
  },

  // Alias para imports más limpios (opcional)
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@assets': '/src/assets',
      '@blogs': '/src/blogs',
    }
  }
});