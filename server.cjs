// A local preview only. GitHub Pages serves the same files without this server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml' };
const publicFiles = new Set(['index.html','styles.css','core.js','app.js','favicon.svg']);
const port = Number(process.env.PORT || 4173);
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  const file=pathname==='/' ? 'index.html' : pathname.slice(1);
  if(!publicFiles.has(file)){res.writeHead(404).end('Not found');return;}
  fs.readFile(path.join(__dirname,file),(error,contents)=>{
    if(error){res.writeHead(500).end('Unable to read file');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(contents);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
