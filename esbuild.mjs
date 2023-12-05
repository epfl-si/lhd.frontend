import * as esbuild from 'esbuild';
import * as process from 'node:process';
import inlineImage from 'esbuild-plugin-inline-image';
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const cmd = process.argv[process.argv.length - 1];

function usage() {
  console.log(`Usage: esbuild.mjs build | dev`);
  process.exit(1);
}

const commonBuildConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/lhd3-frontend.js',
  loader: {
    ".js": "jsx",
    ".css": "global-css",
  },
  plugins: [inlineImage()],
};

if (cmd === "build") {
  catchy(() => esbuild.build({
    color: true,
    logLevel: 'info',
    minify: true,
    define: {
      "window.IS_PRODUCTION": `true`
    },
    ...commonBuildConfig
  }));
} else if (cmd === "dev") {
  catchy(devServer);
} else {
  usage();
}

async function catchy (continuation) {
  try {
    await continuation();
  } catch (e) {
    console.error(e);
    process.exit(2);
  }
}

async function devServer () {
  const ctx = await esbuild.context({
    define: {
      "window.IS_PRODUCTION": `false`
    },
    ...commonBuildConfig
  });

  // https://esbuild.github.io/api/#live-reload
  await ctx.watch();

  // https://esbuild.github.io/api/#serve-proxy
  let server = await ctx.serve();

  function doProxy(req, res) {
    const options = {
      hostname: server.host,
      port: server.port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    }
    const proxyReq = http.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res, { end: true })
    });
    req.pipe(proxyReq, { end: true });
  }

  await http.createServer(async (req, res) => {
    if (req.url.endsWith('/lhd3-frontend.js') ||
      req.url.endsWith('/lhd3-frontend.css') ||
      req.url.endsWith('/esbuild')) {
      doProxy(req, res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(await readFile('public/index.html'));
    }
  }).listen(3000);

  console.log("🚀 Browse the LHD frontend at http://localhost:3000/");
  console.log("\n🔥 Hot reload is enabled!");
}
