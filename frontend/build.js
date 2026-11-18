const esbuild = require('esbuild');
const path = require('node:path');
const fs = require('node:fs');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function build() {
  try {
    const isWatch = process.argv.includes('--watch');
    
    const context = await esbuild.context({
      entryPoints: [path.join(__dirname, 'src', 'main.jsx')],
      bundle: true,
      outfile: path.join(distDir, 'bundle.js'),
      sourcemap: true,
      minify: !isWatch,
      loader: { '.js': 'jsx', '.jsx': 'jsx', '.svg': 'text', '.png': 'dataurl' },
      define: {
        'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
        'process.env.NEXT_PUBLIC_API_URL': '""' // relative API paths
      }
    });

    await context.rebuild();
    console.log('✓ Build succeeded! Bundle created at dist/bundle.js');

    if (isWatch) {
      await context.watch();
      console.log('👀 Watching for frontend changes...');
    } else {
      await context.dispose();
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
