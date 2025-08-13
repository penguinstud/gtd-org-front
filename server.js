const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const chokidar = require('chokidar')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const orgFilesPath = './org-files'

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // File watcher setup
  const watcher = chokidar.watch(orgFilesPath, {
    ignored: /^\./,
    persistent: true,
  })

  watcher
    .on('add', (path) => console.log(`File ${path} has been added`))
    .on('change', (path) => console.log(`File ${path} has been changed`))
    .on('unlink', (path) => console.log(`File ${path} has been removed`))
    .on('error', (error) => console.error('Watcher error:', error))

  server.listen(3000, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:3000`)
  })
})