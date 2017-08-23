import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/react-bound.js',
  plugins: [babel()],
  targets: [
    {dest: 'dist/react-bound.cjs.js', format: 'cjs'},
    {dest: 'dist/react-bound.es.js', format: 'es'}
  ]
}
