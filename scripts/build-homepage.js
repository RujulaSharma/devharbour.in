const esbuild = require("esbuild");
esbuild
  .build({
    entryPoints: ["frontend/homepage/entry.tsx"],
    bundle: true,
    jsx: "automatic",
    minify: true,
    sourcemap: false,
    target: ["es2020"],
    outfile: "public/homepage/homepage.js",
    loader: { ".css": "text" },
    define: { "process.env.NODE_ENV": '"production"' },
    legalComments: "eof",
  })
  .then(() => {
    const fs = require("node:fs"), crypto = require("node:crypto");
    const version = crypto.createHash("sha256").update(fs.readFileSync("public/homepage/homepage.js")).digest("hex").slice(0, 12);
    const file = "public/index.html";
    const html = fs.readFileSync(file, "utf8");
    const url = `/homepage/homepage.js?v=${version}`;
    const updated = html
      .replace(/src="\/homepage\/homepage\.js(?:\?v=[a-f0-9]+)?"/, `src="${url}"`)
      .replace(/(<link id="dh-homepage-preload"[^>]*href=")[^"]+("[^>]*>)/, `$1${url}$2`);
    if (updated !== html) fs.writeFileSync(file, updated);
  })
  .catch(() => {
    process.exitCode = 1;
  });
