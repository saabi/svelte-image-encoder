import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
const preprocessor = require('./src/preprocessor')
import pkg from './package.json';

export default [
	{
		input: 'src/ImgEncoder.svelte',
		output: [
			{ file: pkg.module, 'format': 'es' },
			{ file: pkg.main, 'format': 'umd', name: 'ImgEncoder' }
		],
		plugins: [
			typescript(),
			svelte({preprocess: preprocessor.preprocess}),
			commonjs(),
			resolve()
		]
	}
];