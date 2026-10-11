import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function videoUploadPlugin(): Plugin {
  return {
    name: 'video-upload-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-video', (req: any, res: any) => {
        if (req.method === 'POST') {
          const rawFilename = (req.headers['x-filename'] as string) || `reel-${Date.now()}.mp4`
          const ALLOWED_EXT = new Set(['.mp4', '.mov', '.webm', '.jpg', '.jpeg', '.png', '.webp'])
          const ext = path.extname(rawFilename).toLowerCase() || '.mp4'
          if (!ALLOWED_EXT.has(ext)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid file format' }))
            return
          }

          const baseName = path.basename(rawFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40)
          const safeFilename = `${baseName}-${Date.now()}${ext}`

          const videosDir = path.resolve(process.cwd(), 'public/videos')
          if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir, { recursive: true })
          }

          const targetPath = path.join(videosDir, safeFilename)
          const writeStream = fs.createWriteStream(targetPath)

          let received = 0
          req.on('data', (chunk: any) => {
            received += chunk.length
            if (received > 100 * 1024 * 1024) {
              writeStream.destroy()
              fs.unlink(targetPath, () => {})
              res.statusCode = 413
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'File exceeds 100MB' }))
              req.destroy()
            }
          })

          req.pipe(writeStream)

          writeStream.on('finish', () => {
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                success: true,
                path: `/videos/${safeFilename}`,
                filename: safeFilename,
              })
            )
          })

          writeStream.on('error', (err: any) => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          })
        } else {
          res.statusCode = 405
          res.end('Method Not Allowed')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), videoUploadPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api/projects': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
