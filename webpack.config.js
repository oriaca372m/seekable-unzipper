const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
	mode: 'production',
	target: 'node',
	externals: [nodeExternals()],
	entry: './src/index.ts',
	output: {
		filename: 'index.js',
		library: 'seekable-unzipper',
		libraryTarget: 'umd',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.(ts|js)$/,
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					fix: true
				}
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		]
	},
	resolve: {
		extensions: ['.wasm', '.ts', '.mjs', '.js', '.json'],
		alias: {
			Src: path.resolve(__dirname, 'src/')
		}
	}
}
