import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Auto-spawn Django backend server only in development
const isBuild = process.argv.includes('build') || process.env.NODE_ENV === 'production';
if (!isBuild) {
  console.log('--- Starting Django Backend Server ---')
  const djangoProcess = spawn('python', ['manage.py', 'runserver', '8000'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  })

  djangoProcess.on('error', (err) => {
    console.error('Failed to start Django process:', err)
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Match all paths except Vite system folders/files
      '^/(?!src|node_modules|@react-refresh|@vite|index.html|public).*': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        bypass: (req, res, options) => {
          const accept = req.headers.accept || '';
          const url = req.url || '';
          const isAsset = (
            url.startsWith('/static/') || 
            url.startsWith('/images/') || 
            url.startsWith('/uploads/') ||
            url.includes('.')
          );
          // If browser is reloading a route, bypass proxy and serve local SPA index.html
          if (accept.includes('text/html') && !isAsset) {
            return '/index.html';
          }
        }
      }
    }
  }
})
