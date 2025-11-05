import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 8081

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`)
  
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url)
  
  // Security check to prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  
  const extname = String(path.extname(filePath)).toLowerCase()
  const contentType = MIME_TYPES[extname] || 'application/octet-stream'

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        res.writeHead(404)
        res.end('404 Not Found')
      } else {
        // Server error
        res.writeHead(500)
        res.end(`Server Error: ${error.code}`)
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
})