import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['js/main.js'],
  bundle: true,
  minify: true,
  outfile: 'js/app.min.js',
  target: ['es2017']
}).catch(() => process.exit(1))
