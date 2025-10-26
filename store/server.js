import express from 'express'
import { createServer as createViteServer } from 'vite'
import fs from 'fs'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'
const __dirname = path.dirname(new URL(import.meta.url).pathname)

async function createServer() {
  const app = express()

  let vite
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    app.use('/assets', express.static(path.resolve(__dirname, 'dist/client/assets')))
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl
      let template, render

      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.js')).render
      } else {
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8')
        render = (await import('./dist/server/entry-server.js')).render
      }

      const { html } = await render(url)

      const htmlResponse = template.replace(`{{ app }}`, html)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlResponse)

    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  const port = process.env.PORT || 5173
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
}

createServer()