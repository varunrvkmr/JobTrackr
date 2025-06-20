// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'chrome-extension/content.js',   // <-- use your .js file directly
  output: {
    file:  'chrome-extension/content.js', // bundle *overwrites* the same file
    format:'esm'
  },
  plugins: [
    resolve({ extensions: ['.js', '.ts'] }),
    typescript({ tsconfig: './tsconfig.json' })
  ]
};
