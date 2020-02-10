import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';

const config = {
    mode: process.env.NODE_ENV || 'development',
    devtool:
        process.env.NODE_ENV === 'production'
            ? 'inline-source-map'
            : 'source-map',
    performance: {
        hints: false,
    },
    entry: {
        content: path.join(__dirname, 'src/content.ts'),
        background: path.join(__dirname, 'src/background.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        query: {
                            compilerOptions: {
                                // Enables ModuleConcatenation. It must be in here to avoid conflict with ts-node
                                module: 'es2015',
                            },
                            // Make compilation faster with `fork-ts-checker-webpack-plugin`
                            transpileOnly: true,
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif)?$/,
                loader: 'file-loader?name=assets/[name].[ext]',
                exclude: /node_modules/,
            },
            {
                test: /\.pug$/,
                // Converts .pug files to .html in the distribution
                loaders: [
                    'file-loader?name=[name].html',
                    'pug-html-loader?pretty&exports=false',
                ],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new CopyPlugin([
            {
                from: 'src/manifest.json',
                transform: function(content, _) {
                    // Update extension version and description using package.json
                    return Buffer.from(
                        JSON.stringify({
                            ...JSON.parse(content.toString()),
                            description: process.env.npm_package_description,
                            version: process.env.npm_package_version,
                        })
                    );
                },
            },
        ]),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.png'],
    },
};
export default config;
