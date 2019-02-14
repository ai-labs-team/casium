import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
  {
    input: 'dist/index.js',
    external: ['axios', 'react', 'prop-types'],
    globals: {
      PropTypes: 'propTypes',
      React: 'react',
    },
    output: {
      name: 'casium-core',
      file: pkg.browser,
      format: 'umd',
    },
    treeshake: {
      propertyReadSideEffects: false,
      pureExternalModules: true
    },
    plugins: [
      resolve({
        customResolveOptions: { moduleDirectory: 'node_modules' },
        browser: true
      }),
      commonjs(),
    ],
  }
];
