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
  .catch(() => {
    process.exitCode = 1;
  });
